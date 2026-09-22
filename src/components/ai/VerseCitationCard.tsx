'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { AICitation } from '@/services/aiService';

interface VerseCitationCardProps {
  citation: AICitation;
}

export default function VerseCitationCard({ citation }: VerseCitationCardProps) {
  return (
    <Link
      href={`/app/surah/${citation.surahNumber}#ayah-${citation.ayahNumber}`}
      className="block bg-white hover:bg-[#FAF6EE] border border-[#C5A059]/40 hover:border-[#1B4931] rounded-2xl p-3.5 shadow-xs transition group text-left mt-2"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4931]">
          <BookOpen size={14} className="text-[#C5A059]" />
          <span>QS. {citation.surahName} : Ayat {citation.ayahNumber}</span>
        </div>
        <span className="text-[11px] font-semibold text-[#C5A059] group-hover:text-[#1B4931] flex items-center gap-0.5">
          <span>Buka Ayat</span>
          <ArrowRight size={12} />
        </span>
      </div>

      {citation.arabicText && (
        <p className="font-arabic text-sm text-[#181411] text-right my-1 line-clamp-2">
          {citation.arabicText}
        </p>
      )}

      {citation.translation && (
        <p className="text-xs text-[#6B6258] line-clamp-2 italic">
          &ldquo;{citation.translation}&rdquo;
        </p>
      )}
    </Link>
  );
}
