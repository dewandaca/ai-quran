'use client';

import React from 'react';
import { X, Compass } from 'lucide-react';

interface KiblatModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function KiblatModal({ visible, onClose }: KiblatModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#FAF6EE] rounded-[32px] shadow-2xl border border-[#E8DECD] p-6 text-center flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#1B4931]" />
            <h3 className="text-base font-bold text-[#1B4931]">Arah Kiblat</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD]"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-[#6B6258] mb-6">
          Arah Ka&apos;bah Baitullah dari wilayah Indonesia berada di kisaran arah Barat Laut (~295° U-B)
        </p>

        {/* Compass Visual */}
        <div className="relative w-44 h-44 rounded-full border-4 border-[#1B4931] bg-white flex items-center justify-center shadow-lg mb-6">
          {/* Compass markers */}
          <span className="absolute top-2 text-xs font-bold text-[#1B4931]">U</span>
          <span className="absolute right-2 text-xs font-bold text-[#6B6258]">T</span>
          <span className="absolute bottom-2 text-xs font-bold text-[#6B6258]">S</span>
          <span className="absolute left-2 text-xs font-bold text-[#6B6258]">B</span>

          {/* Needle pointing ~295 degrees (West-Northwest) */}
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ transform: 'rotate(-65deg)' }}
          >
            <div className="w-2.5 h-28 bg-linear-to-t from-zinc-300 via-amber-400 to-[#1B4931] rounded-full shadow-md relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-b-10 border-b-[#1B4931]" />
            </div>
          </div>

          {/* Center Kaaba Badge */}
          <div className="absolute w-10 h-10 rounded-full bg-[#1B4931] border-2 border-[#C5A059] flex items-center justify-center shadow-md">
            <span className="text-[9px] font-bold text-white">295°</span>
          </div>
        </div>

        <div className="bg-[#F3EBDD] rounded-2xl p-3 w-full mb-5 text-xs text-[#2C2621]">
          <p className="font-semibold text-[#1B4931] mb-0.5">Sudut Kiblat Rata-rata Indonesia:</p>
          <p className="text-[#6B6258]">293° s/d 296° dari arah Utara ke Barat</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#1B4931] text-white font-bold text-xs hover:bg-[#143828] cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
