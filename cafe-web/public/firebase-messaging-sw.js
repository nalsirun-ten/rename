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

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Do not call self.registration.showNotification here because 
  // Firebase SDK automatically displays messages that contain a "notification" payload.
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
