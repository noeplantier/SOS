/**
 * Service Worker pour corriger les problèmes de bfcache et des requêtes chrome-extension://
 * 
 * Ce service worker gère plusieurs problèmes:
 * 1. Le problème de mise en cache des requêtes chrome-extension://
 * 2. Les erreurs de bfcache lors de la navigation
 * 3. Les problèmes de service workers multiples
 * 
 * @version 1.0.0
 */

// Nom du cache
const CACHE_NAME = 'sos-cache-v1';

// Liste des URLs à mettre en cache immédiatement
const CACHE_URLS = [
  '/',
  '/index.html',
  '/n8n',
  '/config'
];

// Installation: préchargement du cache et nettoyage des anciens service workers
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation');
  
  // Force ce service worker à devenir le service worker actif
  self.skipWaiting();

  // Préchargement du cache
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Préchargement du cache');
      return cache.addAll(CACHE_URLS);
    })
  );
});

// Activation: nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation');
  
  // Prise de contrôle immédiate de toutes les pages
  event.waitUntil(self.clients.claim());

  // Nettoyage des anciens caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log(`[Service Worker] Suppression de l'ancien cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Interception des requêtes fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorer les requêtes chrome-extension://
  if (url.protocol === 'chrome-extension:') {
    console.log('[Service Worker] Ignoré requête chrome-extension://', url.href);
    return;
  }

  // Ignorer les requêtes d'API ou non-GET
  if (event.request.method !== 'GET' || 
      url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/webhook/')) {
    return;
  }

  // Stratégie de mise en cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Utiliser le cache si disponible
      if (cachedResponse) {
        console.log('[Service Worker] Retour du cache pour:', url.pathname);
        // Mise à jour du cache en arrière-plan
        fetch(event.request)
          .then((response) => {
            // Ne pas mettre en cache les réponses non réussies
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone de la réponse car une réponse ne peut être consommée qu'une fois
            const responseToCache = response.clone();
            
            // Mise à jour du cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('[Service Worker] Erreur de mise à jour du cache:', error);
              });
              
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Erreur de fetch:', error);
          });
          
        return cachedResponse;
      }
      
      // Si pas en cache, faire la requête réseau
      return fetch(event.request)
        .then((response) => {
          // Ne pas mettre en cache les réponses non réussies
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone de la réponse
          const responseToCache = response.clone();
          
          // Mise en cache
          caches.open(CACHE_NAME)
            .then((cache) => {
              console.log('[Service Worker] Mise en cache de:', url.pathname);
              cache.put(event.request, responseToCache);
            })
            .catch(error => {
              console.error('[Service Worker] Erreur de mise en cache:', error);
            });
            
          return response;
        })
        .catch((error) => {
          console.error('[Service Worker] Erreur de récupération:', error);
          
          // Pour les pages HTML, tenter de retourner la page d'accueil en cas d'échec
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
          
          return new Response('Erreur réseau', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Erreur:', event.message, event.filename, event.lineno);
});

// Gestion des rejets non traités
self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Rejet non traité:', event.reason);
});

// Message du client au service worker
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message reçu:', event.data);
  
  // Si le client demande d'effacer le cache
  if (event.data === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('[Service Worker] Cache effacé');
        // Envoyer une confirmation
        event.source.postMessage('CACHE_CLEARED');
      })
    );
  }
  
  // Si le client demande un ping
  if (event.data === 'PING') {
    event.source.postMessage('PONG');
  }
});

// Notifier que le service worker est prêt
console.log('[Service Worker] Prêt à intercepter les requêtes');