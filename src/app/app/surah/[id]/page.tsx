'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Search,
  Play,
  Pause,
  ArrowLeft,
  SlidersHorizontal,
  MapPin,
  Languages,
  Type,
  List,
  X,
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
  const [surahPickerOpen, setSurahPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

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

  // Track reading progress automatically as user scrolls
  useEffect(() => {
    if (!surah || loading) return;

    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          const topEntry = visibleEntries[0];
          const match = topEntry.target.id.match(/^ayah-(\d+)$/);
          if (match) {
            const ayahNum = parseInt(match[1], 10);
            if (ayahNum > 0) {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                setLastRead(surah.nomor, ayahNum, surah.namaLatin);
              }, 400);
            }
          }
        }
      },
      {
        root: null,
        rootMargin: '-130px 0px -40% 0px',
        threshold: 0.1,
      }
    );

    const elements = document.querySelectorAll('[id^="ayah-"]');
    elements.forEach((el) => observer.observe(el));

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [surah, loading, setLastRead]);

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
        const { lastReadSurah, lastReadAyah } = useSettingsStore.getState();
        // Preserve existing progress if user already read in this surah
        if (lastReadSurah === surahData.nomor && (lastReadAyah || 0) > 1) {
          // Keep current progress
        } else if (lastReadSurah !== surahData.nomor) {
          setLastRead(surahData.nomor, 1, surahData.namaLatin);
        }
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

  const filteredPickerSurahs = useMemo(() => {
    if (!pickerSearch.trim()) return allSurahs;
    const q = pickerSearch.toLowerCase();
    return allSurahs.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nomor.toString() === q
    );
  }, [allSurahs, pickerSearch]);

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
      const ayahNum = parseInt(val, 10);
      if (surah && ayahNum > 0) {
        setLastRead(surah.nomor, ayahNum, surah.namaLatin);
      }
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
            <div className="space-y-3">
              {/* FIXED / STICKY TOP CONTROLS & HEADER (Tampilan fixed sesuai gambar pengguna) */}
              <div className="sticky top-[57px] sm:top-[64px] z-30 bg-[#FAF6EE] -mt-2 pt-1.5 pb-2.5 space-y-2 border-b border-[#E8DECD]/70 shadow-xs">
                {/* 1. Kembali Link */}
                <div>
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4931] hover:text-[#143828] transition py-0.5"
                  >
                    <ArrowLeft size={16} />
                    <span>Kembali</span>
                  </Link>
                </div>

                {/* 2. Surah Title Banner Card (Sesuai Gambar: Nomor dengan double ring, Nama • Arti, Lokasi • Ayat, Chevron) */}
                <div
                  onClick={() => setSurahPickerOpen(true)}
                  className="relative rounded-2xl p-3 sm:p-3.5 bg-linear-to-br from-[#1B4931] via-[#163D29] to-[#0E271A] text-white shadow-xs overflow-hidden flex items-center justify-between gap-3 border border-[#C5A059]/40 hover:border-[#C5A059] transition cursor-pointer"
                  title="Klik untuk memilih surat lain"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Double Golden Ring Surah Number */}
                    <div className="w-10 h-10 rounded-full border-2 border-[#C5A059] p-0.5 flex items-center justify-center shrink-0">
                      <div className="w-full h-full rounded-full border border-[#C5A059]/60 flex items-center justify-center font-bold text-xs text-[#F5E6CC] bg-[#143828]">
                        {surah.nomor}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                        <span>{surah.namaLatin}</span>
                        <span className="text-[#F5E6CC]/80 text-xs font-normal">
                          • {surah.arti}
                        </span>
                      </h1>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/75 font-medium capitalize mt-0.5">
                        <MapPin size={11} className="text-[#C5A059] shrink-0" />
                        <span>{surah.tempatTurun} • {surah.jumlahAyat} Ayat</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Chevron Down indicator */}
                  <div className="shrink-0 text-[#C5A059] pr-1">
                    <ChevronDown size={18} />
                  </div>
                </div>

                {/* 3. Dropdowns Row: Ayat & Qari (Sesuai Gambar) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Ayat Selector */}
                  <div className="flex items-center gap-1.5 bg-white border border-[#E8DECD] rounded-xl px-2.5 py-1.5 shadow-xs">
                    <span className="font-bold text-[#6B6258] shrink-0 text-xs">Ayat:</span>
                    <div className="relative flex-1 min-w-0 flex items-center">
                      <select
                        value={selectedJumpAyah}
                        onChange={(e) => handleJumpToAyah(e.target.value)}
                        className="w-full appearance-none bg-transparent text-xs text-[#2C2621] font-semibold outline-hidden cursor-pointer truncate pr-4"
                      >
                        <option value="all">Semua</option>
                        {surah.ayat.map((a) => (
                          <option key={a.nomorAyat} value={a.nomorAyat}>
                            Ayat {a.nomorAyat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-0 text-[#9C9286] pointer-events-none" />
                    </div>
                  </div>

                  {/* Qari Selector */}
                  <div className="flex items-center gap-1.5 bg-white border border-[#E8DECD] rounded-xl px-2.5 py-1.5 shadow-xs">
                    <span className="font-bold text-[#6B6258] shrink-0 text-xs">Qari:</span>
                    <div className="relative flex-1 min-w-0 flex items-center">
                      <select
                        value={selectedQari}
                        onChange={(e) => setSelectedQari(e.target.value)}
                        className="w-full appearance-none bg-transparent text-xs text-[#2C2621] font-semibold outline-hidden cursor-pointer truncate pr-4"
                      >
                        {QARI_LIST.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-0 text-[#9C9286] pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 4. Controls Row: Latin [switch], Indo [switch], [Play], [Surat] (Sesuai Gambar) */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  {/* Left: Latin & Indo Toggles */}
                  <div className="flex items-center gap-3">
                    {/* Latin Toggle */}
                    <div
                      onClick={() => setShowTransliteration(!showTransliteration)}
                      className="flex items-center gap-1.5 cursor-pointer select-none"
                      title="Toggle Teks Latin / Transliterasi"
                    >
                      <span className="text-xs font-semibold text-[#2C2621] flex items-center gap-1">
                        <Languages size={13} className="text-[#1B4931]" />
                        <span>Latin</span>
                      </span>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          showTransliteration ? 'bg-[#1B4931]' : 'bg-[#E8DECD]'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.75 transition-all ${
                            showTransliteration ? 'left-4.5' : 'left-1'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Indo Toggle */}
                    <div
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="flex items-center gap-1.5 cursor-pointer select-none"
                      title="Toggle Terjemahan Indonesia"
                    >
                      <span className="text-xs font-semibold text-[#2C2621] flex items-center gap-1">
                        <Type size={13} className="text-[#1B4931]" />
                        <span>Indo</span>
                      </span>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          showTranslation ? 'bg-[#1B4931]' : 'bg-[#E8DECD]'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.75 transition-all ${
                            showTranslation ? 'left-4.5' : 'left-1'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Play & Surat Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Play Button */}
                    <button
                      onClick={handlePlayFullSurah}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#1B4931] text-[#1B4931] font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      {isCurrentSurahPlaying ? (
                        <>
                          <Pause size={12} className="text-[#1B4931]" />
                          <span>Jeda</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} className="text-[#1B4931] fill-[#1B4931]" />
                          <span>Play</span>
                        </>
                      )}
                    </button>

                    {/* Surat Button */}
                    <button
                      onClick={() => setSurahPickerOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#E8DECD] text-[#2C2621] font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <List size={13} className="text-[#1B4931]" />
                      <span>Surat</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bismillah Banner (except At-Taubah #9) */}
              {surah.nomor !== 9 && (
                <div className="bg-white rounded-xl py-2.5 px-4 border border-[#E8DECD] text-center shadow-xs">
                  <p className="font-arabic text-xl sm:text-2xl text-[#1B4931] leading-relaxed">
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

      {/* Surah Picker Modal (triggered by "Surat" button or clicking Surah Card) */}
      {surahPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FAF6EE] w-full max-w-md rounded-3xl border border-[#E8DECD] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-[#E8DECD] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List size={18} className="text-[#1B4931]" />
                <h3 className="font-bold text-[#1B4931] text-sm">Pilih Surat</h3>
              </div>
              <button
                onClick={() => setSurahPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF6EE] hover:bg-[#E8DECD] flex items-center justify-center text-[#6B6258] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 bg-white border-b border-[#E8DECD]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9286]" />
                <input
                  type="text"
                  placeholder="Cari nama surat atau arti..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full bg-[#FAF6EE] border border-[#E8DECD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] outline-hidden focus:border-[#1B4931]"
                  autoFocus
                />
              </div>
            </div>

            {/* Surah List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredPickerSurahs.map((item) => {
                const isActive = item.nomor === surahNumber;
                return (
                  <button
                    key={item.nomor}
                    onClick={() => {
                      setSurahPickerOpen(false);
                      router.push(`/app/surah/${item.nomor}`);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#1B4931] text-white border-[#1B4931] shadow-xs'
                        : 'bg-white hover:bg-[#FAF6EE] border-[#E8DECD]/60'
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
                        <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-[#2C2621]'}`}>
                          {item.namaLatin}
                        </h4>
                        <p className={`text-[10px] truncate ${isActive ? 'text-[#F5E6CC]' : 'text-[#6B6258]'}`}>
                          {item.arti} • {item.jumlahAyat} Ayat
                        </p>
                      </div>
                    </div>

                    <span className={`font-arabic text-base shrink-0 ml-2 ${isActive ? 'text-[#C5A059]' : 'text-[#1B4931]'}`}>
                      {item.nama}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
