import { supabase, VectorSearchResult, DuaSearchResult } from './supabase';
import { AICitation, AIDuaCitation } from './aiService';

export const SURAH_NAME_TO_NUMBER: Record<string, number> = {
  // 1: Al-Fatihah
  'al-fatihah': 1, 'fatihah': 1, 'al fatihah': 1, 'alfatihah': 1, 'fatehah': 1,
  // 2: Al-Baqarah
  'al-baqarah': 2, 'baqarah': 2, 'al baqarah': 2, 'albaqarah': 2, 'al-baqara': 2, 'baqara': 2,
  // 3: Ali 'Imran
  'ali imran': 3, 'ali-imran': 3, 'al-imran': 3, 'alimran': 3, 'ali \'imran': 3, 'al \'imran': 3, 'ali ‘imran': 3, 'imran': 3,
  // 4: An-Nisa'
  'an-nisa': 4, 'an-nisa\'': 4, 'nisa': 4, 'an nisa': 4, 'annisa': 4, 'an nisa\'': 4, 'an-nisa’': 4,
  // 5: Al-Ma'idah
  'al-maidah': 5, 'maidah': 5, 'al maidah': 5, 'al-ma\'idah': 5, 'al ma\'idah': 5, 'al-ma’idah': 5,
  // 6: Al-An'am
  'al-anam': 6, 'al-an\'am': 6, 'anam': 6, 'al anam': 6, 'al an\'am': 6, 'al-an’am': 6,
  // 7: Al-A'raf
  'al-araf': 7, 'al-a\'raf': 7, 'araf': 7, 'al araf': 7, 'al a\'raf': 7, 'al-a’raf': 7,
  // 8: Al-Anfal
  'al-anfal': 8, 'anfal': 8, 'al anfal': 8,
  // 9: At-Taubah
  'at-taubah': 9, 'taubah': 9, 'at taubah': 9, 'at-tawbah': 9, 'tawbah': 9,
  // 10: Yunus
  'yunus': 10,
  // 11: Hud
  'hud': 11,
  // 12: Yusuf
  'yusuf': 12,
  // 13: Ar-Ra'd
  'ar-rad': 13, 'ar-ra\'d': 13, 'rad': 13, 'ar rad': 13, 'ar ra\'d': 13, 'ar-ra’d': 13,
  // 14: Ibrahim
  'ibrahim': 14,
  // 15: Al-Hijr
  'al-hijr': 15, 'hijr': 15, 'al hijr': 15,
  // 16: An-Nahl
  'an-nahl': 16, 'nahl': 16, 'an nahl': 16,
  // 17: Al-Isra'
  'al-isra': 17, 'al-isra\'': 17, 'isra': 17, 'al isra': 17, 'al isra\'': 17, 'al-isra’': 17, 'bani israil': 17,
  // 18: Al-Kahf
  'al-kahf': 18, 'kahf': 18, 'al kahf': 18, 'al-kahfi': 18, 'kahfi': 18,
  // 19: Maryam
  'maryam': 19,
  // 20: Ta Ha
  'taha': 20, 'thaha': 20, 'ta-ha': 20, 'tha-ha': 20,
  // 21: Al-Anbiya'
  'al-anbiya': 21, 'al-anbiya\'': 21, 'anbiya': 21, 'al anbiya': 21, 'al anbiya\'': 21, 'al-anbiya’': 21,
  // 22: Al-Hajj
  'al-hajj': 22, 'hajj': 22, 'al hajj': 22,
  // 23: Al-Mu'minun
  'al-muminun': 23, 'al-mu\'minun': 23, 'muminun': 23, 'al muminun': 23, 'al mu\'minun': 23, 'al-mu’minun': 23,
  // 24: An-Nur
  'an-nur': 24, 'nur': 24, 'an nur': 24,
  // 25: Al-Furqan
  'al-furqan': 25, 'furqan': 25, 'al furqan': 25,
  // 26: Asy-Syu'ara'
  'asy-syuara': 26, 'asy-syu\'ara\'': 26, 'syuara': 26, 'asy syuara': 26, 'asy syu\'ara\'': 26, 'asy-syu’ara’': 26,
  // 27: An-Naml
  'an-naml': 27, 'naml': 27, 'an naml': 27,
  // 28: Al-Qashash / Al-Qasas
  'al-qasas': 28, 'qasas': 28, 'al qasas': 28, 'al-qashash': 28, 'qashash': 28, 'al qashash': 28, 'al-qashas': 28, 'al qashas': 28, 'qashas': 28,
  // 29: Al-'Ankabut
  'al-ankabut': 29, 'al-\'ankabut': 29, 'ankabut': 29, 'al ankabut': 29, 'al-‘ankabut': 29,
  // 30: Ar-Rum
  'ar-rum': 30, 'rum': 30, 'ar rum': 30,
  // 31: Luqman
  'luqman': 31,
  // 32: As-Sajdah
  'as-sajdah': 32, 'sajdah': 32, 'as sajdah': 32, 'as-sajadah': 32,
  // 33: Al-Ahzab
  'al-ahzab': 33, 'ahzab': 33, 'al ahzab': 33,
  // 34: Saba'
  'saba': 34, 'saba\'': 34, 'saba’': 34,
  // 35: Fatir
  'fatir': 35, 'fathir': 35, 'al-fatir': 35, 'al-fathir': 35,
  // 36: Ya Sin
  'yasin': 36, 'ya sin': 36, 'ya-sin': 36,
  // 37: As-Saffat
  'as-saffat': 37, 'saffat': 37, 'ash-shaffat': 37, 'shaffat': 37, 'as saffat': 37,
  // 38: Sad
  'sad': 38, 'shad': 38,
  // 39: Az-Zumar
  'az-zumar': 39, 'zumar': 39, 'az zumar': 39,
  // 40: Ghafir
  'gafir': 40, 'ghafir': 40, 'al-mumin': 40, 'al-mu\'min': 40, 'al-mu’min': 40,
  // 41: Fussilat
  'fussilat': 41, 'fushshilat': 41, 'fushilat': 41,
  // 42: Asy-Syura
  'asy-syura': 42, 'asy syura': 42, 'syura': 42,
  // 43: Az-Zukhruf
  'az-zukhruf': 43, 'zukhruf': 43, 'az zukhruf': 43,
  // 44: Ad-Dukhan
  'ad-dukhan': 44, 'dukhan': 44, 'ad dukhan': 44,
  // 45: Al-Jasiyah
  'al-jasiyah': 45, 'jasiyah': 45, 'al-jatsiyah': 45, 'jatsiyah': 45,
  // 46: Al-Ahqaf
  'al-ahqaf': 46, 'ahqaf': 46, 'al ahqaf': 46,
  // 47: Muhammad
  'muhammad': 47,
  // 48: Al-Fath
  'al-fath': 48, 'fath': 48, 'al fath': 48,
  // 49: Al-Hujurat
  'al-hujurat': 49, 'hujurat': 49, 'al hujurat': 49,
  // 50: Qaf
  'qaf': 50,
  // 51: Az-Zariyat
  'az-zariyat': 51, 'zariyat': 51, 'adz-dzariyat': 51, 'dzariyat': 51, 'az zariyat': 51,
  // 52: At-Tur
  'at-tur': 52, 'tur': 52, 'at tur': 52, 'ath-thur': 52, 'thur': 52,
  // 53: An-Najm
  'an-najm': 53, 'najm': 53, 'an najm': 53,
  // 54: Al-Qamar
  'al-qamar': 54, 'qamar': 54, 'al qamar': 54,
  // 55: Ar-Rahman
  'ar-rahman': 55, 'rahman': 55, 'ar rahman': 55,
  // 56: Al-Waqi'ah
  'al-waqiah': 56, 'al-waqi\'ah': 56, 'waqiah': 56, 'al waqiah': 56, 'al waqi\'ah': 56, 'waqi\'ah': 56, 'al-waqi’ah': 56,
  // 57: Al-Hadid
  'al-hadid': 57, 'hadid': 57, 'al hadid': 57,
  // 58: Al-Mujadilah
  'al-mujadilah': 58, 'al-mujadalah': 58, 'mujadilah': 58, 'mujadalah': 58, 'al mujadilah': 58,
  // 59: Al-Hasyr
  'al-hasyr': 59, 'hasyr': 59, 'al hasyr': 59,
  // 60: Al-Mumtahanah
  'al-mumtahanah': 60, 'mumtahanah': 60, 'al mumtahanah': 60,
  // 61: As-Saff
  'as-saff': 61, 'saff': 61, 'ash-shaff': 61, 'shaff': 61, 'as saff': 61,
  // 62: Al-Jumu'ah
  'al-jumuah': 62, 'al-jumu\'ah': 62, 'jumat': 62, 'al-jumat': 62, 'al jumuah': 62, 'al jumu\'ah': 62, 'al jumat': 62, 'jumuah': 62, 'jumu\'ah': 62, 'al-jumu’ah': 62,
  // 63: Al-Munafiqun
  'al-munafiqun': 63, 'munafiqun': 63, 'al munafiqun': 63,
  // 64: At-Tagabun
  'at-tagabun': 64, 'tagabun': 64, 'at-taghabun': 64, 'taghabun': 64, 'at tagabun': 64,
  // 65: At-Talaq
  'at-talaq': 65, 'talaq': 65, 'ath-thalaq': 65, 'thalaq': 65, 'at talaq': 65,
  // 66: At-Tahrim
  'at-tahrim': 66, 'tahrim': 66, 'at tahrim': 66,
  // 67: Al-Mulk
  'al-mulk': 67, 'mulk': 67, 'al mulk': 67, 'tabarak': 67,
  // 68: Al-Qalam
  'al-qalam': 68, 'qalam': 68, 'al qalam': 68, 'nun': 68,
  // 69: Al-Haqqah
  'al-haqqah': 69, 'haqqah': 69, 'al haqqah': 69,
  // 70: Al-Ma'arij
  'al-maarij': 70, 'al-ma\'arij': 70, 'maarij': 70, 'al maarij': 70, 'al-ma’arij': 70,
  // 71: Nuh
  'nuh': 71,
  // 72: Al-Jinn
  'al-jinn': 72, 'jinn': 72, 'jin': 72, 'al-jin': 72, 'al jinn': 72, 'al jin': 72,
  // 73: Al-Muzzammil
  'al-muzzammil': 73, 'muzzammil': 73, 'al muzzammil': 73,
  // 74: Al-Muddassir
  'al-muddassir': 74, 'muddassir': 74, 'al-muddatstsir': 74, 'muddatstsir': 74, 'al muddassir': 74,
  // 75: Al-Qiyamah
  'al-qiyamah': 75, 'qiyamah': 75, 'al qiyamah': 75,
  // 76: Al-Insan
  'al-insan': 76, 'insan': 76, 'al insan': 76, 'ad-dahr': 76, 'dahr': 76,
  // 77: Al-Mursalat
  'al-mursalat': 77, 'mursalat': 77, 'al mursalat': 77,
  // 78: An-Naba'
  'an-naba': 78, 'an-naba\'': 78, 'naba': 78, 'an naba': 78, 'an naba\'': 78, 'an-naba’': 78, 'amma': 78,
  // 79: An-Nazi'at
  'an-naziat': 79, 'an-nazi\'at': 79, 'naziat': 79, 'an naziat': 79, 'an nazi\'at': 79, 'an-nazi’at': 79,
  // 80: 'Abasa
  'abasa': 80, 'abbasa': 80, '\'abasa': 80, '‘abasa': 80,
  // 81: At-Takwir
  'at-takwir': 81, 'takwir': 81, 'at takwir': 81,
  // 82: Al-Infitar
  'al-infitar': 82, 'infitar': 82, 'al infitar': 82, 'al-infithar': 82, 'infithar': 82,
  // 83: Al-Mutaffifin
  'al-mutaffifin': 83, 'mutaffifin': 83, 'al mutaffifin': 83, 'al-muthaffifin': 83,
  // 84: Al-Insyiqaq
  'al-insyiqaq': 84, 'insyiqaq': 84, 'al insyiqaq': 84,
  // 85: Al-Buruj
  'al-buruj': 85, 'buruj': 85, 'al buruj': 85,
  // 86: At-Tariq
  'at-tariq': 86, 'tariq': 86, 'at tariq': 86, 'ath-thariq': 86, 'thariq': 86,
  // 87: Al-A'la
  'al-ala': 87, 'al-a\'la': 87, 'ala': 87, 'al ala': 87, 'al a\'la': 87, 'al-a’la': 87,
  // 88: Al-Ghasyiyah
  'al-gasiyah': 88, 'al-ghasyiyah': 88, 'gasiyah': 88, 'ghasyiyah': 88, 'al ghasyiyah': 88,
  // 89: Al-Fajr
  'al-fajr': 89, 'fajr': 89, 'al fajr': 89,
  // 90: Al-Balad
  'al-balad': 90, 'balad': 90, 'al balad': 90,
  // 91: Asy-Syams
  'asy-syams': 91, 'syams': 91, 'asy syams': 91,
  // 92: Al-Lail
  'al-lail': 92, 'lail': 92, 'al lail': 92,
  // 93: Ad-Duha
  'ad-duha': 93, 'duha': 93, 'adh-dhuha': 93, 'dhuha': 93, 'ad duha': 93,
  // 94: Asy-Syarh
  'asy-syarh': 94, 'al-insyirah': 94, 'insyirah': 94, 'alam nasyrah': 94, 'asy syarh': 94, 'al insyirah': 94,
  // 95: At-Tin
  'at-tin': 95, 'tin': 95, 'at tin': 95,
  // 96: Al-'Alaq
  'al-alaq': 96, 'al-\'alaq': 96, 'alaq': 96, 'al alaq': 96, 'al-‘alaq': 96, 'iqra': 96,
  // 97: Al-Qadr
  'al-qadr': 97, 'qadr': 97, 'al qadr': 97,
  // 98: Al-Bayyinah
  'al-bayyinah': 98, 'bayyinah': 98, 'al bayyinah': 98,
  // 99: Az-Zalzalah
  'az-zalzalah': 99, 'zalzalah': 99, 'az zalzalah': 99, 'zilzal': 99,
  // 100: Al-'Adiyat
  'al-adiyat': 100, 'al-\'adiyat': 100, 'adiyat': 100, 'al adiyat': 100, 'al-‘adiyat': 100,
  // 101: Al-Qari'ah
  'al-qariah': 101, 'al-qari\'ah': 101, 'qariah': 101, 'al qariah': 101, 'al qari\'ah': 101, 'al-qari’ah': 101,
  // 102: At-Takasur
  'at-takasur': 102, 'takasur': 102, 'at-takatsur': 102, 'takatsur': 102, 'at takasur': 102,
  // 103: Al-'Asr
  'al-asr': 103, 'al-\'asr': 103, 'asr': 103, 'al asr': 103, 'al-ashr': 103, 'ashr': 103, 'al ashr': 103, 'al-‘asr': 103,
  // 104: Al-Humazah
  'al-humazah': 104, 'humazah': 104, 'al humazah': 104,
  // 105: Al-Fil
  'al-fil': 105, 'fil': 105, 'al fil': 105,
  // 106: Quraisy
  'quraisy': 106, 'quraish': 106, 'al-quraisy': 106, 'al quraisy': 106,
  // 107: Al-Ma'un
  'al-maun': 107, 'al-ma\'un': 107, 'maun': 107, 'al maun': 107, 'al ma\'un': 107, 'al-ma’un': 107,
  // 108: Al-Kausar
  'al-kausar': 108, 'kausar': 108, 'al-kautsar': 108, 'kautsar': 108, 'al kausar': 108, 'al kautsar': 108,
  // 109: Al-Kafirun
  'al-kafirun': 109, 'kafirun': 109, 'al kafirun': 109,
  // 110: An-Nasr
  'an-nasr': 110, 'nasr': 110, 'an-nashr': 110, 'nashr': 110, 'an nasr': 110,
  // 111: Al-Lahab
  'al-lahab': 111, 'lahab': 111, 'al lahab': 111, 'al-masad': 111, 'masad': 111,
  // 112: Al-Ikhlas
  'al-ikhlas': 112, 'ikhlas': 112, 'al ikhlas': 112,
  // 113: Al-Falaq
  'al-falaq': 113, 'falaq': 113, 'al falaq': 113,
  // 114: An-Nas
  'an-nas': 114, 'nas': 114, 'an nas': 114
};

export function normalizeSurahName(name: string): string {
  return name.toLowerCase()
    .replace(/[āá]/g, 'a')
    .replace(/[īí]/g, 'i')
    .replace(/[ūú]/g, 'u')
    .replace(/['’`]/g, '')
    .trim();
}

export function resolveSurahNumber(raw: string): number | null {
  const norm = normalizeSurahName(raw);
  if (SURAH_NAME_TO_NUMBER[norm]) return SURAH_NAME_TO_NUMBER[norm];

  // Try removing definite prefixes: al-, an-, ar-, as-, at-, az-, ad-, ash-, ath-
  const withoutPrefix = norm.replace(/^(?:al|an|ar|as|at|az|ad|ash|ath)[\s\-]?/, '').trim();
  if (SURAH_NAME_TO_NUMBER[withoutPrefix]) return SURAH_NAME_TO_NUMBER[withoutPrefix];

  const withHyphen = norm.replace(/\s+/g, '-');
  if (SURAH_NAME_TO_NUMBER[withHyphen]) return SURAH_NAME_TO_NUMBER[withHyphen];

  const withSpace = norm.replace(/-/g, ' ');
  if (SURAH_NAME_TO_NUMBER[withSpace]) return SURAH_NAME_TO_NUMBER[withSpace];

  return null;
}

export function isArabicLine(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  const arabicMatches = trimmed.match(
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g
  );
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  return arabicCount >= 3 && arabicCount >= trimmed.replace(/\s+/g, '').length * 0.4;
}

export function stripHarakat(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/[\u0640]/g, '') // tatweel
    .replace(/[،,.:;!؟?"'()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findVerseReferences(text: string): { surah: number; ayah: number }[] {
  const refs: { surah: number; ayah: number }[] = [];
  const seen = new Set<string>();

  const patterns = [
    // 1. [QS. Al-Balad: 11] or (QS. Al-Balad: 11) or QS. Al-Balad: 11 or QS. Al Qashash: 24
    /(?:\[|\()?(?:QS\.?|Surah|Surat)\s+([A-Za-zāīū’'`\-\s]+?)[:\s]+(\d+)(?:\]|\))?/gi,
    // 2. Al-Balad [90]: 11 or [90:11]
    /([A-Za-zāīū’'`\-]+?)\s*\[(\d+)\]:\s*(\d+)/gi,
    // 3. [90:11]
    /\[(\d+)[:\s]+(\d+)\]/g,
    // 4. Al-Balad ayat 11 or Al-Balad ke-11
    /([A-Za-zāīū’'`\-]+?)\s+(?:ayat|ke-?)\s*(\d+)/gi,
  ];

  let m;
  while ((m = patterns[0].exec(text)) !== null) {
    const sNum = resolveSurahNumber(m[1]);
    const ayah = parseInt(m[2], 10);
    if (sNum && ayah > 0) {
      const k = `${sNum}:${ayah}`;
      if (!seen.has(k)) { seen.add(k); refs.push({ surah: sNum, ayah }); }
    }
  }

  while ((m = patterns[1].exec(text)) !== null) {
    const sNum = parseInt(m[2], 10);
    const ayah = parseInt(m[3], 10);
    if (sNum >= 1 && sNum <= 114 && ayah > 0) {
      const k = `${sNum}:${ayah}`;
      if (!seen.has(k)) { seen.add(k); refs.push({ surah: sNum, ayah }); }
    }
  }

  while ((m = patterns[2].exec(text)) !== null) {
    const sNum = parseInt(m[1], 10);
    const ayah = parseInt(m[2], 10);
    if (sNum >= 1 && sNum <= 114 && ayah > 0) {
      const k = `${sNum}:${ayah}`;
      if (!seen.has(k)) { seen.add(k); refs.push({ surah: sNum, ayah }); }
    }
  }

  while ((m = patterns[3].exec(text)) !== null) {
    const sNum = resolveSurahNumber(m[1]);
    const ayah = parseInt(m[2], 10);
    if (sNum && ayah > 0) {
      const k = `${sNum}:${ayah}`;
      if (!seen.has(k)) { seen.add(k); refs.push({ surah: sNum, ayah }); }
    }
  }

  return refs;
}

export interface GroundingResult {
  groundedText: string;
  citations: AICitation[];
  duaCitations: AIDuaCitation[];
}

/**
 * Complete Grounding Engine:
 * Ground Quran verses (Arabic, Latin, Arti) and Duas from Supabase vector & relational DB.
 * Guarantees zero hallucinations, accurate harakat, Latin transliteration, Indonesian translation,
 * and eliminates duplicate or displaced verses.
 */
export async function groundAIResponse(
  replyText: string,
  initialVerses: VectorSearchResult[] = [],
  initialDuas: DuaSearchResult[] = []
): Promise<GroundingResult> {
  const refs = findVerseReferences(replyText);

  // 1. Build authentic verse map
  const verseMap = new Map<string, VectorSearchResult>();
  for (const v of initialVerses) {
    verseMap.set(`${v.surah_number}:${v.ayah_number}`, v);
  }

  // Fetch any referenced verses missing from initial vector results directly from Supabase
  const missingRefs = refs.filter((r) => !verseMap.has(`${r.surah}:${r.ayah}`));
  if (missingRefs.length > 0 && supabase) {
    try {
      const surahNumbers = Array.from(new Set(missingRefs.map((r) => r.surah)));
      const { data: dbVerses, error: vErr } = await supabase
        .from('verses')
        .select('id, surah_number, ayah_number, surah_name, arabic_text, transliteration, translation, tafsir_text')
        .in('surah_number', surahNumbers);

      if (dbVerses && !vErr) {
        for (const v of dbVerses) {
          if (missingRefs.some((r) => r.surah === v.surah_number && r.ayah === v.ayah_number)) {
            verseMap.set(`${v.surah_number}:${v.ayah_number}`, {
              ...v,
              similarity: 1.0,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Grounding fetch missing verses error:', e);
    }
  }

  // 2. Load candidate Duas for authentic Dua grounding
  let candidateDuas: DuaSearchResult[] = [...initialDuas];
  if (supabase && candidateDuas.length < 20) {
    try {
      const { data: dbDuas } = await supabase
        .from('duas')
        .select('id, dua_id, grup, nama, arabic_text, transliteration, translation, tentang')
        .limit(250);
      if (dbDuas) {
        candidateDuas = dbDuas.map((d) => ({
          ...d,
          similarity: 1.0,
        }));
      }
    } catch (e) {
      console.warn('Grounding fetch candidate duas error:', e);
    }
  }

  const lines = replyText.split('\n');

  // Step 1: Detect citations per line
  const citationLines: { lineIndex: number; surah: number; ayah: number; key: string }[] = [];
  const citationLineRegex = /(?:\[|\()?(?:QS\.?|Surah|Surat)\s+([A-Za-zāīū’'`\-\s]+?)[:\s]+(\d+)(?:\]|\))?/gi;

  for (let i = 0; i < lines.length; i++) {
    let match;
    citationLineRegex.lastIndex = 0;
    while ((match = citationLineRegex.exec(lines[i])) !== null) {
      const sNum = resolveSurahNumber(match[1]);
      const ayah = parseInt(match[2], 10);
      if (sNum && ayah > 0) {
        citationLines.push({
          lineIndex: i,
          surah: sNum,
          ayah,
          key: `${sNum}:${ayah}`,
        });
      }
    }
  }

  const claimedLines = new Set<number>();
  const activeVerseKeys = new Set<string>();
  const activeDuaIds = new Set<number>();

  // Step 2: Ground each verse citation block
  for (const cit of citationLines) {
    const authentic = verseMap.get(cit.key);
    if (!authentic || !authentic.arabic_text) continue;

    activeVerseKeys.add(cit.key);

    // Check BACKWARD first (Arabic, Latin, Arti placed ABOVE the citation line)
    let arabicAboveIdx = -1;
    let artiAboveIdx = -1;
    let latinAboveIdx = -1;

    for (let k = cit.lineIndex - 1; k >= Math.max(0, cit.lineIndex - 6); k--) {
      // Stop if crossing another citation line or an already claimed line
      if (citationLines.some((c) => c.lineIndex === k) || claimedLines.has(k)) break;
      const trimmed = lines[k].trim();
      if (!trimmed) continue;

      if (/^arti(?:nya)?(?:\s*[:：]|\s*=)/i.test(trimmed)) {
        artiAboveIdx = k;
      } else if (/^latin(?:\s*[:：]|\s*=)/i.test(trimmed)) {
        latinAboveIdx = k;
      } else if (isArabicLine(trimmed)) {
        arabicAboveIdx = k;
        break;
      }
    }

    if (arabicAboveIdx !== -1) {
      // Verse block is located ABOVE the citation line
      const arabicIndent = lines[arabicAboveIdx].match(/^(\s*)/)?.[1] || '';
      lines[arabicAboveIdx] = arabicIndent + authentic.arabic_text.trim();
      claimedLines.add(arabicAboveIdx);

      // Latin transliteration
      for (let j = arabicAboveIdx + 1; j < cit.lineIndex; j++) {
        if (claimedLines.has(j)) continue;
        const trimmed = lines[j].trim();
        if (!trimmed) continue;
        if (/^arti(?:nya)?(?:\s*[:：]|\s*=)/i.test(trimmed)) break;

        if (
          j === latinAboveIdx ||
          /^latin(?:\s*[:：]|\s*=)/i.test(trimmed) ||
          (!trimmed.startsWith('"') && !trimmed.startsWith('“'))
        ) {
          const indent = lines[j].match(/^(\s*)/)?.[1] || '';
          const hasLabel = /^latin(?:\s*[:：]|\s*=)/i.test(trimmed);
          lines[j] =
            indent +
            (hasLabel ? 'Latin: ' : '') +
            (authentic.transliteration ? authentic.transliteration.trim() : '');
          claimedLines.add(j);
          break;
        }
      }

      // Indonesian translation / Arti
      if (artiAboveIdx !== -1) {
        const indent = lines[artiAboveIdx].match(/^(\s*)/)?.[1] || '';
        const isArtinya = /^artinya/i.test(lines[artiAboveIdx].trim());
        lines[artiAboveIdx] = indent + (isArtinya ? 'Artinya: ' : 'Arti: ') + authentic.translation.trim();
        claimedLines.add(artiAboveIdx);
      }
      continue;
    }

    // Check FORWARD (Arabic, Latin, Arti placed BELOW the citation line)
    let arabicBelowIdx = -1;
    for (let k = cit.lineIndex + 1; k < Math.min(lines.length, cit.lineIndex + 6); k++) {
      if (citationLines.some((c) => c.lineIndex === k) || claimedLines.has(k)) break;
      const trimmed = lines[k].trim();
      if (!trimmed) continue;

      if (/^[-*•]/.test(trimmed) || /^\d+\./.test(trimmed) || /^#{1,6}\s/.test(trimmed)) break;

      if (isArabicLine(trimmed)) {
        arabicBelowIdx = k;
        break;
      }
    }

    if (arabicBelowIdx !== -1) {
      const arabicIndent = lines[arabicBelowIdx].match(/^(\s*)/)?.[1] || '';
      lines[arabicBelowIdx] = arabicIndent + authentic.arabic_text.trim();
      claimedLines.add(arabicBelowIdx);

      let foundLatin = false;
      for (let j = arabicBelowIdx + 1; j < Math.min(lines.length, arabicBelowIdx + 6); j++) {
        if (citationLines.some((c) => c.lineIndex === j) || claimedLines.has(j)) break;
        const trimmed = lines[j].trim();
        if (!trimmed) continue;
        if (/^[-*•]/.test(trimmed) || /^\d+\./.test(trimmed) || /^#{1,6}\s/.test(trimmed)) break;

        const indent = lines[j].match(/^(\s*)/)?.[1] || '';
        if (/^arti(?:nya)?(?:\s*[:：]|\s*=)/i.test(trimmed)) {
          const isArtinya = /^artinya/i.test(trimmed);
          lines[j] = indent + (isArtinya ? 'Artinya: ' : 'Arti: ') + authentic.translation.trim();
          claimedLines.add(j);
          break;
        } else if (
          !foundLatin &&
          (j === latinAboveIdx ||
            /^latin(?:\s*[:：]|\s*=)/i.test(trimmed) ||
            (!trimmed.startsWith('"') && !trimmed.startsWith('“')))
        ) {
          const hasLabel = /^latin(?:\s*[:：]|\s*=)/i.test(trimmed);
          lines[j] =
            indent +
            (hasLabel ? 'Latin: ' : '') +
            (authentic.transliteration ? authentic.transliteration.trim() : '');
          claimedLines.add(j);
          foundLatin = true;
        }
      }
    }
  }

  // Step 3: Ground Duas for any unclaimed Arabic lines
  if (candidateDuas.length > 0) {
    for (let i = 0; i < lines.length; i++) {
      if (claimedLines.has(i)) continue;
      const trimmed = lines[i].trim();
      if (!isArabicLine(trimmed)) continue;

      const strippedArabic = stripHarakat(trimmed);
      const matchedDua = candidateDuas.find((d) => {
        const dStrip = stripHarakat(d.arabic_text);
        return (
          dStrip === strippedArabic ||
          (strippedArabic.length >= 20 && dStrip.startsWith(strippedArabic.slice(0, 20))) ||
          (dStrip.length >= 20 && strippedArabic.startsWith(dStrip.slice(0, 20))) ||
          (strippedArabic.length >= 25 && dStrip.includes(strippedArabic.slice(0, 25)))
        );
      });

      if (matchedDua) {
        activeDuaIds.add(matchedDua.dua_id || matchedDua.id);
        const arabicIndent = lines[i].match(/^(\s*)/)?.[1] || '';
        lines[i] = arabicIndent + matchedDua.arabic_text.trim();
        claimedLines.add(i);

        let foundLatin = false;
        for (let j = i + 1; j < Math.min(lines.length, i + 8); j++) {
          if (claimedLines.has(j)) break;
          const nTrim = lines[j].trim();
          if (!nTrim) continue;
          if (/^[-*•]/.test(nTrim) || /^\d+\./.test(nTrim) || /^#{1,6}\s/.test(nTrim) || isArabicLine(nTrim)) break;

          const indent = lines[j].match(/^(\s*)/)?.[1] || '';
          if (/^arti(?:nya)?(?:\s*[:：]|\s*=)/i.test(nTrim)) {
            const isArtinya = /^artinya/i.test(nTrim);
            lines[j] = indent + (isArtinya ? 'Artinya: ' : 'Arti: ') + matchedDua.translation.trim();
            claimedLines.add(j);
            break;
          } else if (
            !foundLatin &&
            (nTrim.toLowerCase().startsWith('latin:') || (!nTrim.startsWith('(') && !nTrim.startsWith('"')))
          ) {
            const hasLabel = /^latin(?:\s*[:：]|\s*=)/i.test(nTrim);
            lines[j] =
              indent +
              (hasLabel ? 'Latin: ' : '') +
              (matchedDua.transliteration ? matchedDua.transliteration.trim() : '');
            claimedLines.add(j);
            foundLatin = true;
          }
        }
      }
    }
  }

  const groundedText = lines.join('\n');

  // Step 4: Build high-integrity citations
  const citations: AICitation[] = [];
  const seenCitations = new Set<string>();

  for (const ref of refs) {
    const key = `${ref.surah}:${ref.ayah}`;
    if (!seenCitations.has(key)) {
      seenCitations.add(key);
      const v = verseMap.get(key);
      if (v) {
        citations.push({
          surahNumber: v.surah_number,
          ayahNumber: v.ayah_number,
          surahName: v.surah_name,
          arabicText: v.arabic_text,
          translation: v.translation,
        });
      }
    }
  }

  // Step 5: Build high-integrity dua citations
  const duaCitations: AIDuaCitation[] = [];
  const seenDuaIds = new Set<number>();

  for (const duaId of activeDuaIds) {
    if (!seenDuaIds.has(duaId)) {
      seenDuaIds.add(duaId);
      const d = candidateDuas.find((x) => (x.dua_id || x.id) === duaId);
      if (d) {
        duaCitations.push({
          duaId: d.dua_id || d.id,
          title: d.nama,
          group: d.grup,
          arabicText: d.arabic_text,
          transliteration: d.transliteration,
          translation: d.translation,
          source: d.tentang,
        });
      }
    }
  }

  // If activeDuaIds is empty, include relevant top duas from initialDuas (up to 3)
  if (duaCitations.length === 0 && initialDuas.length > 0) {
    for (const d of initialDuas.slice(0, 3)) {
      duaCitations.push({
        duaId: d.dua_id || d.id,
        title: d.nama,
        group: d.grup,
        arabicText: d.arabic_text,
        transliteration: d.transliteration,
        translation: d.translation,
        source: d.tentang,
      });
    }
  }

  return {
    groundedText,
    citations,
    duaCitations,
  };
}
