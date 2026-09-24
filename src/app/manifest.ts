import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Al-Qur\'an Companion & Waktu Sholat',
    short_name: 'Al-Qur\'an Web',
    description: 'Aplikasi Al-Qur\'an digital, jadwal sholat akurat Kemenag RI, doa harian, dan asisten islami',
    start_url: '/app',
    display: 'standalone',
    background_color: '#FAF6EE',
    theme_color: '#1B4931',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
