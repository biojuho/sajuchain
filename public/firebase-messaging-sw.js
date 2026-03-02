importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace these inline OR inject via build step
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// NOTE: Service worker context cannot access process.env directly. 
// For production, consider using a Webpack/Next.js plugin to inject these values during build,
// or carefully hardcode public non-sensitive keys here.

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Background message handler
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Default SajuChain B&W Icon
    const notificationTitle = payload.notification?.title || 'SajuChain 알림';
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/icon512_maskable.png', 
      badge: '/window.svg',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log('Firebase App already initialized or failed: ', error);
}
