import { NextRequest, NextResponse } from 'next/server';
import { supabase, searchVerses, searchDuas, VectorSearchResult, DuaSearchResult } from '@/services/supabase';
import { AIDuaCitation } from '@/services/aiService';

export const maxDuration = 60; // Izinkan durasi eksekusi hingga 60 detik (1 menit)

const SYSTEM_PROMPT = `Anda adalah asisten Al-Qur'an dan konsultan Islami terpercaya bernama "EQuran AI".
Tugas utama Anda adalah menjawab pertanyaan pengguna secara bijaksana, alami, to-the-point, dan HANYA bersandar pada ayat-ayat Al-Qur'an, Hadits shahih, dan doa-doa ma'tsur serta tafsir terpercaya.

PEDOMAN UTAMA:
1. BAHASA ALAMI & LANGSUNG: JANGAN PERNAH memulai jawaban dengan ucapan salam ritual seperti "Assalamu'alaikum", "Wa'alaikumussalam", atau basa-basi panjang. Langsung masuk ke inti penjelasan secara hangat, mengalir, dan bersahabat.
2. PONDASI SHAHIH: Berikan dalil ayat Al-Qur'an yang relevan dan selalu sebutkan rujukannya dalam format: [QS. Nama-Surah: Nomor-Ayat] (contoh: [QS. Al-Baqarah: 153]).
3. TEKS ARAB JELAS & LENGKAP: Bila menyertakan ayat Al-Qur'an, penjelasan tafsir, atau doa (terutama saat menyebutkan 'Allah berfirman', firman Allah, atau dalil ayat), WAJIB tuliskan teks Arab berharakat secara lengkap di baris tersendiri dalam font Arab, disusul transliterasi (Latin) dan terjemahannya. JANGAN PERNAH mengutip firman Allah hanya berupa terjemahan tanpa menyertakan teks Arabnya.
4. FORMAT RAPI & BERSIH: Gunakan bahasa mengalir, paragraf terstruktur, dan poin-poin yang mudah dibaca. JANGAN PERNAH memakai tanda kutip markdown mentah seperti '>' di awal baris dan JANGAN PERNAH memakai garis pemisah seperti '---' atau '***' di tengah ataupun di akhir jawaban. Tuliskan teks doa, terjemahan, dan kutipan secara langsung dan natural.
5. JAWABAN TUNTAS & LENGKAP: Jelaskan jawaban sampai tuntas dan lengkap hingga kesimpulan. Jangan pernah memotong kalimat di tengah jawaban.
6. DOA HARIAN & HADITS MA'TSUR: Bila pertanyaan menyangkut doa, permohonan, atau amalan sehari-hari (misalnya doa sebelum makan, doa sesudah makan, doa tidur, dsb.), sertakan doa ma'tsur yang shahih dan sebenarnya (contoh: doa sebelum makan adalah "بِسْمِ اللّٰهِ" atau "اَللَّهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ"). DILARANG KERAS menaruh ayat Al-Qur'an (seperti QS. An-Nahl: 115 atau QS. Al-Baqarah: 173) di bawah bagian doa harian/doa makan!
7. PENJELASAN MENDALAM & TAFSIR: Bila pengguna menanyakan penjelasan, tafsir, makna, kandungan, atau keutamaan dari suatu ayat (misalnya Ayat Kursi), berikan penjelasan yang komprehensif, menguraikan makna kalimat per kalimat, hikmah di dalamnya, serta keutamaannya, bukan hanya menampilkan potongan ayatnya saja.
8. INTEGRITAS MUTLAK AYAT AL-QUR'AN (ANTI-HALUSINASI):
- Al-Qur'an adalah firman Allah yang suci, tidak boleh ada satu huruf pun yang salah, tertukar, atau dikurangi.
- DILARANG KERAS mengarang, mengubah awalan huruf, atau menuliskan teks Arab dan transliterasi Latin dari hafalan sendiri yang rentan salah/halusinasi.
- Jika ayat atau doa terdapat dalam referensi [REFERENSI AYAT AL-QUR'AN], Anda WAJIB MENYALIN 100% PERSIS teks Arab, transliterasi Latin, dan terjemahan langsung dari referensi tersebut. Jangan ubah huruf, harakat, maupun artinya!
- JANGAN PERNAH menukar ayat Al-Qur'an dengan doa makan atau doa harian lainnya. Teks ayat Al-Qur'an hanya untuk dalil firman Allah yang bersangkutan.
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

  // 1. REJECT if the query is an EXPLANATION, TAFSIR, INQUIRY, or QUESTION!
  // If the user wants explanation, tafsir, meaning, wisdom, context, history, etc.,
  // it MUST NOT be short-circuited to a raw verse lookup. The AI must explain it!
  const isExplanationOrInquiry =
    /\b(penjelasan|jelaskan|dijelaskan|tafsir|makna|kandungan|maksud|arti|keutamaan|fadhilah|faedah|hikmah|khasiat|manfaat|sebab|asbab|mengapa|kenapa|bagaimana|apa itu|siapa|tentang|hukum|cerita|kisah|rahasia|maksudnya|sejarah)\b/i.test(q) ||
    /^(apa|bagaimana|kenapa|mengapa|siapa|jelaskan|ceritakan)/i.test(q);

  if (isExplanationOrInquiry) {
    return null;
  }

  // 2. Ayat Kursi direct lookup (only when directly asking for the verse itself)
  if (q.includes('kursi')) {
    return { surahNumber: 2, ayahNumber: 255 };
  }

  // 3. Reject queries containing counts or duration (e.g. "puasa 3 hari", "shalat 5 waktu", "2 rakaat")
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

function normalizeSurahName(name: string): string {
  return name.toLowerCase()
    .replace(/[āá]/g, 'a')
    .replace(/[īí]/g, 'i')
    .replace(/[ūú]/g, 'u')
    .replace(/[’'`]/g, '')
    .trim();
}

function findVerseReferences(text: string): { surah: number; ayah: number }[] {
  const refs: { surah: number; ayah: number }[] = [];
  const seen = new Set<string>();

  // Matches formats like:
  // 1. QS. Al-Isra: 32 or Surah Al-Isra 32
  // 2. Al-Isrā' [17]:32 or [17:32]
  // 3. Al-Isra ayat 32 or Al-Isra ke-32
  const p1 = /(?:QS\.?|Surah|Surat)\s+([A-Za-zāīū’'`\-\s]+?)[:\s]+(\d+)/gi;
  const p2 = /([A-Za-zāīū’'`\-]+?)\s*\[(\d+)\]:\s*(\d+)/gi;
  const p3 = /\[(\d+)[:\s]+(\d+)\]/g;
  const p4 = /([A-Za-zāīū’'`\-]+?)\s+(?:ayat|ke-?)\s*(\d+)/gi;

  let m;
  while ((m = p1.exec(text)) !== null) {
    const raw = normalizeSurahName(m[1]);
    const ayah = parseInt(m[2], 10);
    const sNum = SURAH_NAME_TO_NUMBER[raw] || SURAH_NAME_TO_NUMBER[raw.replace(/^al-?/, '')];
    if (sNum && ayah > 0) {
      const k = `${sNum}:${ayah}`;
      if (!seen.has(k)) { seen.add(k); refs.push({ surah: sNum, ayah }); }
    }
  }

  while ((m = p2.exec(text)) !== null) {
    const sNum = parseInt(m[2], 10);
    const ayah = parseInt(m[3], 10);
    if (sNum >= 1 && sNum <= 114 && ayah > 0) {
      const k = `${sNum}:${ayah}`;
      if (!seen.has(k)) { seen.add(k); refs.push({ surah: sNum, ayah }); }
    }
  }

  while ((m = p3.exec(text)) !== null) {
    const sNum = parseInt(m[1], 10);
    const ayah = parseInt(m[2], 10);
    if (sNum >= 1 && sNum <= 114 && ayah > 0) {
      const k = `${sNum}:${ayah}`;
      if (!seen.has(k)) { seen.add(k); refs.push({ surah: sNum, ayah }); }
    }
  }

  while ((m = p4.exec(text)) !== null) {
    const raw = normalizeSurahName(m[1]);
    const ayah = parseInt(m[2], 10);
    const sNum = SURAH_NAME_TO_NUMBER[raw] || SURAH_NAME_TO_NUMBER[raw.replace(/^al-?/, '')];
    if (sNum && ayah > 0) {
      const k = `${sNum}:${ayah}`;
      if (!seen.has(k)) { seen.add(k); refs.push({ surah: sNum, ayah }); }
    }
  }

  return refs;
}

function isArabicLine(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  const arabicMatches = trimmed.match(
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g
  );
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  return arabicCount >= 3 && arabicCount >= trimmed.replace(/\s+/g, '').length * 0.4;
}

/**
 * Grounding Validator: Verifies and replaces any hallucinated Arabic text or
 * Latin transliteration in the AI reply with 100% authentic, verified verses from Supabase.
 */
async function groundReply(replyText: string, knownVerses: VectorSearchResult[] = []): Promise<string> {
  const refs = findVerseReferences(replyText);
  if (refs.length === 0) return replyText;

  const verseMap = new Map<string, { arabic_text: string; transliteration?: string; translation?: string; surah_name?: string }>();
  for (const v of knownVerses) {
    verseMap.set(`${v.surah_number}:${v.ayah_number}`, v);
  }

  const missingRefs = refs.filter(r => !verseMap.has(`${r.surah}:${r.ayah}`));
  if (missingRefs.length > 0 && supabase) {
    try {
      const orClauses = missingRefs.map(r => `and(surah_number.eq.${r.surah},ayah_number.eq.${r.ayah})`).join(',');
      const { data } = await supabase
        .from('verses')
        .select('surah_number, ayah_number, surah_name, arabic_text, transliteration, translation')
        .or(orClauses);
      if (data) {
        for (const row of data) {
          verseMap.set(`${row.surah_number}:${row.ayah_number}`, row);
        }
      }
    } catch (e) {
      console.warn('Grounding fetch missing verses error:', e);
    }
  }

  const lines = replyText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineRefs = findVerseReferences(line);
    if (lineRefs.length === 0) continue;

    const ref = lineRefs[0];
    const key = `${ref.surah}:${ref.ayah}`;
    const authentic = verseMap.get(key);
    if (!authentic || !authentic.arabic_text) continue;

    // Scan strictly within the immediate next 1-3 lines for the verse's Arabic text.
    // If we encounter a bullet item, numbered list, markdown heading, or a "Doa" / "Hadits" label, stop immediately.
    let targetArabicLineIndex = -1;
    for (let k = i + 1; k < Math.min(i + 4, lines.length); k++) {
      const nextLine = lines[k].trim();
      if (!nextLine) continue; // blank line allowed

      // If we encounter a list item, markdown heading, or a "Doa" / "Hadits" / "Dzikir" label, abort
      if (
        /^[-*•]/.test(nextLine) ||
        /^\d+\./.test(nextLine) ||
        /^[a-zA-Z]\./.test(nextLine) ||
        /^#{1,6}\s/.test(nextLine) ||
        /\b(?:doa|hadis|hadits|dzikir)\b/i.test(nextLine)
      ) {
        break;
      }

      if (isArabicLine(nextLine)) {
        // Double check: if the preceding line mentions "doa" or "hadits", don't treat as Quran verse
        const prevLine = lines[k - 1]?.trim() || '';
        if (/\b(?:doa|hadis|hadits)\b/i.test(prevLine)) {
          break;
        }
        targetArabicLineIndex = k;
        break;
      } else {
        // If we hit non-Arabic non-blank text (e.g. regular Indonesian sentence), this citation was an inline reference!
        break;
      }
    }

    if (targetArabicLineIndex !== -1) {
      lines[targetArabicLineIndex] = authentic.arabic_text.trim();

      // Check if next non-empty line is Latin transliteration
      for (let j = targetArabicLineIndex + 1; j < Math.min(targetArabicLineIndex + 4, lines.length); j++) {
        const nextTrimmed = lines[j].trim();
        if (nextTrimmed.length > 0) {
          if (
            !nextTrimmed.startsWith('“') &&
            !nextTrimmed.startsWith('"') &&
            !nextTrimmed.toLowerCase().startsWith('arti') &&
            !nextTrimmed.toLowerCase().startsWith('tafsir') &&
            !nextTrimmed.startsWith('#') &&
            !nextTrimmed.startsWith('>')
          ) {
            if (authentic.transliteration) {
              lines[j] = authentic.transliteration.trim();
            }
          }
          break;
        }
      }
    }
  }

  return lines.join('\n');
}

async function extractCitationsWithSupabase(results: VectorSearchResult[], text: string): Promise<AICitation[]> {
  const refs = findVerseReferences(text);
  const citations: AICitation[] = [];
  const seen = new Set<string>();

  for (const r of refs) {
    const key = `${r.surah}:${r.ayah}`;
    if (!seen.has(key)) {
      seen.add(key);
      const match = results.find(v => v.surah_number === r.surah && v.ayah_number === r.ayah);
      if (match) {
        citations.push({
          surahNumber: match.surah_number,
          ayahNumber: match.ayah_number,
          surahName: match.surah_name,
          arabicText: match.arabic_text,
          translation: match.translation,
        });
      } else if (supabase) {
        try {
          const { data } = await supabase
            .from('verses')
            .select('surah_number, ayah_number, surah_name, arabic_text, translation')
            .eq('surah_number', r.surah)
            .eq('ayah_number', r.ayah)
            .maybeSingle();

          if (data) {
            citations.push({
              surahNumber: data.surah_number,
              ayahNumber: data.ayah_number,
              surahName: data.surah_name,
              arabicText: data.arabic_text,
              translation: data.translation,
            });
          }
        } catch {}
      }
    }
  }

  if (citations.length === 0 && results.length > 0) {
    return results.slice(0, 6).map((r) => ({
      surahNumber: r.surah_number,
      ayahNumber: r.ayah_number,
      surahName: r.surah_name,
      arabicText: r.arabic_text,
      translation: r.translation,
    }));
  }

  return citations.slice(0, 8);
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
        searchVerses(embedding, 0.45, 8),
        searchDuas(embedding, 0.45, 5),
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
            `Arab: ${r.arabic_text}\n` +
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

    // 3. Try ultra-fast Groq API FIRST (Qwen 27B / GPT-OSS 120B respond in ~1.5s with excellent Arabic & Islamic grounding)
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
            signal: AbortSignal.timeout(30000), // Max 30s wait for Groq
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPromptWithContext },
                ...conversationHistory.slice(-10),
                { role: 'user', content: message },
              ],
              temperature: 0.3,
              max_tokens: 3000,
            }),
          });

          if (response.ok) {
            const json = await response.json();
            const rawReply = json.choices?.[0]?.message?.content;
            if (rawReply && rawReply.trim().length > 0) {
              const cleaned = cleanAssistantReply(rawReply);
              const grounded = await groundReply(cleaned, verseResults);
              const citations = await extractCitationsWithSupabase(verseResults, grounded);
              return NextResponse.json({
                text: grounded,
                citations,
                duaCitations: extractDuaCitations(duaResults),
              });
            }
          }
        } catch (groqErr) {
          console.warn(`Groq (${model}) error:`, groqErr);
        }
      }
    }

    // 4. Secondary fallback: Gemini API with 60s timeout
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
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

      const geminiModels = ['gemini-3.6-flash', 'gemini-flash-latest'];
      for (const model of geminiModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(60000), // Max 60s (1 menit) wait per model
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
              const grounded = await groundReply(cleaned, verseResults);
              const citations = await extractCitationsWithSupabase(verseResults, grounded);
              return NextResponse.json({
                text: grounded,
                citations,
                duaCitations: extractDuaCitations(duaResults),
              });
            }
          }
        } catch (geminiErr) {
          console.warn(`Gemini (${model}) error or timeout:`, geminiErr);
        }
      }
    }

    // If all models failed or are busy, return error message with NO citations
    return NextResponse.json({
      text: 'Maaf, layanan AI sedang sibuk. Silakan periksa koneksi internet Anda atau tanyakan kembali sesaat lagi.',
      citations: [],
      duaCitations: [],
    });
  } catch (error) {
    console.error('API /api/ai error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
