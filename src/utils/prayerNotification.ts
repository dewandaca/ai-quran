/**
 * Utility for handling prayer time notifications, Service Worker sync, and audio chimes
 * Fully compatible with Android Chrome (Service Worker), Desktop browsers, and iOS PWA
 */

export type NotificationStatus = 'default' | 'granted' | 'denied' | 'unsupported';

/**
 * Checks current browser notification permission
 */
export function getNotificationPermissionStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationStatus;
}

/**
 * Plays a gentle, peaceful dual-tone chime using Web Audio API
 * Instantly unlocks and resumes AudioContext upon user gesture
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // First harmonious note (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    // Second higher chime note (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.28);
    gain2.gain.setValueAtTime(0.25, now + 0.28);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.28);
    osc2.stop(now + 1.6);
  } catch (err) {
    console.warn('Audio chime playback issue:', err);
  }
}

/**
 * Ensures Service Worker (/sw.js) is registered, ready, and periodic sync is registered if supported
 */
export async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }

    // Wait until service worker is fully active and ready
    const readyRegistration = await navigator.serviceWorker.ready;

    // Try registering Periodic Background Sync if supported (Android Chrome / installed PWA)
    if ('periodicSync' in readyRegistration) {
      try {
        const periodicSync = (readyRegistration as unknown as {
          periodicSync: {
            register: (tag: string, options: { minInterval: number }) => Promise<void>;
          };
        }).periodicSync;

        await periodicSync.register('check-prayer-times', {
          minInterval: 15 * 60 * 1000, // Every 15 minutes
        });
      } catch {
        // Periodic sync registration can fail if site not installed as PWA; safe to ignore
      }
    }

    return readyRegistration;
  } catch (err) {
    console.warn('Failed to register service worker for mobile notifications:', err);
    return null;
  }
}

/**
 * Explicitly requests browser permission for notifications
 * Also triggers AudioContext unlock and Service Worker registration
 */
export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    // Unlock Web Audio during the user click gesture
    playNotificationChime();

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await getOrRegisterServiceWorker();
    }
    return permission as NotificationStatus;
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return Notification.permission as NotificationStatus;
  }
}

/**
 * Syncs prayer schedule with Service Worker so it knows the times even in background
 */
export async function syncScheduleToServiceWorker(
  schedule: Record<string, string> | null,
  kabkota: string,
  settings: Record<string, boolean> | object
): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await getOrRegisterServiceWorker();
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'SYNC_PRAYER_SCHEDULE',
        schedule,
        kabkota,
        settings,
      });
    }
  } catch (err) {
    console.warn('Failed to sync schedule to service worker:', err);
  }
}

/**
 * Dispatches prayer adzan notification with prayer name and region
 * Displays on mobile (via ServiceWorker) and desktop browsers
 */
export async function sendPrayerNotification(prayerName: string, region: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  // Play gentle chime sound
  playNotificationChime();

  const title = `🕌 Waktu Shalat ${prayerName} Telah Tiba`;
  const options = {
    body: `Telah masuk waktu shalat ${prayerName} untuk wilayah ${region || 'Indonesia'} dan sekitarnya. Mari tunaikan shalat tepat waktu.`,
    icon: '/icon.png',
    badge: '/icon.png',
    tag: `shalat-${prayerName.toLowerCase()}-${new Date().toISOString().slice(0, 10)}`,
    renotify: true,
    data: {
      url: '/app/shalat',
    },
  };

  // 1. Mobile Priority & PWA: Android Chrome & Desktop PWA via ServiceWorker showNotification
  if ('serviceWorker' in navigator) {
    try {
      const registration = await getOrRegisterServiceWorker();
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return true;
      }
    } catch (swErr) {
      console.warn('Service Worker notification show failed, trying fallback:', swErr);
    }
  }

  // 2. Desktop Fallback: Standard window Notification constructor
  try {
    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('Failed to construct window Notification:', err);
    return false;
  }
}

/**
 * Sends an immediate test notification with sound to verify that
 * notifications and audio are functioning properly on the current device
 */
export async function sendTestNotification(region: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const status = await requestNotificationPermission();
    if (status !== 'granted') {
      return false;
    }
  }

  // Play audio chime
  playNotificationChime();

  const title = '🔔 Uji Coba Notifikasi Sholat';
  const options = {
    body: `Notifikasi sholat berhasil diaktifkan untuk ${region || 'wilayah Anda'}! Suara dan pengingat adzan siap menemani ibadah Anda.`,
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'test-notification',
    renotify: true,
    data: {
      url: '/app/shalat',
    },
  };

  if ('serviceWorker' in navigator) {
    try {
      const registration = await getOrRegisterServiceWorker();
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return true;
      }
    } catch (swErr) {
      console.warn('Service Worker test notification error:', swErr);
    }
  }

  try {
    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('Test Notification fallback error:', err);
    return false;
  }
}
