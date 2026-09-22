'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Sparkles,
  HeartHandshake,
  Bookmark,
  Compass,
  Fingerprint,
  Settings,
} from 'lucide-react';
import TasbihModal from './TasbihModal';
import DoaHarianModal from './DoaHarianModal';
import KiblatModal from './KiblatModal';

export default function QuickMenuGrid() {
  const [tasbihOpen, setTasbihOpen] = useState(false);
  const [doaOpen, setDoaOpen] = useState(false);
  const [kiblatOpen, setKiblatOpen] = useState(false);

  const menuItems = [
    {
      id: 'quran',
      label: 'Al-Qur\'an',
      icon: BookOpen,
      color: '#1B4931',
      bg: 'rgba(27, 73, 49, 0.1)',
      href: '/app/quran',
    },
    {
      id: 'shalat',
      label: 'Jadwal Sholat',
      icon: Clock,
      color: '#B8860B',
      bg: 'rgba(212, 175, 55, 0.14)',
      href: '/app/shalat',
    },
    {
      id: 'ai-chat',
      label: 'AI Ustadz',
      icon: Sparkles,
      color: '#2F855A',
      bg: 'rgba(56, 161, 105, 0.12)',
      href: '/app/ai-chat',
    },
    {
      id: 'doa',
      label: 'Doa Harian',
      icon: HeartHandshake,
      color: '#2B6CB0',
      bg: 'rgba(43, 108, 176, 0.12)',
      onClick: () => setDoaOpen(true),
    },
    {
      id: 'bookmarks',
      label: 'Bookmark',
      icon: Bookmark,
      color: '#C53030',
      bg: 'rgba(197, 48, 48, 0.1)',
      href: '/app/bookmarks',
    },
    {
      id: 'kiblat',
      label: 'Arah Kiblat',
      icon: Compass,
      color: '#6B46C1',
      bg: 'rgba(128, 90, 213, 0.1)',
      onClick: () => setKiblatOpen(true),
    },
    {
      id: 'tasbih',
      label: 'Tasbih',
      icon: Fingerprint,
      color: '#D97706',
      bg: 'rgba(217, 119, 6, 0.12)',
      onClick: () => setTasbihOpen(true),
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: Settings,
      color: '#4A5568',
      bg: 'rgba(74, 85, 104, 0.1)',
      href: '/app/settings',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-[#2C2621]">Fitur Utama</h3>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex flex-col items-center group cursor-pointer">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border border-black/5 shadow-xs transition-transform group-hover:scale-105 active:scale-95"
                style={{ backgroundColor: item.bg, color: item.color }}
              >
                <Icon size={24} />
              </div>
              <span className="text-xs font-semibold text-[#2C2621] mt-1.5 text-center truncate max-w-[100px]">
                {item.label}
              </span>
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.id} href={item.href}>
                {content}
              </Link>
            );
          }

          return (
            <button key={item.id} onClick={item.onClick} className="text-center outline-hidden">
              {content}
            </button>
          );
        })}
      </div>

      {/* Modals */}
      <TasbihModal visible={tasbihOpen} onClose={() => setTasbihOpen(false)} />
      <DoaHarianModal visible={doaOpen} onClose={() => setDoaOpen(false)} />
      <KiblatModal visible={kiblatOpen} onClose={() => setKiblatOpen(false)} />
    </div>
  );
}
