'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, Layers } from 'lucide-react';
import MobileFrame from '@/components/layout/MobileFrame';
import JuzSurahModal from '@/components/quran/JuzSurahModal';
import { fetchAllSurahs, SurahInfo } from '@/services/quranApi';
import { JUZ_LIST, JuzInfo } from '@/data/juzData';

export default function QuranListPage() {
  const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJuz, setSelectedJuz] = useState<JuzInfo | null>(null);
  const [juzModalOpen, setJuzModalOpen] = useState(false);

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      const data = await fetchAllSurahs();
      setSurahs(data);
    } catch (err) {
      console.error('Failed to load surahs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.toLowerCase();
    return surahs.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nomor.toString() === q
    );
  }, [surahs, search]);

  const filteredJuz = useMemo(() => {
    if (!search.trim()) return JUZ_LIST;
    const q = search.toLowerCase();
    return JUZ_LIST.filter(
      (j) =>
        j.nama.toLowerCase().includes(q) ||
        j.startSurahName.toLowerCase().includes(q) ||
        j.endSurahName.toLowerCase().includes(q) ||
        j.juz.toString() === q
    );
  }, [search]);

  return (
    <MobileFrame title="Daftar Surah & Juz">
      {/* Top Controls: Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Tab Switcher: Surah vs Juz */}
        <div className="inline-flex bg-[#F3EBDD] p-1 rounded-2xl border border-[#E8DECD] shrink-0">
          <button
            onClick={() => setActiveTab('surah')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'surah'
                ? 'bg-[#1B4931] text-white shadow-xs'
                : 'text-[#6B6258] hover:text-[#1B4931]'
            }`}
          >
            <BookOpen size={14} />
            <span>Surah (114)</span>
          </button>

          <button
            onClick={() => setActiveTab('juz')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'juz'
                ? 'bg-[#1B4931] text-white shadow-xs'
                : 'text-[#6B6258] hover:text-[#1B4931]'
            }`}
          >
            <Layers size={14} />
            <span>Juz (30)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9286]"
          />
          <input
            type="text"
            placeholder={
              activeTab === 'surah'
                ? 'Cari nama surah atau arti...'
                : 'Cari juz atau nama surah...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E8DECD] rounded-2xl pl-10 pr-9 py-2.5 text-xs text-[#2C2621] outline-hidden focus:border-[#1B4931] shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9286] hover:text-[#2C2621]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-[#1B4931] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6B6258]">Memuat Al-Qur&apos;an...</p>
        </div>
      ) : activeTab === 'surah' ? (
        /* Surah Responsive Grid (1 col mobile, 2 cols tablet, 3 cols desktop) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSurahs.length === 0 ? (
            <div className="col-span-full text-center py-16 text-xs text-[#6B6258]">
              Surah tidak ditemukan.
            </div>
          ) : (
            filteredSurahs.map((surah) => (
              <Link
                key={surah.nomor}
                href={`/app/surah/${surah.nomor}`}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E8DECD] hover:border-[#1B4931]/50 hover:shadow-md transition shadow-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Number Badge */}
                  <div className="w-10 h-10 rounded-xl bg-[#1B4931] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    {surah.nomor}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#2C2621] group-hover:text-[#1B4931] truncate">
                      {surah.namaLatin}
                    </h3>
                    <p className="text-[11px] text-[#6B6258] mt-0.5">
                      <span className="capitalize">{surah.tempatTurun}</span> •{' '}
                      {surah.jumlahAyat} Ayat
                    </p>
                    <p className="text-[10px] text-[#9C9286] mt-0.5 italic truncate max-w-[150px]">
                      {surah.arti}
                    </p>
                  </div>
                </div>

                {/* Arabic Calligraphy Name */}
                <span className="font-arabic text-2xl text-[#1B4931] shrink-0 ml-2">
                  {surah.nama}
                </span>
              </Link>
            ))
          )}
        </div>
      ) : (
        /* Juz Responsive Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredJuz.map((juz) => (
            <div
              key={juz.juz}
              onClick={() => {
                setSelectedJuz(juz);
                setJuzModalOpen(true);
              }}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E8DECD] hover:border-[#1B4931]/50 hover:shadow-md transition shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#1B4931] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  {juz.juz}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#2C2621] group-hover:text-[#1B4931]">
                    {juz.nama}
                  </h3>
                  <p className="text-[11px] text-[#6B6258] mt-0.5 truncate">
                    {juz.startSurahName} ({juz.startAyah}) - {juz.endSurahName} ({juz.endAyah})
                  </p>
                </div>
              </div>

              <span className="font-arabic text-lg text-[#1B4931] shrink-0 ml-2">
                {juz.namaArab}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Juz Surah Picker Modal */}
      <JuzSurahModal
        visible={juzModalOpen}
        onClose={() => setJuzModalOpen(false)}
        juz={selectedJuz}
        allSurahs={surahs}
      />
    </MobileFrame>
  );
}
