'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import MobileFrame from '@/components/layout/MobileFrame';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function BookmarksPage() {
  const {
    bookmarks,
    removeBookmark,
    lastReadSurah,
    lastReadAyah,
    lastReadSurahName,
  } = useSettingsStore();

  return (
    <MobileFrame title="Bookmark & Riwayat">
      {/* Last Read Card */}
      {lastReadSurah && (
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#6B6258] uppercase tracking-wider block mb-2 px-1">
            Terakhir Dibaca
          </span>
          <Link
            href={`/app/surah/${lastReadSurah}#ayah-${lastReadAyah || 1}`}
            className="block bg-linear-to-br from-[#1B4931] to-[#143828] text-white rounded-2xl p-4 shadow-md hover:shadow-lg transition group border border-[#C5A059]/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[#C5A059]">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {lastReadSurahName || `Surah ke-${lastReadSurah}`}
                  </h4>
                  <p className="text-xs text-[#C5A059] font-medium">
                    Ayat {lastReadAyah || 1}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#F5E6CC] group-hover:translate-x-1 transition-transform">
                <span>Lanjut</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Saved Bookmarks List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold text-[#6B6258] uppercase tracking-wider">
            Ayat Ditandai ({bookmarks.length})
          </span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E8DECD] text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#9C9286] flex items-center justify-center mx-auto mb-3">
              <Bookmark size={22} />
            </div>
            <h4 className="text-sm font-bold text-[#2C2621] mb-1">
              Belum Ada Bookmark
            </h4>
            <p className="text-xs text-[#6B6258] max-w-xs mx-auto mb-4">
              Ketuk ikon bookmark pada ayat saat membaca surah untuk menyimpannya di sini.
            </p>
            <Link
              href="/app/quran"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4931] text-white text-xs font-bold shadow-xs hover:bg-[#143828]"
            >
              <BookOpen size={14} />
              <span>Buka Daftar Surah</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookmarks.map((b) => (
              <div
                key={`${b.surahNumber}-${b.ayahNumber}`}
                className="bg-white rounded-2xl p-4 border border-[#E8DECD] shadow-xs hover:border-[#1B4931]/40 transition flex items-center justify-between gap-3"
              >
                <Link
                  href={`/app/surah/${b.surahNumber}#ayah-${b.ayahNumber}`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1B4931]">
                      {b.surahName || `Surah ${b.surahNumber}`}
                    </span>
                    <span className="text-[11px] font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-full">
                      Ayat {b.ayahNumber}
                    </span>
                  </div>
                  {b.ayahText && (
                    <p className="text-xs text-[#6B6258] truncate leading-relaxed">
                      {b.ayahText}
                    </p>
                  )}
                </Link>

                <button
                  onClick={() => removeBookmark(b.surahNumber, b.ayahNumber)}
                  className="w-9 h-9 rounded-xl bg-[#FAF6EE] text-[#9C9286] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition shrink-0 cursor-pointer"
                  title="Hapus bookmark"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
