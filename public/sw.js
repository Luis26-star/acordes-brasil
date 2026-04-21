/* =========================================================
   SERVICE WORKER – PRODUCTION READY (2026)
   Acordes Brasil e.V.i.G.
========================================================= */

/* =========================================================
   VERSIONING
========================================================= */
const VERSION = 'v2';
const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

/* =========================================================
   ASSETS (Precache)
========================================================= */
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/css/style.css',
  '/src/js/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];


/* =========================================================
   INSTALL (Precache)
========================================================= */
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});


/* =========================================================
   ACTIVATE (Cleanup old caches)
========================================================= */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => ![STATIC_CACHE, DYNAMIC_CACHE].includes(key))
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});


/* =========================================================
   FETCH STRATEGY
   - HTML → Network First
   - Assets → Cache First
   - API → Network with fallback
========================================================= */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  /* Only GET */
  if (request.method !== 'GET') return;

  /* HTML → Network First */
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  /* STATIC → Cache First */
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  /* DEFAULT → Stale While Revalidate */
  event.respondWith(staleWhileRevalidate(request));
});


/* =========================================================
   STRATEGIES
========================================================= */

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    return cached || caches.match('/index.html');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => cached);

  return cached || fetchPromise;
}


/* =========================================================
   PUSH NOTIFICATIONS
========================================================= */
self.addEventListener('push', (event) => {
  let data = {
    title: 'Acordes Brasil',
    body: 'Neue Nachricht vom Chor',
    url: '/',
  };

  try {
    data = event.data.json();
  } catch {}

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      {
        action: 'open',
        title: 'Öffnen'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});


/* =========================================================
   NOTIFICATION CLICK
========================================================= */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientsArr => {
        for (const client of clientsArr) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
