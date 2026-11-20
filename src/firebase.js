import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC3GJMivZzcaNqZ2vw7e_qV_AWKTkp0U5M",
  authDomain: "portal-jpp-kmk.firebaseapp.com",
  projectId: "portal-jpp-kmk",
  storageBucket: "portal-jpp-kmk.firebasestorage.app",
  messagingSenderId: "622680007175",
  appId: "1:622680007175:web:cf3efbc6e687c8a4dbc0a2",
  measurementId: "G-Z77Z8NJL50",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch {
    analytics = null;
  }
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

let messagingPromise = null;
export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(app) : null))
      .catch(() => null);
  }
  return messagingPromise;
}
export const DEVELOPER_EMAILS = [
  "halimhafizhan1059@gmail.com",
  "ffafif719@gmail.com",
  "cochafizan@gmail.com",
  "aleeyafrsya22@gmail.com",
];

export function trackPageView(pathname) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
      send_to: "G-Z77Z8NJL50",
    });
  } else if (analytics) {
    try {
      logEvent(analytics, "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    } catch {
      // Abaikan jika persekitaran tidak menyokong analytics
    }
  }
}

export { app, analytics };
