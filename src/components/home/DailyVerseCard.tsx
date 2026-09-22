'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Share2, Check } from 'lucide-react';

const DAILY_VERSES = [
  {
    surahNumber: 2,
    ayahNumber: 153,
    surahName: 'Al-Baqarah',
    arabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ',
    translation: 'Wahai orang-orang yang beriman! Mohonlah pertolongan (kepada Allah) dengan sabar dan salat. Sungguh, Allah beserta orang-orang yang sabar.',
  },
  {
    surahNumber: 94,
    ayahNumber: 6,
    surahName: 'Asy-Syarh',
    arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    translation: 'Sesungguhnya beserta kesulitan ada kemudahan.',
  },
  {
    surahNumber: 65,
    ayahNumber: 3,
    surahName: 'At-Talaq',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ',
    translation: 'Dan barangsiapa bertawakal kepada Allah, niscaya Allah akan mencukupkan (keperluan)nya.',
  },
  {
    surahNumber: 13,
    ayahNumber: 28,
    surahName: "Ar-Ra'd",
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    translation: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
  },
];

export default function DailyVerseCard() {
  const [verse, setVerse] = useState(DAILY_VERSES[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Pick daily verse based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = dayOfYear % DAILY_VERSES.length;
    setVerse(DAILY_VERSES[index]);
  }, []);

  const handleShare = () => {
    const text = `${verse.arabic}\n\n"${verse.translation}"\n(QS. ${verse.surahName}: ${verse.ayahNumber})`;
    if (navigator.share) {
      navigator.share({ title: 'Ayat Hari Ini', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 border border-[#E8DECD] shadow-xs mb-6 relative overflow-hidden">
      {/* Decorative accent */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4931]">
          <Sparkles size={14} className="text-[#C5A059]" />
          <span>Ayat Inspirasi Hari Ini</span>
        </div>
        <button
          onClick={handleShare}
          className="text-[#6B6258] hover:text-[#1B4931] text-xs flex items-center gap-1 cursor-pointer"
          title="Bagikan Ayat"
        >
          {copied ? (
            <span className="text-green-600 font-medium">Tersalin!</span>
          ) : (
            <>
              <Share2 size={13} />
              <span>Bagikan</span>
            </>
          )}
        </button>
      </div>

      {/* Arabic text */}
      <p className="font-arabic text-xl text-[#181411] text-right py-2 leading-loose">
        {verse.arabic}
      </p>

      {/* Translation */}
      <p className="text-xs text-[#2C2621] leading-relaxed my-2">
        &ldquo;{verse.translation}&rdquo;
      </p>

      {/* Bottom reference & jump */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E8DECD]/50 mt-2">
        <span className="text-xs font-bold text-[#C5A059]">
          QS. {verse.surahName} : {verse.ayahNumber}
        </span>
        <Link
          href={`/app/surah/${verse.surahNumber}#ayah-${verse.ayahNumber}`}
          className="text-xs font-bold text-[#1B4931] hover:underline flex items-center gap-1"
        >
          <span>Buka Surah</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
