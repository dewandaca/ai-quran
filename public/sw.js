// Service Worker for Al-Qur'an Companion Web & Mobile Notifications
// Handles Push, Periodic Background Sync, Audio triggers, and Click actions

const SW_VERSION = 'v1.1.0';
let cachedSchedule = null;
let cachedKabkota = 'Indonesia';
let cachedSettings = { subuh: true, dzuhur: true, ashar: true, maghrib: true, isya: true };
let lastNotifiedInSW = {};

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen to messages from the web app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SYNC_PRAYER_SCHEDULE') {
    cachedSchedule = event.data.schedule;
    cachedKabkota = event.data.kabkota || cachedKabkota;
    if (event.data.settings) {
      cachedSettings = event.data.settings;
    }
  }

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || '🕌 Waktu Sholat Tiba', {
      icon: '/icon.png',
      badge: '/icon.png',
      ...options,
    });
  }
});

// Periodic Background Sync (Supported in Chromium / Android Chrome / Installed PWA)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-prayer-times') {
    event.waitUntil(checkBackgroundPrayerTimes());
  }
});

async function checkBackgroundPrayerTimes() {
  if (!cachedSchedule) return;

  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  const prayers = [
    { key: 'subuh', name: 'Subuh', time: cachedSchedule.subuh },
    { key: 'dzuhur', name: 'Dzuhur', time: cachedSchedule.dzuhur },
    { key: 'ashar', name: 'Ashar', time: cachedSchedule.ashar },
    { key: 'maghrib', name: 'Maghrib', time: cachedSchedule.maghrib },
    { key: 'isya', name: 'Isya', time: cachedSchedule.isya },
  ];

  for (const prayer of prayers) {
    if (!prayer.time || !cachedSettings[prayer.key]) continue;

    const [h, m] = prayer.time.split(':').map(Number);
    const prayerTotalMinutes = h * 60 + m;
    const diff = currentTotalMinutes - prayerTotalMinutes;

    // If within 10 minutes after prayer time and not yet notified today in SW
    const prayerNotifKey = `${todayKey}-${prayer.key}`;
    if (diff >= 0 && diff <= 10 && !lastNotifiedInSW[prayerNotifKey]) {
      lastNotifiedInSW[prayerNotifKey] = true;

      await self.registration.showNotification(`🕌 Waktu Shalat ${prayer.name} Telah Tiba`, {
        body: `Telah masuk waktu shalat ${prayer.name} untuk wilayah ${cachedKabkota} dan sekitarnya. Mari tunaikan shalat tepat waktu.`,
        icon: '/icon.png',
        badge: '/icon.png',
        tag: `shalat-${prayer.key}-${todayKey}`,
        renotify: true,
        data: {
          url: '/app/shalat',
        },
      });
    }
  }
}

// Web Push event listener (Fallback & Remote Push support)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: '🕌 Waktu Shalat Tiba', body: event.data.text() };
    }
  }

  const title = data.title || '🕌 Waktu Shalat Telah Tiba';
  const options = {
    body: data.body || 'Mari tunaikan shalat tepat pada waktunya.',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/app/shalat',
    },
    tag: data.tag || 'shalat-push',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click on mobile & desktop
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/app/shalat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
