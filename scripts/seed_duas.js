/**
 * Script: Seed & Vectorize Doa ke Supabase
 * Sumber: https://equran.id/api/doa (~227 doa)
 * Model Embedding: Google Gemini (gemini-embedding-001, 1536 dim)
 * 
 * Jalankan: npm run seed:duas
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local or .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["'](.*)["']$/, '$1');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnv();

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://khqaeovtercgdfngmqrq.supabase.co').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase URL atau Anon Key tidak ditemukan di environment variables.');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY tidak ditemukan. Diperlukan untuk generate 1536-dim embeddings.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Generate 1536-dim embeddings menggunakan Gemini batchEmbedContents
 * Dilengkapi auto-retry cerdas jika terkena kuota free-tier (100 req/menit)
 */
async function generateGeminiBatchEmbeddings(texts, maxRetries = 6) {
  const requests = texts.map((text) => ({
    model: 'models/gemini-embedding-001',
    content: { parts: [{ text: text.slice(0, 1500) }] },
    outputDimensionality: 1536,
  }));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      }
    );

    if (res.status === 429) {
      let delaySec = 50;
      try {
        const errJson = await res.json();
        const retryInfo = errJson.error?.details?.find((d) => d['@type']?.includes('RetryInfo'));
        if (retryInfo?.retryDelay) {
          const parsed = parseInt(retryInfo.retryDelay, 10);
          if (!isNaN(parsed) && parsed > 0) delaySec = parsed + 3;
        }
      } catch {
        // use fallback 50s
      }
      console.warn(`\n⏳ Terkena limit kuota Gemini Free Tier (100 req/menit). Menunggu cooldown ${delaySec} detik sebelum coba lagi (percobaan ${attempt}/${maxRetries})...`);
      await sleep(delaySec * 1000);
      continue;
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini batch embedding error (${res.status}): ${errText}`);
    }

    const json = await res.json();
    if (!json.embeddings || !Array.isArray(json.embeddings)) {
      throw new Error('Format response Gemini embedding tidak valid');
    }

    return json.embeddings.map((e) => e.values);
  }

  throw new Error(`Gagal generate embedding setelah ${maxRetries} kali percobaan.`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('====================================================');
  console.log('  EQuran AI: Ingest & Vectorize Doa ke Supabase');
  console.log('====================================================\n');

  // 1. Verifikasi apakah tabel 'duas' sudah dibuat di Supabase
  console.log('🔍 Memeriksa ketersediaan tabel "public.duas" di Supabase...');
  const { error: checkErr } = await supabase.from('duas').select('id').limit(1);
  if (checkErr && checkErr.code === 'PGRST205') {
    console.error('\n❌ TABEL "public.duas" BELUM DIBUAT DI SUPABASE!');
    console.error('👉 Silakan buka Supabase Dashboard -> SQL Editor,');
    console.error('👉 Salin seluruh isi file "supabase_duas_schema.sql", lalu klik "RUN".');
    console.error('👉 Setelah itu, jalankan kembali script ini (npm run seed:duas).\n');
    process.exit(1);
  }

  // 2. Fetch seluruh doa dari API equran.id
  console.log('📥 Mengunduh daftar doa dari https://equran.id/api/doa...');
  let rawDoas = [];
  try {
    const res = await fetch('https://equran.id/api/doa');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    rawDoas = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  } catch (err) {
    console.error('❌ Gagal mengambil data dari equran.id/api/doa:', err.message);
    process.exit(1);
  }

  console.log(`✅ Berhasil mengambil ${rawDoas.length} doa dari API.`);

  // 3. Cek doa yang sudah ada di Supabase (Resume Capability)
  const { data: existingData } = await supabase.from('duas').select('dua_id');
  const existingIds = new Set((existingData || []).map((d) => d.dua_id));
  console.log(`📊 Ditemukan ${existingIds.size} doa sudah tersimpan di database.`);

  const pendingDoas = rawDoas.filter((d) => !existingIds.has(d.id));

  if (pendingDoas.length === 0) {
    console.log('🎉 Seluruh 227 doa sudah lengkap tersimpan di database Supabase!');
  } else {
    console.log(`🎯 Memproses ${pendingDoas.length} doa yang belum tersimpan...\n`);

    const BATCH_SIZE = 20;
    const totalBatches = Math.ceil(pendingDoas.length / BATCH_SIZE);
    let newlySavedCount = 0;

    for (let b = 0; b < totalBatches; b++) {
      const slice = pendingDoas.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      console.log(`⏳ [Batch ${b + 1}/${totalBatches}] Memproses ${slice.length} doa (index ${b * BATCH_SIZE + 1} s/d ${b * BATCH_SIZE + slice.length})...`);

      // Format rich semantic text untuk embedding
      const textsToEmbed = slice.map((item) => {
        const parts = [
          `Judul Doa: ${item.nama || ''}`,
          `Kategori: ${item.grup || ''}`,
          `Terjemahan: ${item.idn || ''}`,
        ];
        if (item.tentang) {
          parts.push(`Sumber / Riwayat: ${item.tentang}`);
        }
        if (item.tag && Array.isArray(item.tag) && item.tag.length > 0) {
          parts.push(`Tag: ${item.tag.join(', ')}`);
        }
        return parts.join('\n');
      });

      try {
        // Generate embeddings dengan auto-retry rate limit
        const embeddings = await generateGeminiBatchEmbeddings(textsToEmbed);

        // Siapkan payload record untuk Supabase
        const records = slice.map((item, idx) => ({
          dua_id: item.id,
          grup: item.grup || 'Umum',
          nama: item.nama || '',
          arabic_text: item.ar || '',
          transliteration: item.tr || '',
          translation: item.idn || '',
          tentang: item.tentang || '',
          tags: Array.isArray(item.tag) ? item.tag : [],
          embedding: embeddings[idx],
        }));

        // Upsert ke Supabase
        const { error: upsertErr } = await supabase
          .from('duas')
          .upsert(records, { onConflict: 'dua_id' });

        if (upsertErr) {
          console.error(`❌ Error upsert batch ${b + 1}:`, upsertErr.message);
        } else {
          newlySavedCount += records.length;
          const currentTotal = existingIds.size + newlySavedCount;
          console.log(`   ✓ Tersimpan (${currentTotal}/${rawDoas.length} doa di database)`);
        }
      } catch (batchErr) {
        console.error(`❌ Gagal pada batch ${b + 1}:`, batchErr.message);
      }

      // Jeda 2 detik antar batch untuk kenyamanan kuota
      if (b < totalBatches - 1) {
        await sleep(2000);
      }
    }
  }

  const { count: finalCount } = await supabase.from('duas').select('*', { count: 'exact', head: true });
  console.log(`\n🎉 SELESAI! Total ${finalCount || 0} dari ${rawDoas.length} doa kini tersimpan lengkap di Supabase.\n`);

  // 4. Test Semantic Vector Search
  console.log('🧪 Menjalankan uji coba semantic vector search...');
  const testQuery = 'doa sebelum makan';
  try {
    const testEmbeds = await generateGeminiBatchEmbeddings([`Judul Doa: ${testQuery}\nKategori: Doa Sehari-hari`]);
    const { data: searchResults, error: rpcErr } = await supabase.rpc('match_duas', {
      query_embedding: testEmbeds[0],
      match_threshold: 0.5,
      match_count: 2,
    });

    if (rpcErr) {
      console.warn('⚠️ RPC match_duas belum aktif atau error:', rpcErr.message);
      console.warn('Pastikan RPC function match_duas dari supabase_duas_schema.sql sudah dijalankan di Supabase.');
    } else {
      console.log(`\nHasil pencarian vektor untuk query: "${testQuery}"`);
      searchResults.forEach((r, idx) => {
        console.log(`  [${idx + 1}] ${r.nama} (${r.grup}) - Similarity: ${(r.similarity * 100).toFixed(1)}%`);
        console.log(`      Arab: ${r.arabic_text}`);
        console.log(`      Arti: "${r.translation}"\n`);
      });
      console.log('✅ Uji coba vector search berhasil!');
    }
  } catch (testErr) {
    console.warn('Uji coba pencarian gagal:', testErr.message);
  }
}

main().catch(console.error);
