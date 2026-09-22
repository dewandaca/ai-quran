'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Bookmark,
  BookOpen,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { Ayah } from '@/services/quranApi';
import { useAudioStore } from '@/stores/useAudioStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface AyahRowProps {
  ayah: Ayah;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  onOpenTafsir: (ayahNumber: number) => void;
  allAyahs?: Ayah[];
}

export default function AyahRow({
  ayah,
  surahNumber,
  surahName,
  totalAyahs,
  onOpenTafsir,
  allAyahs,
}: AyahRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, selectedQari } = useAudioStore();
  const {
    arabicFontSize,
    translationFontSize,
    showTransliteration,
    showTranslation,
    isBookmarked,
    addBookmark,
    removeBookmark,
    setLastRead,
  } = useSettingsStore();

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const isCurrentPlaying =
    currentTrack?.surahNumber === surahNumber &&
    currentTrack?.ayahNumber === ayah.nomorAyat &&
    isPlaying;

  const bookmarked = isBookmarked(surahNumber, ayah.nomorAyat);

  const handlePlayAyah = () => {
    if (
      currentTrack?.surahNumber === surahNumber &&
      currentTrack?.ayahNumber === ayah.nomorAyat
    ) {
      togglePlayPause();
      return;
    }

    const audioUrl =
      ayah.audio[selectedQari] || Object.values(ayah.audio)[0] || '';

    // If allAyahs is provided, populate the queue with the full surah starting from this ayah
    const queue = allAyahs
      ? allAyahs.map((a) => ({
          surahNumber,
          surahName,
          ayahNumber: a.nomorAyat,
          audioUrl: a.audio[selectedQari] || Object.values(a.audio)[0] || '',
          totalAyahs,
        }))
      : undefined;

    playTrack(
      {
        surahNumber,
        surahName,
        ayahNumber: ayah.nomorAyat,
        audioUrl,
        totalAyahs,
      },
      queue
    );

    setLastRead(surahNumber, ayah.nomorAyat, surahName);
  };

  const handleToggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(surahNumber, ayah.nomorAyat);
    } else {
      addBookmark(
        surahNumber,
        ayah.nomorAyat,
        surahName,
        ayah.teksIndonesia
      );
    }
  };

  const formatAyahShareText = () => {
    const parts = [
      `QS. ${surahName}: Ayat ${ayah.nomorAyat}`,
      '',
      ayah.teksArab,
    ];
    if (ayah.teksLatin) {
      parts.push('', ayah.teksLatin);
    }
    parts.push('', `"${ayah.teksIndonesia}"`);
    return parts.join('\n');
  };

  const handleCopy = () => {
    const text = formatAyahShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = formatAyahShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QS. ${surahName}: Ayat ${ayah.nomorAyat}`,
          text,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div
      id={`ayah-${ayah.nomorAyat}`}
      className={`rounded-2xl p-5 mb-4 border transition-all duration-300 scroll-mt-72 sm:scroll-mt-64 ${
        isCurrentPlaying
          ? 'bg-[#F5E6CC]/40 border-[#C5A059] shadow-md ring-2 ring-[#C5A059]/40'
          : 'bg-white border-[#E8DECD] hover:border-[#1B4931]/30 shadow-xs'
      }`}
    >
      {/* Top action bar matching Gambar 2 & 3 */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DECD]/70 mb-4">
        {/* Circled Ayah Number Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-[#C5A059] bg-[#FAF6EE] text-[#1B4931] flex items-center justify-center font-bold text-xs shadow-xs">
            {ayah.nomorAyat}
          </div>
          <span className="text-xs font-bold text-[#6B6258] hidden sm:inline">
            Ayat {ayah.nomorAyat}
          </span>
        </div>

        {/* Action icons bar matching Gambar 2 & 3 */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Play audio button */}
          <button
            onClick={handlePlayAyah}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
              isCurrentPlaying
                ? 'bg-[#1B4931] text-white shadow-xs'
                : 'text-[#1B4931] hover:bg-[#FAF6EE]'
            }`}
            title={isCurrentPlaying ? 'Jeda' : 'Putar Ayat'}
          >
            {isCurrentPlaying ? <Pause size={15} /> : <Play size={15} className="translate-x-0.5" />}
          </button>

          {/* Tafsir button */}
          <button
            onClick={() => onOpenTafsir(ayah.nomorAyat)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] hover:bg-[#FAF6EE] transition cursor-pointer"
            title="Buka Tafsir Kemenag"
          >
            <BookOpen size={16} />
          </button>

          {/* Bookmark button */}
          <button
            onClick={handleToggleBookmark}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
              bookmarked
                ? 'text-[#C5A059] bg-[#FAF6EE]'
                : 'text-[#6B6258] hover:bg-[#FAF6EE]'
            }`}
            title={bookmarked ? 'Hapus Bookmark' : 'Tandai Ayat'}
          >
            <Bookmark size={16} className={bookmarked ? 'fill-[#C5A059]' : ''} />
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] hover:bg-[#FAF6EE] transition cursor-pointer"
            title="Salin Teks Ayat"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] hover:bg-[#FAF6EE] transition cursor-pointer"
            title="Bagikan Ayat"
          >
            {shared ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
          </button>
        </div>
      </div>

      {/* Arabic Text (Large & Crisp) */}
      <p
        className="font-arabic text-[#181411] text-right my-3"
        style={{ fontSize: `${arabicFontSize}px`, lineHeight: 2.3 }}
      >
        {ayah.teksArab}
      </p>

      {/* Transliteration */}
      {showTransliteration && ayah.teksLatin && (
        <p className="text-xs sm:text-sm text-[#6B6258] italic mt-3 mb-1.5 leading-relaxed">
          {ayah.teksLatin}
        </p>
      )}

      {/* Translation */}
      {showTranslation && (
        <p
          className="text-[#2C2621] mt-2 leading-relaxed"
          style={{ fontSize: `${translationFontSize}px` }}
        >
          {ayah.teksIndonesia}
        </p>
      )}
    </div>
  );
}
