'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Play,
  Pause,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
} from 'lucide-react';
import { TafsirAyah, Ayah } from '@/services/quranApi';
import TafsirContentRenderer from './TafsirContentRenderer';
import { useAudioStore } from '@/stores/useAudioStore';

export interface TafsirModalProps {
  visible: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  totalAyahs?: number;
  ayahNumber: number;
  currentAyah?: Ayah;
  allAyahs?: Ayah[];
  tafsirData: TafsirAyah[];
  loading?: boolean;
  onSelectAyah?: (ayahNumber: number) => void;
}

export default function TafsirModal({
  visible,
  onClose,
  surahNumber,
  surahName,
  totalAyahs = 1,
  ayahNumber,
  currentAyah,
  allAyahs,
  tafsirData,
  loading = false,
  onSelectAyah,
}: TafsirModalProps) {
  const [copied, setCopied] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0: sm, 1: base, 2: lg

  const { currentTrack, isPlaying, playTrack, togglePlayPause, selectedQari } = useAudioStore();

  if (!visible) return null;

  const currentTafsir = tafsirData.find((t) => t.ayat === ayahNumber);

  // Audio track check for current ayah
  const isCurrentPlaying =
    currentTrack?.surahNumber === surahNumber &&
    currentTrack?.ayahNumber === ayahNumber &&
    isPlaying;

  const handlePlayAyahAudio = () => {
    if (!currentAyah) return;

    if (
      currentTrack?.surahNumber === surahNumber &&
      currentTrack?.ayahNumber === ayahNumber
    ) {
      togglePlayPause();
      return;
    }

    const audioUrl =
      currentAyah.audio[selectedQari] || Object.values(currentAyah.audio)[0] || '';

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
        ayahNumber: currentAyah.nomorAyat,
        audioUrl,
        totalAyahs,
      },
      queue
    );
  };

  const handleCopyTafsir = () => {
    const lines = [
      `Tafsir QS. ${surahName} : Ayat ${ayahNumber}`,
      currentAyah?.teksArab ? `\n${currentAyah.teksArab}\n` : '',
      currentAyah?.teksIndonesia ? `Artinya: "${currentAyah.teksIndonesia}"\n` : '',
      `--- Penjelasan Tafsir Kemenag RI ---`,
      currentTafsir ? currentTafsir.teks : 'Tafsir belum tersedia.',
      `\nDibaca via EQuran AI Companion`,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontSizeClasses = [
    'text-xs sm:text-sm',      // level 0
    'text-sm sm:text-base',    // level 1 (default)
    'text-base sm:text-lg',    // level 2
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#FCFAF6] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E8DECD] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Pill */}
        <div className="w-12 h-1.5 bg-[#D4C8B5] rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#E8DECD] bg-[#FAF6EE] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1B4931] to-[#2D7A52] flex items-center justify-center text-white shadow-xs">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                  Tafsir Resmi Kemenag RI
                </span>
                <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
                <span className="text-[10px] font-semibold text-[#8A7E72]">
                  QS. {surahNumber}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#1B4931] tracking-tight">
                {surahName} : Ayat {ayahNumber}
              </h3>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5">
            {/* Font size control */}
            <div className="hidden sm:flex items-center bg-white border border-[#E8DECD] rounded-xl px-1 py-0.5 text-xs font-semibold text-[#6B6258]">
              <button
                onClick={() => setFontSizeLevel((l) => Math.max(0, l - 1))}
                disabled={fontSizeLevel === 0}
                className="px-2 py-1 hover:text-[#1B4931] disabled:opacity-30 cursor-pointer"
                title="Perkecil Font"
              >
                A-
              </button>
              <span className="h-3 w-px bg-[#E8DECD]" />
              <button
                onClick={() => setFontSizeLevel((l) => Math.min(2, l + 1))}
                disabled={fontSizeLevel === 2}
                className="px-2 py-1 hover:text-[#1B4931] disabled:opacity-30 cursor-pointer"
                title="Perbesar Font"
              >
                A+
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyTafsir}
              className="p-2 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD] transition cursor-pointer flex items-center gap-1 text-xs"
              title="Salin Ayat & Tafsir"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-emerald-600" />
                  <span className="text-emerald-600 font-medium hidden sm:inline">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span className="hidden sm:inline">Salin</span>
                </>
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD] transition cursor-pointer"
              title="Tutup Modal"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. AYAT HERO CARD */}
          {currentAyah && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#C5A059]/30 p-4 sm:p-5 shadow-xs space-y-3.5">
              {/* Ayah Card Top Bar */}
              <div className="flex items-center justify-between border-b border-[#E8DECD]/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1B4931]/10 text-[#1B4931] text-[11px] font-bold">
                    Ayat {currentAyah.nomorAyat}
                  </span>
                  <span className="text-xs text-[#8A7E72] font-medium hidden sm:inline">
                    QS. {surahName}
                  </span>
                </div>

                {/* Audio Button */}
                <button
                  onClick={handlePlayAyahAudio}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    isCurrentPlaying
                      ? 'bg-[#C5A059] text-white shadow-xs'
                      : 'bg-[#FAF6EE] text-[#1B4931] border border-[#E8DECD] hover:border-[#C5A059]'
                  }`}
                >
                  {isCurrentPlaying ? (
                    <>
                      <Pause size={13} />
                      <span>Jeda Murottal</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} />
                      <span>Putar Ayat</span>
                    </>
                  )}
                </button>
              </div>

              {/* Full Arabic Text */}
              <div
                dir="rtl"
                className="font-arabic text-2xl sm:text-3xl text-right text-[#181411] leading-[2.3] py-2 select-all tracking-wide"
              >
                {currentAyah.teksArab}
              </div>

              {/* Latin Transliteration */}
              {currentAyah.teksLatin && (
                <p className="text-xs sm:text-sm text-[#8A7E72] italic leading-relaxed">
                  {currentAyah.teksLatin}
                </p>
              )}

              {/* Translation */}
              <div className="bg-[#FAF6EE] rounded-xl sm:rounded-2xl p-3 border border-[#E8DECD]/80">
                <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed">
                  &ldquo;{currentAyah.teksIndonesia}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Section Divider Ornament */}
          <div className="flex items-center gap-3 my-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E8DECD] to-transparent" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#E8DECD] text-[#C5A059] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>Penjelasan Tafsir Lengkap</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E8DECD] to-transparent" />
          </div>

          {/* 2. TAFSIR CONTENT BODY */}
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full border-3 border-[#1B4931] border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-[#6B6258]">
                Memuat penjelasan tafsir Kemenag RI...
              </p>
            </div>
          ) : currentTafsir ? (
            <TafsirContentRenderer
              teks={currentTafsir.teks}
              fontSizeClass={fontSizeClasses[fontSizeLevel]}
            />
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-white border border-[#E8DECD] text-[#6B6258] space-y-1">
              <p className="font-semibold text-sm text-[#1B4931]">
                Tafsir untuk ayat ini belum tersedia.
              </p>
              <p className="text-xs">Silakan periksa kembali atau pilih ayat lainnya.</p>
            </div>
          )}
        </div>

        {/* Modal Footer with Ayah Navigator */}
        <div className="p-3.5 sm:p-4 border-t border-[#E8DECD] bg-[#FAF6EE] flex items-center justify-between gap-3 shrink-0">
          {/* Previous Ayah */}
          <button
            onClick={() => onSelectAyah && onSelectAyah(ayahNumber - 1)}
            disabled={ayahNumber <= 1 || !onSelectAyah}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#E8DECD] text-xs font-bold text-[#1B4931] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Ayat Sebelumnya</span>
            <span className="sm:hidden">Prev</span>
          </button>

          {/* Ayat indicator */}
          <div className="text-center text-xs font-bold text-[#6B6258]">
            <span>Ayat {ayahNumber}</span>
            {totalAyahs > 1 && <span className="text-[#8A7E72] font-normal"> / {totalAyahs}</span>}
          </div>

          {/* Next Ayah */}
          <button
            onClick={() => onSelectAyah && onSelectAyah(ayahNumber + 1)}
            disabled={ayahNumber >= totalAyahs || !onSelectAyah}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#E8DECD] text-xs font-bold text-[#1B4931] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <span className="hidden sm:inline">Ayat Selanjutnya</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
