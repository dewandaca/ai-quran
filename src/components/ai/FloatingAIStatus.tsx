'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useChatStore, THINKING_STEPS } from '@/stores/useChatStore';

export default function FloatingAIStatus() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    isGenerating,
    thinkingStep,
    generatingQuestion,
    lastCompletedRoomId,
    setActiveRoom,
    clearLastCompletedRoom,
  } = useChatStore();

  // Auto-dismiss completed notification after 10 seconds
  useEffect(() => {
    if (lastCompletedRoomId && !isGenerating) {
      const timer = setTimeout(() => {
        clearLastCompletedRoom();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [lastCompletedRoomId, isGenerating, clearLastCompletedRoom]);

  // If already on the AI chat page, the chat page itself handles displaying the active stream
  const isChatPage = pathname.startsWith('/app/ai-chat');
  if (isChatPage) return null;

  // If nothing is generating and no finished notification
  if (!isGenerating && !lastCompletedRoomId) return null;

  const handleOpenChat = () => {
    if (lastCompletedRoomId) {
      setActiveRoom(lastCompletedRoomId);
      clearLastCompletedRoom();
    }
    router.push('/app/ai-chat');
  };

  return (
    <aside
      aria-label="Status AI Assistant"
      className="fixed bottom-20 md:bottom-7 left-4 sm:left-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none max-w-[calc(100vw-2rem)] sm:max-w-md"
    >
      {isGenerating ? (
        // ─── GENERATING IN PROGRESS STATE ───
        <div
          onClick={handleOpenChat}
          className="group flex items-center gap-3.5 bg-[#1B4931]/95 hover:bg-[#143828] text-white p-3 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border border-[#C5A059]/50 backdrop-blur-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          title="Klik untuk membuka AI Ustadz"
        >
          {/* Animated AI Sparkle Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#235d3f] to-[#123121] border border-[#C5A059] flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-[#C5A059] animate-spin-slow" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-80" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C5A059]" />
            </span>
          </div>

          {/* Status Text & Step */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                AI Ustadz Sedang Menjawab
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-[#C5A059] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-[#C5A059] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-[#C5A059] animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>
            </div>
            <p className="text-[11px] text-white/80 font-medium truncate mt-0.5 max-w-[190px] sm:max-w-[240px]">
              {THINKING_STEPS[thinkingStep] || 'Menyusun jawaban...'}
            </p>
          </div>

          {/* Action indicator */}
          <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#C5A059] bg-white/10 group-hover:bg-white/15 px-2.5 py-1.5 rounded-xl transition">
            <span>Buka</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      ) : (
        // ─── COMPLETED NOTIFICATION STATE ───
        <div
          onClick={handleOpenChat}
          className="group flex items-center gap-3.5 bg-gradient-to-r from-[#1B4931] via-[#1b4e34] to-[#143828] text-white p-3 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border-2 border-[#C5A059] backdrop-blur-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          title="Klik untuk melihat jawaban AI"
        >
          {/* Success Check Avatar */}
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
          </div>

          {/* Completed Text */}
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white block">
              Jawaban AI Telah Selesai!
            </span>
            <span className="text-[11px] text-white/80 font-medium truncate block mt-0.5 max-w-[180px] sm:max-w-[220px]">
              Ketuk untuk membaca jawaban lengkap
            </span>
          </div>

          {/* Action Button & Dismiss */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-[#1B4931] bg-[#C5A059] px-2.5 py-1.5 rounded-xl shadow-xs transition">
              Lihat
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearLastCompletedRoom();
              }}
              className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Tutup pemberitahuan"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
