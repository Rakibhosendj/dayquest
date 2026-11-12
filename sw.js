const CACHE = 'dayquest-cache-v16-family-profile';
const FILES = [
  './',
  './index.html',
  './style.css?v=20261112-family-profile2',
  './app.js?v=20261112-family-profile2',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Prefer deployed files while online and retain the latest successfully loaded files offline.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request) || await cache.match('./index.html');
      return cached || Response.error();
    }
  })());
});
