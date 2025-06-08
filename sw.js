// sw.js

// Firebase v11 SDKs für den Service Worker importieren
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging.js");

// HIER IHRE FIREBASE-KONFIGURATION ERNEUT EINFÜGEN
const firebaseConfig = {
    apiKey: "AIzaSyCptp989CDyP2I6MrwXdM14WgFvzadEF5k",
    authDomain: "kistentimer.firebaseapp.com",
    projectId: "kistentimer",
    storageBucket: "kistentimer.firebasestorage.app",
    messagingSenderId: "161547195519",
    appId: "1:161547195519:web:3a0d8fa3c90960eaa7db4a"
};

// Firebase im Service Worker initialisieren
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.getMessaging(app);

// Handler für ankommende Push-Nachrichten im Hintergrund
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  
  // payload.notification enthält die Daten, die wir vom Server senden
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './icons/icon-192x192.png'
  };

  // Die Benachrichtigung anzeigen
  self.registration.showNotification(notificationTitle, notificationOptions);
});


// CACHING-LOGIK
const CACHE_NAME = 'kistentimer-cache-v14'; // Neue Version

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://www.soundjay.com/buttons/beep-01a.mp3' 
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            console.log('Opened cache and caching app shell');
            return cache.addAll(urlsToCache);
          })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
          .then(response => {
            // Cache hit - return response
            if (response) {
              return response;
            }
            return fetch(event.request);
          })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
