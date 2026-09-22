export interface DoaItem {
  id: number;
  grup: string;
  nama: string;
  ar: string;
  tr: string;
  idn: string;
  tentang?: string;
  tag?: string[];
}

interface DoaApiResponse {
  status: string;
  total: number;
  data: DoaItem[];
}

const BASE_URL = 'https://equran.id/api';
let memoryCache: DoaItem[] | null = null;

/**
 * Fetch all daily prayers from equran.id/api/doa
 */
export async function fetchAllDoa(): Promise<DoaItem[]> {
  // 1. Return in-memory cache if already loaded
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    const response = await fetch(`${BASE_URL}/doa`);
    if (!response.ok) {
      throw new Error(`Failed to fetch doa: ${response.status}`);
    }
    const json: DoaApiResponse = await response.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      memoryCache = json.data;
      return json.data;
    }
    return getFallbackDoaList();
  } catch (error) {
    console.warn('Error fetching doa from network, using fallback list:', error);
    return getFallbackDoaList();
  }
}

/**
 * Fallback static list in case offline
 */
export function getFallbackDoaList(): DoaItem[] {
  return [
    {
      id: 1,
      grup: 'Doa Kebaikan',
      nama: 'Doa Kebaikan Dunia & Akhirat',
      ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      tr: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina azaban-nar.',
      idn: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.',
      tentang: 'QS. Al-Baqarah: 201',
    },
    {
      id: 2,
      grup: 'Doa Kelapangan',
      nama: 'Doa Memohon Kelapangan Hati',
      ar: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي',
      tr: 'Rabbisy-syrah li shadri wa yassir li amri wahlul uqdatan min lisani yafqahu qauli.',
      idn: 'Ya Tuhanku, lapangkanlah untukku dadaku, dan mudahkanlah untukku urusanku, dan lepaskanlah kekakuan dari lidahku, supaya mereka mengerti perkataanku.',
      tentang: 'QS. Thaha: 25-28',
    },
    {
      id: 3,
      grup: 'Doa Orang Tua',
      nama: 'Doa untuk Kedua Orang Tua',
      ar: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
      tr: 'Rabbighfir li wa liwalidayya warhamhuma kama rabbayani shaghira.',
      idn: 'Wahai Tuhanku, ampunilah aku dan kedua orang tuaku, dan kasihilah keduanya sebagaimana mereka berdua telah mendidik aku sewaktu kecil.',
      tentang: 'QS. Al-Isra: 24',
    },
    {
      id: 4,
      grup: 'Doa Sebelum dan Sesudah Tidur',
      nama: 'Doa Sebelum Tidur',
      ar: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ',
      tr: 'Bismikallahumma ahya wa amuut.',
      idn: 'Dengan nama-Mu ya Allah, aku hidup dan aku mati.',
      tentang: 'HR. Bukhari dan Muslim',
    },
    {
      id: 5,
      grup: 'Doa Sebelum dan Sesudah Tidur',
      nama: 'Doa Bangun Tidur',
      ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
      tr: 'Alhamdulillahil-ladzi ahyana ba\'da ma amatana wa ilaihin-nusyur.',
      idn: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya lah kami dibangkitkan.',
      tentang: 'HR. Bukhari',
    },
    {
      id: 6,
      grup: 'Doa Sehari-hari',
      nama: 'Doa Sebelum Makan',
      ar: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ، بِسْمِ اللَّهِ',
      tr: 'Allahumma barik lana fima razaqtana wa qina azaban-nar, bismillah.',
      idn: 'Ya Allah, berkahilah kami dalam rezeki yang telah Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka. Dengan nama Allah.',
      tentang: 'HR. Ibnu Sunni',
    },
    {
      id: 7,
      grup: 'Doa Sehari-hari',
      nama: 'Doa Sesudah Makan',
      ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
      tr: 'Alhamdulillahil-ladzi ath\'amana wa saqana wa ja\'alana muslimin.',
      idn: 'Segala puji bagi Allah yang telah memberi makan dan minum kepada kami serta menjadikan kami termasuk orang-orang yang berserah diri.',
      tentang: 'HR. Abu Dawud, Tirmidzi',
    },
  ];
}
