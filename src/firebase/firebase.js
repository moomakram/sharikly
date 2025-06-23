// firebase.js

// Import necessary functions from Firebase SDK
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL5IMuSqey5m3IRvDddbE65jgFx3PyWvg",
  authDomain: "sharikly.firebaseapp.com",
  projectId: "sharikly",
  storageBucket: "sharikly.appspot.com", // ✅ تعديل: "firebasestorage.app" خاطئة
  messagingSenderId: "772155263704",
  appId: "1:772155263704:web:d9ac2141b2a68ec52c25ad",
  measurementId: "G-W78K2YHH61"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null; // ✅ تجنب تشغيل analytics في بيئة SSR

// Export services
export { app, db, auth, storage, analytics };
