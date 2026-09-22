'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Search,
  Bell,
  Calendar,
  BookOpen,
  ChevronRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import MobileFrame from '@/components/layout/MobileFrame';
import PrayerHeroCard from '@/components/home/PrayerHeroCard';
import QuickMenuGrid from '@/components/home/QuickMenuGrid';
import DailyVerseCard from '@/components/home/DailyVerseCard';
import CityPickerModal from '@/components/home/CityPickerModal';
import { useShalatStore } from '@/stores/useShalatStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

function getHijriYear(): string {
  const gregorianYear = new Date().getFullYear();
  return `${Math.round((gregorianYear - 622) * (33 / 32))} H`;
}

function getFormattedDate(): string {
  const date = new Date();
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const POPULAR_SURAHS = [
  { nomor: 1, nama: 'Al-Fatihah', arti: 'Pembukaan', ayat: 7 },
  { nomor: 18, nama: 'Al-Kahf', arti: 'Penghuni Gua', ayat: 110 },
  { nomor: 36, nama: 'Ya Sin', arti: 'Ya Sin', ayat: 83 },
  { nomor: 67, nama: 'Al-Mulk', arti: 'Kerajaan', ayat: 30 },
  { nomor: 55, nama: 'Ar-Rahman', arti: 'Maha Pengasih', ayat: 78 },
  { nomor: 56, nama: 'Al-Waqi\'ah', arti: 'Hari Kiamat', ayat: 96 },
];

export default function AppHomePage() {
  const {
    provinsi,
    kabkota,
    todaySchedule,
    nextPrayer,
    isDetectingLocation,
    loadSchedule,
    detectLocation,
    setCity,
    updateNextPrayer,
  } = useShalatStore();

  const { lastReadSurah, lastReadAyah, lastReadSurahName } = useSettingsStore();

  const [cityModalOpen, setCityModalOpen] = useState(false);

  useEffect(() => {
    loadSchedule();
    const interval = setInterval(() => {
      updateNextPrayer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MobileFrame>
      {/* Top Welcome & Date Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white/80 p-4 rounded-3xl border border-[#E8DECD] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B4931] border-2 border-[#C5A059] flex items-center justify-center text-white shadow-xs shrink-0">
            <User size={24} />
          </div>
          <div>
            <span className="text-xs text-[#6B6258] font-medium block">
              Assalamualaikum,
            </span>
            <h2 className="text-lg font-bold text-[#1B4931]">
              Hamba Allah
            </h2>
          </div>
        </div>

        {/* Date and Quick Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6258] bg-[#FAF6EE] px-3.5 py-2 rounded-2xl border border-[#E8DECD]">
            <Calendar size={15} className="text-[#1B4931]" />
            <span>{getFormattedDate()}</span>
            <span className="text-[#C5A059]">•</span>
            <span className="text-[#1B4931] font-bold">{getHijriYear()}</span>
          </div>

          <Link
            href="/app/quran"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#1B4931] text-white text-xs font-bold hover:bg-[#143828] transition shadow-xs"
          >
            <Search size={14} />
            <span>Cari Surah</span>
          </Link>
        </div>
      </div>

      {/* BENTO BOX GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Bento 1: Prayer Hero Card (md: col-span-8) */}
        <div className="md:col-span-8 flex flex-col justify-between">
          <PrayerHeroCard
            todaySchedule={todaySchedule}
            nextPrayer={nextPrayer}
            cityName={kabkota}
            onPressLocation={() => setCityModalOpen(true)}
            onPressGps={() => detectLocation()}
            isDetectingLocation={isDetectingLocation}
          />
        </div>

        {/* Bento 2: Last Read Resume Card (md: col-span-4) */}
        <div className="md:col-span-4 flex flex-col">
          <div className="bg-linear-to-br from-[#1B4931] via-[#163D29] to-[#0E271A] text-white rounded-[24px] p-6 shadow-xl border border-[#C5A059]/40 flex-1 flex flex-col justify-between relative overflow-hidden group">
            {/* Background watermarked Quran icon */}
            <BookOpen
              size={140}
              className="absolute -right-6 -bottom-8 text-white/5 pointer-events-none group-hover:scale-105 transition-transform"
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/15 px-3 py-1 rounded-full border border-[#C5A059]/30">
                  📖 Terakhir Dibaca
                </span>
                <span className="text-[11px] font-semibold text-white/70">
                  Tilawah
                </span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                {lastReadSurahName || 'Surah Al-Fatihah'}
              </h3>
              <p className="text-xs text-[#F5E6CC] font-medium">
                Melanjutkan tilawah pada ayat ke-{lastReadAyah || 1}
              </p>
            </div>

            <div className="pt-6">
              <Link
                href={`/app/surah/${lastReadSurah || 1}#ayah-${lastReadAyah || 1}`}
                className="w-full py-3 px-4 rounded-xl bg-[#C5A059] hover:bg-[#b08e4d] text-[#181411] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <span>Lanjutkan Membaca</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bento 3: Quick Menu Grid (md: col-span-7) */}
        <div className="md:col-span-7 bg-white rounded-[28px] p-6 border border-[#E8DECD] shadow-xs flex flex-col justify-between">
          <QuickMenuGrid />
        </div>

        {/* Bento 4: Surah Populer Pilihan Cepat (md: col-span-5) */}
        <div className="md:col-span-5 bg-white rounded-[28px] p-6 border border-[#E8DECD] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#1B4931]">
              <Flame size={16} className="text-[#C5A059]" />
              <span>Surah Populer</span>
            </div>
            <Link
              href="/app/quran"
              className="text-xs font-semibold text-[#6B6258] hover:text-[#1B4931] flex items-center gap-0.5"
            >
              <span>Semua 114 Surah</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {POPULAR_SURAHS.map((surah) => (
              <Link
                key={surah.nomor}
                href={`/app/surah/${surah.nomor}`}
                className="p-3 rounded-2xl bg-[#FAF6EE] hover:bg-[#F3EBDD] border border-[#E8DECD] transition group flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#1B4931] group-hover:text-[#143828]">
                    {surah.nama}
                  </h4>
                  <p className="text-[10px] text-[#6B6258] mt-0.5">
                    {surah.ayat} Ayat
                  </p>
                </div>
                <div className="w-6 h-6 rounded-lg bg-[#1B4931]/10 text-[#1B4931] flex items-center justify-center font-bold text-[10px]">
                  {surah.nomor}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bento 5: Daily Verse Inspiration Card (md: col-span-12) */}
        <div className="md:col-span-12">
          <DailyVerseCard />
        </div>
      </div>

      {/* City Picker Modal */}
      <CityPickerModal
        visible={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        currentProvinsi={provinsi}
        currentKabKota={kabkota}
        onSelectCity={(prov, city) => setCity(prov, city)}
        onDetectGps={() => detectLocation()}
        isDetectingGps={isDetectingLocation}
      />
    </MobileFrame>
  );
}
