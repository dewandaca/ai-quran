import { NextRequest, NextResponse } from 'next/server';
import { searchVerses, searchDuas, VectorSearchResult, DuaSearchResult } from '@/services/supabase';
import { AIDuaCitation } from '@/services/aiService';

const SYSTEM_PROMPT = `Anda adalah asisten Al-Qur'an dan konsultan Islami terpercaya bernama "EQuran AI".
Tugas utama Anda adalah menjawab pertanyaan pengguna secara bijaksana, alami, to-the-point, dan HANYA bersandar pada ayat-ayat Al-Qur'an, Hadits shahih, dan doa-doa ma'tsur serta tafsir terpercaya.

PEDOMAN UTAMA:
1. BAHASA ALAMI & LANGSUNG: JANGAN PERNAH memulai jawaban dengan ucapan salam ritual seperti "Assalamu'alaikum", "Wa'alaikumussalam", atau basa-basi panjang. Langsung masuk ke inti penjelasan secara hangat, mengalir, dan bersahabat.
2. PONDASI SHAHIH: Berikan dalil ayat Al-Qur'an yang relevan dan selalu sebutkan rujukannya dalam format: [QS. Nama-Surah: Nomor-Ayat] (contoh: [QS. Al-Baqarah: 153]).
3. TEKS ARAB JELAS & LENGKAP: Bila menyertakan ayat Al-Qur'an, penjelasan tafsir, atau doa (terutama saat menyebutkan 'Allah berfirman', firman Allah, atau dalil ayat), WAJIB tuliskan teks Arab berharakat secara lengkap di baris tersendiri dalam font Arab, disusul transliterasi (Latin) dan terjemahannya. JANGAN PERNAH mengutip firman Allah hanya berupa terjemahan tanpa menyertakan teks Arabnya.
4. FORMAT RAPI & BERSIH: Gunakan bahasa mengalir, paragraf terstruktur, dan poin-poin yang mudah dibaca. JANGAN PERNAH memakai tanda kutip markdown mentah seperti '>' di awal baris dan JANGAN PERNAH memakai garis pemisah seperti '---' atau '***' di tengah ataupun di akhir jawaban. Tuliskan teks doa, terjemahan, dan kutipan secara langsung dan natural.
5. JAWABAN TUNTAS & LENGKAP: Jelaskan jawaban sampai tuntas dan lengkap hingga kesimpulan. Jangan pernah memotong kalimat di tengah jawaban.
6. DOA HARIAN & AMALAN: Bila pertanyaan menyangkut doa, permohonan, atau amalan sehari-hari, sertakan doa ma'tsur yang relevan dari referensi yang disediakan.`;

export interface AICitation {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText?: string;
  translation?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SURAH_NAME_TO_NUMBER: Record<string, number> = {
  'al-fatihah': 1, 'fatihah': 1, 'al-baqarah': 2, 'baqarah': 2, 'ali imran': 3, 'ali-imran': 3,
  'an-nisa': 4, 'an-nisa\'': 4, 'nisa': 4, 'al-maidah': 5, 'maidah': 5, 'al-anam': 6, 'al-an\'am': 6, 'anam': 6,
  'al-araf': 7, 'al-a\'raf': 7, 'araf': 7, 'al-anfal': 8, 'anfal': 8, 'at-taubah': 9, 'taubah': 9,
  'yunus': 10, 'hud': 11, 'yusuf': 12, 'ar-rad': 13, 'ar-ra\'d': 13, 'rad': 13,
  'ibrahim': 14, 'al-hijr': 15, 'hijr': 15, 'an-nahl': 16, 'nahl': 16, 'al-isra': 17, 'al-isra\'': 17, 'isra': 17,
  'al-kahf': 18, 'kahf': 18, 'maryam': 19, 'taha': 20, 'thaha': 20, 'al-anbiya': 21, 'al-anbiya\'': 21, 'anbiya': 21,
  'al-hajj': 22, 'hajj': 22, 'al-muminun': 23, 'al-mu\'minun': 23, 'muminun': 23,
  'an-nur': 24, 'nur': 24, 'al-furqan': 25, 'furqan': 25, 'asy-syuara': 26, 'asy-syu\'ara\'': 26,
  'an-naml': 27, 'naml': 27, 'al-qasas': 28, 'qasas': 28, 'al-ankabut': 29, 'al-\'ankabut': 29, 'ankabut': 29,
  'ar-rum': 30, 'rum': 30, 'luqman': 31, 'as-sajdah': 32, 'sajdah': 32, 'al-ahzab': 33, 'ahzab': 33,
  'saba': 34, 'saba\'': 34, 'fatir': 35, 'yasin': 36, 'ya sin': 36, 'as-saffat': 37, 'saffat': 37,
  'sad': 38, 'shad': 38, 'az-zumar': 39, 'zumar': 39, 'gafir': 40, 'ghafir': 40, 'al-mumin': 40,
  'fussilat': 41, 'asy-syura': 42, 'az-zukhruf': 43, 'ad-dukhan': 44, 'al-jasiyah': 45, 'al-ahqaf': 46,
  'muhammad': 47, 'al-fath': 48, 'fath': 48, 'al-hujurat': 49, 'hujurat': 49, 'qaf': 50, 'az-zariyat': 51,
  'at-tur': 52, 'tur': 52, 'an-najm': 53, 'najm': 53, 'al-qamar': 54, 'qamar': 54, 'ar-rahman': 55, 'rahman': 55,
  'al-waqiah': 56, 'al-waqi\'ah': 56, 'waqiah': 56, 'al-hadid': 57, 'hadid': 57, 'al-mujadilah': 58,
  'al-hasyr': 59, 'hasyr': 59, 'al-mumtahanah': 60, 'as-saff': 61, 'al-jumuah': 62, 'al-jumu\'ah': 62, 'jumat': 62,
  'al-munafiqun': 63, 'at-tagabun': 64, 'at-talaq': 65, 'talaq': 65, 'at-tahrim': 66, 'tahrim': 66,
  'al-mulk': 67, 'mulk': 67, 'al-qalam': 68, 'qalam': 68, 'al-haqqah': 69, 'al-maarij': 70, 'nuh': 71,
  'al-jinn': 72, 'jinn': 72, 'jin': 72, 'al-muzzammil': 73, 'muzzammil': 73, 'al-muddassir': 74, 'muddassir': 74,
  'al-qiyamah': 75, 'al-insan': 76, 'al-mursalat': 77, 'an-naba': 78, 'an-naba\'': 79, 'naba': 78,
  'an-naziat': 79, 'an-nazi\'at': 79, 'naziat': 79, 'abasa': 80, 'abbasa': 80, '\'abasa': 80,
  'at-takwir': 81, 'takwir': 81, 'al-infitar': 82, 'infitar': 82, 'al-mutaffifin': 83, 'mutaffifin': 83,
  'al-insyiqaq': 84, 'al-buruj': 85, 'buruj': 85, 'at-tariq': 86, 'tariq': 86, 'al-ala': 87, 'al-a\'la': 87,
  'al-gasiyah': 88, 'al-ghasyiyah': 88, 'al-fajr': 89, 'fajr': 89, 'al-balad': 90, 'balad': 90,
  'asy-syams': 91, 'syams': 91, 'al-lail': 92, 'lail': 92, 'ad-duha': 93, 'duha': 93, 'asy-syarh': 94, 'al-insyirah': 94, 'insyirah': 94,
  'at-tin': 95, 'tin': 95, 'al-alaq': 96, 'al-\'alaq': 96, 'alaq': 96, 'al-qadr': 97, 'qadr': 97,
  'al-bayyinah': 98, 'az-zalzalah': 99, 'zalzalah': 99, 'al-adiyat': 100, 'al-\'adiyat': 100, 'adiyat': 100,
  'al-qariah': 101, 'al-qari\'ah': 101, 'qariah': 101, 'at-takasur': 102, 'takasur': 102, 'al-asr': 103, 'al-\'asr': 103, 'asr': 103,
  'al-humazah': 104, 'humazah': 104, 'al-fil': 105, 'fil': 105, 'quraisy': 106, 'al-maun': 107, 'al-ma\'un': 107, 'maun': 107,
  'al-kausar': 108, 'kausar': 108, 'al-kafirun': 109, 'kafirun': 109, 'an-nasr': 110, 'nasr': 110,
  'al-lahab': 111, 'lahab': 111, 'al-ikhlas': 112, 'ikhlas': 112, 'al-falaq': 113, 'falaq': 113,
  'an-nas': 114, 'nas': 114
};

function cleanAssistantReply(text: string): string {
  if (!text) return '';
  return text
    .replace(/^(?:assalamu'?alaikum(?:\s+warahmatullahi(?:\s+wabarakaatuh)?)?|wa'?alaikumsalam[\w\s]*)[,.:!\-\s]*/i, '')
    .replace(/(\r?\n\s*[-*_]{3,}\s*)+$/g, '')
    .trim();
}

function parseDirectVerseQuery(query: string): { surahNumber: number; ayahNumber: number } | null {
  const q = query.toLowerCase().replace(/['"`]/g, '').trim();

  // 1. Ayat Kursi special case
  if (q.includes('kursi')) {
    return { surahNumber: 2, ayahNumber: 255 };
  }

  // 2. Reject queries containing counts or duration (e.g. "puasa 3 hari", "shalat 5 waktu", "2 rakaat")
  if (/\b\d+\s*(hari|waktu|rakaat|kali|bulan|tahun|orang|juz|malam)\b/i.test(q)) {
    return null;
  }

  // 3. Direct verse lookup MUST have explicit verse intent
  // Query must contain "ayat", "surat", "surah", or ":"
  const hasVerseIntent = /\b(ayat|surat|surah)\b/i.test(q) || /:\s*\d+/.test(q);
  if (!hasVerseIntent) {
    return null;
  }

  // 4. Extract the ayah number (must follow "ayat", "ke", ":", or "surah <name> <number>")
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

  // 5. Check if surah number was typed directly (e.g. "surah 2 ayat 255")
  const directSurahNumMatch = q.match(/(?:surah|surat)\s+(\d+)\s*(?:ayat|ke-?|:)\s*(\d+)/i);
  if (directSurahNumMatch) {
    const sNum = parseInt(directSurahNumMatch[1], 10);
    const aNum = parseInt(directSurahNumMatch[2], 10);
    if (sNum >= 1 && sNum <= 114 && aNum > 0) {
      return { surahNumber: sNum, ayahNumber: aNum };
    }
  }

  // 6. Match known surah names using exact word boundary (never partial letters)
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
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
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
      console.warn('Gemini embedding failed, trying fallback:', err);
    }
  }

  // 2. Secondary fallback: OpenAI (text-embedding-3-small)
  const openAiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text.slice(0, 1000),
          model: 'text-embedding-3-small',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.[0]?.embedding || [];
      }
    } catch (err) {
      console.error('OpenAI embedding error:', err);
    }
  }

  return [];
}

function extractCitations(results: VectorSearchResult[], text: string): AICitation[] {
  if (results.length > 0) {
    return results.map((r) => ({
      surahNumber: r.surah_number,
      ayahNumber: r.ayah_number,
      surahName: r.surah_name,
      arabicText: r.arabic_text,
      translation: r.translation,
    }));
  }

  const citations: AICitation[] = [];
  const seen = new Set<string>();
  const pattern = /(?:QS\.?|Surah|Surat)\s+([A-Za-z'\-\s]+?)[:\s]+(\d+)/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const rawSurah = match[1].trim().toLowerCase().replace(/['"`]/g, '');
    const ayahNum = parseInt(match[2], 10);
    const surahNum = SURAH_NAME_TO_NUMBER[rawSurah] || SURAH_NAME_TO_NUMBER[rawSurah.replace(/^al-?/, '')];

    if (surahNum && ayahNum > 0 && ayahNum <= 286) {
      const key = `${surahNum}-${ayahNum}`;
      if (!seen.has(key)) {
        seen.add(key);
        const displayName = match[1].trim();
        citations.push({
          surahNumber: surahNum,
          ayahNumber: ayahNum,
          surahName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        });
      }
    }
  }
  return citations.slice(0, 4);
}

function extractDuaCitations(duaResults: DuaSearchResult[]): AIDuaCitation[] {
  return duaResults.map((d) => ({
    duaId: d.dua_id,
    title: d.nama,
    group: d.grup,
    arabicText: d.arabic_text,
    transliteration: d.transliteration,
    translation: d.translation,
    source: d.tentang,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

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
              });
            }
          }
        }
      } catch (directErr) {
        console.warn('Direct verse lookup failed, proceeding to LLM:', directErr);
      }
    }

    // 2. Parallel Vector Search via pgvector (Ayat + Doa)
    const embedding = await generateEmbedding(message);
    let verseResults: VectorSearchResult[] = [];
    let duaResults: DuaSearchResult[] = [];

    if (embedding.length > 0) {
      const [vRes, dRes] = await Promise.all([
        searchVerses(embedding, 0.55, 3),
        searchDuas(embedding, 0.50, 3),
      ]);
      verseResults = vRes;
      duaResults = dRes;
    }

    // Build context sections
    let contextParts: string[] = [];

    if (verseResults.length > 0) {
      const verseContext = verseResults
        .map(
          (r, i) =>
            `[${i + 1}] QS. ${r.surah_name} Ayat ${r.ayah_number}:\n` +
            `Arab: ${r.arabic_text}\n` +
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
            `Arab: ${d.arabic_text}\n` +
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

    // 3. Try Gemini API (gemini-3.6-flash first, then gemini-2.5-flash)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      // Build multi-turn contents for Gemini with conversation history
      const geminiContents: { role: string; parts: { text: string }[] }[] = [];

      // First message includes system prompt + context
      geminiContents.push({
        role: 'user',
        parts: [{ text: `${systemPromptWithContext}\n\nPahami instruksi di atas dan jawab pertanyaan pengguna berikut.` }],
      });
      geminiContents.push({
        role: 'model',
        parts: [{ text: 'Baik, saya siap menjawab pertanyaan seputar Al-Qur\'an, doa, dan Islam berdasarkan rujukan shahih.' }],
      });

      // Add conversation history (last 10 messages for context)
      const historySlice = conversationHistory.slice(-10);
      for (const msg of historySlice) {
        if (msg.role === 'user') {
          geminiContents.push({ role: 'user', parts: [{ text: msg.content }] });
        } else if (msg.role === 'assistant') {
          geminiContents.push({ role: 'model', parts: [{ text: msg.content }] });
        }
      }

      // Add current user message
      geminiContents.push({ role: 'user', parts: [{ text: message }] });

      const geminiModels = ['gemini-3.6-flash', 'gemini-2.5-flash'];
      for (const model of geminiModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: geminiContents,
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 8192,
                },
              }),
            }
          );

          if (response.ok) {
            const json = await response.json();
            const rawReply = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawReply && rawReply.trim().length > 0) {
              const cleaned = cleanAssistantReply(rawReply);
              return NextResponse.json({
                text: cleaned,
                citations: extractCitations(verseResults, cleaned),
                duaCitations: extractDuaCitations(duaResults),
              });
            }
          }
        } catch (geminiErr) {
          console.warn(`Gemini (${model}) error:`, geminiErr);
        }
      }
    }

    // 4. Try Groq API fallback (qwen/qwen3.8-27b, then openai/gpt-oss-120b)
    const groqKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (groqKey) {
      const groqModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
      for (const model of groqModels) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPromptWithContext },
                ...conversationHistory.slice(-10),
                { role: 'user', content: message },
              ],
              temperature: 0.3,
              max_tokens: 4096,
            }),
          });

          if (response.ok) {
            const json = await response.json();
            const rawReply = json.choices?.[0]?.message?.content;
            if (rawReply && rawReply.trim().length > 0) {
              const cleaned = cleanAssistantReply(rawReply);
              return NextResponse.json({
                text: cleaned,
                citations: extractCitations(verseResults, cleaned),
                duaCitations: extractDuaCitations(duaResults),
              });
            }
          }
        } catch (groqErr) {
          console.warn(`Groq (${model}) error:`, groqErr);
        }
      }
    }

    return NextResponse.json({
      text: 'Maaf, layanan AI sedang sibuk. Silakan periksa koneksi internet Anda atau tanyakan kembali sesaat lagi.',
      citations: extractCitations(verseResults, ''),
      duaCitations: extractDuaCitations(duaResults),
    });
  } catch (error) {
    console.error('API /api/ai error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
