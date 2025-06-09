// ==========================================================
// Kombinierter Service Worker für Firebase & PWA Caching
// ==========================================================

// ... Dein Firebase Import- und Initialisierungs-Code bleibt unverändert ...
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCptp989CDyP2I6MrwXdM14WgFvzadEF5k",
    authDomain: "kistentimer.firebaseapp.com",
    projectId: "kistentimer",
    storageBucket: "kistentimer.appspot.com",
    messagingSenderId: "161547195519",
    appId: "1:161547195519:web:3a0d8fa3c90960eaa7db4a"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './assets/icon.png' // Beispiel-Icon, Pfad anpassen falls nötig
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});


// ---------------------------------------
// TEIL 3: PWA CACHING LOGIK
// ---------------------------------------
const CACHE_NAME = 'kistentimer-cache-v2';

// V V V HIER IST DIE KORREKTUR V V V
const APP_SHELL_URLS = [
  './',
  './index.html'
];
// ^ ^ ^ HIER IST DIE KORREKTUR ^ ^ ^

self.addEventListener('install', event => {
  console.log('[SW] Install-Event. Caching App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activate-Event. Cleaning up old caches...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
