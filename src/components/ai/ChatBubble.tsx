'use client';

import React from 'react';
import { Sparkles, User, Copy, Check } from 'lucide-react';
import VerseCitationCard from './VerseCitationCard';
import DuaCitationCard from './DuaCitationCard';
import { AICitation, AIDuaCitation } from '@/services/aiService';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  citations?: AICitation[];
  duaCitations?: AIDuaCitation[];
}

function isArabicLine(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  const arabicMatches = trimmed.match(
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g
  );
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  return arabicCount >= 3 && arabicCount >= trimmed.replace(/\s+/g, '').length * 0.4;
}

function renderFormattedInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const segments = text.split(regex);

  segments.forEach((seg, i) => {
    if (!seg) return;
    if (seg.startsWith('**') && seg.endsWith('**')) {
      parts.push(
        <strong key={i} className="font-bold text-[#1B4931]">
          {seg.slice(2, -2)}
        </strong>
      );
    } else if (seg.startsWith('*') && seg.endsWith('*')) {
      parts.push(
        <em key={i} className="italic text-[#6B6258]">
          {seg.slice(1, -1)}
        </em>
      );
    } else if (seg.startsWith('`') && seg.endsWith('`')) {
      parts.push(
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-[#FAF6EE] text-[#1B4931] font-mono text-xs border border-[#E8DECD]">
          {seg.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(seg);
    }
  });

  return <>{parts}</>;
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // 1. Horizontal Rules / Dividers (e.g., '---', '***', '___')
    if (/^[-*_]{3,}$/.test(trimmed)) {
      // If trailing (no more non-divider content lines after this), omit it
      const hasSubsequentContent = lines.slice(i + 1).some(l => l.trim().length > 0 && !/^[-*_]{3,}$/.test(l.trim()));
      if (hasSubsequentContent) {
        elements.push(
          <div key={`hr-${i}`} className="my-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-[#E8DECD]" />
            <span className="text-[#C5A059] text-[10px]">✦</span>
            <div className="h-px flex-1 bg-[#E8DECD]" />
          </div>
        );
      }
      continue;
    }

    // 2. Blockquotes: lines starting with '>'
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      i--; // step back since loop counter increments

      elements.push(
        <div
          key={`quote-${i}`}
          className="my-2.5 pl-3.5 pr-3 py-2 border-l-3 border-[#C5A059] bg-[#FAF6EE] rounded-r-xl space-y-1 shadow-2xs"
        >
          {quoteLines.map((qLine, qIdx) => {
            const qTrimmed = qLine.trim();
            if (!qTrimmed) return <div key={qIdx} className="h-1" />;
            if (isArabicLine(qTrimmed)) {
              return (
                <div
                  key={qIdx}
                  dir="rtl"
                  className="font-arabic text-xl sm:text-2xl text-right text-[#181411] leading-relaxed my-1"
                >
                  {qTrimmed}
                </div>
              );
            }
            return (
              <p key={qIdx} className="text-xs sm:text-sm text-[#4A4036] italic leading-relaxed">
                {renderFormattedInline(qLine)}
              </p>
            );
          })}
        </div>
      );
      continue;
    }

    // 3. Arabic Verse / Text block
    if (isArabicLine(trimmed)) {
      elements.push(
        <div
          key={`arabic-${i}`}
          dir="rtl"
          className="font-arabic text-2xl sm:text-3xl text-right text-[#181411] leading-[2.3] my-3 p-4 bg-[#FAF6EE] rounded-2xl border border-[#E8DECD] shadow-xs select-all transition-all hover:border-[#C5A059]/60"
        >
          {trimmed}
        </div>
      );
      continue;
    }

    // 4. Heading: #, ##, ###, ####
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h5 key={`h5-${i}`} className="text-xs sm:text-sm font-bold text-[#1B4931] mt-2.5 mb-0.5">
          {renderFormattedInline(trimmed.slice(5))}
        </h5>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm sm:text-base font-bold text-[#1B4931] mt-3 mb-1">
          {renderFormattedInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const headingText = trimmed.startsWith('## ') ? trimmed.slice(3) : trimmed.slice(2);
      elements.push(
        <h3 key={`h3-${i}`} className="text-base sm:text-lg font-black text-[#1B4931] mt-3 mb-1">
          {renderFormattedInline(headingText)}
        </h3>
      );
      continue;
    }

    // 5. Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1.5 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0 mt-2" />
          <div className="text-xs sm:text-sm text-[#2C2621] leading-relaxed flex-1">
            {renderFormattedInline(trimmed.slice(2))}
          </div>
        </div>
      );
      continue;
    }

    // 6. Numbered list: 1. 2. 3.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 pl-1">
          <span className="text-xs font-bold text-[#1B4931] shrink-0 mt-0.5 bg-[#1B4931]/10 px-1.5 py-0.5 rounded-md">
            {numMatch[1]}
          </span>
          <div className="text-xs sm:text-sm text-[#2C2621] leading-relaxed flex-1">
            {renderFormattedInline(numMatch[2])}
          </div>
        </div>
      );
      continue;
    }

    // 7. Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-[#2C2621] leading-relaxed my-1">
        {renderFormattedInline(trimmed)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export default function ChatBubble({
  role,
  content,
  isStreaming = false,
  citations = [],
  duaCitations = [],
}: ChatBubbleProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const plain = content
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/^>\s?/gm, '')
      .replace(/^[-*_]{3,}\s*$/gm, '')
      .trim();
    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-[85%] bg-[#1B4931] text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-sm">
          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#1B4931] border border-[#C5A059] flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5 shadow-xs">
        <Sparkles size={16} />
      </div>

      {/* Bubble Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-[#E8DECD] rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#1B4931] tracking-wide flex items-center gap-1.5">
              <span>EQuran AI Assistant</span>
              <span className="text-[10px] text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-full font-medium">
                Shahih
              </span>
            </span>
            {content && !isStreaming && (
              <button
                onClick={handleCopy}
                className="text-[#9C9286] hover:text-[#1B4931] text-[11px] flex items-center gap-1 cursor-pointer transition"
                title="Salin jawaban"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-600" />
                    <span className="text-green-600 font-semibold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Formatted Text Body */}
          <div className="text-xs sm:text-sm text-[#2C2621]">
            <MarkdownRenderer content={content} />
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-[#1B4931] ml-1 animate-pulse align-middle" />
            )}
          </div>

          {/* Verse Citation Cards */}
          {citations && citations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#E8DECD]/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
                Rujukan Ayat & Tafsir:
              </span>
              <div className="space-y-2">
                {citations.map((c, i) => (
                  <VerseCitationCard key={i} citation={c} />
                ))}
              </div>
            </div>
          )}

          {/* Dua Citation Cards */}
          {duaCitations && duaCitations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#E8DECD]/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4931] block mb-2">
                Rujukan Doa Terkait:
              </span>
              <div className="space-y-2">
                {duaCitations.map((d, i) => (
                  <DuaCitationCard key={i} dua={d} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
