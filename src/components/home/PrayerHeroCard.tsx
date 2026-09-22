'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, ChevronRight, Sun, Sunrise, Sunset, Moon, CloudSun } from 'lucide-react';
import { JadwalShalatItem } from '@/services/shalatApi';
import { NextPrayerInfo } from '@/stores/useShalatStore';

interface PrayerHeroCardProps {
  todaySchedule: JadwalShalatItem | null;
  nextPrayer: NextPrayerInfo | null;
  cityName: string;
  onPressLocation: () => void;
  onPressGps?: () => void;
  isDetectingLocation?: boolean;
}

export default function PrayerHeroCard({
  todaySchedule,
  nextPrayer,
  cityName,
  onPressLocation,
  onPressGps,
  isDetectingLocation = false,
}: PrayerHeroCardProps) {
  const prayerList = [
    { key: 'Subuh', name: 'Subuh', time: todaySchedule?.subuh || '--:--', icon: Sunrise },
    { key: 'Dzuhur', name: 'Dzuhur', time: todaySchedule?.dzuhur || '--:--', icon: Sun },
    { key: 'Ashar', name: 'Ashar', time: todaySchedule?.ashar || '--:--', icon: CloudSun },
    { key: 'Maghrib', name: 'Maghrib', time: todaySchedule?.maghrib || '--:--', icon: Sunset },
    { key: 'Isya', name: 'Isya', time: todaySchedule?.isya || '--:--', icon: Moon },
  ];

  const activeName = nextPrayer?.name || 'Dzuhur';

  return (
    <div className="relative rounded-[24px] p-5 shadow-xl overflow-hidden bg-linear-to-br from-[#1B4332] via-[#143828] to-[#0D241A] text-white h-full flex flex-col justify-between">
      {/* Decorative background glow circles */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-[#C5A059]/10 pointer-events-none" />

      {/* Top row: City Location Badge & GPS */}
      <div className="flex items-center justify-between gap-2.5 mb-4 relative z-10">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* City selector badge with auto-scrolling marquee for long names */}
          <button
            onClick={onPressLocation}
            className="flex items-center gap-1 bg-white/12 hover:bg-white/20 px-2 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-xs transition cursor-pointer border border-white/10 min-w-0 max-w-[130px] xs:max-w-[160px] sm:max-w-[200px]"
            title={`Lokasi: ${cityName || 'Pilih Kota'}`}
          >
            <MapPin size={13} className="text-[#C5A059] shrink-0" />
            <div className="overflow-hidden whitespace-nowrap min-w-0 max-w-[85px] xs:max-w-[115px] sm:max-w-[155px] relative">
              {(cityName || '').length > 8 ? (
                <div className="animate-marquee inline-flex whitespace-nowrap items-center">
                  <span className="pr-2">{cityName}</span>
                  <span className="text-[#C5A059] opacity-70 pr-2">•</span>
                  <span className="pr-2">{cityName}</span>
                  <span className="text-[#C5A059] opacity-70 pr-2">•</span>
                </div>
              ) : (
                <span className="truncate block">{cityName || 'Pilih Kota'}</span>
              )}
            </div>
            <ChevronRight size={12} className="text-white/70 shrink-0" />
          </button>

          {/* GPS Quick detect (Logo/Icon only on this card as requested) */}
          {onPressGps && (
            <button
              onClick={onPressGps}
              disabled={isDetectingLocation}
              className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/15 hover:bg-white/25 text-[#C5A059] border border-white/10 transition cursor-pointer shrink-0"
              title={isDetectingLocation ? 'Mendeteksi Lokasi GPS...' : 'Deteksi Lokasi GPS'}
              aria-label="Deteksi Lokasi GPS"
            >
              <Navigation size={13} className={isDetectingLocation ? 'animate-spin' : ''} />
            </button>
          )}
        </div>

        {/* Link to Full Schedule Page */}
        <Link
          href="/app/shalat"
          className="text-[11px] font-bold text-[#C5A059] hover:underline flex items-center gap-0.5 shrink-0 whitespace-nowrap"
        >
          <span>Jadwal Lengkap</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* Next Prayer Highlight & Countdown */}
      <div className="flex items-baseline justify-between mb-5 relative z-10">
        <div>
          <span className="text-[11px] font-semibold text-white/70 tracking-wider uppercase block">
            Waktu Sholat Berikutnya
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
            {nextPrayer?.name || 'DZUHUR'}
          </h2>
        </div>

        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-[#C5A059]">
            {nextPrayer?.time || '--:--'}
          </div>
          {nextPrayer?.displayText && (
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-[#C5A059]/20 text-[#F5E6CC] text-[10px] font-bold tracking-wide">
              {nextPrayer.displayText}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Strip of 5 Daily Prayers */}
      <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-white/10 relative z-10">
        {prayerList.map((p) => {
          const isActive = p.name.toLowerCase() === activeName.toLowerCase();
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
                isActive
                  ? 'bg-[#C5A059] text-white shadow-md font-bold'
                  : 'bg-white/5 text-white/90 hover:bg-white/10'
              }`}
            >
              <span className={`text-[10px] font-semibold mb-1 ${isActive ? 'text-white' : 'text-white/70'}`}>
                {p.name}
              </span>
              <Icon size={16} className={`my-0.5 ${isActive ? 'text-white' : 'text-[#C5A059]'}`} />
              <span className="text-[11px] font-mono mt-1 font-semibold">
                {p.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
