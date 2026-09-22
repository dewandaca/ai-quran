'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Copy, Check } from 'lucide-react';
import { fetchAllDoa, DoaItem } from '@/services/doaApi';

interface DoaHarianModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DoaHarianModal({ visible, onClose }: DoaHarianModalProps) {
  const [doaList, setDoaList] = useState<DoaItem[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadDoa();
    }
  }, [visible]);

  const loadDoa = async () => {
    setLoading(true);
    const data = await fetchAllDoa();
    setDoaList(data);
    setLoading(false);
  };

  if (!visible) return null;

  const filtered = doaList.filter(
    (d) =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.idn.toLowerCase().includes(search.toLowerCase()) ||
      d.grup.toLowerCase().includes(search.toLowerCase())
  );

  const cleanDoaSource = (tentang?: string) => {
    if (!tentang) return '';
    let str = tentang.trim();

    // Strip accidental outer parentheses enclosing multiple lines
    if (str.startsWith('(') && str.endsWith(')') && str.includes('\n')) {
      str = str.slice(1, -1).trim();
    }

    // Ensure "Sumber: ..." has proper balanced parentheses: (Sumber: ...)
    str = str.replace(/(?:\()?Sumber:\s*([^\n\)]+)(?:\))?/gi, '(Sumber: $1)');

    // For single line hadith
    if (!str.includes('\n')) {
      if (!str.startsWith('(') && !str.endsWith(')')) {
        return `(${str})`;
      }
      return str;
    }

    // For multi-line, format the opening hadith reference cleanly
    const lines = str.split('\n');
    if (lines[0].trim().startsWith('HR.') && !lines[0].includes('(')) {
      lines[0] = `(${lines[0].trim().replace(/\.$/, '')})`;
    }

    return lines.join('\n');
  };

  const formatDoaText = (d: DoaItem) => {
    const parts = [
      d.nama,
      '',
      d.ar,
    ];

    if (d.tr) {
      parts.push('', d.tr);
    }

    parts.push('', 'Artinya:', `"${d.idn}"`);

    const sourceText = cleanDoaSource(d.tentang);
    if (sourceText) {
      parts.push('', sourceText);
    }

    return parts.join('\n');
  };

  const handleCopy = (d: DoaItem) => {
    const text = formatDoaText(d);
    navigator.clipboard.writeText(text);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (d: DoaItem) => {
    const text = formatDoaText(d);
    if (navigator.share) {
      try {
        await navigator.share({
          title: d.nama,
          text: text,
        });
      } catch {
        handleCopy(d);
      }
    } else {
      handleCopy(d);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF6EE] rounded-[28px] shadow-2xl border border-[#E8DECD] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DECD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B4931]/10 flex items-center justify-center text-[#1B4931]">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B4931]">Doa-Doa Harian</h3>
              <p className="text-xs text-[#6B6258]">Kumpulan doa mustajab sehari-hari</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9286]" />
            <input
              type="text"
              placeholder="Cari doa (cth: makan, tidur, orang tua)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#E8DECD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] outline-hidden focus:border-[#1B4931]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-xs text-[#6B6258]">Memuat doa harian...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#6B6258]">Doa tidak ditemukan.</div>
          ) : (
            filtered.map((doa) => (
              <div
                key={doa.id}
                className="bg-white rounded-2xl p-4 border border-[#E8DECD] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#C5A059]/10 px-2.5 py-0.5 rounded-full">
                    {doa.grup}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(doa)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#1B4931] hover:underline cursor-pointer"
                      title="Salin Doa Lengkap"
                    >
                      {copiedId === doa.id ? (
                        <>
                          <Check size={12} className="text-green-600" />
                          <span className="text-green-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                    <span className="text-[#E8DECD]">•</span>
                    <button
                      onClick={() => handleShare(doa)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#C5A059] hover:underline cursor-pointer"
                      title="Bagikan Doa"
                    >
                      <span>Bagikan</span>
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-[#1B4931]">{doa.nama}</h4>

                {/* Arabic Text */}
                <p className="font-arabic text-xl text-[#181411] text-right py-2 leading-loose">
                  {doa.ar}
                </p>

                {/* Transliteration */}
                {doa.tr && (
                  <p className="text-xs italic text-[#6B6258]">{doa.tr}</p>
                )}

                {/* Translation */}
                <p className="text-xs text-[#2C2621] font-medium leading-relaxed bg-[#FAF6EE] p-2.5 rounded-xl border border-[#E8DECD]/50">
                  {doa.idn}
                </p>

                {doa.tentang && (
                  <p className="text-[10px] text-[#9C9286] font-medium text-right">
                    Sumber: {doa.tentang}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
