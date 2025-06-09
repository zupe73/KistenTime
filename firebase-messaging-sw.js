// ==========================================================
// Kombinierter Service Worker für Firebase & PWA Caching
// ==========================================================

// ------------------------------------
// TEIL 1: FIREBASE MESSAGING IMPORTE
// ------------------------------------
// Firebase empfiehlt die -compat Versionen für Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// ---------------------------------------
// TEIL 2: FIREBASE MESSAGING LOGIK
// ---------------------------------------
// Hier deine Firebase Konfiguration einfügen
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

// Optional: Hier kannst du auf Push-Nachrichten im Hintergrund lauschen,
// falls du besondere Logik dafür brauchst.
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Anpassen des Benachrichtigungs-Titels oder -Texts, falls nötig
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icon.png' // Beispiel für ein Icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// ---------------------------------------
// TEIL 3: PWA CACHING LOGIK ("Stale-While-Revalidate")
// ---------------------------------------
const CACHE_NAME = 'kistentimer-cache-v2'; // WICHTIG: Version erhöht, um alten Cache sicher zu löschen

// Die "App Shell" - die wichtigsten Dateien, die deine App zum Starten braucht.
const APP_SHELL_URLS = [
  '/',
  '/index.html'
  // Füge hier weitere wichtige Dateien hinzu, falls vorhanden (z.B. /style.css, /app.js)
];

// INSTALL-EVENT: Wird ausgelöst, wenn der neue Worker installiert wird.
// Hier laden wir die App Shell in den Cache.
self.addEventListener('install', event => {
  console.log('[SW] Install-Event. Caching App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

// ACTIVATE-EVENT: Wird ausgelöst, nachdem der Worker installiert wurde.
// Hier löschen wir alte, nicht mehr benötigte Caches.
self.addEventListener('activate', event => {
    console.log('[SW] Activate-Event. Cleaning up old caches...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Wenn der Cache-Name nicht der aktuelle ist, löschen wir ihn.
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


// FETCH-EVENT: Wird für JEDE Netzwerkanfrage ausgelöst (Bilder, CSS, etc.).
// Hier implementieren wir unsere Caching-Strategie.
self.addEventListener('fetch', event => {
  // Wir wenden die Strategie nur auf Anfragen innerhalb unserer eigenen Domain an.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        // 1. "Stale": Versuche, aus dem Cache zu antworten
        return cache.match(event.request).then(cachedResponse => {
          // 2. "While-Revalidate": Im Hintergrund das Netzwerk anfragen
          const fetchPromise = fetch(event.request).then(networkResponse => {
            // Wenn wir eine gültige Antwort bekommen, aktualisieren wir den Cache
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });

          // Gib die gecachte Antwort sofort zurück (falls vorhanden), ansonsten warte auf die Netzwerk-Antwort
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
