'use client';

import React, { useState } from 'react';
import { HeartHandshake, Copy, Check } from 'lucide-react';
import { AIDuaCitation } from '@/services/aiService';

interface DuaCitationCardProps {
  dua: AIDuaCitation;
}

export default function DuaCitationCard({ dua }: DuaCitationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${dua.title} (${dua.group})\n\n${dua.arabicText || ''}\n\n"${dua.translation || ''}"\n\n${dua.source ? `Sumber: ${dua.source}` : ''}`.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="block bg-white hover:bg-[#FAF6EE]/70 border border-[#C5A059]/40 hover:border-[#1B4931] rounded-2xl p-4 shadow-xs transition group text-left mt-2.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#1B4931]/10 flex items-center justify-center text-[#1B4931] shrink-0">
            <HeartHandshake size={14} />
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-[#1B4931] truncate">
              {dua.title}
            </h5>
            <span className="text-[10px] font-medium text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded-md inline-block">
              {dua.group}
            </span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="text-[#9C9286] hover:text-[#1B4931] text-[11px] flex items-center gap-1 cursor-pointer transition shrink-0 px-2 py-1 rounded-lg hover:bg-white border border-transparent hover:border-[#E8DECD]"
          title="Salin doa"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-600" />
              <span className="text-green-600 font-semibold text-[10px]">Tersalin</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="text-[10px]">Salin Doa</span>
            </>
          )}
        </button>
      </div>

      {/* Arabic Text */}
      {dua.arabicText && (
        <div
          dir="rtl"
          className="font-arabic text-xl sm:text-2xl text-right text-[#181411] leading-relaxed my-2.5 p-3 bg-[#FAF6EE] rounded-xl border border-[#E8DECD]/80 select-all"
        >
          {dua.arabicText}
        </div>
      )}

      {/* Transliteration */}
      {dua.transliteration && (
        <p className="text-[11px] text-[#8C8276] italic mb-1.5 line-clamp-2">
          {dua.transliteration}
        </p>
      )}

      {/* Translation */}
      {dua.translation && (
        <p className="text-xs text-[#2C2621] leading-relaxed">
          &ldquo;{dua.translation}&rdquo;
        </p>
      )}

      {/* Source / Hadith */}
      {dua.source && (
        <div className="mt-2 pt-2 border-t border-[#E8DECD]/50 text-[10px] text-[#8C8276] flex items-center gap-1">
          <span className="font-semibold text-[#1B4931]">Sumber:</span>
          <span className="truncate">{dua.source.replace(/\n+/g, ' ')}</span>
        </div>
      )}
    </div>
  );
}
