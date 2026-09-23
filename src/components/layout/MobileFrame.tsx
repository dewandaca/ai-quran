'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpen,
  Clock,
  Sparkles,
  Bookmark,
  Settings,
  ChevronLeft,
  Disc,
  Menu,
  X,
} from 'lucide-react';
import FloatingVinylPlayer from '@/components/audio/FloatingVinylPlayer';
import FullPlayerModal from '@/components/audio/FullPlayerModal';
import { useAudioStore } from '@/stores/useAudioStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useShalatStore } from '@/stores/useShalatStore';

interface MobileFrameProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  fluid?: boolean;
}

export default function MobileFrame({
  children,
  title,
  showBack = false,
  rightAction,
  fluid = false,
}: MobileFrameProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTrack, isPlaying, setPlayerModalOpen } = useAudioStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load stores from localStorage on mount & register Service Worker
  useEffect(() => {
    useSettingsStore.getState().loadFromStorage();
    useShalatStore.getState().loadFromStorage();
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Spacebar keyboard listener for laptop/desktop play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
        ) {
          return; // Ignore if user is typing
        }
        e.preventDefault();
        useAudioStore.getState().togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    {
      label: 'Beranda',
      href: '/app',
      icon: Home,
      isActive: pathname === '/app',
    },
    {
      label: 'Al-Qur\'an',
      href: '/app/quran',
      icon: BookOpen,
      isActive: pathname.startsWith('/app/quran') || pathname.startsWith('/app/surah'),
    },
    {
      label: 'Jadwal Sholat',
      href: '/app/shalat',
      icon: Clock,
      isActive: pathname.startsWith('/app/shalat'),
    },
    {
      label: 'AI Ustadz',
      href: '/app/ai-chat',
      icon: Sparkles,
      isActive: pathname.startsWith('/app/ai-chat'),
    },
    {
      label: 'Bookmark',
      href: '/app/bookmarks',
      icon: Bookmark,
      isActive: pathname.startsWith('/app/bookmarks'),
    },
    {
      label: 'Pengaturan',
      href: '/app/settings',
      icon: Settings,
      isActive: pathname.startsWith('/app/settings'),
    },
  ];

  return (
    <div
      className={`bg-[#FAF6EE] text-[#2C2621] flex flex-col selection:bg-[#1B4931] selection:text-white ${
        fluid ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* TOP NAVBAR (Applies across all screens, responsive) */}
      <header className="sticky top-0 shrink-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#E8DECD] px-4 sm:px-6 lg:px-12 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Back Button */}
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#1B4931] border border-[#E8DECD] hover:bg-[#F3EBDD] cursor-pointer shadow-xs transition"
                title="Kembali"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <Link href="/app" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#1B4931] flex items-center justify-center shadow-md border border-[#C5A059]/40 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                <Image
                  src="/logo.png"
                  alt="Al-Qur'an Companion Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-[#1B4931] block">
                  Al-Qur&apos;an Companion
                </span>
                <span className="text-[10px] text-[#6B6258] font-medium hidden sm:block">
                  Tilawah, Tafsir &amp; AI Ustadz
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#F3EBDD] p-1.5 rounded-2xl border border-[#E8DECD]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    item.isActive
                      ? 'bg-[#1B4931] text-white shadow-xs'
                      : 'text-[#6B6258] hover:text-[#1B4931] hover:bg-white/60'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Custom page right action */}
            {rightAction && <div className="hidden sm:block">{rightAction}</div>}

            {/* Playing Status Pill */}
            {currentTrack && (
              <button
                onClick={() => setPlayerModalOpen(true)}
                className="flex items-center gap-2 bg-[#1B4931] text-white px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-[#143828] cursor-pointer border border-[#C5A059]"
              >
                <Disc
                  size={15}
                  className={`text-[#C5A059] ${isPlaying ? 'animate-spin-slow' : ''}`}
                />
                <span className="truncate max-w-[100px] sm:max-w-[150px]">
                  {currentTrack.isFullSurah
                    ? `${currentTrack.surahName} (Full)`
                    : `${currentTrack.surahName}:${currentTrack.ayahNumber}`}
                </span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-white border border-[#E8DECD] flex items-center justify-center text-[#1B4931] cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-[#E8DECD] mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    item.isActive
                      ? 'bg-[#1B4931] text-white'
                      : 'text-[#6B6258] hover:bg-[#F3EBDD]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* FULL-WIDTH RESPONSIVE MAIN CONTENT WRAPPER */}
      {fluid ? (
        <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col pb-16 md:pb-0">
          {children}
        </main>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 pb-28 md:pb-16">
          {/* Page Title & Subtitle (if title is provided) */}
          {title && (
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8DECD]">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1B4931] tracking-tight">
                {title}
              </h1>
              {rightAction && <div className="sm:hidden">{rightAction}</div>}
            </div>
          )}

          {children}
        </main>
      )}

      {/* FLOATING VINYL PLAYER & FULL MODAL */}
      <FloatingVinylPlayer />
      <FullPlayerModal />

      {/* MOBILE BOTTOM NAVIGATION BAR (for easy one-hand mobile navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8DECD] py-1.5 px-2 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
                item.isActive
                  ? 'text-[#1B4931] font-bold'
                  : 'text-[#9C9286] hover:text-[#2C2621]'
              }`}
            >
              <div
                className={`w-9 h-7.5 flex items-center justify-center rounded-xl transition ${
                  item.isActive
                    ? 'bg-[#1B4931]/10 text-[#1B4931]'
                    : 'text-inherit'
                }`}
              >
                <Icon size={19} />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
