export interface JuzInfo {
  juz: number;
  nama: string;
  namaArab: string;
  startSurahNumber: number;
  startSurahName: string;
  startAyah: number;
  endSurahNumber: number;
  endSurahName: string;
  endAyah: number;
}

export interface JuzSurahEntry {
  nomor: number;
  namaLatin: string;
  nama: string;
  arti: string;
  totalAyat: number;
  startAyah: number;
  endAyah: number;
}

export const JUZ_LIST: JuzInfo[] = [
  { juz: 1, nama: 'Juz 1', namaArab: 'الجزء الأول', startSurahNumber: 1, startSurahName: 'Al-Fatihah', startAyah: 1, endSurahNumber: 2, endSurahName: 'Al-Baqarah', endAyah: 141 },
  { juz: 2, nama: 'Juz 2', namaArab: 'الجزء الثاني', startSurahNumber: 2, startSurahName: 'Al-Baqarah', startAyah: 142, endSurahNumber: 2, endSurahName: 'Al-Baqarah', endAyah: 252 },
  { juz: 3, nama: 'Juz 3', namaArab: 'الجزء الثالث', startSurahNumber: 2, startSurahName: 'Al-Baqarah', startAyah: 253, endSurahNumber: 3, endSurahName: 'Ali \'Imran', endAyah: 92 },
  { juz: 4, nama: 'Juz 4', namaArab: 'الجزء الرابع', startSurahNumber: 3, startSurahName: 'Ali \'Imran', startAyah: 93, endSurahNumber: 4, endSurahName: 'An-Nisa\'', endAyah: 23 },
  { juz: 5, nama: 'Juz 5', namaArab: 'الجزء الخامس', startSurahNumber: 4, startSurahName: 'An-Nisa\'', startAyah: 24, endSurahNumber: 4, endSurahName: 'An-Nisa\'', endAyah: 147 },
  { juz: 6, nama: 'Juz 6', namaArab: 'الجزء السادس', startSurahNumber: 4, startSurahName: 'An-Nisa\'', startAyah: 148, endSurahNumber: 5, endSurahName: 'Al-Ma\'idah', endAyah: 81 },
  { juz: 7, nama: 'Juz 7', namaArab: 'الجزء السابع', startSurahNumber: 5, startSurahName: 'Al-Ma\'idah', startAyah: 82, endSurahNumber: 6, endSurahName: 'Al-An\'am', endAyah: 110 },
  { juz: 8, nama: 'Juz 8', namaArab: 'الجزء الثامن', startSurahNumber: 6, startSurahName: 'Al-An\'am', startAyah: 111, endSurahNumber: 7, endSurahName: 'Al-A\'raf', endAyah: 87 },
  { juz: 9, nama: 'Juz 9', namaArab: 'الجزء التاسع', startSurahNumber: 7, startSurahName: 'Al-A\'raf', startAyah: 88, endSurahNumber: 8, endSurahName: 'Al-Anfal', endAyah: 40 },
  { juz: 10, nama: 'Juz 10', namaArab: 'الجزء العاشر', startSurahNumber: 8, startSurahName: 'Al-Anfal', startAyah: 41, endSurahNumber: 9, endSurahName: 'At-Taubah', endAyah: 92 },
  { juz: 11, nama: 'Juz 11', namaArab: 'الجزء الحادي عشر', startSurahNumber: 9, startSurahName: 'At-Taubah', startAyah: 93, endSurahNumber: 11, endSurahName: 'Hud', endAyah: 5 },
  { juz: 12, nama: 'Juz 12', namaArab: 'الجزء الثاني عشر', startSurahNumber: 11, startSurahName: 'Hud', startAyah: 6, endSurahNumber: 12, endSurahName: 'Yusuf', endAyah: 52 },
  { juz: 13, nama: 'Juz 13', namaArab: 'الجزء الثالث عشر', startSurahNumber: 12, startSurahName: 'Yusuf', startAyah: 53, endSurahNumber: 14, endSurahName: 'Ibrahim', endAyah: 52 },
  { juz: 14, nama: 'Juz 14', namaArab: 'الجزء الرابع عشر', startSurahNumber: 15, startSurahName: 'Al-Hijr', startAyah: 1, endSurahNumber: 16, endSurahName: 'An-Nahl', endAyah: 128 },
  { juz: 15, nama: 'Juz 15', namaArab: 'الجزء الخامس عشر', startSurahNumber: 17, startSurahName: 'Al-Isra\'', startAyah: 1, endSurahNumber: 18, endSurahName: 'Al-Kahf', endAyah: 74 },
  { juz: 16, nama: 'Juz 16', namaArab: 'الجزء السادس عشر', startSurahNumber: 18, startSurahName: 'Al-Kahf', startAyah: 75, endSurahNumber: 20, endSurahName: 'Ta Ha', endAyah: 135 },
  { juz: 17, nama: 'Juz 17', namaArab: 'الجزء السابع عشر', startSurahNumber: 21, startSurahName: 'Al-Anbiya\'', startAyah: 1, endSurahNumber: 22, endSurahName: 'Al-Hajj', endAyah: 78 },
  { juz: 18, nama: 'Juz 18', namaArab: 'الجزء الثامن عشر', startSurahNumber: 23, startSurahName: 'Al-Mu\'minun', startAyah: 1, endSurahNumber: 25, endSurahName: 'Al-Furqan', endAyah: 20 },
  { juz: 19, nama: 'Juz 19', namaArab: 'الجزء التاسع عشر', startSurahNumber: 25, startSurahName: 'Al-Furqan', startAyah: 21, endSurahNumber: 27, endSurahName: 'An-Naml', endAyah: 55 },
  { juz: 20, nama: 'Juz 20', namaArab: 'الجزء العشرون', startSurahNumber: 27, startSurahName: 'An-Naml', startAyah: 56, endSurahNumber: 29, endSurahName: 'Al-\'Ankabut', endAyah: 45 },
  { juz: 21, nama: 'Juz 21', namaArab: 'الجزء الحادي والعشرون', startSurahNumber: 29, startSurahName: 'Al-\'Ankabut', startAyah: 46, endSurahNumber: 33, endSurahName: 'Al-Ahzab', endAyah: 30 },
  { juz: 22, nama: 'Juz 22', namaArab: 'الجزء الثاني والعشرون', startSurahNumber: 33, startSurahName: 'Al-Ahzab', startAyah: 31, endSurahNumber: 36, endSurahName: 'Ya Sin', endAyah: 27 },
  { juz: 23, nama: 'Juz 23', namaArab: 'الجزء الثالث والعشرون', startSurahNumber: 36, startSurahName: 'Ya Sin', startAyah: 28, endSurahNumber: 39, endSurahName: 'Az-Zumar', endAyah: 31 },
  { juz: 24, nama: 'Juz 24', namaArab: 'الجزء الرابع والعشرون', startSurahNumber: 39, startSurahName: 'Az-Zumar', startAyah: 32, endSurahNumber: 41, endSurahName: 'Fussilat', endAyah: 46 },
  { juz: 25, nama: 'Juz 25', namaArab: 'الجزء الخامس والعشرون', startSurahNumber: 41, startSurahName: 'Fussilat', startAyah: 47, endSurahNumber: 45, endSurahName: 'Al-Jasiyah', endAyah: 37 },
  { juz: 26, nama: 'Juz 26', namaArab: 'الجزء السادس والعشرون', startSurahNumber: 46, startSurahName: 'Al-Ahqaf', startAyah: 1, endSurahNumber: 51, endSurahName: 'Az-Zariyat', endAyah: 30 },
  { juz: 27, nama: 'Juz 27', namaArab: 'الجزء السابع والعشرون', startSurahNumber: 51, startSurahName: 'Az-Zariyat', startAyah: 31, endSurahNumber: 57, endSurahName: 'Al-Hadid', endAyah: 29 },
  { juz: 28, nama: 'Juz 28', namaArab: 'الجزء الثامن والعشرون', startSurahNumber: 58, startSurahName: 'Al-Mujadilah', startAyah: 1, endSurahNumber: 66, endSurahName: 'At-Tahrim', endAyah: 12 },
  { juz: 29, nama: 'Juz 29', namaArab: 'الجزء التاسع والعشرون', startSurahNumber: 67, startSurahName: 'Al-Mulk', startAyah: 1, endSurahNumber: 77, endSurahName: 'Al-Mursalat', endAyah: 50 },
  { juz: 30, nama: 'Juz 30 (Juz \'Amma)', namaArab: 'الجزء الثلاثون (عمّ)', startSurahNumber: 78, startSurahName: 'An-Naba\'', startAyah: 1, endSurahNumber: 114, endSurahName: 'An-Nas', endAyah: 6 },
];

/**
 * Get all surahs contained within a specific Juz with their verse ranges
 */
export function getSurahsInJuz(
  juz: JuzInfo,
  allSurahs: { nomor: number; namaLatin: string; nama: string; arti: string; jumlahAyat: number }[]
): JuzSurahEntry[] {
  return allSurahs
    .filter(s => s.nomor >= juz.startSurahNumber && s.nomor <= juz.endSurahNumber)
    .map(s => {
      let startAyah = 1;
      let endAyah = s.jumlahAyat;
      if (s.nomor === juz.startSurahNumber) {
        startAyah = juz.startAyah;
      }
      if (s.nomor === juz.endSurahNumber) {
        endAyah = juz.endAyah;
      }
      return {
        nomor: s.nomor,
        namaLatin: s.namaLatin,
        nama: s.nama,
        arti: s.arti,
        totalAyat: s.jumlahAyat,
        startAyah,
        endAyah,
      };
    });
}
