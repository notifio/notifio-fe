/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: self.__FIREBASE_CONFIG__?.apiKey,
  authDomain: self.__FIREBASE_CONFIG__?.authDomain,
  projectId: self.__FIREBASE_CONFIG__?.projectId,
  messagingSenderId: self.__FIREBASE_CONFIG__?.messagingSenderId,
  appId: self.__FIREBASE_CONFIG__?.appId,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || 'Notifio';
  const body = data.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/icons/notifio-192.png',
    badge: '/icons/notifio-badge.png',
    data: { deepLink: data.deepLink },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const deepLink = event.notification.data?.deepLink || '/';
  event.waitUntil(clients.openWindow(deepLink));
});
