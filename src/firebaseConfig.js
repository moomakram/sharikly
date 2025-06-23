// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL5IMuSqey5m3IRvDddbE65jgFx3PyWvg",
  authDomain: "sharikly.firebaseapp.com",
  projectId: "sharikly",
  storageBucket: "sharikly.firebasestorage.app",
  messagingSenderId: "772155263704",
  appId: "1:772155263704:web:d9ac2141b2a68ec52c25ad",
  measurementId: "G-W78K2YHH61"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
