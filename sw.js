const CACHE = 'dayquest-cache-v113-budget-mobile-fit';
const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js';
const FILES = [
  './',
  './index.html',
  './style.css?v=20261118-budget-mobile-fit',
  './app.js?v=20261118-budget-mobile-fit',
  './manifest.json',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './cloud-config.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(FILES);
    // Cache the Supabase browser SDK when online, but do not block installation if
    // the CDN is temporarily unavailable. The next online request can cache it.
    try { await cache.add(SUPABASE_SDK); } catch (error) { console.warn('Supabase SDK will be cached on first successful load.'); }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const requestUrl = new URL(request.url);
  const isSupabaseSdk = requestUrl.href === SUPABASE_SDK;
  if (requestUrl.origin !== self.location.origin && !isSupabaseSdk) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        try { await cache.put(request, response.clone()); } catch (error) { /* cache is best-effort */ }
      }
      return response;
    } catch (error) {
      // Only use index.html as an offline fallback for page navigation.
      // Returning HTML for a failed JavaScript/CSS request can make the entire app blank.
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const page = await cache.match('./index.html');
        if (page) return page;
      }
      return Response.error();
    }
  })());
});
