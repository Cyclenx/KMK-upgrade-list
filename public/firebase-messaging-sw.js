/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyC3GJMivZzcaNqZ2vw7e_qV_AWKTkp0U5M",
  authDomain: "portal-jpp-kmk.firebaseapp.com",
  projectId: "portal-jpp-kmk",
  storageBucket: "portal-jpp-kmk.firebasestorage.app",
  messagingSenderId: "622680007175",
  appId: "1:622680007175:web:cf3efbc6e687c8a4dbc0a2",
  measurementId: "G-Z77Z8NJL50",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload?.notification?.title ||
    payload?.data?.title ||
    "Portal Rasmi JPP KMK";

  const notificationBody =
    payload?.notification?.body ||
    payload?.data?.body ||
    "Anda mempunyai makluman baharu daripada JPP KMK.";

  const targetUrl =
    payload?.fcmOptions?.link ||
    payload?.data?.url ||
    "/live-board";

  const notificationOptions = {
    body: notificationBody,
    icon: "/logo-jpp.png",
    badge: "/logo-jpp.png",
    data: {
      url: targetUrl,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl = event.notification?.data?.url || "/";
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            if ("navigate" in client && client.url !== targetUrl) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
        return undefined;
      })
  );
});
