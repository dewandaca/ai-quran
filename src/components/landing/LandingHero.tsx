'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Clock,
  Disc,
  Compass,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Heart,
  ChevronRight,
  Volume2,
} from 'lucide-react';

export default function LandingHero() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C2621] selection:bg-[#1B4931] selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF6EE]/90 backdrop-blur-md border-b border-[#E8DECD] px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1B4931] text-[#C5A059] flex items-center justify-center font-bold shadow-md border border-[#C5A059]/40">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1B4931] block">
                Al-Qur&apos;an Companion
              </span>
              <span className="text-[10px] text-[#6B6258] font-medium">
                Web & Mobile Experience
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/ai-chat"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1B4931] hover:bg-[#F3EBDD] rounded-xl transition"
            >
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>AI Ustadz</span>
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-[#1B4931] hover:bg-[#143828] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border border-[#C5A059]/50"
            >
              <span>Buka Aplikasi</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 overflow-hidden">
        {/* Background Islamic geometric ornaments */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-[#1B4931]/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Bismillah Calligraphy */}
          <div className="mb-4">
            <span className="font-arabic text-3xl sm:text-4xl text-[#1B4931] font-normal leading-relaxed">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B4931]/10 text-[#1B4931] border border-[#1B4931]/20 text-xs font-semibold mb-6">
            <Sparkles size={13} className="text-[#C5A059]" />
            <span>Al-Qur&apos;an Digital Berbasis RAG &amp; Audio Murottal 6 Qari</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1B4931] tracking-tight leading-tight mb-6">
            Menyelami Hikmah Al-Qur&apos;an
            <br />
            <span className="text-[#C5A059]">dengan Sentuhan Modern</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#6B6258] leading-relaxed mb-8">
            Baca 114 Surah lengkap terjemahan Kemenag RI, dengarkan audio murottal
            berkualitas tinggi dengan piringan vinyl berputar, pantau jadwal sholat
            517 kota di Indonesia, dan tanya jawab keagamaan dengan asisten AI yang
            bersandar pada ayat shahih.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#1B4931] hover:bg-[#143828] text-white text-sm font-bold shadow-xl shadow-[#1B4931]/20 hover:shadow-2xl transition-all active:scale-98 flex items-center justify-center gap-2.5 border-2 border-[#C5A059]"
            >
              <BookOpen size={18} />
              <span>Mulai Membaca Al-Qur&apos;an</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/app/ai-chat"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-[#F3EBDD] text-[#1B4931] text-sm font-bold border border-[#E8DECD] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={17} className="text-[#C5A059]" />
              <span>Tanya AI Ustadz</span>
            </Link>
          </div>

          {/* App Preview Card Showcase */}
          <div className="max-w-4xl mx-auto bg-linear-to-b from-[#FAF6EE] to-white rounded-[36px] border border-[#E8DECD] shadow-2xl p-4 sm:p-8 relative">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8DECD]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-[#9C9286] font-mono ml-2">
                  alquran-companion.vercel.app
                </span>
              </div>
              <span className="text-xs font-semibold text-[#1B4931] bg-[#1B4931]/10 px-3 py-1 rounded-full">
                Mobile-First Web App
              </span>
            </div>

            {/* Feature quick links strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <Link
                href="/app/quran"
                className="p-4 rounded-2xl bg-[#FAF6EE] hover:bg-[#F3EBDD] border border-[#E8DECD] transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1B4931] text-white flex items-center justify-center mb-2.5">
                  <BookOpen size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#1B4931] group-hover:text-[#143828]">
                  114 Surah &amp; 30 Juz
                </h4>
                <p className="text-xs text-[#6B6258] mt-1">
                  Arab Amiri, transliterasi &amp; tafsir lengkap.
                </p>
              </Link>

              <Link
                href="/app/shalat"
                className="p-4 rounded-2xl bg-[#FAF6EE] hover:bg-[#F3EBDD] border border-[#E8DECD] transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C5A059] text-white flex items-center justify-center mb-2.5">
                  <Clock size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#1B4931] group-hover:text-[#143828]">
                  Jadwal Sholat 517 Kota
                </h4>
                <p className="text-xs text-[#6B6258] mt-1">
                  Hitung mundur waktu sholat &amp; GPS otomatis.
                </p>
              </Link>

              <Link
                href="/app/ai-chat"
                className="p-4 rounded-2xl bg-[#FAF6EE] hover:bg-[#F3EBDD] border border-[#E8DECD] transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2F855A] text-white flex items-center justify-center mb-2.5">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#1B4931] group-hover:text-[#143828]">
                  AI Ustadz RAG
                </h4>
                <p className="text-xs text-[#6B6258] mt-1">
                  Tanya jawab syariah bersitasi ayat shahih.
                </p>
              </Link>

              <Link
                href="/app"
                className="p-4 rounded-2xl bg-[#FAF6EE] hover:bg-[#F3EBDD] border border-[#E8DECD] transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#18181b] text-[#C5A059] flex items-center justify-center mb-2.5 border border-[#C5A059]/40">
                  <Disc size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#1B4931] group-hover:text-[#143828]">
                  Floating Vinyl Player
                </h4>
                <p className="text-xs text-[#6B6258] mt-1">
                  Audio murottal 6 Qari dengan piringan berputar.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="py-16 px-4 sm:px-8 bg-white border-y border-[#E8DECD]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block mb-1">
              Keunggulan Aplikasi
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1B4931]">
              Fitur Lengkap Sesuai Kebutuhan Umat
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAF6EE] p-6 rounded-3xl border border-[#E8DECD] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#1B4931] text-[#C5A059] flex items-center justify-center mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1B4931] mb-2">
                Tipografi Nyaman di Mata
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6258] leading-relaxed">
                Menggunakan palet warna Warm Cream Aesthetic (`#FAF6EE`) dan font
                khusus mushaf Amiri yang didesain agar mata tidak lelah saat
                tilawah dalam durasi lama.
              </p>
            </div>

            <div className="bg-[#FAF6EE] p-6 rounded-3xl border border-[#E8DECD] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#1B4931] text-[#C5A059] flex items-center justify-center mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1B4931] mb-2">
                Grounded AI Assistant
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6258] leading-relaxed">
                Didukung pencarian vektor (pgvector Supabase) yang mencocokkan
                pertanyaan pengguna langsung ke database ayat dan tafsir resmi Kemenag,
                mencegah halusinasi atau fatwa palsu.
              </p>
            </div>

            <div className="bg-[#FAF6EE] p-6 rounded-3xl border border-[#E8DECD] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#1B4931] text-[#C5A059] flex items-center justify-center mb-4">
                <Volume2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1B4931] mb-2">
                Pilihan 6 Qari Ternama
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6258] leading-relaxed">
                Pilih suara qari favorit: Misyari Rasyid Al-Afasy, Abdurrahman As-Sudais,
                Abdullah Al-Juhany, Abdul Muhsin Al-Qasim, Ibrahim Al-Dossari, dan Yasser Al-Dosari.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 text-center text-xs text-[#6B6258] border-t border-[#E8DECD]">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[#1B4931]">
            <BookOpen size={16} />
            <span>Al-Qur&apos;an Companion</span>
          </div>
          <p className="max-w-md">
            Aplikasi Al-Qur&apos;an digital ramah mobile, bersumber dari data Kemenag RI
            dan EQuran.id. Semoga menjadi amal jariyah bagi kita semua.
          </p>
          <div className="flex items-center gap-1 text-[#9C9286]">
            <span>Dibuat dengan ikhlas untuk kemudahan tilawah umat</span>
            <Heart size={13} className="text-rose-600 fill-rose-600" />
          </div>
        </div>
      </footer>
    </div>
  );
}
