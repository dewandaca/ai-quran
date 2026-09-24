import { create } from 'zustand';
import { fetchJadwalShalat, fetchKabKota, JadwalShalatItem } from '../services/shalatApi';
import {
  sendPrayerNotification,
  sendTestNotification,
  getOrRegisterServiceWorker,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  syncScheduleToServiceWorker,
  NotificationStatus,
} from '@/utils/prayerNotification';

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
  permissionStatus: NotificationStatus;
  isLoading: boolean;
  isDetectingLocation: boolean;
  isGpsLocation: boolean;
  error: string | null;

  // Actions
  setCity: (provinsi: string, kabkota: string) => Promise<void>;
  detectLocation: () => Promise<boolean>;
  toggleNotification: (prayer: keyof PrayerNotificationSettings) => Promise<void>;
  requestPermission: () => Promise<NotificationStatus>;
  testNotification: () => Promise<boolean>;
  loadSchedule: () => Promise<void>;
  updateNextPrayer: () => void;
  loadFromStorage: () => void;
}

const SHALAT_STORAGE_KEY = 'quran_companion_shalat';
const NOTIFIED_STORAGE_KEY = 'quran_companion_notified_prayers';

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

function getNotifiedPrayers(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = localStorage.getItem(NOTIFIED_STORAGE_KEY);
    if (saved) {
      return new Set(JSON.parse(saved));
    }
  } catch {
    // Ignore
  }
  return new Set();
}

function saveNotifiedPrayers(set: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore
  }
}

function checkAndNotifyPrayer(
  today: JadwalShalatItem | null,
  kabkota: string,
  settings: PrayerNotificationSettings
) {
  if (!today || typeof window === 'undefined') return;

  const now = new Date();
  const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const prayers: { key: keyof PrayerNotificationSettings; name: string; time: string }[] = [
    { key: 'subuh', name: 'Subuh', time: today.subuh },
    { key: 'dzuhur', name: 'Dzuhur', time: today.dzuhur },
    { key: 'ashar', name: 'Ashar', time: today.ashar },
    { key: 'maghrib', name: 'Maghrib', time: today.maghrib },
    { key: 'isya', name: 'Isya', time: today.isya },
  ];

  const notified = getNotifiedPrayers();
  let changed = false;

  for (const prayer of prayers) {
    if (!prayer.time || prayer.time === '--:--' || !settings[prayer.key]) continue;

    const [h, m] = prayer.time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) continue;

    const prayerTotalMinutes = h * 60 + m;
    const diff = currentTotalMinutes - prayerTotalMinutes;

    // Trigger if current time is within [prayerTime, prayerTime + 10 minutes]
    // Ensures notifications fire reliably even if background tab is throttled
    const prayerId = `${dateKey}-${prayer.key}`;
    if (diff >= 0 && diff <= 10 && !notified.has(prayerId)) {
      notified.add(prayerId);
      changed = true;
      sendPrayerNotification(prayer.name, kabkota);
    }
  }

  if (changed) {
    saveNotifiedPrayers(notified);
  }
}

export const useShalatStore = create<ShalatState>((set, get) => ({
  provinsi: 'Jawa Barat',
  kabkota: 'Kota Bandung',
  monthlySchedule: [],
  todaySchedule: null,
  nextPrayer: null,
  notificationSettings: DEFAULT_NOTIFICATIONS,
  permissionStatus: 'default',
  isLoading: false,
  isDetectingLocation: false,
  isGpsLocation: false,
  error: null,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const perm = getNotificationPermissionStatus();
      const saved = localStorage.getItem(SHALAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          ...(parsed.provinsi && parsed.kabkota
            ? { provinsi: parsed.provinsi, kabkota: parsed.kabkota }
            : {}),
          ...(parsed.notificationSettings ? { notificationSettings: parsed.notificationSettings } : {}),
          permissionStatus: perm,
        });
      } else {
        set({ permissionStatus: perm });
      }
    } catch {
      // Ignore
    }
  },

  setCity: async (provinsi: string, kabkota: string) => {
    set({ provinsi, kabkota, isGpsLocation: false });
    if (typeof window !== 'undefined') {
      const current = get();
      localStorage.setItem(
        SHALAT_STORAGE_KEY,
        JSON.stringify({
          provinsi,
          kabkota,
          notificationSettings: current.notificationSettings,
        })
      );
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
          const rawCity =
            address.city || address.town || address.county || address.city_district || 'Jakarta';

          // Fetch valid cities in this province to guarantee a 100% exact match in equran.id
          const validCities = await fetchKabKota(state);
          let matchedKabkota = validCities[0] || 'Kota Bandung';

          if (validCities.length > 0) {
            const clean = (s: string) =>
              s
                .toLowerCase()
                .replace(/^(kota|kabupaten|kab\.?)\s+/i, '')
                .replace(/[^a-z0-9]/g, '');
            const targetClean = clean(rawCity);

            const directMatch = validCities.find((c) => clean(c) === targetClean);
            const partialMatch = validCities.find(
              (c) => clean(c).includes(targetClean) || targetClean.includes(clean(c))
            );

            if (directMatch) {
              matchedKabkota = directMatch;
            } else if (partialMatch) {
              matchedKabkota = partialMatch;
            }
          }

          set({
            provinsi: state,
            kabkota: matchedKabkota,
            isGpsLocation: true,
            isDetectingLocation: false,
          });

          if (typeof window !== 'undefined') {
            const current = get();
            localStorage.setItem(
              SHALAT_STORAGE_KEY,
              JSON.stringify({
                provinsi: state,
                kabkota: matchedKabkota,
                notificationSettings: current.notificationSettings,
              })
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

  requestPermission: async () => {
    const status = await requestNotificationPermission();
    set({ permissionStatus: status });
    return status;
  },

  testNotification: async () => {
    const { kabkota } = get();
    const success = await sendTestNotification(kabkota);
    const perm = getNotificationPermissionStatus();
    set({ permissionStatus: perm });
    return success;
  },

  toggleNotification: async (prayer: keyof PrayerNotificationSettings) => {
    const { notificationSettings, provinsi, kabkota, todaySchedule } = get();
    const willEnable = !notificationSettings[prayer];
    const updated = {
      ...notificationSettings,
      [prayer]: willEnable,
    };
    set({ notificationSettings: updated });

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        SHALAT_STORAGE_KEY,
        JSON.stringify({
          provinsi,
          kabkota,
          notificationSettings: updated,
        })
      );
    }

    // Request notification permission and initialize SW if enabling
    if (willEnable && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await requestNotificationPermission();
        set({ permissionStatus: perm });
      }
      await getOrRegisterServiceWorker();
    }

    // Sync updated settings to service worker
    if (todaySchedule) {
      syncScheduleToServiceWorker(
        {
          subuh: todaySchedule.subuh,
          dzuhur: todaySchedule.dzuhur,
          ashar: todaySchedule.ashar,
          maghrib: todaySchedule.maghrib,
          isya: todaySchedule.isya,
        },
        kabkota,
        updated
      );
    }
  },

  loadSchedule: async () => {
    const { provinsi, kabkota, notificationSettings } = get();
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

        // Sync schedule to Service Worker for background notifications
        if (todayItem) {
          syncScheduleToServiceWorker(
            {
              subuh: todayItem.subuh,
              dzuhur: todayItem.dzuhur,
              ashar: todayItem.ashar,
              maghrib: todayItem.maghrib,
              isya: todayItem.isya,
            },
            kabkota,
            notificationSettings
          );
        }
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
