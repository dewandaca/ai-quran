/**
 * Utility for handling prayer time notifications and audio chimes
 * Fully compatible with Android Chrome (Service Worker) and Desktop browsers
 */

/**
 * Plays a gentle, peaceful dual-tone chime using Web Audio API
 * Requires no external audio files and instantly unlocks AudioContext
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
    gain1.gain.setValueAtTime(0.18, now);
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
    gain2.gain.setValueAtTime(0.22, now + 0.28);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.28);
    osc2.stop(now + 1.6);
  } catch (err) {
    console.warn('Audio chime playback issue:', err);
  }
}

export interface NotificationResult {
  success: boolean;
  status: 'granted' | 'denied' | 'unsupported' | 'error';
  message: string;
}

/**
 * Ensures Service Worker (/sw.js) is registered and active
 * Required by Android Chrome and mobile browsers to display notifications
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

    // Wait until the service worker is ready / active
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.warn('Failed to register service worker for mobile notifications:', err);
    return null;
  }
}

/**
 * Dispatches a test notification with sound and system banner
 * Works across both mobile phones (via ServiceWorker) and desktop browsers
 */
export async function sendTestPrayerNotification(kabkota: string): Promise<NotificationResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    playNotificationChime();
    return {
      success: false,
      status: 'unsupported',
      message: 'Browser Anda tidak mendukung Web Notification API, namun nada pengingat tetap aktif.',
    };
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = 'denied';
    }
  }

  // Always trigger gentle chime on test trigger
  playNotificationChime();

  if (permission === 'denied') {
    return {
      success: false,
      status: 'denied',
      message: 'Izin notifikasi diblokir di browser. Buka setelan situs di browser HP Anda dan aktifkan "Izin Notifikasi".',
    };
  }

  const title = '🕌 Pengingat Waktu Shalat';
  const options = {
    body: `Alhamdulillah! Notifikasi adzan & waktu shalat untuk wilayah ${kabkota || 'Anda'} telah aktif.`,
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'shalat-test-notification',
    data: {
      url: '/app/shalat',
    },
  };

  // 1. Mobile Priority: Android Chrome requires ServiceWorkerRegistration.showNotification()
  if ('serviceWorker' in navigator) {
    try {
      const registration = await getOrRegisterServiceWorker();
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return {
          success: true,
          status: 'granted',
          message: 'Notifikasi berhasil dikirimkan ke perangkat HP Anda!',
        };
      }
    } catch (swErr) {
      console.warn('Service Worker showNotification error, attempting desktop fallback:', swErr);
    }
  }

  // 2. Desktop Fallback: Standard window Notification constructor
  try {
    new Notification(title, options);
    return {
      success: true,
      status: 'granted',
      message: 'Notifikasi berhasil dikirimkan ke perangkat Anda!',
    };
  } catch (err) {
    console.error('Failed to construct window Notification:', err);
    return {
      success: false,
      status: 'error',
      message: 'Gagal memunculkan banner notifikasi di HP. Pastikan notifikasi browser Chrome/HP tidak disenyapkan di Pengaturan Android/iOS.',
    };
  }
}
