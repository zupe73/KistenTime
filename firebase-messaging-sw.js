importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging.js");
const firebaseConfig = {
    apiKey: "AIzaSyCptp989CDyP2I6MrwXdM14WgFvzadEF5k",
    authDomain: "kistentimer.firebaseapp.com",
    projectId: "kistentimer",
    storageBucket: "kistentimer.firebasestorage.app",
    messagingSenderId: "161547195519",
    appId: "1:161547195519:web:3a0d8fa3c90960eaa7db4a"
};
// Firebase initialisieren
initializeApp(firebaseConfig);
const messaging = getMessaging();

// Optional: Ein Handler, wenn eine Nachricht ankommt, während die App im Hintergrund ist.
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});