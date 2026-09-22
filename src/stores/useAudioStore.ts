import { create } from 'zustand';

export interface AudioTrack {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  audioUrl: string;
  totalAyahs: number;
}

export const QARI_LIST = [
  { id: '01', name: 'Abdullah-Al-Juhany', label: 'Abdullah Al-Juhany' },
  { id: '02', name: 'Abdul-Muhsin-Al-Qasim', label: 'Abdul Muhsin Al-Qasim' },
  { id: '03', name: 'Abdurrahman-as-Sudais', label: 'Abdurrahman As-Sudais' },
  { id: '04', name: 'Ibrahim-Al-Dossari', label: 'Ibrahim Al-Dossari' },
  { id: '05', name: 'Misyari-Rasyid-Al-Afasy', label: 'Misyari Rasyid Al-Afasy' },
  { id: '06', name: 'Yasser-Ad-Dossari', label: 'Yasser Al-Dosari' },
];

interface AudioState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  playbackPosition: number; // in milliseconds
  playbackDuration: number; // in milliseconds
  queue: AudioTrack[];
  activeAyahNumber: number | null;
  activeSurahNumber: number | null;
  isContinuous: boolean;
  repeatMode: 'none' | 'verse' | 'surah';
  selectedQari: string;
  isPlayerModalOpen: boolean;

  // Actions
  setCurrentTrack: (track: AudioTrack | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setPlaybackPosition: (position: number) => void;
  setPlaybackDuration: (duration: number) => void;
  setQueue: (queue: AudioTrack[]) => void;
  setActiveAyah: (surahNumber: number | null, ayahNumber: number | null) => void;
  setIsContinuous: (continuous: boolean) => void;
  setRepeatMode: (mode: 'none' | 'verse' | 'surah') => void;
  setSelectedQari: (qari: string) => void;
  setPlayerModalOpen: (open: boolean) => void;
  playTrack: (track: AudioTrack, queue?: AudioTrack[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (positionMs: number) => void;
  stop: () => void;
}

// Global browser audio instance
let globalAudio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudio) {
    globalAudio = new Audio();
  }
  return globalAudio;
}

const QARI_FOLDERS: Record<string, string> = {
  '01': 'Abdullah-Al-Juhany',
  '02': 'Abdul-Muhsin-Al-Qasim',
  '03': 'Abdurrahman-as-Sudais',
  '04': 'Ibrahim-Al-Dossari',
  '05': 'Misyari-Rasyid-Al-Afasi',
  '06': 'Yasser-Al-Dosari',
};

export function getAyahAudioUrl(surahNumber: number, ayahNumber: number, qariId: string): string {
  const folder = QARI_FOLDERS[qariId] || 'Misyari-Rasyid-Al-Afasi';
  const s = surahNumber.toString().padStart(3, '0');
  const a = ayahNumber.toString().padStart(3, '0');
  return `https://cdn.equran.id/audio-partial/${folder}/${s}${a}.mp3`;
}

export const useAudioStore = create<AudioState>((set, get) => {
  if (typeof window !== 'undefined') {
    const audio = getAudio();
    if (audio) {
      audio.onplay = () => set({ isPlaying: true, isLoading: false });
      audio.onpause = () => set({ isPlaying: false });
      audio.onwaiting = () => set({ isLoading: true });
      audio.onplaying = () => set({ isLoading: false, isPlaying: true });
      audio.ontimeupdate = () => {
        set({
          playbackPosition: (audio.currentTime || 0) * 1000,
          playbackDuration: (audio.duration || 0) * 1000,
        });
      };
      audio.onended = () => {
        const { isContinuous, repeatMode, playNext, currentTrack, queue } = get();
        if (repeatMode === 'verse') {
          audio.currentTime = 0;
          audio.play().catch(console.error);
        } else if (isContinuous) {
          playNext();
        } else {
          set({ isPlaying: false, playbackPosition: 0 });
        }
      };
    }
  }

  return {
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    playbackPosition: 0,
    playbackDuration: 0,
    queue: [],
    activeAyahNumber: null,
    activeSurahNumber: null,
    isContinuous: true,
    repeatMode: 'none',
    selectedQari: '05', // Default: Misyari Rasyid Al-Afasy
    isPlayerModalOpen: false,

    setCurrentTrack: (track) => set({ currentTrack: track }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setPlaybackPosition: (position) => set({ playbackPosition: position }),
    setPlaybackDuration: (duration) => set({ playbackDuration: duration }),
    setQueue: (queue) => set({ queue }),
    setActiveAyah: (surahNumber, ayahNumber) =>
      set({
        activeSurahNumber: surahNumber,
        activeAyahNumber: ayahNumber,
      }),
    setIsContinuous: (continuous) => set({ isContinuous: continuous }),
    setRepeatMode: (mode) => set({ repeatMode: mode }),

    setSelectedQari: (qari) => {
      const { currentTrack, isPlaying, queue } = get();
      set({ selectedQari: qari });

      // Update the entire queue to the new qari
      const updatedQueue = queue.map((track) => ({
        ...track,
        audioUrl: getAyahAudioUrl(track.surahNumber, track.ayahNumber, qari),
      }));
      set({ queue: updatedQueue });

      // If there is an active track, switch qari in real-time immediately!
      if (currentTrack) {
        const newUrl = getAyahAudioUrl(currentTrack.surahNumber, currentTrack.ayahNumber, qari);
        const updatedTrack = { ...currentTrack, audioUrl: newUrl };
        set({ currentTrack: updatedTrack });

        const audio = getAudio();
        if (audio) {
          const wasPlaying = isPlaying;
          const currentPos = audio.currentTime;
          audio.src = newUrl;
          audio.currentTime = currentPos;
          if (wasPlaying) {
            audio.play().catch((err) => {
              console.warn('Realtime qari switch playback error:', err);
              // Fallback to starting from 0 if position seek failed
              audio.currentTime = 0;
              audio.play().catch(console.error);
            });
          }
        }
      }
    },

    setPlayerModalOpen: (open) => set({ isPlayerModalOpen: open }),

    playTrack: (track, queue) => {
      const audio = getAudio();
      if (!audio) return;

      if (queue) {
        set({ queue });
      }

      set({
        currentTrack: track,
        activeSurahNumber: track.surahNumber,
        activeAyahNumber: track.ayahNumber,
        isLoading: true,
        playbackPosition: 0,
      });

      audio.src = track.audioUrl;
      audio.currentTime = 0;
      audio.play().then(() => {
        set({ isPlaying: true, isLoading: false });
      }).catch((err) => {
        console.warn('Audio play failed:', err);
        set({ isPlaying: false, isLoading: false });
      });
    },

    togglePlayPause: () => {
      const audio = getAudio();
      const { isPlaying, currentTrack } = get();
      if (!audio || !currentTrack) return;

      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
    },

    playNext: () => {
      const { queue, currentTrack, playTrack } = get();
      if (!currentTrack || queue.length === 0) return;

      const currentIndex = queue.findIndex(
        (t) =>
          t.surahNumber === currentTrack.surahNumber &&
          t.ayahNumber === currentTrack.ayahNumber
      );

      if (currentIndex >= 0 && currentIndex < queue.length - 1) {
        const next = queue[currentIndex + 1];
        playTrack(next);
      } else {
        set({ isPlaying: false });
      }
    },

    playPrevious: () => {
      const { queue, currentTrack, playTrack } = get();
      if (!currentTrack || queue.length === 0) return;

      const currentIndex = queue.findIndex(
        (t) =>
          t.surahNumber === currentTrack.surahNumber &&
          t.ayahNumber === currentTrack.ayahNumber
      );

      if (currentIndex > 0) {
        const prev = queue[currentIndex - 1];
        playTrack(prev);
      }
    },

    seekTo: (positionMs: number) => {
      const audio = getAudio();
      if (!audio) return;
      audio.currentTime = positionMs / 1000;
      set({ playbackPosition: positionMs });
    },

    stop: () => {
      const audio = getAudio();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      set({
        isPlaying: false,
        isLoading: false,
        playbackPosition: 0,
        currentTrack: null,
        activeAyahNumber: null,
      });
    },
  };
});
