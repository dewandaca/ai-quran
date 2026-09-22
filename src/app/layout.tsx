import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Al-Qur'an Companion - Baca Al-Qur'an, Tafsir & AI Ustadz",
  description: "Aplikasi digital Al-Qur'an 114 Surah, Tafsir Kemenag, Audio Murottal 6 Qari, Jadwal Sholat 517 Kota, dan AI Konsultan Islami.",
  icons: {
    icon: '/favicon.png',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1B4931',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#FAF6EE] text-[#2C2621]">
        {children}
      </body>
    </html>
  );
}
