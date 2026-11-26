const CACHE = 'dayquest-cache-v277-budget-page-v47';
const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js';
const FILES = [
  './',
  './index.html',
  './style.css?v=20261126-budget-page-v46',
  './app.js?v=20261126-budget-page-v47',
  './manifest.json',
  './icons/icon-192.png?v=20261121-admin-password-gate',
  './icons/icon-512.svg',
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

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch { data = { body: event.data ? event.data.text() : '' }; }
  const title = String(data.title || 'DayQuest');
  const options = {
    body: String(data.body || 'You have a DayQuest reminder.'),
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: String(data.tag || 'dayquest-reminder'),
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [250, 120, 250, 120, 350],
    data: { url: String(data.url || './index.html') }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './index.html', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
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
