'use client';

import React from 'react';
import { SurahDetail } from '@/services/quranApi';
import { Play, Pause } from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';

interface SurahHeaderCardProps {
  surah: SurahDetail;
}

export default function SurahHeaderCard({ surah }: SurahHeaderCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, selectedQari } = useAudioStore();

  const isCurrentSurahPlaying =
    currentTrack?.surahNumber === surah.nomor && isPlaying;

  const handlePlayFullSurah = () => {
    if (currentTrack?.surahNumber === surah.nomor) {
      togglePlayPause();
      return;
    }

    if (surah.ayat && surah.ayat.length > 0) {
      const firstAyah = surah.ayat[0];
      const audioUrl =
        firstAyah.audio[selectedQari] || Object.values(firstAyah.audio)[0] || '';

      const queue = surah.ayat.map((a) => ({
        surahNumber: surah.nomor,
        surahName: surah.namaLatin,
        ayahNumber: a.nomorAyat,
        audioUrl: a.audio[selectedQari] || Object.values(a.audio)[0] || '',
        totalAyahs: surah.jumlahAyat,
      }));

      playTrack(
        {
          surahNumber: surah.nomor,
          surahName: surah.namaLatin,
          ayahNumber: 1,
          audioUrl,
          totalAyahs: surah.jumlahAyat,
        },
        queue
      );
    }
  };

  return (
    <div className="relative rounded-[28px] p-6 mb-6 shadow-xl overflow-hidden bg-linear-to-br from-[#1B4931] via-[#163D29] to-[#0E271A] text-white text-center">
      {/* Decorative islamic background shapes */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-[#C5A059]/10 pointer-events-none" />

      {/* Surah Latin Title */}
      <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
        {surah.namaLatin}
      </h1>

      {/* Meaning */}
      <p className="text-xs text-[#C5A059] font-semibold uppercase tracking-wider mb-2">
        {surah.arti}
      </p>

      {/* Divider */}
      <div className="w-32 h-px bg-white/20 mx-auto my-3" />

      {/* Meta tags */}
      <div className="flex items-center justify-center gap-2 text-xs text-white/80 mb-4 font-medium">
        <span className="capitalize">{surah.tempatTurun}</span>
        <span>•</span>
        <span>{surah.jumlahAyat} Ayat</span>
      </div>

      {/* Arabic Calligraphy Name in header */}
      <p className="font-arabic text-4xl text-[#C5A059] py-1 mb-4">
        {surah.nama}
      </p>

      {/* Play Surah Button */}
      <button
        onClick={handlePlayFullSurah}
        className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08e4d] text-[#181411] px-5 py-2.5 rounded-full font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
      >
        {isCurrentSurahPlaying ? <Pause size={15} /> : <Play size={15} />}
        <span>{isCurrentSurahPlaying ? 'Jeda Audio Surah' : 'Putar Murottal Surah'}</span>
      </button>

      {/* Bismillah Header (for all surahs except At-Taubah #9) */}
      {surah.nomor !== 9 && (
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="font-arabic text-2xl text-white/95">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}
    </div>
  );
}
