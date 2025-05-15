// Ce script corrige les problèmes liés au Service Worker

// Désinscrire tous les service workers existants
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Ignorer les requêtes chrome-extension://
self.addEventListener('fetch', function(event) {
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  event.respondWith(fetch(event.request));
});