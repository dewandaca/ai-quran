'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, BookMarked, ArrowRight, Loader2 } from 'lucide-react';
import {
  extractQuranCitations,
  fetchCitedVerse,
  sanitizeTafsirText,
  CitedVerseData,
  QuranCitationRef,
} from '@/services/verseLookup';

interface TafsirContentRendererProps {
  teks: string;
  fontSizeClass?: string;
}

export default function TafsirContentRenderer({
  teks,
  fontSizeClass = 'text-sm',
}: TafsirContentRendererProps) {
  const [resolvedVerses, setResolvedVerses] = useState<Record<string, CitedVerseData[]>>({});
  const [loadingCitations, setLoadingCitations] = useState<Record<string, boolean>>({});

  // 0. Clean legacy OCR / typesetting artifacts (like broken bar ¦ or corrupted bullets)
  const cleanTeks = useMemo(() => sanitizeTafsirText(teks), [teks]);

  // 1. Extract all citations from the cleaned tafsir text
  const allCitations = useMemo(() => extractQuranCitations(cleanTeks), [cleanTeks]);

  // 2. Fetch all cited Quran verses asynchronously
  useEffect(() => {
    let isMounted = true;

    async function loadCitations() {
      for (const cit of allCitations) {
        const key = `${cit.surahNumber}:${cit.ayahStart}${cit.ayahEnd ? `-${cit.ayahEnd}` : ''}`;
        
        // Skip if already fetched or in progress
        if (resolvedVerses[key] || loadingCitations[key]) continue;

        setLoadingCitations((prev) => ({ ...prev, [key]: true }));

        try {
          const verses = await fetchCitedVerse(cit.surahNumber, cit.ayahStart, cit.ayahEnd);
          if (isMounted) {
            setResolvedVerses((prev) => ({ ...prev, [key]: verses }));
          }
        } catch (err) {
          console.error(`Failed to load cited verse ${key}:`, err);
        } finally {
          if (isMounted) {
            setLoadingCitations((prev) => ({ ...prev, [key]: false }));
          }
        }
      }
    }

    if (allCitations.length > 0) {
      loadCitations();
    }

    return () => {
      isMounted = false;
    };
  }, [allCitations]);

  // 3. Process the tafsir text into structured blocks
  const blocks = useMemo(() => {
    // Normalise double newlines
    const rawParagraphs = cleanTeks
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    return rawParagraphs.map((para, idx) => {
      // Check if this paragraph contains Quran citations
      const citationsInPara = extractQuranCitations(para);

      // Check if this paragraph is a Hadith or Quote
      const isHadithOrQuote =
        /^(?:Hadis|Hadits|Nabi saw bersabda|Rasulullah saw bersabda|Dari\s+[A-Z]|Abu Hurairah juga|Kalau kita perhatikan bahwa sahabat)/i.test(
          para
        ) || para.includes('(Riwayat ');

      // Check if this is a Section Heading (short line without final period or specific keywords)
      const isHeading =
        (para.length < 60 && !para.endsWith('.') && !para.includes(':') && !/^\d+\./.test(para)) ||
        /^(?:Hikmah|Makna kata|Sebab Turunnya|Asbabun Nuzul|Kesimpulan|Pendapat Ulama)/i.test(para);

      // Check if numbered list (e.g. "1.Basmalah..." or "1. ...")
      const numberedMatch = para.match(/^(\d+)\.\s*([\s\S]*)/);

      return {
        id: `block-${idx}`,
        rawText: para,
        isHeading,
        isHadithOrQuote,
        numbered: numberedMatch ? { num: numberedMatch[1], content: numberedMatch[2] } : null,
        citations: citationsInPara,
      };
    });
  }, [teks]);

  return (
    <div className={`space-y-3.5 ${fontSizeClass} text-[#2C2621] leading-relaxed`}>
      {blocks.map((block) => {
        // A. Heading Block
        if (block.isHeading) {
          return (
            <div
              key={block.id}
              className="flex items-center gap-2.5 pt-4 pb-1 mt-2 border-t border-[#E8DECD]/70 first:border-t-0 first:pt-0"
            >
              <span className="text-[#C5A059] text-xs">✦</span>
              <h4 className="text-sm sm:text-base font-bold text-[#1B4931] tracking-tight">
                {block.rawText}
              </h4>
            </div>
          );
        }

        // B. Numbered Point Block
        if (block.numbered) {
          return (
            <div key={block.id} className="space-y-2.5 my-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1B4931]/10 text-[#1B4931] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#1B4931]/20">
                  {block.numbered.num}
                </span>
                <div className="flex-1 whitespace-pre-line text-[#2C2621]">
                  {block.numbered.content}
                </div>
              </div>

              {/* Render cited verses in this numbered block if any */}
              {renderCitations(block.citations, resolvedVerses, loadingCitations)}
            </div>
          );
        }

        // C. Hadith / Atsar Callout Box
        if (block.isHadithOrQuote) {
          return (
            <div key={block.id} className="space-y-2.5 my-3">
              <div className="pl-4 pr-3.5 py-3 border-l-3 border-[#C5A059] bg-[#FAF6EE] rounded-r-2xl space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                  <BookMarked size={13} />
                  <span>Kutipan Hadits &amp; Atsar Sahabat</span>
                </div>
                <div className="italic text-[#38302A] leading-relaxed whitespace-pre-line">
                  {block.rawText}
                </div>
              </div>

              {/* Render cited verses in this quote if any */}
              {renderCitations(block.citations, resolvedVerses, loadingCitations)}
            </div>
          );
        }

        // D. Standard Paragraph with Quran Citations
        return (
          <div key={block.id} className="space-y-2.5">
            <p className="whitespace-pre-line text-[#2C2621] leading-relaxed">
              {block.rawText}
            </p>

            {/* Render cited verses if this paragraph quotes other verses */}
            {renderCitations(block.citations, resolvedVerses, loadingCitations)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Helper to render the interactive Dalil Quran Card for citations
 */
function renderCitations(
  citations: QuranCitationRef[],
  resolvedVerses: Record<string, CitedVerseData[]>,
  loadingCitations: Record<string, boolean>
) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="space-y-2.5 my-2">
      {citations.map((cit, i) => {
        const key = `${cit.surahNumber}:${cit.ayahStart}${cit.ayahEnd ? `-${cit.ayahEnd}` : ''}`;
        const verses = resolvedVerses[key];
        const isLoading = loadingCitations[key];

        if (isLoading) {
          return (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white/80 border border-[#E8DECD] flex items-center gap-2.5 text-xs text-[#6B6258] animate-pulse"
            >
              <Loader2 size={15} className="animate-spin text-[#C5A059]" />
              <span>Memuat teks Arab rujukan QS. {cit.surahNameHint || cit.surahNumber}:{cit.ayahStart}...</span>
            </div>
          );
        }

        if (!verses || verses.length === 0) {
          return null;
        }

        return (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-[#C5A059]/40 hover:border-[#1B4931]/60 shadow-xs transition group text-left space-y-3"
          >
            {/* Header Badge & Action Link */}
            <div className="flex items-center justify-between border-b border-[#E8DECD]/70 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1B4931]/10 flex items-center justify-center text-[#1B4931]">
                  <BookOpen size={13} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">
                    Rujukan Dalil:
                  </span>
                  <span className="text-xs font-bold text-[#1B4931]">
                    QS. {verses[0].surahName} : Ayat {cit.ayahStart}
                    {cit.ayahEnd ? ` - ${cit.ayahEnd}` : ''}
                  </span>
                </div>
              </div>

              <Link
                href={`/app/surah/${cit.surahNumber}?ayah=${cit.ayahStart}#ayah-${cit.ayahStart}`}
                className="text-[11px] font-semibold text-[#C5A059] group-hover:text-[#1B4931] flex items-center gap-1 transition"
              >
                <span>Buka Ayat</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Verses Arabic and Translation */}
            <div className="space-y-3">
              {verses.map((v, vIdx) => (
                <div key={vIdx} className="space-y-2">
                  {/* Arabic Calligraphy */}
                  <div
                    dir="rtl"
                    className="font-arabic text-xl sm:text-2xl text-right text-[#181411] leading-[2.2] py-1 select-all"
                  >
                    {v.arabicText}
                  </div>

                  {/* Transliteration if available */}
                  {v.transliteration && (
                    <p className="text-[11px] sm:text-xs text-[#8A7E72] italic">
                      {v.transliteration}
                    </p>
                  )}

                  {/* Translation */}
                  <p className="text-xs sm:text-sm text-[#4A4036] italic leading-relaxed bg-[#FAF6EE]/80 p-2.5 rounded-xl border border-[#E8DECD]/60">
                    &ldquo;{v.translation}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
