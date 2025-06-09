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


// ========================================================
// HIER SIND DIE ÄNDERUNGEN FÜR DIE BENACHRICHTIGUNGEN
// ========================================================

messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // ÄNDERUNG: Wir lesen Titel und Text jetzt aus 'payload.data'
  // anstatt aus 'payload.notification'.
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: './assets/icon.png', // Pfad zu deinem App-Icon
    // NEU: Wir fügen Daten hinzu, damit wir wissen, was beim Klick passieren soll.
    data: {
      url: self.location.origin + '/KistenTime/' // URL, die beim Klick geöffnet wird.
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// NEU: Event-Listener, der auf Klicks auf die Benachrichtigung reagiert.
self.addEventListener('notificationclick', event => {
  // Benachrichtigung schließen
  event.notification.close();

  // Die in den 'data'-Optionen gespeicherte URL in einem neuen Fenster/Tab öffnen.
  // Wenn die PWA schon offen ist, wird sie in den Vordergrund geholt.
  event.waitUntil(clients.openWindow(event.notification.data.url));
});


// ========================================================
// PWA CACHING LOGIK (mit erhöhter Versionsnummer)
// ========================================================

// WICHTIG: Version erhöht, um den Browser zu zwingen, den neuen Service Worker zu laden.
const CACHE_NAME = 'kistentimer-cache-v4';

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
