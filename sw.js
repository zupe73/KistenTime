const CACHE_NAME = 'maschine-timer-app-v2'; // Cache-Name aktualisieren, um neue SW-Version zu erzwingen
const urlsToCache = [
  './', // Die Wurzel der App (index.html)
  './index.html',
  './manifest.json',
  './sw.js', // Den Service Worker selbst cachen
  '/icons/icon-192x192.png', // Pfade zu den Icons
  '/icons/icon-512x512.png'
  // Füge hier weitere statische Assets hinzu, die du cachen möchtest (z.B. externe CSS-Dateien, wenn du welche hast)
];

// Installation: Caching der statischen Assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Cache addAll failed:', error);
      })
  );
});

// Fetch: Abfangen von Netzwerk-Anfragen und Bereitstellen aus dem Cache oder Netzwerk
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache Hit - sofortige Rückgabe
        if (response) {
          return response;
        }
        // Kein Cache Hit - vom Netzwerk holen
        return fetch(event.request);
      })
  );
});

// Aktivierung: Bereinigen alter Caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});