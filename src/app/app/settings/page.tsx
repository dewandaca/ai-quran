'use client';

import React from 'react';
import { Type, Volume2, Info, Check } from 'lucide-react';
import MobileFrame from '@/components/layout/MobileFrame';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore, QARI_LIST } from '@/stores/useAudioStore';

export default function SettingsPage() {
  const {
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize,
    showTransliteration,
    setShowTransliteration,
    showTranslation,
    setShowTranslation,
  } = useSettingsStore();

  const { selectedQari, setSelectedQari } = useAudioStore();

  return (
    <MobileFrame title="Pengaturan">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Typography (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-1.5 px-1">
            <Type size={16} className="text-[#1B4931]" />
            <h3 className="text-xs font-bold text-[#6B6258] uppercase tracking-wider">
              Tampilan Teks Al-Qur&apos;an
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E8DECD] shadow-xs space-y-6">
            {/* Arabic Font Size Slider */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-[#2C2621]">
                  Ukuran Kaligrafi Arab
                </span>
                <span className="font-bold text-[#1B4931] bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#E8DECD]">
                  {arabicFontSize}px
                </span>
              </div>

              {/* Live Preview */}
              <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E8DECD]/60 text-center mb-3 overflow-x-hidden">
                <p
                  className="font-arabic text-[#181411]"
                  style={{ fontSize: `${arabicFontSize}px`, lineHeight: 1.8 }}
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              </div>

              <input
                type="range"
                min={20}
                max={42}
                value={arabicFontSize}
                onChange={(e) => setArabicFontSize(Number(e.target.value))}
                className="w-full h-2 bg-[#E8DECD] rounded-lg appearance-none cursor-pointer accent-[#1B4931]"
              />
            </div>

            {/* Translation Font Size Slider */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-[#2C2621]">
                  Ukuran Teks Terjemahan
                </span>
                <span className="font-bold text-[#1B4931] bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#E8DECD]">
                  {translationFontSize}px
                </span>
              </div>

              <p
                className="text-[#6B6258] mb-3 italic"
                style={{ fontSize: `${translationFontSize}px` }}
              >
                &ldquo;Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.&rdquo;
              </p>

              <input
                type="range"
                min={12}
                max={24}
                value={translationFontSize}
                onChange={(e) => setTranslationFontSize(Number(e.target.value))}
                className="w-full h-2 bg-[#E8DECD] rounded-lg appearance-none cursor-pointer accent-[#1B4931]"
              />
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-[#E8DECD]/60 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#2C2621] block">
                    Tampilkan Transliterasi (Latin)
                  </span>
                  <span className="text-[11px] text-[#6B6258]">
                    Bantuan bacaan ejaan latin untuk pemula
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTransliteration(!showTransliteration)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    showTransliteration ? 'bg-[#1B4931]' : 'bg-[#E8DECD]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                      showTransliteration ? 'left-5.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#2C2621] block">
                    Tampilkan Terjemahan Indonesia
                  </span>
                  <span className="text-[11px] text-[#6B6258]">
                    Terjemahan resmi Departemen Agama Kemenag RI
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    showTranslation ? 'bg-[#1B4931]' : 'bg-[#E8DECD]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                      showTranslation ? 'left-5.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Qari & App Info (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 2: Audio Qari */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 px-1">
              <Volume2 size={16} className="text-[#1B4931]" />
              <h3 className="text-xs font-bold text-[#6B6258] uppercase tracking-wider">
                Pilihan Qari Murottal
              </h3>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DECD] shadow-xs overflow-hidden divide-y divide-[#E8DECD]/60">
              {QARI_LIST.map((qari) => {
                const isSelected = selectedQari === qari.id;
                return (
                  <button
                    key={qari.id}
                    onClick={() => setSelectedQari(qari.id)}
                    className={`w-full flex items-center justify-between p-3.5 text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF6EE] font-bold text-[#1B4931]'
                        : 'hover:bg-[#FAF6EE]/50 text-[#2C2621]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          isSelected
                            ? 'bg-[#1B4931] text-white'
                            : 'bg-[#FAF6EE] text-[#6B6258]'
                        }`}
                      >
                        {qari.id}
                      </div>
                      <span>{qari.label}</span>
                    </div>

                    {isSelected && <Check size={16} className="text-[#1B4931]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: App Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 px-1">
              <Info size={16} className="text-[#1B4931]" />
              <h3 className="text-xs font-bold text-[#6B6258] uppercase tracking-wider">
                Tentang Aplikasi
              </h3>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#E8DECD] shadow-xs text-xs space-y-2.5 text-[#6B6258]">
              <div className="flex justify-between">
                <span>Nama Aplikasi</span>
                <span className="font-bold text-[#1B4931]">
                  Al-Qur&apos;an Companion
                </span>
              </div>
              <div className="flex justify-between">
                <span>Versi Web</span>
                <span className="font-bold text-[#1B4931]">
                  v1.0.0 (Vercel Ready)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sumber Data</span>
                <span className="font-medium text-[#2C2621]">
                  EQuran.id &amp; Kemenag RI
                </span>
              </div>
              <div className="flex justify-between">
                <span>Model AI</span>
                <span className="font-medium text-[#2C2621]">
                  RAG pgvector + Gemini/Groq
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
