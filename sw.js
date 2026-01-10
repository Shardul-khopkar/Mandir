// Service Worker for Sales Tracker PWA
// Smart caching with offline support and performance optimization

const CACHE_NAME = 'stall-entry-v5.0';
const RUNTIME_CACHE = 'stall-entry-runtime-v1';
const API_CACHE = 'stall-entry-api-v1';

const urlsToCache = [
  './',
  './manifest.json'
];

// Install event - cache static assets aggressively
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force this new SW to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - optimized caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Firebase API calls - network first with API cache
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const cache = url.hostname.includes('firebase') ? API_CACHE : CACHE_NAME;
            return caches.open(cache).then((c) => {
              c.put(req, response.clone());
              return response;
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(req);
        })
    );
    return;
  }

  // HTML documents - network first with stale-while-revalidate
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, response.clone());
              return response;
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(req);
        })
    );
    return;
  }

  // CSS, JS, fonts - cache first with network fallback
  if (req.destination === 'style' || req.destination === 'script' || req.destination === 'font') {
    event.respondWith(
      caches.match(req)
        .then((response) => {
          if (response) {
            // Update cache in background
            fetch(req).then((freshResponse) => {
              if (freshResponse && freshResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(req, freshResponse);
                });
              }
            });
            return response;
          }
          return fetch(req).then((response) => {
            if (response && response.status === 200) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, response.clone());
                return response;
              });
            }
            return response;
          });
        })
        .catch(() => fetch(req))
    );
    return;
  }

  // Images - cache with fallback
  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req)
        .then((response) => {
          return response || fetch(req).then((response) => {
            if (response && response.status === 200) {
              const cacheClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, cacheClone);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Default - network first
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200) {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(req, response.clone());
            return response;
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(req);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all open clients immediately
});

// Background sync for offline data submission (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sales-data') {
    event.waitUntil(
      clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          clients[0].postMessage({
            type: 'SYNC_SALES_DATA'
          });
        }
      })
    );
  }
});
