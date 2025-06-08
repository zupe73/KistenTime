// sw.js - FINALE VERSION MIT KOMPATIBILITÄTS-BIBLIOTHEKEN

// ======================================================================
// KORREKTUR HIER: Wir verwenden die "-compat" Versionen der Skripte
// ======================================================================
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

// Ihre Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyCptp989CDyP2I6MrwXdM14WgFvzadEF5k",
    authDomain: "kistentimer.firebaseapp.com",
    projectId: "kistentimer",
    storageBucket: "kistentimer.firebasestorage.app",
    messagingSenderId: "161547195519",
    appId: "1:161547195519:web:3a0d8fa3c90960eaa7db4a"
};

// Firebase im Service Worker initialisieren
firebase.initializeApp(firebaseConfig);

// Der Messaging-Dienst. Mit den "-compat" Skripten ist dieser Aufruf korrekt.
const messaging = firebase.messaging();

// in sw.js -> messaging.onBackgroundMessage

messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './icons/icon-192x192.png',
    vibrate: [200, 100, 200], // Vibration für mobile Geräte
    // NEU: Wir fügen Daten zur Benachrichtigung hinzu
    data: {
      url: 'https://zupe73.github.io/KistenTime/' // Die URL, die bei Klick geöffnet werden soll. '/' ist die Startseite.
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


const CACHE_NAME = 'kistentimer-cache-v17'; // Version erhöht!
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './assets/beep.mp3' // Neuer, lokaler Pfad
];

self.addEventListener('install', event => { 
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker Caching App Shell...');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
          .then(response => {
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
// in sw.js

// NEU: Event-Listener für Klicks auf Benachrichtigungen
self.addEventListener('notificationclick', event => {
  console.log('[sw.js] Notification click Received.');

  // Benachrichtigung nach dem Klick schließen
  event.notification.close();
  
  // URL aus den Daten der Benachrichtigung auslesen
  const targetUrl = event.notification.data.url;

  // Verhindert, dass der Service Worker beendet wird, bevor das neue Fenster geöffnet ist
  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {
      // Prüfen, ob ein Fenster der App bereits geöffnet ist
      for (const client of clientList) {
        // Wenn ein Fenster gefunden wird, wird es fokussiert
        if ('focus' in client) {
          console.log('App window found, focusing it.');
          return client.focus();
        }
      }
      // Wenn kein Fenster gefunden wurde, wird ein neues geöffnet
      if (clients.openWindow) {
        console.log('No app window found, opening a new one.');
        return clients.openWindow(targetUrl);
      }
    })
  );
});
