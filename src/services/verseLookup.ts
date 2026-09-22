import { supabase } from './supabase';
import { fetchSurahDetail } from './quranApi';

export interface CitedVerseData {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  transliteration?: string;
}

export interface QuranCitationRef {
  rawMatch: string;
  surahNumber: number;
  ayahStart: number;
  ayahEnd?: number;
  surahNameHint?: string;
}

// In-memory cache for fast lookups
const verseCache = new Map<string, CitedVerseData>();

/**
 * Parses Quran references from tafsir or any text.
 * Matches patterns like:
 * - (al-An'am/6: 110)
 * - (al-hajj/22: 46)
 * - (asy-Syu‘ara‘/26: 192-193)
 * - (Ali 'Imran/3:130)
 * - (QS. Al-Baqarah/2: 255)
 */
export function extractQuranCitations(text: string): QuranCitationRef[] {
  const citations: QuranCitationRef[] = [];
  const seen = new Set<string>();

  // Pattern: (OptionalName / SurahNum : AyahNum [- EndAyahNum]?)
  const regex = /\((?:([a-zA-Z\s‘'’\-]+)\/)?(\d{1,3}):\s*(\d{1,3})(?:-(\d{1,3}))?\)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawMatch = match[0];
    const surahNameHint = match[1]?.trim();
    const surahNumber = parseInt(match[2], 10);
    const ayahStart = parseInt(match[3], 10);
    const ayahEnd = match[4] ? parseInt(match[4], 10) : undefined;

    // Validate surah number range (1 to 114)
    if (surahNumber >= 1 && surahNumber <= 114) {
      const key = `${surahNumber}:${ayahStart}${ayahEnd ? `-${ayahEnd}` : ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        citations.push({
          rawMatch,
          surahNumber,
          ayahStart,
          ayahEnd,
          surahNameHint,
        });
      }
    }
  }

  return citations;
}

/**
 * Fetches verse data (Arabic text, translation, surah name) for given citation reference.
 * Uses Supabase `verses` table first, with fallback to equran.id API.
 */
export async function fetchCitedVerse(
  surahNumber: number,
  ayahNumber: number,
  ayahEnd?: number
): Promise<CitedVerseData[]> {
  const cacheKey = `${surahNumber}:${ayahNumber}${ayahEnd ? `-${ayahEnd}` : ''}`;
  const results: CitedVerseData[] = [];

  // Determine ayah numbers to retrieve (limit range to 4 consecutive verses max)
  const targetAyahs: number[] = [];
  const maxEnd = ayahEnd && ayahEnd > ayahNumber ? Math.min(ayahEnd, ayahNumber + 3) : ayahNumber;
  for (let a = ayahNumber; a <= maxEnd; a++) {
    targetAyahs.push(a);
  }

  // Check if all needed ayahs are already cached
  const missingAyahs = targetAyahs.filter((a) => !verseCache.has(`${surahNumber}:${a}`));
  if (missingAyahs.length === 0) {
    return targetAyahs.map((a) => verseCache.get(`${surahNumber}:${a}`)!).filter(Boolean);
  }

  // 1. Try Supabase lookup
  if (supabase) {
    try {
      let query = supabase
        .from('verses')
        .select('surah_number, ayah_number, surah_name, arabic_text, translation, transliteration')
        .eq('surah_number', surahNumber);

      if (targetAyahs.length > 1) {
        query = query.in('ayah_number', targetAyahs);
      } else {
        query = query.eq('ayah_number', ayahNumber);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        for (const item of data) {
          const verse: CitedVerseData = {
            surahNumber: item.surah_number,
            ayahNumber: item.ayah_number,
            surahName: item.surah_name || `Surah ke-${item.surah_number}`,
            arabicText: item.arabic_text || '',
            translation: item.translation || '',
            transliteration: item.transliteration || '',
          };
          verseCache.set(`${verse.surahNumber}:${verse.ayahNumber}`, verse);
        }

        return targetAyahs.map((a) => verseCache.get(`${surahNumber}:${a}`)!).filter(Boolean);
      }
    } catch (err) {
      console.warn('Supabase verse lookup fallback triggered:', err);
    }
  }

  // 2. Fallback to equran.id API
  try {
    const detail = await fetchSurahDetail(surahNumber);
    if (detail && detail.ayat) {
      for (const a of targetAyahs) {
        const found = detail.ayat.find((item) => item.nomorAyat === a);
        if (found) {
          const verse: CitedVerseData = {
            surahNumber,
            ayahNumber: a,
            surahName: detail.namaLatin,
            arabicText: found.teksArab,
            translation: found.teksIndonesia,
            transliteration: found.teksLatin,
          };
          verseCache.set(`${surahNumber}:${a}`, verse);
        }
      }
      return targetAyahs.map((a) => verseCache.get(`${surahNumber}:${a}`)!).filter(Boolean);
    }
  } catch (apiErr) {
    console.error('Failed to fetch fallback verse detail:', apiErr);
  }

  return results;
}
