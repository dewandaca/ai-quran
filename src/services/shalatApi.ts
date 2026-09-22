// EQuran.id Shalat API Client
// Endpoints for Indonesian prayer times (517 Kab/Kota across 34 Provinces)

const BASE_URL = 'https://equran.id/api/v2';

export interface JadwalShalatItem {
  tanggal: number;
  tanggal_lengkap: string;
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface JadwalShalatResponse {
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
  bulan_nama: string;
  jadwal: JadwalShalatItem[];
}

/**
 * Fetch all 34 provinces in Indonesia
 */
export async function fetchProvinsi(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/shalat/provinsi`);
    const data = await response.json();
    if (data.code === 200 && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching provinsi:', error);
    return [
      'Aceh', 'Bali', 'Banten', 'Bengkulu', 'D.I. Yogyakarta',
      'DKI Jakarta', 'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah',
      'Jawa Timur', 'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah',
      'Kalimantan Timur', 'Kalimantan Utara', 'Kepulauan Bangka Belitung',
      'Kepulauan Riau', 'Lampung', 'Maluku', 'Maluku Utara', 'Nusa Tenggara Barat',
      'Nusa Tenggara Timur', 'Papua', 'Papua Barat', 'Riau', 'Sulawesi Barat',
      'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara', 'Sulawesi Utara',
      'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara'
    ];
  }
}

/**
 * Fetch cities/regencies for a specific province
 */
export async function fetchKabKota(provinsi: string): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/shalat/kabkota`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provinsi }),
    });
    const data = await response.json();
    if (data.code === 200 && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching kabkota:', error);
    return [];
  }
}

/**
 * Fetch monthly prayer times for a city
 */
export async function fetchJadwalShalat(
  provinsi: string,
  kabkota: string,
  bulan?: number,
  tahun?: number
): Promise<JadwalShalatResponse | null> {
  const now = new Date();
  const currentMonth = bulan || now.getMonth() + 1;
  const currentYear = tahun || now.getFullYear();

  try {
    const response = await fetch(`${BASE_URL}/shalat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provinsi,
        kabkota,
        bulan: currentMonth,
        tahun: currentYear,
      }),
    });

    const data = await response.json();
    if (data.code === 200 && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching jadwal shalat:', error);
    return null;
  }
}
