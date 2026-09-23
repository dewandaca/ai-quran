import { create } from 'zustand';
import { fetchJadwalShalat, JadwalShalatItem } from '../services/shalatApi';
import { sendPrayerNotification, getOrRegisterServiceWorker } from '@/utils/prayerNotification';

export interface NextPrayerInfo {
  name: string;
  time: string;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  displayText: string;
}

export interface PrayerNotificationSettings {
  subuh: boolean;
  dzuhur: boolean;
  ashar: boolean;
  maghrib: boolean;
  isya: boolean;
}

interface ShalatState {
  provinsi: string;
  kabkota: string;
  monthlySchedule: JadwalShalatItem[];
  todaySchedule: JadwalShalatItem | null;
  nextPrayer: NextPrayerInfo | null;
  notificationSettings: PrayerNotificationSettings;
  isLoading: boolean;
  isDetectingLocation: boolean;
  isGpsLocation: boolean;
  error: string | null;

  // Actions
  setCity: (provinsi: string, kabkota: string) => Promise<void>;
  detectLocation: () => Promise<boolean>;
  toggleNotification: (prayer: keyof PrayerNotificationSettings) => void;
  loadSchedule: () => Promise<void>;
  updateNextPrayer: () => void;
  loadFromStorage: () => void;
}

const SHALAT_STORAGE_KEY = 'quran_companion_shalat';

const DEFAULT_NOTIFICATIONS: PrayerNotificationSettings = {
  subuh: true,
  dzuhur: true,
  ashar: true,
  maghrib: true,
  isya: true,
};

function calculateNextPrayer(today: JadwalShalatItem | null): NextPrayerInfo | null {
  if (!today) return null;

  const now = new Date();
  const prayerTimes: { name: string; timeStr: string }[] = [
    { name: 'Subuh', timeStr: today.subuh },
    { name: 'Dzuhur', timeStr: today.dzuhur },
    { name: 'Ashar', timeStr: today.ashar },
    { name: 'Maghrib', timeStr: today.maghrib },
    { name: 'Isya', timeStr: today.isya },
  ];

  for (const prayer of prayerTimes) {
    if (!prayer.timeStr || prayer.timeStr === '--:--') continue;
    const [h, m] = prayer.timeStr.split(':').map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(h, m, 0, 0);

    const diffMs = prayerDate.getTime() - now.getTime();
    if (diffMs > 0) {
      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      let displayText = '';
      if (hours > 0) {
        displayText = `${hours} jam ${minutes} mnt lagi`;
      } else if (minutes > 0) {
        displayText = `${minutes} menit lagi`;
      } else {
        displayText = `${seconds} detik lagi`;
      }

      return {
        name: prayer.name,
        time: prayer.timeStr,
        hoursRemaining: hours,
        minutesRemaining: minutes,
        secondsRemaining: seconds,
        displayText,
      };
    }
  }

  // If past Isya today, next is Subuh tomorrow
  return {
    name: 'Subuh',
    time: today.subuh,
    hoursRemaining: 0,
    minutesRemaining: 0,
    secondsRemaining: 0,
    displayText: 'Besok',
  };
}

let lastNotifiedDate = '';
const notifiedPrayers = new Set<string>();

function checkAndNotifyPrayer(
  today: JadwalShalatItem | null,
  kabkota: string,
  settings: PrayerNotificationSettings
) {
  if (!today || typeof window === 'undefined') return;

  const now = new Date();
  const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  if (lastNotifiedDate !== dateKey) {
    lastNotifiedDate = dateKey;
    notifiedPrayers.clear();
  }

  const currentHH = String(now.getHours()).padStart(2, '0');
  const currentMM = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHH}:${currentMM}`;

  const prayers: { key: keyof PrayerNotificationSettings; name: string; time: string }[] = [
    { key: 'subuh', name: 'Subuh', time: today.subuh },
    { key: 'dzuhur', name: 'Dzuhur', time: today.dzuhur },
    { key: 'ashar', name: 'Ashar', time: today.ashar },
    { key: 'maghrib', name: 'Maghrib', time: today.maghrib },
    { key: 'isya', name: 'Isya', time: today.isya },
  ];

  for (const prayer of prayers) {
    if (prayer.time && prayer.time === currentTime && settings[prayer.key]) {
      const prayerId = `${dateKey}-${prayer.key}`;
      if (!notifiedPrayers.has(prayerId)) {
        notifiedPrayers.add(prayerId);
        sendPrayerNotification(prayer.name, kabkota);
      }
    }
  }
}

export const useShalatStore = create<ShalatState>((set, get) => ({
  provinsi: 'Jawa Barat',
  kabkota: 'Kota Bandung',
  monthlySchedule: [],
  todaySchedule: null,
  nextPrayer: null,
  notificationSettings: DEFAULT_NOTIFICATIONS,
  isLoading: false,
  isDetectingLocation: false,
  isGpsLocation: false,
  error: null,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(SHALAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.provinsi && parsed.kabkota) {
          set({ provinsi: parsed.provinsi, kabkota: parsed.kabkota });
        }
      }
    } catch {
      // Ignore
    }
  },

  setCity: async (provinsi: string, kabkota: string) => {
    set({ provinsi, kabkota, isGpsLocation: false });
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHALAT_STORAGE_KEY, JSON.stringify({ provinsi, kabkota }));
    }
    await get().loadSchedule();
  },

  detectLocation: async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return false;

    set({ isDetectingLocation: true });
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=id`
        );
        if (res.ok) {
          const data = await res.json();
          const address = data.address || {};
          const state = address.state || 'DKI Jakarta';
          const cityOrCounty = address.city || address.town || address.county || address.city_district || 'Kota Jakarta Pusat';

          let matchedKabkota = cityOrCounty;
          if (!matchedKabkota.startsWith('Kota ') && !matchedKabkota.startsWith('Kab. ')) {
            matchedKabkota = `Kota ${matchedKabkota}`;
          }

          set({
            provinsi: state,
            kabkota: matchedKabkota,
            isGpsLocation: true,
            isDetectingLocation: false,
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              SHALAT_STORAGE_KEY,
              JSON.stringify({ provinsi: state, kabkota: matchedKabkota })
            );
          }

          await get().loadSchedule();
          return true;
        }
      } catch (geocodeErr) {
        console.warn('Geocoding service unavailable, maintaining current city:', geocodeErr);
      }
    } catch (err) {
      console.warn('Geolocation detection failed:', err);
    } finally {
      set({ isDetectingLocation: false });
    }
    return false;
  },

  toggleNotification: (prayer: keyof PrayerNotificationSettings) => {
    const { notificationSettings } = get();
    const updated = {
      ...notificationSettings,
      [prayer]: !notificationSettings[prayer],
    };
    set({ notificationSettings: updated });

    // Request notification permission and initialize SW if enabling
    if (updated[prayer] && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      getOrRegisterServiceWorker();
    }
  },

  loadSchedule: async () => {
    const { provinsi, kabkota } = get();
    set({ isLoading: true, error: null });

    try {
      const data = await fetchJadwalShalat(provinsi, kabkota);
      if (data && data.jadwal && data.jadwal.length > 0) {
        const todayDateNum = new Date().getDate();
        const todayItem =
          data.jadwal.find((j) => j.tanggal === todayDateNum) || data.jadwal[0];

        const nextPrayer = calculateNextPrayer(todayItem);

        set({
          monthlySchedule: data.jadwal,
          todaySchedule: todayItem,
          nextPrayer,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, error: 'Gagal memuat jadwal shalat' });
      }
    } catch {
      set({ isLoading: false, error: 'Terjadi kesalahan jaringan' });
    }
  },

  updateNextPrayer: () => {
    const { todaySchedule, kabkota, notificationSettings } = get();
    const next = calculateNextPrayer(todaySchedule);
    set({ nextPrayer: next });
    checkAndNotifyPrayer(todaySchedule, kabkota, notificationSettings);
  },
}));
