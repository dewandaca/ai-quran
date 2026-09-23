'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Disc,
  ExternalLink,
  Square,
} from 'lucide-react';
import { useAudioStore, QARI_LIST } from '@/stores/useAudioStore';

export default function FullPlayerModal() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    playbackPosition,
    playbackDuration,
    queue,
    isContinuous,
    repeatMode,
    selectedQari,
    isPlayerModalOpen,
    setPlayerModalOpen,
    togglePlayPause,
    playNext,
    playPrevious,
    setIsContinuous,
    setRepeatMode,
    seekTo,
    stop,
  } = useAudioStore();

  if (!isPlayerModalOpen || !currentTrack) return null;

  const progressPercent =
    playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0;

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const qariName =
    QARI_LIST.find((q) => q.id === selectedQari)?.label || 'Misyari Rasyid';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-[430px] bg-[#FAF6EE] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E8DECD] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-[#D4C8B5] rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-[#E8DECD]/60">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#C5A059] uppercase">
              Sedang Memutar
            </span>
            <h3 className="text-base font-bold text-[#1B4931]">
              {currentTrack.isFullSurah
                ? `${currentTrack.surahName} (1 Surah Penuh)`
                : `${currentTrack.surahName} : Ayat ${currentTrack.ayahNumber}`}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stop();
                setPlayerModalOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
              title="Hentikan pemutaran audio"
            >
              <Square size={13} className="fill-current" />
              <span>Berhenti</span>
            </button>
            <button
              onClick={() => setPlayerModalOpen(false)}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD] shadow-xs cursor-pointer transition-colors"
              title="Tutup jendela pemutar (audio tetap berlanjut)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Big Spinning Vinyl Disc Graphic */}
        <div className="flex flex-col items-center justify-center py-6 px-4">
          <div className="relative w-52 h-52 rounded-full bg-[#18181b] p-3 shadow-xl flex items-center justify-center border-4 border-[#C5A059]/40">
            {/* Spinning disc */}
            <div
              className={`w-full h-full rounded-full border border-zinc-700/50 flex items-center justify-center relative overflow-hidden ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{
                background:
                  'radial-gradient(circle, #27272a 0%, #18181b 45%, #09090b 80%)',
              }}
            >
              {/* Concentric rings */}
              <div className="w-40 h-40 rounded-full border border-zinc-700/40 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border border-zinc-700/60 flex items-center justify-center">
                  {/* Center Emerald Label */}
                  <div className="w-16 h-16 rounded-full bg-[#1B4931] border-2 border-[#C5A059] flex flex-col items-center justify-center shadow-inner text-center p-1">
                    <Disc className="text-[#C5A059] w-5 h-5" />
                    <span className="text-[8px] font-bold text-white mt-0.5">
                      QURAN
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arm stylus accent */}
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#C5A059] shadow-md border-2 border-white" />
          </div>

          {/* Qari and Surah Title */}
          <div className="text-center mt-5">
            <h4 className="text-lg font-bold text-[#1B4931]">
              Surah {currentTrack.surahName}
            </h4>
            <p className="text-xs text-[#6B6258] mt-0.5">
              {currentTrack.isFullSurah && (
                <span className="inline-block bg-[#1B4931]/10 text-[#1B4931] font-bold px-2.5 py-0.5 rounded-full text-[10px] mr-1.5 border border-[#1B4931]/20">
                  Full Surah • {currentTrack.totalAyahs} Ayat
                </span>
              )}
              Qari: <span className="font-semibold text-[#1B4931]">{qariName}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar & Seek */}
        <div className="px-6 py-2">
          <input
            type="range"
            min={0}
            max={playbackDuration || 100}
            value={playbackPosition}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-2 bg-[#E8DECD] rounded-lg appearance-none cursor-pointer accent-[#1B4931]"
          />
          <div className="flex justify-between text-[11px] font-medium text-[#6B6258] mt-1.5">
            <span>{formatTime(playbackPosition)}</span>
            <span>{formatTime(playbackDuration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 py-4">
          {/* Previous / Seek Backward */}
          <button
            onClick={() => {
              if (currentTrack.isFullSurah && queue.length <= 1) {
                seekTo(Math.max(0, playbackPosition - 10000));
              } else {
                playPrevious();
              }
            }}
            className="w-11 h-11 rounded-full bg-white border border-[#E8DECD] flex items-center justify-center text-[#1B4931] hover:bg-[#F3EBDD] transition-colors shadow-xs cursor-pointer active:scale-95"
            title={currentTrack.isFullSurah && queue.length <= 1 ? 'Mundur 10 Detik' : 'Ayat Sebelumnya'}
          >
            <SkipBack size={20} />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-[#1B4931] text-white flex items-center justify-center shadow-lg hover:bg-[#143828] active:scale-95 transition-transform cursor-pointer border-2 border-[#C5A059]"
            title={isPlaying ? 'Jeda' : 'Putar'}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={28} />
            ) : (
              <Play size={28} className="translate-x-0.5" />
            )}
          </button>

          {/* Next / Seek Forward */}
          <button
            onClick={() => {
              if (currentTrack.isFullSurah && queue.length <= 1) {
                seekTo(Math.min(playbackDuration, playbackPosition + 10000));
              } else {
                playNext();
              }
            }}
            className="w-11 h-11 rounded-full bg-white border border-[#E8DECD] flex items-center justify-center text-[#1B4931] hover:bg-[#F3EBDD] transition-colors shadow-xs cursor-pointer active:scale-95"
            title={currentTrack.isFullSurah && queue.length <= 1 ? 'Maju 10 Detik' : 'Ayat Selanjutnya'}
          >
            <SkipForward size={20} />
          </button>

          {/* Stop Button */}
          <button
            onClick={() => {
              stop();
              setPlayerModalOpen(false);
            }}
            className="w-11 h-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Berhenti Memutar & Tutup"
          >
            <Square size={16} className="fill-current" />
          </button>
        </div>

        {/* Secondary options & Link to Surah */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#E8DECD]/60 text-xs">
          {/* Continuous playback toggle */}
          <button
            onClick={() => setIsContinuous(!isContinuous)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
              isContinuous
                ? 'bg-[#1B4931]/10 text-[#1B4931] border-[#1B4931]/30 font-semibold'
                : 'text-[#6B6258] border-[#E8DECD]'
            }`}
          >
            <Repeat size={14} />
            <span>Otomatis Lanjut</span>
          </button>

          {/* Jump to surah page */}
          <Link
            href={
              currentTrack.isFullSurah
                ? `/app/surah/${currentTrack.surahNumber}`
                : `/app/surah/${currentTrack.surahNumber}?ayah=${currentTrack.ayahNumber}#ayah-${currentTrack.ayahNumber}`
            }
            onClick={() => setPlayerModalOpen(false)}
            className="flex items-center gap-1 text-[#1B4931] font-semibold hover:underline"
          >
            <span>{currentTrack.isFullSurah ? 'Buka Surah' : 'Buka Ayat di Surah'}</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
