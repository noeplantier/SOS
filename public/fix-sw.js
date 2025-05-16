// filepath: /home/pnoe/SOS/public/fix-sw.js
// Service Worker pour corriger les problèmes de mise en cache
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    // Désinscrire tous les service workers précédents
    self.registration.unregister()
      .then(() => self.clients.matchAll())
      .then(clients => {
        clients.forEach(client => client.navigate(client.url));
      })
  );
});