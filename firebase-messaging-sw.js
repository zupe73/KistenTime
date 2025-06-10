// ==========================================================
// Kombinierter Service Worker für Firebase & PWA Caching
// ==========================================================

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

// ========================================================
// ANGEPASSTE LOGIK FÜR BENACHRICHTIGUNGEN
// ========================================================

messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received data-only message: ', payload);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    vibrate: [200, 100, 200],
    data: {
      url: payload.data.url
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// ========================================================
// PWA CACHING LOGIK
// ========================================================

// WICHTIG: Version erhöht, um den Browser zu zwingen, den neuen Service Worker zu laden.
const CACHE_NAME = 'kistentimer-cache-v12';

const APP_SHELL_URLS = [
  './',
  './index.html'
];

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
