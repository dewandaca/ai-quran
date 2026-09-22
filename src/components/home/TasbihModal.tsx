'use client';

import React, { useState } from 'react';
import { X, RotateCcw, Sparkles } from 'lucide-react';

interface TasbihModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TasbihModal({ visible, onClose }: TasbihModalProps) {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);

  if (!visible) return null;

  const currentDhikr =
    count < 33
      ? 'Subhanallah (سُبْحَانَ اللَّهِ)'
      : count < 66
      ? 'Alhamdulillah (الْحَمْدُ لِلَّهِ)'
      : 'Allahu Akbar (اللَّهُ أَكْبَرُ)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#FAF6EE] rounded-[32px] shadow-2xl border border-[#E8DECD] p-6 text-center flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
            <h3 className="text-base font-bold text-[#1B4931]">Tasbih Digital</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Dhikr Subtitle */}
        <p className="text-xs font-semibold text-[#6B6258] mb-6 min-h-[20px]">
          {currentDhikr}
        </p>

        {/* Big Tap Button */}
        <button
          onClick={() => setCount((c) => c + 1)}
          className="w-40 h-40 rounded-full bg-[#1B4931] border-4 border-[#C5A059] flex flex-col items-center justify-center text-white shadow-xl hover:bg-[#143828] active:scale-95 transition-transform cursor-pointer mb-6"
        >
          <span className="text-5xl font-bold font-mono tracking-tight">
            {count}
          </span>
          <span className="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider mt-1">
            Ketuk Dzikir
          </span>
        </button>

        {/* Target Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[33, 99, 100].map((t) => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                target === t
                  ? 'bg-[#C5A059] text-white shadow-xs'
                  : 'bg-white text-[#6B6258] border border-[#E8DECD]'
              }`}
            >
              Target: {t}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="w-full flex gap-3">
          <button
            onClick={() => setCount(0)}
            className="flex-1 py-2.5 rounded-xl bg-white border border-[#E8DECD] text-[#2C2621] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F3EBDD] cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#1B4931] text-white font-bold text-xs hover:bg-[#143828] cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
