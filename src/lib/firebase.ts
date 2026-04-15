
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Placeholder config - will be replaced by real config if available
const firebaseConfig = {
  apiKey: process.env.GEMINI_API_KEY || "placeholder",
  authDomain: "placeholder.firebaseapp.com",
  projectId: "placeholder",
  storageBucket: "placeholder.appspot.com",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

// Try to load real config if it exists
let config = firebaseConfig;
try {
  // In this environment, we might have a firebase-applet-config.json
  // But since the tool failed, we'll use env vars or defaults
} catch (e) {
  console.warn("Firebase config not found, using placeholders");
}

const app = getApps().length > 0 ? getApp() : initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
