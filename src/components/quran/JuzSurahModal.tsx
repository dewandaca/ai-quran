'use client';

import React from 'react';
import Link from 'next/link';
import { X, BookOpen, ChevronRight } from 'lucide-react';
import { JuzInfo, getSurahsInJuz } from '@/data/juzData';
import { SurahInfo } from '@/services/quranApi';

interface JuzSurahModalProps {
  visible: boolean;
  onClose: () => void;
  juz: JuzInfo | null;
  allSurahs: SurahInfo[];
}

export default function JuzSurahModal({
  visible,
  onClose,
  juz,
  allSurahs,
}: JuzSurahModalProps) {
  if (!visible || !juz) return null;

  const surahs = getSurahsInJuz(juz, allSurahs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#FAF6EE] rounded-[32px] shadow-2xl border border-[#E8DECD] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DECD]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B4931] text-white flex items-center justify-center font-bold text-sm">
              {juz.juz}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B4931]">
                Daftar Surah dalam {juz.nama}
              </h3>
              <p className="text-xs text-[#6B6258] font-arabic">
                {juz.namaArab}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD]"
          >
            <X size={16} />
          </button>
        </div>

        {/* List of Surahs in this Juz */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {surahs.map((item) => (
            <Link
              key={item.nomor}
              href={`/app/surah/${item.nomor}#ayah-${item.startAyah}`}
              onClick={onClose}
              className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#E8DECD] hover:border-[#1B4931]/40 hover:bg-[#F3EBDD]/40 transition shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1B4931]/10 text-[#1B4931] flex items-center justify-center font-bold text-xs">
                  {item.nomor}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1B4931] group-hover:text-[#143828]">
                    {item.namaLatin}
                  </h4>
                  <p className="text-xs text-[#6B6258]">
                    Ayat {item.startAyah} - {item.endAyah}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-arabic text-lg text-[#1B4931]">
                  {item.nama}
                </span>
                <ChevronRight size={16} className="text-[#9C9286]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
