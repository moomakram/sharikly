import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export const loginUser = async (email, password, userType) => {
  try {
    const emailToCheck = email.trim();
    const userCredential = await signInWithEmailAndPassword(auth, emailToCheck, password);

    const targetCollection = userType === "admin" ? "admins" : "supervisors";
    const q = query(collection(db, targetCollection), where("email", "==", emailToCheck));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert(`✅ Welcome, ${userType}`);
      return userCredential.user.uid;
    } else {
      alert("❌ Not authorized as " + userType);
      return null;
    }
  } catch (error) {
    console.error("Login failed:", error); // أضف هذا السطر
    alert("❌ Login failed: " + error.message);
    return null;
  }
};
