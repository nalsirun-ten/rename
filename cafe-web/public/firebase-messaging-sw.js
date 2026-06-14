importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "dentapp-18e25",
  appId: "1:951534054649:web:8343a366615807a4a44628",
  storageBucket: "dentapp-18e25.firebasestorage.app",
  apiKey: "AIzaSyBP6nTP_3gXXzmuWnpINNCQLbQIihMd7bo",
  authDomain: "dentapp-18e25.firebaseapp.com",
  messagingSenderId: "951534054649",
  measurementId: "G-7BDTPNQ7G3",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// ── App-icon badge (Badging API), shared with the window ──
// iOS does not badge a PWA icon automatically from a push, so we set it here.
// The count is persisted in IndexedDB ('gc-badge') so it survives between
// pushes while the app is closed; the window resets the same key to the real
// unread count when it opens (see src/lib/appBadge.ts).
const BADGE_DB = 'gc-badge';
const BADGE_STORE = 'kv';
const BADGE_KEY = 'count';

function badgeDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BADGE_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(BADGE_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function badgeGet() {
  return badgeDb().then((db) => new Promise((resolve) => {
    const tx = db.transaction(BADGE_STORE, 'readonly');
    const req = tx.objectStore(BADGE_STORE).get(BADGE_KEY);
    req.onsuccess = () => { resolve(req.result || 0); db.close(); };
    req.onerror = () => { resolve(0); db.close(); };
  })).catch(() => 0);
}

function badgeSet(value) {
  return badgeDb().then((db) => new Promise((resolve) => {
    const tx = db.transaction(BADGE_STORE, 'readwrite');
    tx.objectStore(BADGE_STORE).put(value, BADGE_KEY);
    tx.oncomplete = () => { resolve(); db.close(); };
    tx.onerror = () => { resolve(); db.close(); };
  })).catch(() => {});
}

async function bumpAppBadge() {
  try {
    const next = (await badgeGet()) + 1;
    await badgeSet(next);
    if (self.navigator && 'setAppBadge' in self.navigator) {
      await self.navigator.setAppBadge(next);
    }
  } catch (e) {
    console.warn('[firebase-messaging-sw.js] badge update failed', e);
  }
}

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Do not call self.registration.showNotification here because
  // Firebase SDK automatically displays messages that contain a "notification" payload.
});

// Bump the app-icon badge on every incoming push. We use the raw 'push' event
// (not onBackgroundMessage) because it fires reliably on every platform incl.
// iOS, and event.waitUntil() keeps the worker alive until the badge is actually
// written — onBackgroundMessage gave neither guarantee. The Firebase SDK's own
// push listener still shows the notification; this listener only sets the badge.
self.addEventListener('push', (event) => {
  event.waitUntil(bumpAppBadge());
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
