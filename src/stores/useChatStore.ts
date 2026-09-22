'use client';

import { create } from 'zustand';
import { AICitation, AIDuaCitation } from '@/services/aiService';

// ─── Types ───────────────────────────────────────────────────────────
export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: AICitation[];
  duaCitations?: AIDuaCitation[];
  isStreaming?: boolean;
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessageItem[];
}

interface ChatStore {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  sidebarOpen: boolean;

  // Actions
  createRoom: () => string;
  deleteRoom: (roomId: string) => void;
  setActiveRoom: (roomId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Message actions
  addMessage: (roomId: string, message: ChatMessageItem) => void;
  updateMessage: (roomId: string, messageId: string, updates: Partial<ChatMessageItem>) => void;

  // Helpers
  getActiveRoom: () => ChatRoom | null;
  getConversationHistory: (roomId: string) => { role: 'user' | 'assistant'; content: string }[];
  clearAllRooms: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'equran-chat-history';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function autoTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\n/g, ' ');
  if (cleaned.length <= 45) return cleaned;
  return cleaned.slice(0, 42) + '...';
}

function saveToStorage(rooms: ChatRoom[], activeRoomId: string | null) {
  try {
    // Only save the last 50 rooms to prevent localStorage overflow
    const trimmed = rooms.slice(0, 50).map((room) => ({
      ...room,
      messages: room.messages.map((m) => ({
        ...m,
        isStreaming: false, // Never persist streaming state
      })),
    }));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ rooms: trimmed, activeRoomId })
    );
  } catch {
    // localStorage full — silently fail
  }
}

function loadStorage(): { rooms: ChatRoom[]; activeRoomId: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { rooms: [], activeRoomId: null };
    const parsed = JSON.parse(raw);
    return {
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      activeRoomId: parsed.activeRoomId || null,
    };
  } catch {
    return { rooms: [], activeRoomId: null };
  }
}

export const useChatStore = create<ChatStore>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  sidebarOpen: false,

  loadFromStorage: () => {
    const data = loadStorage();
    set({ rooms: data.rooms, activeRoomId: data.activeRoomId });
  },

  createRoom: () => {
    const newRoom: ChatRoom = {
      id: generateId(),
      title: 'Chat Baru',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    const updatedRooms = [newRoom, ...get().rooms];
    set({ rooms: updatedRooms, activeRoomId: newRoom.id, sidebarOpen: false });
    saveToStorage(updatedRooms, newRoom.id);
    return newRoom.id;
  },

  deleteRoom: (roomId) => {
    const state = get();
    const updatedRooms = state.rooms.filter((r) => r.id !== roomId);
    const newActiveId =
      state.activeRoomId === roomId
        ? updatedRooms[0]?.id || null
        : state.activeRoomId;
    set({ rooms: updatedRooms, activeRoomId: newActiveId });
    saveToStorage(updatedRooms, newActiveId);
  },

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId, sidebarOpen: false });
    saveToStorage(get().rooms, roomId);
  },

  toggleSidebar: () => {
    set((s) => ({ sidebarOpen: !s.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  addMessage: (roomId, message) => {
    const state = get();
    const updatedRooms = state.rooms.map((room) => {
      if (room.id !== roomId) return room;

      const updatedMessages = [...room.messages, message];

      // Auto-title: use first user message as title
      let title = room.title;
      if (
        title === 'Chat Baru' &&
        message.role === 'user' &&
        room.messages.filter((m) => m.role === 'user').length === 0
      ) {
        title = autoTitle(message.content);
      }

      return {
        ...room,
        title,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };
    });

    // Move updated room to top
    const targetIdx = updatedRooms.findIndex((r) => r.id === roomId);
    if (targetIdx > 0) {
      const [room] = updatedRooms.splice(targetIdx, 1);
      updatedRooms.unshift(room);
    }

    set({ rooms: updatedRooms });
    // Only save non-streaming messages
    if (!message.isStreaming) {
      saveToStorage(updatedRooms, state.activeRoomId);
    }
  },

  updateMessage: (roomId, messageId, updates) => {
    const state = get();
    const updatedRooms = state.rooms.map((room) => {
      if (room.id !== roomId) return room;
      return {
        ...room,
        updatedAt: Date.now(),
        messages: room.messages.map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      };
    });
    set({ rooms: updatedRooms });
    // Save when streaming completes
    if (updates.isStreaming === false) {
      saveToStorage(updatedRooms, state.activeRoomId);
    }
  },

  getActiveRoom: () => {
    const state = get();
    if (!state.activeRoomId) return null;
    return state.rooms.find((r) => r.id === state.activeRoomId) || null;
  },

  getConversationHistory: (roomId) => {
    const room = get().rooms.find((r) => r.id === roomId);
    if (!room) return [];
    return room.messages
      .filter((m) => m.content && !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));
  },

  clearAllRooms: () => {
    set({ rooms: [], activeRoomId: null });
    saveToStorage([], null);
  },
}));
