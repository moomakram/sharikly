import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// بيانات مشروعك الحقيقية
const firebaseConfig = {
  apiKey: "AIzaSyCL5IMuSqey5m3IRvDddbE65jgFx3PyWvg",
  authDomain: "sharikly.firebaseapp.com",
  projectId: "sharikly",
  storageBucket: "sharikly.appspot.com", // ✅ تأكد إنه .appspot.com
  messagingSenderId: "772155263704",
  appId: "1:772155263704:web:d9ac2141b2a68ec52c25ad",
  measurementId: "G-W78K2YHH61"
};

// تأكد إنك ما تعملش إعادة تهيئة لو التطبيق معمول بالفعل
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
