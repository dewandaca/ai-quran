import { AICitation, AIDuaCitation } from './aiService';

export interface EQuranVectorItem {
  tipe: 'ayat' | 'tafsir' | 'doa' | 'surat';
  skor: number;
  relevansi: string;
  data: any;
}

export interface EQuranVectorResult {
  text: string;
  citations: AICitation[];
  duaCitations: AIDuaCitation[];
  engine: 'vector';
  isFallback?: boolean;
}

// In-memory cache for surah data during requests
const surahCache = new Map<number, any>();

async function fetchSurahData(surahId: number): Promise<any | null> {
  if (surahCache.has(surahId)) {
    return surahCache.get(surahId);
  }
  try {
    const res = await fetch(`https://equran.id/api/v2/surat/${surahId}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && json.data) {
        surahCache.set(surahId, json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch surah ${surahId}:`, err);
  }
  return null;
}

function handleConversationalQuery(query: string): string | null {
  const q = query.toLowerCase().trim();

  // Salam
  if (/^(assalamu'?alaikum|salam|halo|hai|hi|hey|pagi|siang|sore|malam)\b/i.test(q) && q.length < 35) {
    return `Wa'alaikumussalam warahmatullah wabarakatuh. Selamat datang di **EQuran AI** (Pencarian Vektor Semantik).

Saya siap membantu Anda mencari dan memahami rujukan ayat Al-Qur'an, tafsir resmi, serta doa-doa harian yang shahih.

Silakan ajukan pertanyaan atau topik yang ingin Anda telusuri, contohnya:
- *"Ayat tentang sabar dan sholat"*
- *"Doa untuk kedua orang tua"*
- *"Tafsir keutamaan Ayat Kursi"*
- *"Kisah Nabi Musa dalam Al-Qur'an"*`;
  }

  // Who are you / about
  if (/(siapa\s+kamu|tentang\s+kamu|kamu\s+siapa|bisa\s+apa|fitur\s+apa)/i.test(q) && q.length < 50) {
    return `Saya adalah asisten Al-Qur'an **EQuran AI** yang berjalan dalam mode **EQuran Vector Search**.

Mode ini terhubung langsung ke sistem pencarian semantik cerdas [EQuran.id Vector API](https://equran.id/apidev/vector). Berbeda dengan pencarian kata kunci biasa, teknologi ini memahami **makna dan konteks** dari pertanyaan Anda.

**Kelebihan Mode EQuran Vector:**
- ⚡ **Sangat Cepat & Responsif**: Mengambil rujukan ayat dan tafsir secara instan.
- 🛡️ **Bebas Batas Kuota (No Limit)**: Tidak terganggu oleh limit kuota atau status *high demand* model pihak ketiga.
- 📖 **Rujukan Shahih & Akurat**: Dilengkapi teks Arab berharakat, transliterasi Latin, terjemahan Kemenag RI, tafsir, dan doa harian.`;
  }

  // Thank you
  if (/(terima\s*kasih|syukran|jazakallah|makasih)/i.test(q) && q.length < 30) {
    return `Afwan, sama-sama. Semoga rujukan Al-Qur'an dan doa yang disampaikan membawa ketenangan, keberkahan, dan menambah kecintaan kita terhadap Kitabullah. Silakan tanyakan hal lain bila ada yang ingin Anda pelajari kembali.`;
  }

  return null;
}

export async function processWithEQuranVector(
  query: string,
  options: { isFallback?: boolean } = {}
): Promise<EQuranVectorResult> {
  const conversationalText = handleConversationalQuery(query);
  if (conversationalText) {
    return {
      text: conversationalText,
      citations: [],
      duaCitations: [],
      engine: 'vector',
      isFallback: options.isFallback,
    };
  }

  try {
    const vectorRes = await fetch('https://equran.id/api/vector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        cari: query,
        batas: 6,
      }),
    });

    if (!vectorRes.ok) {
      throw new Error(`Vector API error status ${vectorRes.status}`);
    }

    const vectorJson = await vectorRes.json();
    const rawHasil: EQuranVectorItem[] = Array.isArray(vectorJson.hasil) ? vectorJson.hasil : [];

    if (rawHasil.length === 0) {
      return {
        text: `Tidak ditemukan rujukan ayat atau doa yang secara langsung berkaitan dengan pencarian **"${query}"** pada indeks vektor saat ini.\n\nSilakan coba gunakan kata kunci lain yang lebih spesifik, seperti *"sabar"*, *"rezeki"*, *"surah al-kahfi"*, atau *"doa memohon ampunan"*.`,
        citations: [],
        duaCitations: [],
        engine: 'vector',
        isFallback: options.isFallback,
      };
    }

    // Separate by types
    const suratItems = rawHasil.filter((h) => h.tipe === 'surat');
    const ayatItems = rawHasil.filter((h) => h.tipe === 'ayat');
    const tafsirItems = rawHasil.filter((h) => h.tipe === 'tafsir');
    const doaItems = rawHasil.filter((h) => h.tipe === 'doa');

    // Consolidate verses and their tafsir
    interface ConsolidatedVerse {
      surahNumber: number;
      surahName: string;
      surahArabic?: string;
      ayahNumber: number;
      arabicText: string;
      transliteration: string;
      translation: string;
      tafsirText?: string;
    }

    const verseMap = new Map<string, ConsolidatedVerse>();

    // 1. Process ayat items
    for (const item of ayatItems) {
      const d = item.data;
      if (!d) continue;
      const key = `${d.id_surat}:${d.nomor_ayat}`;
      verseMap.set(key, {
        surahNumber: d.id_surat,
        surahName: d.nama_surat,
        surahArabic: d.nama_surat_arab,
        ayahNumber: d.nomor_ayat,
        arabicText: d.teks_arab || '',
        transliteration: d.teks_latin || '',
        translation: d.terjemahan_id || d.terjemahan || '',
      });
    }

    // 2. Attach or fetch verses for tafsir items
    for (const item of tafsirItems) {
      const d = item.data;
      if (!d) continue;
      const key = `${d.id_surat}:${d.nomor_ayat}`;
      if (verseMap.has(key)) {
        const existing = verseMap.get(key)!;
        if (!existing.tafsirText) {
          existing.tafsirText = d.isi;
        }
      } else {
        // Fetch full verse text so tafsir is accompanied by the actual verse
        const surahData = await fetchSurahData(d.id_surat);
        const targetAyah = surahData?.ayat?.find((a: any) => a.nomorAyat === d.nomor_ayat);

        verseMap.set(key, {
          surahNumber: d.id_surat,
          surahName: d.nama_surat || surahData?.namaLatin || `Surah ${d.id_surat}`,
          surahArabic: surahData?.nama || '',
          ayahNumber: d.nomor_ayat,
          arabicText: targetAyah?.teksArab || '',
          transliteration: targetAyah?.teksLatin || '',
          translation: targetAyah?.teksIndonesia || '',
          tafsirText: d.isi,
        });
      }
    }

    // Build Formatted Output Text (Matching the exact rich format of our app)
    const textSections: string[] = [];

    if (options.isFallback) {
      textSections.push(
        `> 💡 *Server Gemini AI saat ini sedang mengalami lonjakan trafik/limit kuota. Jawaban dialihkan secara otomatis ke **EQuran Vector Search** agar rujukan dalil tetap dapat Anda akses dengan cepat.*`
      );
    }

    textSections.push(
      `Berdasarkan pencarian semantik Al-Qur'an untuk topik **"${query}"**, berikut adalah rujukan ayat dan dalil shahih yang paling relevan:`
    );

    // Render Surah info if returned
    for (const s of suratItems) {
      const sd = s.data;
      if (sd) {
        textSections.push(
          `### Surah ${sd.nama} (${sd.nama_arab}) — Surah ke-${sd.id_surat}\n\n` +
          `- **Arti:** ${sd.arti}\n` +
          `- **Jumlah Ayat:** ${sd.jumlah_ayat} ayat (${sd.tempat_turun})\n\n` +
          `**Keterangan Surah:**\n${sd.deskripsi}`
        );
      }
    }

    // Render Verses
    const versesList = Array.from(verseMap.values());
    for (const v of versesList) {
      let verseBlock = `### QS. ${v.surahName}: Ayat ${v.ayahNumber}\n\n`;
      if (v.arabicText) {
        verseBlock += `${v.arabicText}\n\n`;
      }
      if (v.transliteration) {
        verseBlock += `*${v.transliteration}*\n\n`;
      }
      if (v.translation) {
        verseBlock += `**Artinya:**\n"${v.translation}"\n\n`;
      }
      if (v.tafsirText) {
        verseBlock += `**Penjelasan & Kandungan Tafsir:**\n[TAFSIR_START]\n${v.tafsirText}\n[TAFSIR_END]`;
      }
      textSections.push(verseBlock.trim());
    }

    // Render Duas
    for (const d of doaItems) {
      const dd = d.data;
      if (dd) {
        let doaBlock = `### Doa: ${dd.judul}\n`;
        if (dd.grup) {
          doaBlock += `*Kategori: ${dd.grup}*\n\n`;
        }
        if (dd.teks_arab) {
          doaBlock += `${dd.teks_arab}\n\n`;
        }
        if (dd.teks_latin) {
          doaBlock += `*${dd.teks_latin}*\n\n`;
        }
        if (dd.terjemahan) {
          doaBlock += `**Artinya:**\n"${dd.terjemahan}"\n\n`;
        }
        if (dd.sumber || dd.catatan) {
          const src = dd.sumber || dd.catatan;
          doaBlock += `**Riwayat & Keterangan:**\n${src}`;
        }
        textSections.push(doaBlock.trim());
      }
    }

    // Concluding guidance
    textSections.push(
      `Semoga rujukan firman Allah SWT dan doa di atas dapat menjadi pedoman, penyejuk hati, serta menambah pemahaman kita terhadap nilai-nilai Al-Qur'anul Karim.`
    );

    const finalText = textSections.join('\n\n');

    // Build Citations array for interactive cards at the bottom
    const citations: AICitation[] = versesList.map((v) => ({
      surahNumber: v.surahNumber,
      ayahNumber: v.ayahNumber,
      surahName: v.surahName,
      arabicText: v.arabicText,
      translation: v.translation,
      tafsirText: v.tafsirText,
    }));

    // Build Dua Citations array for interactive cards
    const duaCitations: AIDuaCitation[] = doaItems.map((d) => ({
      duaId: d.data.id_doa || 0,
      title: d.data.judul || 'Doa Harian',
      group: d.data.grup || 'Doa Ma\'tsur',
      arabicText: d.data.teks_arab,
      transliteration: d.data.teks_latin,
      translation: d.data.terjemahan,
      source: d.data.sumber || d.data.catatan,
    }));

    return {
      text: finalText,
      citations,
      duaCitations,
      engine: 'vector',
      isFallback: options.isFallback,
    };
  } catch (error) {
    console.error('Error in processWithEQuranVector:', error);
    return {
      text: `Maaf, terjadi kendala saat menghubungkan ke layanan EQuran Vector Search. Silakan periksa koneksi internet Anda atau coba kembali sesaat lagi.`,
      citations: [],
      duaCitations: [],
      engine: 'vector',
      isFallback: options.isFallback,
    };
  }
}
