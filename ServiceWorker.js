// Version de cache pour faciliter les mises à jour
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `sos-cache-${CACHE_VERSION}`;

// Liste des ressources à mettre en cache immédiatement
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png',
  '/images/sos-button.png',
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache préchargé avec succès');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('sos-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Suppression de l\'ancien cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fonction pour vérifier si une URL est valide pour la mise en cache
function isValidCacheUrl(url) {
  try {
    const urlObj = new URL(url);
    return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
           !urlObj.href.includes('chrome-extension://');
  } catch (e) {
    return false;
  }
}

// Fonction pour déterminer si une requête est une requête d'API
function isApiRequest(url) {
  return url.includes('/api/') || 
         url.includes('n8n.api') || 
         url.includes('webhook');
}

// Gestionnaire de requêtes fetch
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Ignorer les requêtes non HTTP/HTTPS ou extensions Chrome
  if (!isValidCacheUrl(request.url)) {
    return;
  }
  
  // Stratégie différente pour les API vs les ressources statiques
  if (isApiRequest(request.url)) {
    // Stratégie Network-first pour les API
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            throw new Error('Erreur réseau');
          }
          return response;
        })
        .catch(() => {
          // Fallback pour les API en cas d'échec réseau
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Si aucune réponse en cache n'est disponible, renvoyer une réponse d'erreur
              return new Response(
                JSON.stringify({ error: 'Réseau indisponible' }),
                { 
                  status: 503, 
                  headers: { 'Content-Type': 'application/json' } 
                }
              );
            });
        })
    );
  } else {
    // Stratégie Cache-first pour les ressources statiques
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request).then(networkResponse => {
            // Ne mettre en cache que les réponses valides
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              
              caches.open(CACHE_NAME).then(cache => {
                if (isValidCacheUrl(request.url)) {
                  cache.put(request, responseToCache);
                }
              });
            }
            
            return networkResponse;
          }).catch(() => {
            // Pour les pages HTML, servir la page hors ligne
            if (request.headers.get('Accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // Pour les images, retourner une image placeholder
            if (request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/images/placeholder.png');
            }
            
            // Par défaut, renvoyer une erreur
            return new Response('Ressource non disponible', { 
              status: 404, 
              headers: { 'Content-Type': 'text/plain' } 
            });
          });
        })
    );
  }
});