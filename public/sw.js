// Safety Service Worker
// This worker immediately activates and claims clients, overriding any previous buggy workers.
self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    // Pass through all requests to the network
    // This fixes the "Failed to fetch" errors caused by stale caching logic
    // event.respondWith(fetch(event.request));
    // Actually, simply not calling respondWith lets the browser handle it normally, which is safer for now.
});
