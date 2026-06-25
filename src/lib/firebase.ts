import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration sécurisée : lit les variables injectées par Vercel en production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Évite d'initialiser Firebase plusieurs fois au cours des rechargements Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Exportation des modules prêts à l'emploi pour tes composants UI
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
