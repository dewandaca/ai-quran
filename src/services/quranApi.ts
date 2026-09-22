// EQuran.id API v2 Client
// Base URL: https://equran.id/api/v2
// Provides: Surahs, Verses (Arabic, Latin, Translation), Tafsir, Audio

const BASE_URL = 'https://equran.id/api/v2';

// ─── Types ───────────────────────────────────────────────────────

export interface SurahInfo {
  nomor: number;
  nama: string;          // Arabic name
  namaLatin: string;     // Latin name
  jumlahAyat: number;
  tempatTurun: string;   // Makkiyah / Madaniyah
  arti: string;          // Meaning in Indonesian
  deskripsi: string;     // Description HTML
  audioFull: Record<string, string>;  // Full surah audio URLs per qari
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;       // Transliteration
  teksIndonesia: string;   // Indonesian translation
  audio: Record<string, string>;  // Audio URLs per qari
}

export interface SurahDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
  ayat: Ayah[];
}

export interface TafsirAyah {
  ayat: number;
  teks: string;   // Tafsir text
}

export interface TafsirDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: TafsirAyah[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ─── API Functions ───────────────────────────────────────────────

/** Fetch list of all 114 Surahs */
export async function fetchAllSurahs(): Promise<SurahInfo[]> {
  try {
    const response = await fetch(`${BASE_URL}/surat`);
    const json: ApiResponse<SurahInfo[]> = await response.json();
    if (json.code === 200) {
      return json.data;
    }
    throw new Error(json.message || 'Failed to fetch surahs');
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

/** Fetch a single Surah with all verses */
export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetail> {
  try {
    const response = await fetch(`${BASE_URL}/surat/${surahNumber}`);
    const json: ApiResponse<SurahDetail> = await response.json();
    if (json.code === 200) {
      return json.data;
    }
    throw new Error(json.message || `Failed to fetch surah ${surahNumber}`);
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    throw error;
  }
}

/** Fetch tafsir for a Surah */
export async function fetchTafsir(surahNumber: number): Promise<TafsirDetail> {
  try {
    const response = await fetch(`${BASE_URL}/tafsir/${surahNumber}`);
    const json: ApiResponse<TafsirDetail> = await response.json();
    if (json.code === 200) {
      return json.data;
    }
    throw new Error(json.message || `Failed to fetch tafsir ${surahNumber}`);
  } catch (error) {
    console.error(`Error fetching tafsir ${surahNumber}:`, error);
    throw error;
  }
}

/**
 * Get audio URL for a specific ayah and qari
 * @param audioMap - The audio record from the ayah data
 * @param qariId - The qari ID (01-06)
 */
export function getAudioUrl(audioMap: Record<string, string>, qariId: string): string {
  return audioMap[qariId] || Object.values(audioMap)[0] || '';
}

/**
 * Get full surah audio URL for a specific qari
 */
export function getFullSurahAudioUrl(audioFull: Record<string, string>, qariId: string): string {
  return audioFull[qariId] || Object.values(audioFull)[0] || '';
}
