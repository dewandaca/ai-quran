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
      signal: AbortSignal.timeout(3500),
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

async function generateGPTOSSSummary(
  query: string,
  verses: { surahName: string; ayahNumber: number; translation: string; tafsirText?: string }[],
  duas: { judul: string; terjemahan: string }[]
): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!groqKey) return null;

  try {
    const versesContext = verses.slice(0, 4).map((v) =>
      `[QS. ${v.surahName}: ${v.ayahNumber}]: "${v.translation}"${v.tafsirText ? ` (Tafsir: ${v.tafsirText.slice(0, 250)}...)` : ''}`
    ).join('\n');

    const duasContext = duas.slice(0, 2).map((d) =>
      `[Doa: ${d.judul}]: "${d.terjemahan}"`
    ).join('\n');

    const promptContext = [
      versesContext ? `Rujukan Ayat Al-Qur'an:\n${versesContext}` : '',
      duasContext ? `Rujukan Doa Terkait:\n${duasContext}` : '',
    ].filter(Boolean).join('\n\n');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(9000), // 9 detik toleransi
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: `Anda adalah konsultan Islami terpercaya dari EQuran AI. Tugas Anda memberikan penjelasan, intisari, dan panduan praktis yang RAMAH, SEJUK, MENGALIR, dan SANGAT MUDAH DIPAHAMI ORANG AWAM berdasarkan rujukan ayat Al-Qur'an dan doa yang disediakan.
PEDOMAN:
1. DILARANG menggunakan salam ritual (seperti "Assalamu'alaikum" atau "Wa'alaikumussalam"), langsung masuk ke intisari penjelasan secara hangat dan bersahabat.
2. Gunakan bahasa Indonesia yang santun, sederhana, dan mudah dimengerti orang awam (hindari istilah teologis yang rumit tanpa penjelasan mudah).
3. Sebutkan rujukan ayat dalam format [QS. Nama-Surat: Nomor-Ayat] (contoh: [QS. Asy-Syura: 37]).
4. Jelaskan hikmah aplikatif sehari-hari secara bertahap dan terstruktur dalam poin-poin yang jelas dan praktis.
5. Berikan pesan penutup yang menenangkan hati.`,
          },
          {
            role: 'user',
            content: `Pertanyaan Pengguna: "${query}"\n\nRujukan Shahih Al-Qur'an & Doa:\n${promptContext}\n\nTolong buatkan penjelasan ringkas dan hikmah praktis sehari-hari yang mudah dipahami orang awam berdasarkan rujukan di atas.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 900,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      const summary = json.choices?.[0]?.message?.content;
      if (summary && summary.trim().length > 0) {
        return summary
          .replace(/^(?:assalamu'?alaikum(?:\s+warahmatullahi(?:\s+wabarakaatuh)?)?|wa'?alaikumsalam[\w\s]*)[,.:!\-\s]*/i, '')
          .replace(/(\r?\n\s*[-*_]{3,}\s*)+$/g, '')
          .trim();
      }
    }
  } catch (err) {
    console.warn('Groq GPT OSS 120B summarization failed/timed out, continuing with direct EQuran Vector data:', err);
  }
  return null;
}

function handleConversationalQuery(query: string): string | null {
  const q = query.toLowerCase().trim();

  // Salam
  if (/^(assalamu'?alaikum|salam|halo|hai|hi|hey|pagi|siang|sore|malam)\b/i.test(q) && q.length < 35) {
    return `Wa'alaikumussalam warahmatullah wabarakatuh. Selamat datang di **EQuran AI** (Mode **EQuran Vector + GPT OSS 120B**).

Saya siap membantu Anda mencari dan memahami rujukan ayat Al-Qur'an, tafsir resmi, serta doa-doa harian yang shahih dengan penjelasan yang mudah dipahami orang awam.

Silakan ajukan pertanyaan atau topik yang ingin Anda telusuri, contohnya:
- *"Bagaimana cara memaafkan orang yang menyakiti kita?"*
- *"Ayat tentang sabar dan ikhlas saat diuji"*
- *"Doa untuk kedua orang tua dan artinya"*
- *"Keutamaan dan tafsir Ayat Kursi"*`;
  }

  // Who are you / about
  if (/(siapa\s+kamu|tentang\s+kamu|kamu\s+siapa|bisa\s+apa|fitur\s+apa)/i.test(q) && q.length < 50) {
    return `Saya adalah asisten Al-Qur'an **EQuran AI** yang berjalan dalam mode kombinasi **EQuran Vector + GPT OSS 120B**.

Mode ini menggabungkan dua keunggulan utama:
1. 🛡️ **Pencarian Semantik & Verifikasi Dalil (EQuran Vector)**: Mengambil ayat, teks Arab berharakat, transliterasi Latin, terjemahan resmi Kemenag RI, serta doa ma'tsur secara presisi dan anti-halusinasi tanpa kesalahan teks suci.
2. 💡 **Penjelasan Ramah & Mudah Dipahami (GPT OSS 120B via Groq)**: Merangkum intisari dan hikmah praktis sehari-hari dengan bahasa yang sejuk, sederhana, dan mudah dimengerti orang awam.

**Keunggulan Mode Ini:**
- ⚡ **Super Cepat & Responsif**: Didukung inferensi ultra-cepat Groq LPU.
- 📖 **Integritas Al-Qur'an Terjamin**: Teks suci ayat dan tafsir tetap dijaga keasliannya dari database EQuran.id.
- 🛡️ **Bebas Limit Kuota**: Sangat stabil digunakan kapan pun tanpa terhambat kuota Gemini.`;
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

    const versesList = Array.from(verseMap.values());

    // Generate easy-to-understand explanation using GPT OSS 120B (Groq)
    const gptSummary = await generateGPTOSSSummary(
      query,
      versesList.map((v) => ({
        surahName: v.surahName,
        ayahNumber: v.ayahNumber,
        translation: v.translation,
        tafsirText: v.tafsirText,
      })),
      doaItems.map((d) => ({
        judul: d.data?.judul || '',
        terjemahan: d.data?.terjemahan || '',
      }))
    );

    // Build Formatted Output Text
    const textSections: string[] = [];

    if (options.isFallback) {
      textSections.push(
        `> 💡 *Server Gemini AI saat ini mengalami lonjakan trafik/limit. Jawaban dialihkan secara otomatis ke **EQuran Vector + GPT OSS 120B** agar rujukan Al-Qur'an tetap akurat dan penjelasan mudah dipahami.*`
      );
    }

    // 1. Bagian Rangkuman & Penjelasan Praktis (GPT OSS 120B)
    if (gptSummary) {
      textSections.push(
        `Berdasarkan pencarian Al-Qur'an untuk topik **"${query}"**, berikut adalah penjelasan praktis serta rujukan ayat shahih yang bersumber dari mushaf resmi:`
      );
      textSections.push(gptSummary);
      textSections.push(`---`);
      textSections.push(`### 📜 Rujukan Shahih Ayat Al-Qur'an (EQuran Vector)`);
    } else {
      textSections.push(
        `Berdasarkan pencarian semantik Al-Qur'an untuk topik **"${query}"**, berikut adalah rujukan ayat dan dalil shahih yang paling relevan:`
      );
    }

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

    // Render Verses (100% authentic from EQuran Vector)
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
    if (doaItems.length > 0) {
      textSections.push(`### 🤲 Rujukan Doa Terkait`);
      for (const d of doaItems) {
        const dd = d.data;
        if (dd) {
          let doaBlock = `#### Doa: ${dd.judul}\n`;
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
    }

    // Concluding guidance
    textSections.push(
      `Semoga rujukan firman Allah SWT dan panduan di atas dapat menjadi pedoman, penyejuk hati, serta menambah pemahaman kita terhadap nilai-nilai Al-Qur'anul Karim.`
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
