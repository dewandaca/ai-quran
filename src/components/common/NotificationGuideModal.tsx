'use client';

import React from 'react';
import { X, SlidersHorizontal, Bell, RotateCcw, AlertTriangle } from 'lucide-react';

interface NotificationGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationGuideModal({
  visible,
  onClose,
}: NotificationGuideModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#FAF6EE] rounded-[28px] shadow-2xl border border-[#E8DECD] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DECD] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
              <AlertTriangle size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1B4931]">
                Izin Notifikasi Diblokir
              </h3>
              <p className="text-[11px] text-[#6B6258]">
                Cara membuka blokir di browser HP / Laptop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF6EE] flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD] cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-[#2C2621]">
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/80 text-[11px] leading-relaxed text-amber-950">
            <p className="font-semibold mb-1">
              Kenapa popup izin tidak muncul lagi?
            </p>
            <p>
              Saat Anda memilih <span className="font-semibold text-amber-900">&quot;Jangan Izinkan&quot;</span>, sistem browser menyimpan pilihan tersebut dan menonaktifkan permintaan otomatis agar tidak mengganggu kenyamanan Anda. Anda dapat mengaktifkannya kembali kapan saja melalui langkah berikut:
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-[#1B4931] uppercase tracking-wider text-[10px]">
              3 Langkah Mudah Mengaktifkan Kembali:
            </h4>

            {/* Step 1 */}
            <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-[#E8DECD]">
              <div className="w-6 h-6 rounded-xl bg-[#1B4931]/10 text-[#1B4931] flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <span className="font-bold block text-[#1B4931] mb-0.5">
                  Ketuk Ikon Setelan / Gembok
                </span>
                <span className="text-[11px] text-[#6B6258] leading-relaxed block">
                  Di bilah alamat (URL bar) browser Anda, ketuk ikon setelan <SlidersHorizontal size={12} className="inline mx-0.5 text-[#1B4931]" /> atau ikon gembok di sebelah kiri alamat website.
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-[#E8DECD]">
              <div className="w-6 h-6 rounded-xl bg-[#1B4931]/10 text-[#1B4931] flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <span className="font-bold block text-[#1B4931] mb-0.5">
                  Pilih Izin &gt; Notifikasi
                </span>
                <span className="text-[11px] text-[#6B6258] leading-relaxed block">
                  Ketuk menu <b>Izin (Permissions)</b> lalu cari menu <b>Notifikasi (Notifications)</b> <Bell size={12} className="inline mx-0.5 text-[#1B4931]" />.
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-[#E8DECD]">
              <div className="w-6 h-6 rounded-xl bg-[#1B4931]/10 text-[#1B4931] flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <span className="font-bold block text-[#1B4931] mb-0.5">
                  Ubah Menjadi &quot;Izinkan&quot; (Allow)
                </span>
                <span className="text-[11px] text-[#6B6258] leading-relaxed block">
                  Ganti status dari <b>Diblokir</b> menjadi <b>Izinkan</b> (atau aktifkan saklar/toggle).
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1B4931] text-white flex items-center justify-center gap-2 font-bold text-xs shadow-md hover:bg-[#143828] active:scale-98 transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Muat Ulang Halaman Setelah Diizinkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
