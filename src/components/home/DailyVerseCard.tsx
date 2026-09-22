'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Share2, RefreshCw } from 'lucide-react';
import { supabase } from '@/services/supabase';

// 150+ Curated Inspirational Ayah Targets across the 114 Surahs
// These cover Doa para Nabi, Sabar, Syukur, Rahmat, Harapan, Ketenangan Hati, Kebaikan, & Tawakal
const INSPIRATIONAL_TARGETS = [
  { s: 1, a: 5, name: 'Al-Fatihah' },
  { s: 2, a: 45, name: 'Al-Baqarah' },
  { s: 2, a: 152, name: 'Al-Baqarah' },
  { s: 2, a: 153, name: 'Al-Baqarah' },
  { s: 2, a: 155, name: 'Al-Baqarah' },
  { s: 2, a: 186, name: 'Al-Baqarah' },
  { s: 2, a: 216, name: 'Al-Baqarah' },
  { s: 2, a: 255, name: 'Al-Baqarah' },
  { s: 2, a: 286, name: 'Al-Baqarah' },
  { s: 3, a: 8, name: "Ali 'Imran" },
  { s: 3, a: 103, name: "Ali 'Imran" },
  { s: 3, a: 134, name: "Ali 'Imran" },
  { s: 3, a: 139, name: "Ali 'Imran" },
  { s: 3, a: 159, name: "Ali 'Imran" },
  { s: 3, a: 173, name: "Ali 'Imran" },
  { s: 3, a: 200, name: "Ali 'Imran" },
  { s: 4, a: 28, name: "An-Nisa'" },
  { s: 4, a: 86, name: "An-Nisa'" },
  { s: 4, a: 135, name: "An-Nisa'" },
  { s: 5, a: 2, name: "Al-Ma'idah" },
  { s: 5, a: 32, name: "Al-Ma'idah" },
  { s: 6, a: 17, name: "Al-An'am" },
  { s: 6, a: 54, name: "Al-An'am" },
  { s: 6, a: 162, name: "Al-An'am" },
  { s: 7, a: 56, name: "Al-A'raf" },
  { s: 7, a: 156, name: "Al-A'raf" },
  { s: 7, a: 180, name: "Al-A'raf" },
  { s: 7, a: 199, name: "Al-A'raf" },
  { s: 7, a: 205, name: "Al-A'raf" },
  { s: 8, a: 2, name: 'Al-Anfal' },
  { s: 8, a: 46, name: 'Al-Anfal' },
  { s: 9, a: 40, name: 'At-Taubah' },
  { s: 9, a: 51, name: 'At-Taubah' },
  { s: 9, a: 129, name: 'At-Taubah' },
  { s: 10, a: 12, name: 'Yunus' },
  { s: 10, a: 57, name: 'Yunus' },
  { s: 10, a: 62, name: 'Yunus' },
  { s: 10, a: 107, name: 'Yunus' },
  { s: 11, a: 6, name: 'Hud' },
  { s: 11, a: 115, name: 'Hud' },
  { s: 12, a: 64, name: 'Yusuf' },
  { s: 12, a: 86, name: 'Yusuf' },
  { s: 12, a: 87, name: 'Yusuf' },
  { s: 12, a: 90, name: 'Yusuf' },
  { s: 13, a: 11, name: "Ar-Ra'd" },
  { s: 13, a: 22, name: "Ar-Ra'd" },
  { s: 13, a: 28, name: "Ar-Ra'd" },
  { s: 14, a: 7, name: 'Ibrahim' },
  { s: 14, a: 40, name: 'Ibrahim' },
  { s: 15, a: 85, name: 'Al-Hijr' },
  { s: 15, a: 98, name: 'Al-Hijr' },
  { s: 16, a: 90, name: 'An-Nahl' },
  { s: 16, a: 97, name: 'An-Nahl' },
  { s: 16, a: 125, name: 'An-Nahl' },
  { s: 16, a: 128, name: 'An-Nahl' },
  { s: 17, a: 23, name: "Al-Isra'" },
  { s: 17, a: 24, name: "Al-Isra'" },
  { s: 17, a: 37, name: "Al-Isra'" },
  { s: 17, a: 53, name: "Al-Isra'" },
  { s: 17, a: 79, name: "Al-Isra'" },
  { s: 17, a: 80, name: "Al-Isra'" },
  { s: 17, a: 82, name: "Al-Isra'" },
  { s: 18, a: 10, name: 'Al-Kahf' },
  { s: 18, a: 46, name: 'Al-Kahf' },
  { s: 18, a: 110, name: 'Al-Kahf' },
  { s: 19, a: 4, name: 'Maryam' },
  { s: 19, a: 96, name: 'Maryam' },
  { s: 20, a: 25, name: 'Taha' },
  { s: 20, a: 46, name: 'Taha' },
  { s: 20, a: 114, name: 'Taha' },
  { s: 20, a: 130, name: 'Taha' },
  { s: 21, a: 83, name: "Al-Anbiya'" },
  { s: 21, a: 87, name: "Al-Anbiya'" },
  { s: 21, a: 89, name: "Al-Anbiya'" },
  { s: 21, a: 107, name: "Al-Anbiya'" },
  { s: 22, a: 77, name: 'Al-Hajj' },
  { s: 23, a: 1, name: "Al-Mu'minun" },
  { s: 23, a: 97, name: "Al-Mu'minun" },
  { s: 23, a: 118, name: "Al-Mu'minun" },
  { s: 24, a: 22, name: 'An-Nur' },
  { s: 24, a: 35, name: 'An-Nur' },
  { s: 25, a: 63, name: 'Al-Furqan' },
  { s: 25, a: 74, name: 'Al-Furqan' },
  { s: 26, a: 80, name: "Asy-Syu'ara'" },
  { s: 26, a: 83, name: "Asy-Syu'ara'" },
  { s: 27, a: 19, name: 'An-Naml' },
  { s: 28, a: 24, name: 'Al-Qasas' },
  { s: 28, a: 77, name: 'Al-Qasas' },
  { s: 29, a: 69, name: "Al-'Ankabut" },
  { s: 30, a: 21, name: 'Ar-Rum' },
  { s: 31, a: 17, name: 'Luqman' },
  { s: 31, a: 18, name: 'Luqman' },
  { s: 32, a: 16, name: 'As-Sajdah' },
  { s: 33, a: 3, name: 'Al-Ahzab' },
  { s: 33, a: 21, name: 'Al-Ahzab' },
  { s: 33, a: 41, name: 'Al-Ahzab' },
  { s: 33, a: 70, name: 'Al-Ahzab' },
  { s: 35, a: 2, name: 'Fatir' },
  { s: 35, a: 34, name: 'Fatir' },
  { s: 39, a: 10, name: 'Az-Zumar' },
  { s: 39, a: 53, name: 'Az-Zumar' },
  { s: 40, a: 44, name: 'Ghafir' },
  { s: 40, a: 60, name: 'Ghafir' },
  { s: 41, a: 34, name: 'Fussilat' },
  { s: 41, a: 46, name: 'Fussilat' },
  { s: 42, a: 30, name: 'Asy-Syura' },
  { s: 42, a: 43, name: 'Asy-Syura' },
  { s: 46, a: 15, name: 'Al-Ahqaf' },
  { s: 48, a: 4, name: 'Al-Fath' },
  { s: 49, a: 10, name: 'Al-Hujurat' },
  { s: 49, a: 12, name: 'Al-Hujurat' },
  { s: 49, a: 13, name: 'Al-Hujurat' },
  { s: 50, a: 16, name: 'Qaf' },
  { s: 51, a: 56, name: 'Az-Zariyat' },
  { s: 55, a: 13, name: 'Ar-Rahman' },
  { s: 57, a: 4, name: 'Al-Hadid' },
  { s: 57, a: 23, name: 'Al-Hadid' },
  { s: 59, a: 18, name: 'Al-Hasyr' },
  { s: 59, a: 22, name: 'Al-Hasyr' },
  { s: 64, a: 13, name: 'At-Taghabun' },
  { s: 65, a: 2, name: 'At-Talaq' },
  { s: 65, a: 3, name: 'At-Talaq' },
  { s: 65, a: 7, name: 'At-Talaq' },
  { s: 67, a: 2, name: 'Al-Mulk' },
  { s: 67, a: 15, name: 'Al-Mulk' },
  { s: 68, a: 4, name: 'Al-Qalam' },
  { s: 73, a: 8, name: 'Al-Muzzammil' },
  { s: 73, a: 20, name: 'Al-Muzzammil' },
  { s: 76, a: 3, name: 'Al-Insan' },
  { s: 90, a: 17, name: 'Al-Balad' },
  { s: 91, a: 9, name: 'Asy-Syams' },
  { s: 93, a: 3, name: 'Ad-Duha' },
  { s: 93, a: 5, name: 'Ad-Duha' },
  { s: 93, a: 11, name: 'Ad-Duha' },
  { s: 94, a: 1, name: 'Asy-Syarh' },
  { s: 94, a: 5, name: 'Asy-Syarh' },
  { s: 94, a: 6, name: 'Asy-Syarh' },
  { s: 94, a: 7, name: 'Asy-Syarh' },
  { s: 94, a: 8, name: 'Asy-Syarh' },
  { s: 95, a: 4, name: 'At-Tin' },
  { s: 96, a: 1, name: "Al-'Alaq" },
  { s: 97, a: 3, name: 'Al-Qadr' },
  { s: 99, a: 7, name: 'Az-Zalzalah' },
  { s: 103, a: 3, name: "Al-'Asr" },
  { s: 106, a: 3, name: 'Quraisy' },
  { s: 108, a: 1, name: 'Al-Kausar' },
  { s: 110, a: 3, name: 'An-Nasr' },
  { s: 112, a: 1, name: 'Al-Ikhlas' },
  { s: 112, a: 2, name: 'Al-Ikhlas' },
  { s: 113, a: 1, name: 'Al-Falaq' },
  { s: 114, a: 1, name: 'An-Nas' },
];

export interface VerseData {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabic: string;
  transliteration?: string;
  translation: string;
}

const DEFAULT_VERSE: VerseData = {
  surahNumber: 94,
  ayahNumber: 6,
  surahName: 'Asy-Syarh',
  arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
  transliteration: 'Inna ma‘al-‘usri yusrā(n).',
  translation: 'Sesungguhnya beserta kesulitan ada kemudahan.',
};

export default function DailyVerseCard() {
  const [verse, setVerse] = useState<VerseData>(DEFAULT_VERSE);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch verse logic: first Supabase, then fallback to equran.id API
  const fetchVerseData = async (surahNumber: number, ayahNumber: number, fallbackSurahName?: string): Promise<VerseData | null> => {
    // 1. Try Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('verses')
          .select('surah_number, ayah_number, surah_name, arabic_text, transliteration, translation')
          .eq('surah_number', surahNumber)
          .eq('ayah_number', ayahNumber)
          .maybeSingle();

        if (!error && data && data.arabic_text) {
          return {
            surahNumber: data.surah_number,
            ayahNumber: data.ayah_number,
            surahName: data.surah_name || fallbackSurahName || `Surah ke-${surahNumber}`,
            arabic: data.arabic_text,
            transliteration: data.transliteration || '',
            translation: data.translation,
          };
        }
      } catch (err) {
        console.warn('Supabase verse lookup failed, trying equran.id fallback:', err);
      }
    }

    // 2. Fallback to equran.id API
    try {
      const res = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
      if (res.ok) {
        const json = await res.json();
        if (json.code === 200 && json.data) {
          const ayahObj = json.data.ayat?.find((a: { nomorAyat: number }) => a.nomorAyat === ayahNumber);
          if (ayahObj) {
            return {
              surahNumber,
              ayahNumber,
              surahName: json.data.namaLatin || fallbackSurahName || `Surah ke-${surahNumber}`,
              arabic: ayahObj.teksArab,
              transliteration: ayahObj.teksLatin || '',
              translation: ayahObj.teksIndonesia,
            };
          }
        }
      }
    } catch (err) {
      console.error('equran.id API fallback error:', err);
    }

    return null;
  };

  // On mount: load today's verse with daily localStorage caching
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = 'quran_daily_verse_v4';

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayStr && parsed.verse) {
          setVerse(parsed.verse);
          return;
        }
      }
    } catch {
      // ignore localStorage errors
    }

    // Determine target based on day of year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
    const target = INSPIRATIONAL_TARGETS[dayOfYear % INSPIRATIONAL_TARGETS.length];

    setIsLoading(true);
    fetchVerseData(target.s, target.a, target.name).then((data) => {
      setIsLoading(false);
      if (data) {
        setVerse(data);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ date: todayStr, verse: data }));
        } catch {}
      }
    });
  }, []);

  // Shuffle / Ganti Ayat handler
  const handleShuffle = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    // Pick a random target distinct from current
    let randomIndex = Math.floor(Math.random() * INSPIRATIONAL_TARGETS.length);
    let target = INSPIRATIONAL_TARGETS[randomIndex];
    if (target.s === verse.surahNumber && target.a === verse.ayahNumber) {
      randomIndex = (randomIndex + 1) % INSPIRATIONAL_TARGETS.length;
      target = INSPIRATIONAL_TARGETS[randomIndex];
    }

    const data = await fetchVerseData(target.s, target.a, target.name);
    if (data) {
      setVerse(data);
    }
    setIsRefreshing(false);
  };

  const handleShare = () => {
    const latin = verse.transliteration ? `\n\n"${verse.transliteration}"` : '';
    const text = `${verse.arabic}${latin}\n\n"${verse.translation}"\n(QS. ${verse.surahName}: ${verse.ayahNumber})`;
    if (navigator.share) {
      navigator.share({ title: 'Ayat Inspirasi Hari Ini', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 border border-[#E8DECD] shadow-xs mb-6 relative overflow-hidden transition-all duration-300">
      {/* Card Header: Title & Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4931]">
          <Sparkles size={14} className="text-[#C5A059]" />
          <span>Ayat Inspirasi Hari Ini</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ganti Ayat (Shuffle) button */}
          <button
            onClick={handleShuffle}
            disabled={isRefreshing}
            className="text-[#6B6258] hover:text-[#1B4931] hover:bg-[#FAF6EE] px-2 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors border border-transparent hover:border-[#E8DECD]"
            title="Ganti dengan ayat inspirasi lainnya"
          >
            <RefreshCw size={12} className={`text-[#C5A059] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Ganti Ayat</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="text-[#6B6258] hover:text-[#1B4931] hover:bg-[#FAF6EE] px-2 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Bagikan Ayat"
          >
            {copied ? (
              <span className="text-green-600 font-medium">Tersalin!</span>
            ) : (
              <>
                <Share2 size={13} />
                <span className="hidden sm:inline">Bagikan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`transition-opacity duration-200 ${isRefreshing ? 'opacity-40' : 'opacity-100'}`}>
        {/* Arabic text */}
        <p className="font-arabic text-xl sm:text-2xl text-[#181411] text-right py-2 leading-loose">
          {verse.arabic}
        </p>

        {/* Transliteration (Latin) directly shown by default */}
        {verse.transliteration && (
          <p className="text-xs text-[#6B6258] italic leading-relaxed my-1.5">
            {verse.transliteration}
          </p>
        )}

        {/* Translation */}
        <p className="text-xs sm:text-sm text-[#2C2621] leading-relaxed my-2">
          &ldquo;{verse.translation}&rdquo;
        </p>
      </div>

      {/* Bottom reference & actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E8DECD]/50 mt-3">
        <span className="text-xs font-bold text-[#C5A059]">
          QS. {verse.surahName} : {verse.ayahNumber}
        </span>

        {/* Open Verse Link */}
        <Link
          href={`/app/surah/${verse.surahNumber}?ayah=${verse.ayahNumber}#ayah-${verse.ayahNumber}`}
          className="text-xs font-bold text-[#1B4931] hover:underline flex items-center gap-1 group"
        >
          <span>Buka Ayat</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
