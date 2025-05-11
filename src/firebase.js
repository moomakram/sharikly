// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// إعدادات مشروعك من Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBeDeafvlwY-fzJiGNDnjVvjXkKycXKRIs",
  authDomain: "sharikly-project.firebaseapp.com",
  projectId: "sharikly-project",
  storageBucket: "sharikly-project.firebasestorage.app",
  messagingSenderId: "713478178692",
  appId: "1:713478178692:web:a1ea69a9654ff8b60a3fd1",
  measurementId: "G-QBTH4L6TD0"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تهيئة الخدمات
const db = getFirestore(app);
const auth = getAuth(app);

// تصديرهم للاستخدام في الملفات الأخرى
export { db, auth };
