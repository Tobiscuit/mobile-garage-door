const CACHE_NAME = 'mobile-garage-door-pwa-v2';

// Assets to cache for basic offline shell functionality
const OFFLINE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests entirely (e.g. cloudflareinsights, CDNs)
  if (url.origin !== self.location.origin) return;

  // Skip /_vinext/ image optimization requests
  if (url.pathname.startsWith('/_vinext/')) return;

  // Stale-while-revalidate strategy for navigational requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  // Network-first for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Allow the UI to trigger an immediate update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push Notification Handler
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge.png',
      vibrate: [100, 50, 100],
      // Tag groups notifications — same tag replaces previous (no spam)
      tag: data.tag || 'general',
      // Renotify even if same tag (so the user notices the update)
      renotify: true,
      // Keep notification visible until user interacts
      requireInteraction: data.data?.milestone === 'eta_3',
      data: {
        url: data.data?.url || '/',
        ticketId: data.data?.ticketId || null,
        milestone: data.data?.milestone || null,
        dateOfArrival: Date.now(),
      },
    };
    event.waitUntil(self.registration.showNotification(data.title || 'Mobil Garage Door', options));
  } catch (e) {
    console.error('[SW] Push parse error:', e);
  }
});

// Notification Click Handler — deep-link to tracking page
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // Determine the target URL
  let targetUrl = '/';
  const data = event.notification.data;

  if (data?.ticketId) {
    targetUrl = `/portal/track/${data.ticketId}`;
  } else if (data?.url) {
    targetUrl = data.url;
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Try to focus an existing window on the same origin
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // No existing window — open new one
      return clients.openWindow(targetUrl);
    })
  );
});

