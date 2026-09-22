import { create } from 'zustand';

export interface BookmarkItem {
  surahNumber: number;
  ayahNumber: number;
  surahName?: string;
  ayahText?: string;
  timestamp: number;
}

interface SettingsState {
  arabicFontSize: number;
  latinFontSize: number;
  translationFontSize: number;
  showTransliteration: boolean;
  showTranslation: boolean;
  lastReadSurah: number | null;
  lastReadAyah: number | null;
  lastReadSurahName: string | null;
  bookmarks: BookmarkItem[];

  // Actions
  setArabicFontSize: (size: number) => void;
  setLatinFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  setShowTransliteration: (show: boolean) => void;
  setShowTranslation: (show: boolean) => void;
  setLastRead: (surah: number, ayah: number, surahName?: string) => void;
  addBookmark: (surahNumber: number, ayahNumber: number, surahName?: string, ayahText?: string) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'quran_companion_settings';
const BOOKMARKS_KEY = 'quran_companion_bookmarks';
const LAST_READ_KEY = 'quran_companion_last_read';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  arabicFontSize: 28,
  latinFontSize: 14,
  translationFontSize: 15,
  showTransliteration: true,
  showTranslation: true,
  lastReadSurah: null,
  lastReadAyah: null,
  lastReadSurahName: null,
  bookmarks: [],

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        set(parsed);
      }
      const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      if (savedBookmarks) {
        set({ bookmarks: JSON.parse(savedBookmarks) });
      }
      const savedLastRead = localStorage.getItem(LAST_READ_KEY);
      if (savedLastRead) {
        const lr = JSON.parse(savedLastRead);
        set({
          lastReadSurah: lr.surahNumber,
          lastReadAyah: lr.ayahNumber,
          lastReadSurahName: lr.surahName,
        });
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage:', e);
    }
  },

  setArabicFontSize: (size) => {
    set({ arabicFontSize: size });
    if (typeof window !== 'undefined') {
      const curr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...curr, arabicFontSize: size }));
    }
  },

  setLatinFontSize: (size) => {
    set({ latinFontSize: size });
    if (typeof window !== 'undefined') {
      const curr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...curr, latinFontSize: size }));
    }
  },

  setTranslationFontSize: (size) => {
    set({ translationFontSize: size });
    if (typeof window !== 'undefined') {
      const curr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...curr, translationFontSize: size }));
    }
  },

  setShowTransliteration: (show) => {
    set({ showTransliteration: show });
    if (typeof window !== 'undefined') {
      const curr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...curr, showTransliteration: show }));
    }
  },

  setShowTranslation: (show) => {
    set({ showTranslation: show });
    if (typeof window !== 'undefined') {
      const curr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...curr, showTranslation: show }));
    }
  },

  setLastRead: (surah, ayah, surahName) => {
    set({
      lastReadSurah: surah,
      lastReadAyah: ayah,
      ...(surahName ? { lastReadSurahName: surahName } : {}),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        LAST_READ_KEY,
        JSON.stringify({ surahNumber: surah, ayahNumber: ayah, surahName })
      );
    }
  },

  addBookmark: (surahNumber, ayahNumber, surahName, ayahText) => {
    const { bookmarks } = get();
    const exists = bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
    if (!exists) {
      const updated = [
        ...bookmarks,
        { surahNumber, ayahNumber, surahName, ayahText, timestamp: Date.now() },
      ];
      set({ bookmarks: updated });
      if (typeof window !== 'undefined') {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      }
    }
  },

  removeBookmark: (surahNumber, ayahNumber) => {
    const { bookmarks } = get();
    const updated = bookmarks.filter(
      (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
    );
    set({ bookmarks: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    }
  },

  isBookmarked: (surahNumber, ayahNumber) => {
    const { bookmarks } = get();
    return bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  },
}));
