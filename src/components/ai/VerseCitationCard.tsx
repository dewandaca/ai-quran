'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { AICitation } from '@/services/aiService';
import TafsirContentRenderer from '@/components/quran/TafsirContentRenderer';

interface VerseCitationCardProps {
  citation: AICitation;
}

export default function VerseCitationCard({ citation }: VerseCitationCardProps) {
  const [showTafsir, setShowTafsir] = useState(false);

  return (
    <div className="block bg-white border border-[#C5A059]/40 hover:border-[#1B4931]/60 rounded-2xl p-4 shadow-xs transition text-left mt-2.5">
      <div className="flex items-center justify-between mb-2">
        <Link
          href={`/app/surah/${citation.surahNumber}?ayah=${citation.ayahNumber}#ayah-${citation.ayahNumber}`}
          className="flex items-center gap-1.5 text-xs font-bold text-[#1B4931] hover:text-[#C5A059] transition group"
        >
          <BookOpen size={14} className="text-[#C5A059]" />
          <span>QS. {citation.surahName} : Ayat {citation.ayahNumber}</span>
        </Link>
        <Link
          href={`/app/surah/${citation.surahNumber}?ayah=${citation.ayahNumber}#ayah-${citation.ayahNumber}`}
          className="text-[11px] font-semibold text-[#C5A059] hover:text-[#1B4931] flex items-center gap-0.5 transition"
        >
          <span>Buka di Mushaf</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {citation.arabicText && (
        <div
          dir="rtl"
          className="font-arabic text-xl sm:text-2xl text-right text-[#181411] leading-relaxed my-2 p-2.5 bg-[#FAF6EE] rounded-xl border border-[#E8DECD]/80 select-all"
        >
          {citation.arabicText}
        </div>
      )}

      {citation.translation && (
        <p className="text-xs text-[#4A4036] leading-relaxed italic my-1.5">
          &ldquo;{citation.translation}&rdquo;
        </p>
      )}

      {citation.tafsirText && (
        <div className="mt-3 pt-2.5 border-t border-[#E8DECD]/80">
          <button
            type="button"
            onClick={() => setShowTafsir(!showTafsir)}
            className="w-full flex items-center justify-between py-1 px-2.5 rounded-xl bg-[#FAF6EE] hover:bg-[#EAE1D2] text-[#1B4931] transition cursor-pointer border border-[#E8DECD]/80 text-[11px] font-bold"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#C5A059]" />
              <span>{showTafsir ? 'Tutup Tafsir Kemenag RI' : 'Baca Tafsir Lengkap Kemenag RI'}</span>
            </span>
            <ChevronDown
              size={14}
              className={`text-[#8C8276] transition-transform duration-200 ${showTafsir ? 'rotate-180' : ''}`}
            />
          </button>

          {showTafsir && (
            <div className="mt-2.5 p-3.5 bg-[#FAF6EE]/90 rounded-xl border border-[#E8DECD] animate-in fade-in slide-in-from-top-1 duration-150">
              <TafsirContentRenderer teks={citation.tafsirText} fontSizeClass="text-xs sm:text-sm" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
