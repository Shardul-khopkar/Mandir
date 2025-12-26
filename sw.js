// Service Worker for Sales Tracker PWA
// Smart caching with offline support

const CACHE_NAME = 'sales-tracker-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './app.js',
  './style.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force this new SW to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - cache first for assets, network with fallback for dynamic content
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // For HTML documents - try network first, fallback to cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          // Cache the fresh response
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Offline - use cached HTML
          return caches.match(req);
        })
    );
    return;
  }

  // For CSS, JS, and other assets - cache first
  event.respondWith(
    caches.match(req)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(req);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all open clients immediately
});
