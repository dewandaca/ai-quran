'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Send,
  Sparkles,
  ArrowRight,
  RotateCw,
  Plus,
  MessageSquare,
  Trash2,
  X,
  History,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import MobileFrame from '@/components/layout/MobileFrame';
import ChatBubble from '@/components/ai/ChatBubble';
import { chatWithAI, AICitation } from '@/services/aiService';
import { useChatStore, ChatMessageItem } from '@/stores/useChatStore';

const QUESTION_POOL = [
  'Apakah boleh menikah dalam keadaan miskin?',
  'Bagaimana cara agar hati merasa tenang menurut Al-Qur\'an?',
  'Ayat tentang kesabaran dan bersyukur',
  'Doa memohon kemudahan urusan dan rezeki halal',
  'Tafsir dan keutamaan membaca Ayat Kursi',
  'Bagaimana adab membaca Al-Qur\'an yang benar menurut sunnah?',
  'Amalan apa yang paling dicintai oleh Allah SWT?',
  'Hukum mengqadha sholat fardhu yang terlewat karena tertidur',
  'Ayat Al-Qur\'an yang menenangkan hati saat cemas dan bersedih',
  'Makna ikhlas dalam beramal menurut surah Al-Ikhlas',
  'Doa untuk kedua orang tua dan keutamaannya',
  'Cara agar tetap istiqomah dalam menjalankan ibadah sholat',
  'Keutamaan sholat tahajud di sepertiga malam terakhir',
  'Penjelasan tentang rezeki tak disangka dalam QS. At-Talaq',
  'Bagaimana cara memaafkan orang yang menyakiti kita menurut Al-Qur\'an?',
  'Pahala menuntut ilmu dan mengajarkannya dalam Islam',
];

const THINKING_STEPS = [
  'Memahami pertanyaan Anda...',
  'Mengecek database ayat & tafsir Al-Qur\'an...',
  'Mencocokkan rujukan dalil yang shahih...',
  'Menyusun jawaban yang ringkas & penuh hikmah...',
];

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(ts).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

export default function AIChatPage() {
  const {
    rooms,
    activeRoomId,
    sidebarOpen,
    createRoom,
    deleteRoom,
    setActiveRoom,
    toggleSidebar,
    setSidebarOpen,
    addMessage,
    updateMessage,
    getActiveRoom,
    getConversationHistory,
    loadFromStorage,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRoom = getActiveRoom();
  const messages = activeRoom?.messages || [];

  // Load chat history from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshSuggestions = useCallback(() => {
    const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    refreshSuggestions();
  }, [refreshSuggestions]);

  // Multi-stage thinking animation
  useEffect(() => {
    if (!loading) {
      setThinkingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setThinkingStep((prev) =>
        prev < THINKING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 1100);
    return () => clearInterval(interval);
  }, [loading]);

  // Focus input & scroll to bottom when switching rooms
  useEffect(() => {
    inputRef.current?.focus();
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [activeRoomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');

    // Auto-create room if none is active
    let roomId = activeRoomId;
    if (!roomId) {
      roomId = createRoom();
    }

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    const userMsg: ChatMessageItem = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessageItem = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      citations: [],
      duaCitations: [],
      timestamp: Date.now(),
    };

    addMessage(roomId, userMsg);
    addMessage(roomId, assistantMsg);
    setLoading(true);
    scrollToBottom();

    try {
      const history = getConversationHistory(roomId).filter(
        (m) => m.content !== '' // exclude the empty streaming placeholder
      );

      let accumulated = '';
      const result = await chatWithAI(
        text,
        (chunk) => {
          accumulated = chunk;
          updateMessage(roomId!, assistantMsgId, {
            content: accumulated,
            isStreaming: true,
          });
          scrollToBottom();
        },
        history
      );

      updateMessage(roomId, assistantMsgId, {
        content: result.text,
        isStreaming: false,
        citations: result.citations,
        duaCitations: result.duaCitations,
      });
    } catch (err) {
      console.error('Chat error:', err);
      updateMessage(roomId, assistantMsgId, {
        content:
          'Terjadi kendala saat memproses jawaban. Silakan coba lagi.',
        isStreaming: false,
      });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleNewChat = () => {
    createRoom();
    refreshSuggestions();
    inputRef.current?.focus();
  };

  const handleDeleteRoom = (roomId: string) => {
    if (deleteConfirm === roomId) {
      deleteRoom(roomId);
      setDeleteConfirm(null);
      if (rooms.length <= 1) {
        refreshSuggestions();
      }
    } else {
      setDeleteConfirm(roomId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // ──────────── SIDEBAR COMPONENT (GEMINI STYLE) ────────────
  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF6EE] select-none">
      {/* Top Header inside Sidebar */}
      <div className="p-3 pb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[#1B4931] tracking-wide px-1">
          EQuran AI
        </span>

        {/* Desktop close button on the RIGHT */}
        <button
          onClick={() => setDesktopSidebarOpen(false)}
          className="hidden md:flex p-2 rounded-xl text-[#6B6258] hover:text-[#1B4931] hover:bg-[#EAE1D2] transition cursor-pointer"
          title="Tutup riwayat"
        >
          <PanelLeftClose size={18} />
        </button>

        {/* Mobile close button on the RIGHT */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-[#6B6258] hover:text-[#1B4931] hover:bg-[#EAE1D2] transition cursor-pointer"
          title="Tutup"
        >
          <X size={18} />
        </button>
      </div>

      {/* New Chat Button - Gemini Style */}
      <div className="px-3 py-2">
        <button
          onClick={() => {
            handleNewChat();
            setSidebarOpen(false);
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-[#EAE1D2] hover:bg-[#E0D5C3] text-[#1B4931] rounded-full text-xs font-bold transition cursor-pointer shadow-2xs border border-[#E8DECD] active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Chat Baru</span>
        </button>
      </div>

      {/* Section Title */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#8C8276] uppercase tracking-wider">
          Percakapan Terakhir
        </span>
        {rooms.length > 0 && (
          <span className="text-[10px] font-semibold text-[#8C8276] bg-[#EAE1D2] px-1.5 py-0.5 rounded-full">
            {rooms.length}
          </span>
        )}
      </div>

      {/* Scrollable Room List (Height is constrained so ONLY this list scrolls internally) */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 min-h-0">
        {rooms.length === 0 ? (
          <div className="text-center py-10 px-3">
            <MessageSquare size={28} className="mx-auto text-[#D4C9B8] mb-2" />
            <p className="text-xs text-[#9C9286] font-medium">
              Belum ada riwayat chat
            </p>
            <p className="text-[10px] text-[#B5ADA3] mt-1">
              Mulai percakapan baru untuk bertanya seputar Al-Qur&apos;an
            </p>
          </div>
        ) : (
          rooms.map((room) => {
            const isActive = room.id === activeRoomId;
            return (
              <div
                key={room.id}
                className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#1B4931] text-white shadow-xs font-semibold'
                    : 'text-[#2C2621] hover:bg-[#EAE1D2] font-medium'
                }`}
                onClick={() => {
                  setActiveRoom(room.id);
                  setSidebarOpen(false);
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare
                    size={14}
                    className={`shrink-0 ${
                      isActive ? 'text-[#C5A059]' : 'text-[#8C8276]'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate">{room.title}</p>
                    <p
                      className={`text-[10px] truncate mt-0.5 ${
                        isActive ? 'text-white/70' : 'text-[#9C9286]'
                      }`}
                    >
                      {formatTimeAgo(room.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRoom(room.id);
                  }}
                  className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition cursor-pointer ${
                    deleteConfirm === room.id
                      ? 'bg-rose-500 text-white'
                      : isActive
                      ? 'opacity-0 group-hover:opacity-100 text-white/80 hover:text-white hover:bg-white/20'
                      : 'opacity-0 group-hover:opacity-100 text-[#9C9286] hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title={
                    deleteConfirm === room.id
                      ? 'Klik lagi untuk konfirmasi hapus'
                      : 'Hapus chat'
                  }
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      {rooms.length > 0 && (
        <div className="p-3 border-t border-[#E8DECD] shrink-0">
          <p className="text-[10px] text-center text-[#9C9286]">
            {rooms.length} percakapan tersimpan
          </p>
        </div>
      )}
    </div>
  );

  // ──────────── EMPTY STATE (no active room or empty room) ────────────
  const EmptyState = (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-2">
      <div className="w-16 h-16 rounded-2xl bg-[#1B4931] border-2 border-[#C5A059] flex items-center justify-center shadow-lg mb-4 overflow-hidden">
        <Image
          src="/logo.png"
          alt="EQuran AI Assistant"
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="text-xl font-bold text-[#1B4931] mb-1">
        EQuran AI Assistant
      </h3>
      <p className="text-xs text-[#6B6258] max-w-sm leading-relaxed mb-6">
        Tanyakan apa saja seputar Al-Qur&apos;an, tafsir, hukum, dan doa
        sehari-hari yang berlandaskan ayat shahih.
      </p>

      {/* Quick Prompt Suggestions with Refresh */}
      <div className="w-full max-w-md space-y-2.5 text-left">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[11px] font-bold text-[#9C9286] uppercase tracking-wider">
            Pertanyaan yang sering diajukan:
          </span>
          <button
            type="button"
            onClick={refreshSuggestions}
            className="text-xs font-semibold text-[#1B4931] hover:text-[#C5A059] flex items-center gap-1 cursor-pointer transition active:scale-95"
            title="Acak pertanyaan lain"
          >
            <RotateCw size={12} />
            <span>Acak Pertanyaan</span>
          </button>
        </div>

        {suggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="w-full p-3.5 bg-white hover:bg-[#FAF6EE] border border-[#E8DECD] rounded-2xl text-xs text-[#2C2621] font-medium flex items-center justify-between gap-3 transition shadow-xs group cursor-pointer text-left hover:border-[#C5A059]/60"
          >
            <span className="leading-relaxed font-medium text-[#2C2621] group-hover:text-[#1B4931] flex-1">
              {prompt}
            </span>
            <ArrowRight
              size={15}
              className="text-[#9C9286] group-hover:text-[#1B4931] shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </button>
        ))}
      </div>
    </div>
  );

  // ──────────── THINKING INDICATOR ────────────
  const ThinkingIndicator = (
    <div className="flex items-start gap-2.5 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="w-8 h-8 rounded-full bg-[#1B4931] border border-[#C5A059] flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5 shadow-xs animate-pulse">
        <Sparkles size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white border border-[#E8DECD] rounded-2xl rounded-tl-xs p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold text-[#1B4931]">
              EQuran AI Assistant
            </span>
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
          </div>

          <div className="space-y-2 py-1">
            {THINKING_STEPS.map((stepText, stepIdx) => {
              const isDone = stepIdx < thinkingStep;
              const isCurrent = stepIdx === thinkingStep;
              return (
                <div
                  key={stepIdx}
                  className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'text-[#1B4931] font-bold'
                      : isDone
                      ? 'text-[#6B6258] line-through opacity-70'
                      : 'text-[#9C9286] opacity-40'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-[#1B4931] text-[#C5A059] font-bold animate-spin'
                        : isDone
                        ? 'bg-green-600 text-white'
                        : 'bg-[#E8DECD] text-[#9C9286]'
                    }`}
                  >
                    {isDone ? '✓' : isCurrent ? '⟳' : stepIdx + 1}
                  </div>
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ──────────── MAIN RENDER ────────────
  return (
    <MobileFrame fluid>
      <div className="flex w-full h-full overflow-hidden relative">
        {/* ══════ DESKTOP SIDEBAR (GEMINI STYLE) ══════ */}
        <aside
          className={`hidden md:flex flex-col h-full shrink-0 border-r border-[#E8DECD] bg-[#FAF6EE] transition-all duration-300 ease-in-out overflow-hidden ${
            desktopSidebarOpen ? 'w-[260px] lg:w-[280px]' : 'w-0 border-r-0'
          }`}
        >
          <div className="w-[260px] lg:w-[280px] h-full flex flex-col">
            {SidebarContent}
          </div>
        </aside>

        {/* ══════ MOBILE SIDEBAR OVERLAY DRAWER ══════ */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Slide-over Drawer */}
            <div className="md:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-[#FAF6EE] shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
              {SidebarContent}
            </div>
          </>
        )}

        {/* ══════ CHAT MAIN AREA ══════ */}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-[#FAF6EE] overflow-hidden">
          {/* Top Subheader Bar */}
          <div className="h-12 sm:h-13 border-b border-[#E8DECD] px-4 flex items-center justify-between shrink-0 bg-[#FAF6EE]/90 backdrop-blur-xs">
            <div className="flex items-center gap-2 min-w-0">
              {/* Desktop toggle button (only visible when sidebar is closed, to reopen it) */}
              {!desktopSidebarOpen && (
                <button
                  onClick={() => setDesktopSidebarOpen(true)}
                  className="hidden md:flex p-1.5 sm:p-2 rounded-xl text-[#6B6258] hover:text-[#1B4931] hover:bg-[#EAE1D2] transition cursor-pointer"
                  title="Buka riwayat"
                >
                  <PanelLeft size={18} />
                </button>
              )}

              {/* Mobile toggle button */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-1.5 rounded-xl text-[#6B6258] hover:text-[#1B4931] hover:bg-[#EAE1D2] transition cursor-pointer"
                title="Buka riwayat"
              >
                <History size={18} />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-sm text-[#1B4931] shrink-0">
                  AI Ustadz
                </span>
                {activeRoom && (
                  <span className="hidden sm:inline text-xs text-[#8C8276] truncate max-w-[200px] lg:max-w-[320px]">
                    • {activeRoom.title}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Shortcut to new chat */}
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1B4931] bg-[#EAE1D2] hover:bg-[#E0D5C3] border border-[#E8DECD] transition cursor-pointer shadow-2xs active:scale-95 shrink-0"
              title="Chat Baru"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Chat Baru</span>
            </button>
          </div>

          {/* Messages or Empty State */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 flex flex-col"
          >
            <div className="max-w-4xl xl:max-w-5xl mx-auto w-full flex-1 flex flex-col">
              {messages.length === 0 ? (
                EmptyState
              ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((msg) => {
                    // Thinking indicator for empty streaming assistant message
                    if (
                      msg.role === 'assistant' &&
                      msg.isStreaming &&
                      !msg.content
                    ) {
                      return (
                        <React.Fragment key={msg.id}>
                          {ThinkingIndicator}
                        </React.Fragment>
                      );
                    }

                      return (
                        <ChatBubble
                          key={msg.id}
                          role={msg.role}
                          content={msg.content}
                          isStreaming={msg.isStreaming}
                          citations={msg.citations as AICitation[]}
                          duaCitations={msg.duaCitations}
                        />
                      );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Input Area */}
          <div className="shrink-0 px-3 sm:px-6 pb-3 pt-2 bg-[#FAF6EE] border-t border-[#E8DECD]/50">
            <div className="max-w-4xl xl:max-w-5xl mx-auto w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 bg-white border border-[#E8DECD] rounded-2xl p-1.5 shadow-md focus-within:border-[#1B4931] focus-within:ring-1 focus-within:ring-[#1B4931]/20 transition-all"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Tanyakan sesuatu pada EQuran AI (cth: abbasa ayat 3)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#2C2621] outline-hidden placeholder:text-[#9C9286]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    input.trim() && !loading
                      ? 'bg-[#1B4931] text-white hover:bg-[#143828] shadow-sm'
                      : 'bg-[#FAF6EE] text-[#9C9286] cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                </button>
              </form>

              {/* AI Disclaimer Note */}
              <div className="text-center py-2 px-3">
                <p className="text-[10px] sm:text-[11px] text-[#9C9286] font-medium">
                  ⚠️{' '}
                  <span className="font-bold text-[#6B6258]">Catatan:</span> AI
                  dapat membuat kesalahan. Mohon selalu periksa kembali rujukan
                  Al-Qur&apos;an &amp; Tafsir shahih.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
