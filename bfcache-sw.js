/**
 * Service Worker optimisé pour Next.js
 * Gère le cache et prend en charge les stratégies de mise en cache efficaces
 * Évite les erreurs avec les URLs non-HTTP et les extensions Chrome
 */

const CACHE_NAME = 'sos-cache-v1';

// Liste des URLs à mettre en cache de manière proactive (lors de l'installation)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/favicon.ico',
  '/manifest.json',
  '/offline.html'  // Page affichée quand l'utilisateur est hors ligne
];

// Liste des types de fichiers à mettre en cache
const CACHEABLE_TYPES = [
  'document',
  'script',
  'style',
  'image',
  'font'
];

/**
 * Vérifie si une requête est éligible pour la mise en cache
 * @param {Request|string} request - Requête ou URL à vérifier
 * @returns {boolean} - true si la requête peut être mise en cache
 */
function isCacheable(request) {
  // Vérifier si la requête a une méthode GET (seule méthode supportée pour le cache)
  if (request.method && request.method !== 'GET') {
    return false;
  }

  let url;
  try {
    // Normaliser l'entrée en URL
    url = request.url ? new URL(request.url) : new URL(request);
  } catch (e) {
    console.error('URL invalide:', request);
    return false;
  }

  // Exclure les URLs qui ne sont pas HTTP/HTTPS (comme chrome-extension://)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  // Exclure les API calls (sauf si explicitement configuré pour être mis en cache)
  if (url.pathname.startsWith('/api/') && !url.pathname.includes('/api/static/')) {
    return false;
  }

  // Exclure les requêtes de vérification de Service Worker
  if (url.pathname.includes('sw.js') || url.pathname.includes('workbox')) {
    return false;
  }

  return true;
}

/**
 * Déterminer si une réponse est valide pour la mise en cache
 * @param {Response} response - Réponse à vérifier
 * @returns {boolean} - true si la réponse peut être mise en cache
 */
function isResponseCacheable(response) {
  // Ne pas mettre en cache les réponses d'erreur
  if (!response || response.status !== 200) {
    return false;
  }

  // Ne pas mettre en cache les réponses sans CORS
  const type = response.headers.get('content-type');
  if (type && type.includes('application/json') && !response.headers.get('access-control-allow-origin')) {
    return false;
  }

  return true;
}

/**
 * Gestion de l'installation du Service Worker
 * Pré-mise en cache des ressources essentielles
 */
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pré-mise en cache des ressources');
        // Mettre en cache les URLs essentielles
        return cache.addAll(PRECACHE_URLS.filter(url => url));
      })
      .then(() => {
        // Activer immédiatement le Service Worker sans attendre la fermeture des onglets
        return self.skipWaiting();
      })
  );
});

/**
 * Gestion de l'activation du Service Worker
 * Suppression des anciens caches
 */
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[Service Worker] Suppression du cache obsolète:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Prendre le contrôle de tous les clients sans recharger la page
        return self.clients.claim();
      })
  );
});

/**
 * Gestion des requêtes réseau
 * Stratégie: Network First avec fallback vers le cache
 */
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET ou non-HTTP/HTTPS
  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') {
    return;
  }
  
  // Ignorer les requêtes chrome-extension://
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Vérifier si la requête est éligible pour la mise en cache
  if (!isCacheable(event.request)) {
    return;
  }

  // Stratégie Network First, avec fallback vers le cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Vérifier si la réponse est valide
        if (!isResponseCacheable(response)) {
          return response;
        }

        // Mettre en cache la réponse pour les futures requêtes
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            try {
              if (isCacheable(event.request)) {
                cache.put(event.request, clonedResponse);
              }
            } catch (error) {
              console.error('[Service Worker] Erreur de mise en cache:', error);
            }
          });

        return response;
      })
      .catch(() => {
        // Si le réseau échoue, essayer de servir depuis le cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Si la requête est pour une page, servir la page hors ligne
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Pour les autres ressources, retourner une réponse d'erreur
            return new Response('Ressource non disponible hors ligne', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

/**
 * Gestion des messages du client
 * Permet de contrôler le Service Worker depuis l'application
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        console.log('[Service Worker] Cache effacé avec succès');
        event.ports[0].postMessage({ result: 'success' });
      })
      .catch(error => {
        console.error('[Service Worker] Erreur lors de l\'effacement du cache:', error);
        event.ports[0].postMessage({ result: 'error', message: error.toString() });
      });
  }
});

/**
 * Gestion de la synchronisation en arrière-plan
 * Utile pour les opérations différées quand l'utilisateur est hors ligne
 */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncAlerts());
  }
});

/**
 * Fonction pour synchroniser les alertes en arrière-plan
 */
async function syncAlerts() {
  try {
    const db = await openDB();
    const pendingAlerts = await db.getAll('pendingAlerts');
    
    for (const alert of pendingAlerts) {
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
        
        if (response.ok) {
          await db.delete('pendingAlerts', alert.id);
        }
      } catch (error) {
        console.error('[Service Worker] Échec de synchronisation de l\'alerte:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Erreur de synchronisation des alertes:', error);
  }
}

/**
 * Fonction pour ouvrir la base de données IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sos-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingAlerts')) {
        db.createObjectStore('pendingAlerts', { keyPath: 'id' });
      }
    };
  });
}