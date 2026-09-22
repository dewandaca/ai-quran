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
    // Normalize single newlines before list items so they become independent blocks
    const normalized = cleanTeks.replace(
      /\n(?=(?:[a-zA-Z]|\d+|\([a-zA-Z0-9]+\))[.)]\s*|[•\-\*]\s+)/g,
      '\n\n'
    );

    const rawParagraphs = normalized
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    return rawParagraphs.map((para, idx) => {
      // Check if this paragraph contains Quran citations
      const citationsInPara = extractQuranCitations(para);

      // 1. Check if List Item (numbered e.g. "1.", lettered e.g. "a." or "a.Keluar", parenthesized e.g. "(a)", or bullets • -)
      const listMatch = para.match(/^(?:([a-zA-Z]|\d+|\([a-zA-Z0-9]+\))[.)]\s*|[•\-\*]\s+)([\s\S]*)/);
      if (listMatch) {
        const marker = listMatch[1] ? listMatch[1].replace(/[()]/g, '') : '•';
        const content = listMatch[2] ? listMatch[2].trim() : '';
        return {
          id: `block-${idx}`,
          type: 'list_item' as const,
          marker,
          content,
          rawText: para,
          citations: citationsInPara,
        };
      }

      // 2. Check if this paragraph is a Hadith or Quote
      const isHadithOrQuote =
        /^(?:Hadis|Hadits|Nabi saw bersabda|Rasulullah saw bersabda|Dari\s+[A-Z]|Abu Hurairah juga|Kalau kita perhatikan bahwa sahabat)/i.test(
          para
        ) || para.includes('(Riwayat ');

      if (isHadithOrQuote) {
        return {
          id: `block-${idx}`,
          type: 'hadith_quote' as const,
          rawText: para,
          citations: citationsInPara,
        };
      }

      // 3. Check if Section Heading (genuine title, NOT list item, NOT narrative sentence, NOT quote)
      const isExplicitHeading = /^#{1,4}\s+/.test(para);
      const hasPredicate = /\b(?:ialah|adalah|merupakan|bahwa|bahwasanya|seperti diriwayatkan|sebagaimana)\b/i.test(para);
      const endsWithPunct = /[.;:,!?]$/.test(para);
      const isQuoteLine = /^["'“]/.test(para);
      const isKnownHeadingKeyword = /^(?:Hikmah|Makna kata|Sebab Turunnya|Asbabun Nuzul|Kesimpulan|Pendapat Ulama)\b/i.test(para);

      const isHeading =
        isExplicitHeading ||
        (!hasPredicate && !endsWithPunct && !isQuoteLine && para.length < 70 && (
          isKnownHeadingKeyword ||
          (para.length < 50 && !para.includes(':'))
        ));

      if (isHeading) {
        return {
          id: `block-${idx}`,
          type: 'heading' as const,
          rawText: para.replace(/^#{1,4}\s+/, ''),
          citations: citationsInPara,
        };
      }

      // 4. Standard Paragraph
      return {
        id: `block-${idx}`,
        type: 'paragraph' as const,
        rawText: para,
        citations: citationsInPara,
      };
    });
  }, [cleanTeks]);

  return (
    <div className={`space-y-3.5 ${fontSizeClass} text-[#2C2621] leading-relaxed`}>
      {blocks.map((block) => {
        // A. Heading Block (Only for real titles/section headers)
        if (block.type === 'heading') {
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

        // B. List Item Block (Numbered 1., Lettered a., b., c., bullets)
        if (block.type === 'list_item') {
          return (
            <div key={block.id} className="space-y-2.5 my-2.5">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1B4931]/10 text-[#1B4931] font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#1B4931]/20 select-none">
                  {block.marker}
                </span>
                <div className="flex-1 whitespace-pre-line text-[#2C2621] leading-relaxed">
                  {block.content}
                </div>
              </div>

              {/* Render cited verses in this list item if any */}
              {renderCitations(block.citations, resolvedVerses, loadingCitations)}
            </div>
          );
        }

        // C. Hadith / Atsar Callout Box
        if (block.type === 'hadith_quote') {
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
