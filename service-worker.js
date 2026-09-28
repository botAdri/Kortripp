const CACHE_NAME = 'guide-coree-v15';

const STATIC_ASSETS = [
  '/Kortripp/index.html',
  '/Kortripp/manifest.json',
  '/Kortripp/icons/icon-192.png',
  '/Kortripp/icons/icon-512.png',
  '/Kortripp/vendor/leaflet/leaflet.js',
  '/Kortripp/vendor/leaflet/leaflet.css',
  '/Kortripp/vendor/leaflet/images/layers.png',
  '/Kortripp/vendor/leaflet/images/layers-2x.png',
  '/Kortripp/vendor/leaflet/images/marker-icon.png',
  '/Kortripp/vendor/leaflet/images/marker-icon-2x.png',
  '/Kortripp/vendor/leaflet/images/marker-shadow.png',
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled([
        cache.addAll(STATIC_ASSETS),
        cache.addAll(EXTERNAL_ASSETS),
      ]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isMapTile =
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('maps.wikimedia.org');

  if (isMapTile) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200) return response;
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => new Response('', { status: 503 }));
      })
    );
  } else {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
