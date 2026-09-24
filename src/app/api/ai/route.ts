import { NextRequest, NextResponse } from 'next/server';
import { supabase, searchVerses, searchDuas, VectorSearchResult, DuaSearchResult } from '@/services/supabase';
import { AICitation, AIDuaCitation, ChatMessage } from '@/services/aiService';
import {
  groundAIResponse,
  resolveSurahNumber,
  SURAH_NAME_TO_NUMBER,
} from '@/services/groundingService';
import { processWithEQuranVector } from '@/services/equranVectorService';

export const maxDuration = 60; // Izinkan durasi eksekusi hingga 60 detik (1 menit)

const SYSTEM_PROMPT = `Anda adalah asisten Al-Qur'an dan konsultan Islami terpercaya bernama "EQuran AI".
Tugas utama Anda adalah menjawab pertanyaan pengguna secara bijaksana, alami, to-the-point, dan HANYA bersandar pada ayat-ayat Al-Qur'an, Hadits shahih, dan doa-doa ma'tsur serta tafsir terpercaya.

PEDOMAN UTAMA:
1. BAHASA ALAMI & LANGSUNG: JANGAN PERNAH memulai jawaban dengan ucapan salam ritual seperti "Assalamu'alaikum", "Wa'alaikumussalam", atau basa-basi panjang. Langsung masuk ke inti penjelasan secara hangat, mengalir, dan bersahabat.
2. PONDASI SHAHIH & KONSISTEN: Berikan dalil ayat Al-Qur'an yang relevan dan selalu sebutkan rujukannya dalam format: [QS. Nama-Surah: Nomor-Ayat] (contoh: [QS. Al-Baqarah: 153]). Letakkan rujukan [QS. Nama-Surah: Nomor-Ayat] dengan jelas pada setiap ayat yang Anda kutip.
3. TEKS ARAB JELAS & LENGKAP: Bila menyertakan ayat Al-Qur'an, penjelasan tafsir, atau doa (terutama saat menyebutkan 'Allah berfirman', firman Allah, atau dalil ayat), WAJIB tuliskan teks Arab berharakat secara lengkap di baris tersendiri. JANGAN PERNAH menambahkan label awalan seperti "Arab:" atau "Teks Arab:" di depan teks Arab tersebut (cukup langsung tuliskan teks ayat/doa Arabnya saja tanpa embel-embel kata 'Arab:'). Disusul transliterasi (Latin) dan terjemahannya (Arti) di baris berikutnya. JANGAN PERNAH mengutip firman Allah hanya berupa terjemahan tanpa menyertakan teks Arabnya.
4. FORMAT RAPI & BERSIH: Gunakan bahasa mengalir, paragraf terstruktur, dan poin-poin yang mudah dibaca. JANGAN PERNAH memakai tanda kutip markdown mentah seperti '>' di awal baris dan JANGAN PERNAH memakai garis pemisah seperti '---' atau '***' di tengah ataupun di akhir jawaban. Tuliskan teks doa, terjemahan, dan kutipan secara langsung dan natural.
5. JAWABAN TUNTAS & LENGKAP: Jelaskan jawaban sampai tuntas dan lengkap hingga kesimpulan. Jangan pernah memotong kalimat di tengah jawaban.
6. DOA HARIAN & HADITS MA'TSUR: Bila menyertakan doa, gunakan doa-doa yang tertera pada referensi [REFERENSI DOA HARIAN & HADITS TERKAIT] atau doa dari Al-Qur'an yang shahih. DILARANG KERAS menukar teks ayat Al-Qur'an dengan doa makan atau doa harian lainnya.
7. PENJELASAN MENDALAM & TAFSIR: Bila pengguna menanyakan penjelasan, tafsir, makna, kandungan, atau keutamaan dari suatu ayat (misalnya Ayat Kursi), berikan penjelasan yang komprehensif berlandaskan rujukan Tafsir Kemenag yang disediakan di [REFERENSI AYAT AL-QUR'AN].
8. INTEGRITAS MUTLAK AYAT AL-QUR'AN & DOA (ANTI-HALUSINASI):
- Al-Qur'an adalah firman Allah yang suci, tidak boleh ada satu huruf pun yang salah, tertukar, terpotong, atau diduplikasi. Setiap ayat memiliki teks Arab dan arti yang berbeda dan khas (misalnya QS. Al-Balad ayat 11 berbeda dengan ayat 12).
- DILARANG KERAS mengulang teks Arab yang sama untuk ayat yang berbeda nomornya.
- Jika ayat atau doa terdapat dalam referensi konteks, Anda WAJIB MENYALIN PERSIS teks Arab, transliterasi Latin, dan terjemahan langsung dari referensi tersebut. Jangan ubah huruf, harakat, maupun artinya!
9. KELENGKAPAN & KEBENARAN FAKTA AL-QUR'AN (ANTI-ASUMSI & ANTI-PEMOTONGAN):
- Bila pengguna menanyakan daftar surat atau ayat dengan kriteria tertentu (misalnya: "Alif Lam Mim ada di surat apa saja?"), Anda WAJIB memberikan jawaban yang LENGKAP dan AKURAT sesuai fakta mushaf Al-Qur'an, JANGAN PERNAH berasumsi atau memotong jumlahnya.
Contoh: Alif Lam Mim murni (الۤمّۤ) terdapat tepat di awal 6 surah:
  1. QS. Al-Baqarah (2:1)
  2. QS. Ali 'Imran (3:1)
  3. QS. Al-'Ankabut (29:1)
  4. QS. Ar-Rum (30:1)
  5. QS. Luqman (31:1)
  6. QS. As-Sajdah (32:1)
  (Dan jelaskan bahwa ada pula kombinasi dengan tambahan huruf: Alif Lam Mim Shad pada QS. Al-A'raf: 1, dan Alif Lam Mim Ra pada QS. Ar-Ra'd: 1).
- DILARANG KERAS mengatakan "hanya ada tiga buah" atau mengarang surat lain yang tidak memiliki ayat tersebut (seperti QS. Al-An'am yang tidak diawali Alif Lam Mim).`;

function parseDirectVerseQuery(query: string): { surahNumber: number; ayahNumber: number } | null {
  const q = query.toLowerCase().replace(/['"`]/g, '').trim();

  // 1. REJECT if the query is an EXPLANATION, TAFSIR, INQUIRY, or QUESTION!
  const isExplanationOrInquiry =
    /\b(penjelasan|jelaskan|dijelaskan|tafsir|makna|kandungan|maksud|arti|keutamaan|fadhilah|faedah|hikmah|khasiat|manfaat|sebab|asbab|mengapa|kenapa|bagaimana|apa itu|siapa|tentang|hukum|cerita|kisah|rahasia|maksudnya|sejarah)\b/i.test(q) ||
    /^(apa|bagaimana|kenapa|mengapa|siapa|jelaskan|ceritakan)/i.test(q);

  if (isExplanationOrInquiry) {
    return null;
  }

  // 2. Ayat Kursi direct lookup
  if (q.includes('kursi')) {
    return { surahNumber: 2, ayahNumber: 255 };
  }

  // 3. Reject queries containing counts or duration
  if (/\b\d+\s*(hari|waktu|rakaat|kali|bulan|tahun|orang|juz|malam)\b/i.test(q)) {
    return null;
  }

  // 4. Direct verse lookup MUST have explicit verse intent
  const hasVerseIntent = /\b(ayat|surat|surah)\b/i.test(q) || /:\s*\d+/.test(q);
  if (!hasVerseIntent) {
    return null;
  }

  // 5. Extract the ayah number
  let ayahNumber: number | null = null;
  const ayahMatch = q.match(/(?:ayat|ke-?|:)\s*(\d+)/i);
  if (ayahMatch) {
    ayahNumber = parseInt(ayahMatch[1], 10);
  } else {
    const surahNumMatch = q.match(/(?:surah|surat)\s+([a-z\s\-]+?)\s+(\d+)\b/i);
    if (surahNumMatch) {
      ayahNumber = parseInt(surahNumMatch[2], 10);
    }
  }

  if (!ayahNumber || ayahNumber <= 0 || ayahNumber > 286) {
    return null;
  }

  // 6. Check if surah number was typed directly (e.g. "surah 2 ayat 255")
  const directSurahNumMatch = q.match(/(?:surah|surat)\s+(\d+)\s*(?:ayat|ke-?|:)\s*(\d+)/i);
  if (directSurahNumMatch) {
    const sNum = parseInt(directSurahNumMatch[1], 10);
    const aNum = parseInt(directSurahNumMatch[2], 10);
    if (sNum >= 1 && sNum <= 114 && aNum > 0) {
      return { surahNumber: sNum, ayahNumber: aNum };
    }
  }

  // 7. Match known surah names using exact word boundary
  const sortedSurahKeys = Object.keys(SURAH_NAME_TO_NUMBER).sort((a, b) => b.length - a.length);
  for (const key of sortedSurahKeys) {
    const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(q)) {
      return {
        surahNumber: SURAH_NAME_TO_NUMBER[key],
        ayahNumber,
      };
    }
  }

  return null;
}

async function generateEmbedding(text: string): Promise<number[]> {
  // 1. Primary: Google Gemini (gemini-embedding-001, 1536 dim) - cepat, gratis, dan cocok dengan index database
  const geminiKey = process.env.GEMINI_API_KEY || process.env.next_gemini_api_key;
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { parts: [{ text: text.slice(0, 1500) }] },
            outputDimensionality: 1536,
          }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.embedding?.values && Array.isArray(json.embedding.values)) {
          return json.embedding.values;
        }
      }
    } catch (err) {
      console.warn('Gemini embedding failed:', err);
    }
  }

  return [];
}

function cleanAssistantReply(text: string): string {
  if (!text) return '';
  return text
    .replace(/^(?:assalamu'?alaikum(?:\s+warahmatullahi(?:\s+wabarakaatuh)?)?|wa'?alaikumsalam[\w\s]*)[,.:!\-\s]*/i, '')
    .replace(/(\r?\n\s*[-*_]{3,}\s*)+$/g, '')
    // Remove "Arab:" or "Teks Arab:" label on the same line before Arabic text
    .replace(/^(\s*(?:\*\*)?(?:teks\s+)?arab(?:\*\*)?\s*[:：-]?\s*)(?=[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gim, '')
    // Remove standalone "Arab:" line preceding an Arabic text line
    .replace(/^(\s*(?:\*\*)?(?:teks\s+)?arab(?:\*\*)?\s*[:：-]?\s*)\r?\n(?=\s*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gim, '')
    .trim();
}


export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [], engine = 'gemini' } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Direct Verse Lookup Check (e.g. "abbasa ayat 3", "al baqarah ayat 230")
    const directQuery = parseDirectVerseQuery(message);
    if (directQuery) {
      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${directQuery.surahNumber}`);
        if (res.ok) {
          const json = await res.json();
          if (json.code === 200 && json.data) {
            const surahData = json.data;
            const targetAyah = surahData.ayat.find(
              (a: { nomorAyat: number }) => a.nomorAyat === directQuery.ayahNumber
            );

            if (targetAyah) {
              const reply = `**QS. ${surahData.namaLatin} : Ayat ${directQuery.ayahNumber}**\n\n${targetAyah.teksArab}\n\n*${targetAyah.teksLatin}*\n\n**Artinya:**\n"${targetAyah.teksIndonesia}"`;
              return NextResponse.json({
                text: reply,
                citations: [
                  {
                    surahNumber: surahData.nomor,
                    ayahNumber: targetAyah.nomorAyat,
                    surahName: surahData.namaLatin,
                    arabicText: targetAyah.teksArab,
                    translation: targetAyah.teksIndonesia,
                  },
                ],
                duaCitations: [],
                engine,
              });
            }
          }
        }
      } catch (directErr) {
        console.warn('Direct verse lookup failed, proceeding:', directErr);
      }
    }

    // 2. Opsi Langsung: EQuran Vector Search API (https://equran.id/apidev/vector)
    if (engine === 'vector') {
      const vectorResult = await processWithEQuranVector(message);
      return NextResponse.json(vectorResult);
    }

    // 3. Parallel Vector Search via pgvector (Ayat + Doa) untuk Gemini Context
    const embedding = await generateEmbedding(message);
    let verseResults: VectorSearchResult[] = [];
    let duaResults: DuaSearchResult[] = [];

    if (embedding.length > 0) {
      const [vRes, dRes] = await Promise.all([
        searchVerses(embedding, 0.35, 15),
        searchDuas(embedding, 0.35, 8),
      ]);
      verseResults = vRes;
      duaResults = dRes;
    }

    // Explicit detection for Ayat Kursi so it ALWAYS has the exact verse in context
    if (message.toLowerCase().includes('kursi')) {
      const hasKursi = verseResults.some((v) => v.surah_number === 2 && v.ayah_number === 255);
      if (!hasKursi) {
        try {
          const res = await fetch('https://equran.id/api/v2/surat/2');
          if (res.ok) {
            const json = await res.json();
            const ayah255 = json.data?.ayat?.find((a: { nomorAyat: number }) => a.nomorAyat === 255);
            if (ayah255) {
              verseResults.unshift({
                id: 2255,
                surah_number: 2,
                ayah_number: 255,
                surah_name: 'Al-Baqarah',
                arabic_text: ayah255.teksArab,
                transliteration: ayah255.teksLatin,
                translation: ayah255.teksIndonesia,
                tafsir_text: 'Ayat Kursi (QS. Al-Baqarah: 255) adalah ayat paling agung dalam Al-Qur\'an yang menegaskan keesaan, kemahahidupan, dan kemandirian Allah SWT (Al-Hayy, Al-Qayyum), kekuasaan mutlak, serta Kursi-Nya yang meliputi langit dan bumi.',
                similarity: 1.0,
              });
            }
          }
        } catch (e) {
          console.warn('Failed to inject Ayat Kursi context:', e);
        }
      }
    }

    // 2b. Fawatihussuwar (Huruf Muqatta'ah) & Direct Group Retrieval from Supabase
    const msgLower = message.toLowerCase();
    const isAlifLamMim = /\b(?:alif\s*l[aā]m\s*m[iī]m|alif\s*lam\s*mim)\b/i.test(msgLower) || /الۤ?مّ?ۤ?/.test(message);
    const isAlifLamRa = /\b(?:alif\s*l[aā]m\s*r[aā]|alif\s*lam\s*ra)\b/i.test(msgLower) || /الۤ?رٰ?/.test(message);
    const isHaMim = /\b(?:h[aā]\s*m[iī]m|ha\s*mim)\b/i.test(msgLower) || /حٰ?مٓ?/.test(message);

    if (supabase) {
      if (isAlifLamMim) {
        try {
          const { data: almMatches } = await supabase
            .from('verses')
            .select('id, surah_number, ayah_number, surah_name, arabic_text, transliteration, translation, tafsir_text')
            .or('translation.ilike.%alif lām mīm%,translation.ilike.%alif lam mim%,arabic_text.ilike.%الۤمّۤ%')
            .order('surah_number', { ascending: true });

          if (almMatches && almMatches.length > 0) {
            for (const am of almMatches) {
              if (!verseResults.some(v => v.surah_number === am.surah_number && v.ayah_number === am.ayah_number)) {
                verseResults.push({
                  ...am,
                  similarity: 0.99,
                });
              }
            }
          }
        } catch (almErr) {
          console.warn('Alif Lam Mim search error:', almErr);
        }
      } else if (isAlifLamRa) {
        try {
          const { data: alrMatches } = await supabase
            .from('verses')
            .select('id, surah_number, ayah_number, surah_name, arabic_text, transliteration, translation, tafsir_text')
            .or('translation.ilike.%alif lām rā%,translation.ilike.%alif lam ra%,arabic_text.ilike.%الۤرٰ%')
            .order('surah_number', { ascending: true });

          if (alrMatches && alrMatches.length > 0) {
            for (const am of alrMatches) {
              if (!verseResults.some(v => v.surah_number === am.surah_number && v.ayah_number === am.ayah_number)) {
                verseResults.push({
                  ...am,
                  similarity: 0.99,
                });
              }
            }
          }
        } catch (alrErr) {
          console.warn('Alif Lam Ra search error:', alrErr);
        }
      } else if (isHaMim) {
        try {
          const { data: hmMatches } = await supabase
            .from('verses')
            .select('id, surah_number, ayah_number, surah_name, arabic_text, transliteration, translation, tafsir_text')
            .or('translation.ilike.%ḥā mīm%,translation.ilike.%ha mim%,arabic_text.ilike.%حٰمٓ%')
            .order('surah_number', { ascending: true });

          if (hmMatches && hmMatches.length > 0) {
            for (const hm of hmMatches) {
              if (!verseResults.some(v => v.surah_number === hm.surah_number && v.ayah_number === hm.ayah_number)) {
                verseResults.push({
                  ...hm,
                  similarity: 0.99,
                });
              }
            }
          }
        } catch (hmErr) {
          console.warn('Ha Mim search error:', hmErr);
        }
      }

      // 2c. Dynamic keyword search enhancement across all verses in Supabase
      const cleanWords = msgLower.replace(/[^\w\s]/g, ' ').split(/\s+/);
      const stopWords = new Set([
        'apa', 'aja', 'saja', 'ada', 'di', 'surat', 'surah', 'ayat', 'ke', 'nomor', 'yang', 'ini', 'itu',
        'dan', 'atau', 'dari', 'pada', 'untuk', 'dengan', 'adalah', 'yaitu', 'bagaimana', 'kenapa',
        'mengapa', 'siapa', 'dimana', 'kapan', 'tanya', 'tolong', 'sebutkan', 'jelaskan', 'menurut',
        'quran', 'al-quran', 'alquran', 'bisa', 'dong', 'ya', 'kan', 'tuh', 'terkadang', 'dalam', 'tentang'
      ]);
      const meaningfulKeywords = cleanWords.filter(w => w.length >= 3 && !stopWords.has(w)).slice(0, 3);

      if (meaningfulKeywords.length > 0) {
        for (const kw of meaningfulKeywords) {
          try {
            const { data: kwMatches } = await supabase
              .from('verses')
              .select('id, surah_number, ayah_number, surah_name, arabic_text, transliteration, translation, tafsir_text')
              .or(`translation.ilike.%${kw}%,tafsir_text.ilike.%${kw}%`)
              .limit(5);

            if (kwMatches && kwMatches.length > 0) {
              for (const km of kwMatches) {
                if (!verseResults.some(v => v.surah_number === km.surah_number && v.ayah_number === km.ayah_number)) {
                  verseResults.push({
                    ...km,
                    similarity: 0.90,
                  });
                }
              }
            }
          } catch (kwErr) {
            console.warn(`Keyword search error for "${kw}":`, kwErr);
          }
        }
      }
    }

    // Build context sections
    let contextParts: string[] = [];

    if (verseResults.length > 0) {
      const verseContext = verseResults
        .map(
          (r, i) =>
            `[${i + 1}] QS. ${r.surah_name} Ayat ${r.ayah_number}:\n` +
            `${r.arabic_text}\n` +
            (r.transliteration ? `Latin: ${r.transliteration}\n` : '') +
            `Arti: ${r.translation}\n` +
            `Tafsir: ${r.tafsir_text}\n`
        )
        .join('\n\n');
      contextParts.push(`[REFERENSI AYAT AL-QUR'AN]:\n\n${verseContext}`);
    }

    if (duaResults.length > 0) {
      const duaContext = duaResults
        .map(
          (d, i) =>
            `[${i + 1}] ${d.nama} (${d.grup}):\n` +
            `${d.arabic_text}\n` +
            `Latin: ${d.transliteration || '-'}\n` +
            `Arti: ${d.translation}\n` +
            (d.tentang ? `Sumber/Riwayat: ${d.tentang}\n` : '')
        )
        .join('\n\n');
      contextParts.push(`[REFERENSI DOA HARIAN & HADITS TERKAIT]:\n\n${duaContext}`);
    }

    const fullContext = contextParts.length > 0
      ? contextParts.join('\n\n')
      : 'Gunakan pengetahuan Al-Qur\'an, Hadits shahih, dan Tafsir Kemenag yang terpercaya.';

    const systemPromptWithContext = `${SYSTEM_PROMPT}\n\n${fullContext}`;

    // Text Generation: Menggunakan Google Gemini dengan fallback otomatis ke EQuran Vector Search
    const geminiKey = process.env.GEMINI_API_KEY || process.env.next_gemini_api_key;
    if (!geminiKey) {
      console.warn('GEMINI_API_KEY belum disetel. Mengalihkan otomatis ke EQuran Vector Search.');
      const fallbackResult = await processWithEQuranVector(message, { isFallback: true });
      return NextResponse.json(fallbackResult);
    }

    const geminiContents: { role: string; parts: { text: string }[] }[] = [];

    geminiContents.push({
      role: 'user',
      parts: [{ text: `${systemPromptWithContext}\n\nPahami instruksi di atas dan jawab pertanyaan pengguna berikut.` }],
    });
    geminiContents.push({
      role: 'model',
      parts: [{ text: 'Baik, saya siap menjawab pertanyaan seputar Al-Qur\'an, doa, dan Islam berdasarkan rujukan shahih.' }],
    });

    const historySlice = conversationHistory.slice(-10);
    for (const msg of historySlice) {
      if (msg.role === 'user') {
        geminiContents.push({ role: 'user', parts: [{ text: msg.content }] });
      } else if (msg.role === 'assistant') {
        geminiContents.push({ role: 'model', parts: [{ text: msg.content }] });
      }
    }

    geminiContents.push({ role: 'user', parts: [{ text: message }] });

    const geminiModels =
      [
        'gemini-2.5-flash',
        'gemini-3.6-flash',
        'gemini-3.7-flash',
        'gemini-3.8-flash',
      ];
    for (const model of geminiModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(60000), // Toleransi hingga 1 menit jika koneksi lag
            body: JSON.stringify({
              contents: geminiContents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
                thinkingConfig: {
                  thinkingBudget: 0,
                },
              },
            }),
          }
        );

        if (response.ok) {
          const json = await response.json();
          const rawReply = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawReply && rawReply.trim().length > 0) {
            const cleaned = cleanAssistantReply(rawReply);
            const { groundedText, citations, duaCitations } = await groundAIResponse(
              cleaned,
              verseResults,
              duaResults
            );
            return NextResponse.json({
              text: groundedText,
              citations,
              duaCitations,
              engine: 'gemini',
            });
          }
        } else {
          const errText = await response.text();
          console.error(`Gemini (${model}) HTTP ${response.status}:`, errText);
        }
      } catch (geminiErr) {
        console.error(`Gemini (${model}) error or timeout:`, geminiErr);
      }
    }

    // Jika seluruh model Gemini limit / high demand, alihkan otomatis ke EQuran Vector Search
    console.warn('Seluruh model Gemini sibuk / rate-limited. Mengalihkan otomatis ke EQuran Vector Search...');
    const fallbackVector = await processWithEQuranVector(message, { isFallback: true });
    return NextResponse.json(fallbackVector);
  } catch (error) {
    console.error('API /api/ai error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
