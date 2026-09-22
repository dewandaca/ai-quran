/**
 * Utility for handling prayer time notifications and audio chimes
 */

/**
 * Plays a gentle, peaceful dual-tone chime using Web Audio API
 * Requires no external audio files and instantly unlocks AudioContext
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
 * Dispatches a test notification with sound and system banner
 */
export async function sendTestPrayerNotification(kabkota: string): Promise<NotificationResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    // Still play audio chime even if system notifications are not supported
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

  // Always play gentle chime on test trigger
  playNotificationChime();

  if (permission === 'denied') {
    return {
      success: false,
      status: 'denied',
      message: 'Izin notifikasi diblokir di browser. Buka setelan browser untuk mengizinkan notifikasi.',
    };
  }

  try {
    const title = '🕌 Pengingat Waktu Shalat';
    const options: NotificationOptions = {
      body: `Alhamdulillah! Notifikasi adzan & waktu shalat untuk wilayah ${kabkota || 'Anda'} telah aktif.`,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'shalat-test-notification',
    };

    // Check service worker support first (recommended on mobile/PWA)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.showNotification) {
          await registration.showNotification(title, options);
          return {
            success: true,
            status: 'granted',
            message: 'Notifikasi berhasil dikirimkan ke perangkat Anda!',
          };
        }
      } catch {
        // Fallback to standard window Notification
      }
    }

    new Notification(title, options);
    return {
      success: true,
      status: 'granted',
      message: 'Notifikasi berhasil dikirimkan ke perangkat Anda!',
    };
  } catch (err) {
    console.warn('Failed to display native notification:', err);
    return {
      success: true,
      status: 'granted',
      message: 'Nada pengingat berhasil dibunyikan!',
    };
  }
}
