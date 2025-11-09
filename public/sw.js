const CACHE = 'shchakim-v1';
const OFFLINE_URLS = [
  '/',
  '/display',
  '/pair'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(OFFLINE_URLS);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    try {
      const network = await fetch(event.request);
      const cache = await caches.open(CACHE);
      cache.put(event.request, network.clone());
      return network;
    } catch {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return caches.match('/');
    }
  })());
});



