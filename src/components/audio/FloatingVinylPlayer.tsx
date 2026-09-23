'use client';

import React from 'react';
import { Disc, Play, Pause } from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';

export default function FloatingVinylPlayer() {
  const { currentTrack, isPlaying, setPlayerModalOpen, togglePlayPause } = useAudioStore();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-5 md:right-8 z-40 flex items-center gap-2.5">
      {/* Mini info pill on hover/tap */}
      <div
        onClick={() => setPlayerModalOpen(true)}
        className="hidden xs:flex items-center gap-2 bg-[#FAF6EE]/95 border border-[#C5A059]/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg cursor-pointer transition-all hover:border-[#1B4931]"
      >
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider leading-none">
            Memutar
          </span>
          <span className="text-xs font-bold text-[#1B4931] truncate max-w-[110px]">
            {currentTrack.isFullSurah ? currentTrack.surahName : `${currentTrack.surahName}:${currentTrack.ayahNumber}`}
          </span>
        </div>
      </div>

      {/* Floating Vinyl Record Disc */}
      <div className="relative group">
        <button
          onClick={() => setPlayerModalOpen(true)}
          className="relative w-14 h-14 rounded-full bg-[#18181b] p-1 shadow-xl border-2 border-[#C5A059] flex items-center justify-center cursor-pointer transition-transform group-hover:scale-105 active:scale-95"
          title={
            currentTrack.isFullSurah
              ? `Surah ${currentTrack.surahName} (Full Surah)`
              : `${currentTrack.surahName} : Ayat ${currentTrack.ayahNumber}`
          }
        >
          {/* Vinyl grooves */}
          <div
            className={`w-full h-full rounded-full border border-zinc-700/60 flex items-center justify-center relative overflow-hidden ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
            style={{
              background:
                'radial-gradient(circle, #27272a 0%, #18181b 50%, #09090b 80%)',
            }}
          >
            {/* Center label */}
            <div className="w-6 h-6 rounded-full bg-[#1B4931] border border-[#C5A059] flex items-center justify-center shadow-inner">
              <Disc className="w-3.5 h-3.5 text-[#C5A059]" />
            </div>
          </div>

          {/* Pulse dot indicator when playing */}
          {isPlaying && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D8B4E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#2D8B4E] border-2 border-white"></span>
            </span>
          )}
        </button>

        {/* Quick inline Play/Pause hover toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-[#1B4931] text-white flex items-center justify-center shadow-md border border-[#FAF6EE] cursor-pointer hover:bg-[#143828]"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} className="translate-x-0.5" />}
        </button>
      </div>
    </div>
  );
}
