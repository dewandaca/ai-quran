'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Search,
  Play,
  Pause,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import MobileFrame from '@/components/layout/MobileFrame';
import AyahRow from '@/components/quran/AyahRow';
import TafsirModal from '@/components/quran/TafsirModal';
import {
  fetchSurahDetail,
  fetchTafsir,
  fetchAllSurahs,
  SurahDetail,
  SurahInfo,
  TafsirAyah,
  getAudioUrl,
} from '@/services/quranApi';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore, QARI_LIST } from '@/stores/useAudioStore';

export default function SurahDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const surahNumber = parseInt(resolvedParams.id || '1', 10);

  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [allSurahs, setAllSurahs] = useState<SurahInfo[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [tafsirList, setTafsirList] = useState<TafsirAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [tafsirModalOpen, setTafsirModalOpen] = useState(false);
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState(1);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [selectedJumpAyah, setSelectedJumpAyah] = useState<string>('all');

  const {
    showTransliteration,
    setShowTransliteration,
    showTranslation,
    setShowTranslation,
    setLastRead,
  } = useSettingsStore();

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    selectedQari,
    setSelectedQari,
  } = useAudioStore();

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [surahNumber]);

  // Handle scroll to hash if present in URL
  useEffect(() => {
    if (!loading && surah) {
      const hash = window.location.hash;
      if (hash) {
        const el = document.querySelector(hash);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 350);
        }
      }
    }
  }, [loading, surah]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [surahData, surahsList] = await Promise.all([
        fetchSurahDetail(surahNumber),
        fetchAllSurahs(),
      ]);
      setSurah(surahData);
      setAllSurahs(surahsList);

      if (surahData) {
        setLastRead(surahData.nomor, 1, surahData.namaLatin);
      }
    } catch (err) {
      console.error('Failed to load surah details:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSidebarSurahs = useMemo(() => {
    if (!sidebarSearch.trim()) return allSurahs;
    const q = sidebarSearch.toLowerCase();
    return allSurahs.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nomor.toString() === q
    );
  }, [allSurahs, sidebarSearch]);

  const handleOpenTafsir = async (ayahNum: number) => {
    setSelectedTafsirAyah(ayahNum);
    setTafsirModalOpen(true);

    if (tafsirList.length === 0) {
      try {
        setTafsirLoading(true);
        const data = await fetchTafsir(surahNumber);
        setTafsirList(data.tafsir);
      } catch (err) {
        console.error('Failed to load tafsir:', err);
      } finally {
        setTafsirLoading(false);
      }
    }
  };

  const handlePlayFullSurah = () => {
    if (!surah || !surah.ayat || surah.ayat.length === 0) return;

    const { queue } = useAudioStore.getState();
    const isFullSurahQueued =
      currentTrack?.surahNumber === surah.nomor &&
      queue.length === surah.ayat.length;

    // If currently playing the full surah, toggle pause
    if (isFullSurahQueued && isPlaying) {
      togglePlayPause();
      return;
    }

    // If paused while the full surah is queued, resume
    if (isFullSurahQueued && !isPlaying && currentTrack) {
      togglePlayPause();
      return;
    }

    // Otherwise, generate the complete surah queue and start playing from Ayah 1
    const firstAyah = surah.ayat[0];
    const audioUrl = getAudioUrl(firstAyah.audio, selectedQari);

    const fullQueue = surah.ayat.map((a) => ({
      surahNumber: surah.nomor,
      surahName: surah.namaLatin,
      ayahNumber: a.nomorAyat,
      audioUrl: getAudioUrl(a.audio, selectedQari),
      totalAyahs: surah.jumlahAyat,
    }));

    playTrack(
      {
        surahNumber: surah.nomor,
        surahName: surah.namaLatin,
        ayahNumber: 1,
        audioUrl,
        totalAyahs: surah.jumlahAyat,
      },
      fullQueue
    );
  };

  const handleJumpToAyah = (val: string) => {
    setSelectedJumpAyah(val);
    if (val === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(`ayah-${val}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const isCurrentSurahPlaying =
    currentTrack?.surahNumber === surah?.nomor && isPlaying;

  const goToPrevSurah = () => {
    if (surahNumber > 1) {
      router.push(`/app/surah/${surahNumber - 1}`);
    }
  };

  const goToNextSurah = () => {
    if (surahNumber < 114) {
      router.push(`/app/surah/${surahNumber + 1}`);
    }
  };

  return (
    <MobileFrame showBack={false}>
      <div className="flex gap-6 items-start">
        {/* DESKTOP SIDEBAR: DAFTAR SURAT (matching Gambar 2) */}
        <aside className="hidden lg:flex flex-col w-80 shrink-0 bg-white rounded-3xl border border-[#E8DECD] shadow-xs p-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden">
          <div className="mb-3 px-1">
            <h2 className="text-base font-bold text-[#1B4931]">Daftar Surat</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9286]"
            />
            <input
              type="text"
              placeholder="Cari surat..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-[#FAF6EE] border border-[#E8DECD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] outline-hidden focus:border-[#1B4931]"
            />
          </div>

          {/* Scrollable list of 114 Surahs */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredSidebarSurahs.map((item) => {
              const isActive = item.nomor === surahNumber;
              return (
                <Link
                  key={item.nomor}
                  href={`/app/surah/${item.nomor}`}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition text-left group ${
                    isActive
                      ? 'bg-[#1B4931] text-white border-[#1B4931] shadow-xs'
                      : 'bg-white hover:bg-[#FAF6EE] border-transparent hover:border-[#E8DECD]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        isActive
                          ? 'border border-[#C5A059] bg-[#C5A059] text-[#181411]'
                          : 'border border-[#C5A059] text-[#1B4931] bg-[#FAF6EE]'
                      }`}
                    >
                      {item.nomor}
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-white' : 'text-[#2C2621]'
                        }`}
                      >
                        {item.namaLatin}
                      </h4>
                      <p
                        className={`text-[10px] truncate ${
                          isActive ? 'text-[#F5E6CC]' : 'text-[#6B6258]'
                        }`}
                      >
                        <span className="capitalize">{item.tempatTurun}</span> • {item.jumlahAyat}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-arabic text-lg shrink-0 ml-2 ${
                      isActive ? 'text-[#C5A059]' : 'text-[#1B4931]'
                    }`}
                  >
                    {item.nama}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* MAIN SURAH CONTENT AREA */}
        <div className="flex-1 min-w-0">

          {loading || !surah ? (
            <div className="py-24 text-center bg-white rounded-3xl border border-[#E8DECD]">
              <div className="w-8 h-8 border-3 border-[#1B4931] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#6B6258]">Memuat Surah &amp; Ayat...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* STICKY TOP CONTROLS & HEADER (Gambar 1: fixed at top so only verses scroll) */}
              <div className="sticky top-[65px] z-20 bg-[#FAF6EE] -mt-2 pt-2.5 pb-2 space-y-2.5">
                {/* Top navigation back button */}
                <div>
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4931] hover:text-[#143828] bg-white px-3.5 py-2 rounded-xl border border-[#E8DECD] shadow-xs hover:bg-[#FAF6EE] transition"
                  >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Beranda</span>
                  </Link>
                </div>

                {/* SURAH TITLE HEADER CARD (matching Gambar 1 & 2) */}
                <div className="relative rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 bg-linear-to-br from-[#1B4931] via-[#163D29] to-[#0E271A] text-white shadow-md overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#C5A059]/40">
                  <div className="flex items-center gap-3.5">
                    {/* Circled Number Badge */}
                    <div className="w-11 h-11 rounded-full border-2 border-[#C5A059] bg-[#FAF6EE] text-[#1B4931] flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      {surah.nomor}
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {surah.namaLatin}
                        <span className="text-[#F5E6CC] text-xs sm:text-sm font-normal ml-2">
                          • {surah.arti}
                        </span>
                      </h1>
                      <p className="text-[11px] text-white/80 mt-0.5 font-medium capitalize">
                        {surah.tempatTurun} • {surah.jumlahAyat} Ayat
                      </p>
                    </div>
                  </div>

                  {/* Right Calligraphy & Quick Surah Dropdown */}
                  <div className="flex items-center gap-3 sm:text-right">
                    <span className="font-arabic text-2xl sm:text-3xl text-[#C5A059]">
                      {surah.nama}
                    </span>
                    {/* Mobile Quick Dropdown */}
                    <div className="lg:hidden">
                      <select
                        value={surahNumber}
                        onChange={(e) => router.push(`/app/surah/${e.target.value}`)}
                        className="bg-white/15 text-white text-xs font-bold rounded-xl px-2 py-1.5 border border-white/20 outline-hidden"
                      >
                        {allSurahs.map((s) => (
                          <option key={s.nomor} value={s.nomor} className="text-[#2C2621]">
                            {s.nomor}. {s.namaLatin}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE CONTROLS BAR (matching Gambar 1 & 2) */}
                <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E8DECD] shadow-xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Ayat Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#6B6258]">Ayat:</span>
                      <select
                        value={selectedJumpAyah}
                        onChange={(e) => handleJumpToAyah(e.target.value)}
                        className="bg-[#FAF6EE] border border-[#E8DECD] rounded-xl px-2.5 py-1.5 text-xs text-[#2C2621] font-semibold outline-hidden focus:border-[#1B4931] cursor-pointer"
                      >
                        <option value="all">Semua ({surah.jumlahAyat})</option>
                        {surah.ayat.map((a) => (
                          <option key={a.nomorAyat} value={a.nomorAyat}>
                            Ayat {a.nomorAyat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Qari Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#6B6258]">Qari:</span>
                      <select
                        value={selectedQari}
                        onChange={(e) => setSelectedQari(e.target.value)}
                        className="bg-[#FAF6EE] border border-[#E8DECD] rounded-xl px-2.5 py-1.5 text-xs text-[#2C2621] font-semibold outline-hidden focus:border-[#1B4931] cursor-pointer"
                      >
                        {QARI_LIST.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Toggles & Play Button */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Transliterasi Toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#2C2621]">Transliterasi</span>
                      <button
                        type="button"
                        onClick={() => setShowTransliteration(!showTransliteration)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          showTransliteration ? 'bg-[#1B4931]' : 'bg-[#E8DECD]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                            showTransliteration ? 'left-4.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Terjemahan Toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#2C2621]">Terjemahan</span>
                      <button
                        type="button"
                        onClick={() => setShowTranslation(!showTranslation)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          showTranslation ? 'bg-[#1B4931]' : 'bg-[#E8DECD]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                            showTranslation ? 'left-4.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Play Audio Full Button */}
                    <button
                      onClick={handlePlayFullSurah}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B4931] hover:bg-[#143828] text-white font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      {isCurrentSurahPlaying ? (
                        <>
                          <Pause size={13} />
                          <span>Jeda Audio</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} className="translate-x-0.5" />
                          <span>Play Audio Full</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bismillah Banner (except At-Taubah #9) */}
              {surah.nomor !== 9 && (
                <div className="bg-white rounded-2xl p-4 border border-[#E8DECD] text-center shadow-xs">
                  <p className="font-arabic text-2xl sm:text-3xl text-[#1B4931]">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}

              {/* LIST OF AYAT CARDS (matching Gambar 2 & 3) */}
              <div className="space-y-3">
                {surah.ayat.map((ayah) => (
                  <AyahRow
                    key={ayah.nomorAyat}
                    ayah={ayah}
                    surahNumber={surah.nomor}
                    surahName={surah.namaLatin}
                    totalAyahs={surah.jumlahAyat}
                    onOpenTafsir={handleOpenTafsir}
                    allAyahs={surah.ayat}
                  />
                ))}
              </div>

              {/* BOTTOM NAVIGATION: Surat Sebelumnya & Surat Selanjutnya */}
              <div className="flex items-center justify-between pt-6 pb-6 border-t border-[#E8DECD]">
                <button
                  onClick={goToPrevSurah}
                  disabled={surahNumber <= 1}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                    surahNumber > 1
                      ? 'bg-white text-[#1B4931] border-[#E8DECD] hover:bg-[#FAF6EE] shadow-xs'
                      : 'opacity-40 cursor-not-allowed border-transparent text-[#9C9286]'
                  }`}
                >
                  <ChevronLeft size={16} />
                  <span>Surat Sebelumnya</span>
                </button>

                <button
                  onClick={goToNextSurah}
                  disabled={surahNumber >= 114}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                    surahNumber < 114
                      ? 'bg-[#1B4931] text-white border-[#1B4931] hover:bg-[#143828] shadow-xs'
                      : 'opacity-40 cursor-not-allowed border-transparent text-[#9C9286]'
                  }`}
                >
                  <span>Surat Selanjutnya</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tafsir Modal */}
      {surah && (
        <TafsirModal
          visible={tafsirModalOpen}
          onClose={() => setTafsirModalOpen(false)}
          surahNumber={surah.nomor}
          surahName={surah.namaLatin}
          totalAyahs={surah.jumlahAyat}
          ayahNumber={selectedTafsirAyah}
          currentAyah={surah.ayat?.find((a) => a.nomorAyat === selectedTafsirAyah)}
          allAyahs={surah.ayat}
          tafsirData={tafsirList}
          loading={tafsirLoading}
          onSelectAyah={(newAyahNum) => setSelectedTafsirAyah(newAyahNum)}
        />
      )}
    </MobileFrame>
  );
}
