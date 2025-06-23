import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // تأكد من المسار الصحيح

console.log("Firebase project app name:", auth.app.name);

async function loginAsSupervisor(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const q = query(collection(db, "supervisors"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    console.log("البريد المستخدم:", email, "عدد النتائج:", querySnapshot.size);

    if (!querySnapshot.empty) {
      console.log("✅ مرحبًا بك يا مشرف");
      return userCredential.user.uid;
    } else {
      console.log("❌ هذا الحساب ليس له صلاحية المشرف");
      return null;
    }
  } catch (error) {
    console.error("فشل تسجيل الدخول:", error.message);
    return null;
  }
}

const SupervisorLogin = () => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim();
      const uid = await loginAsSupervisor(trimmedEmail, password);
      if (uid) {
        localStorage.setItem('supervisor-auth', uid);
        navigate('/supervisor-dashboard');
      } else {
        setError('أنت غير مصرح لك بالدخول.');
      }
    } catch (err) {
      setError('فشل في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}
      style={{ minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          maxWidth: '400px',
          width: '100%',
          borderRadius: '15px',
          backgroundColor: darkMode ? '#333' : '#fff',
          color: darkMode ? '#fff' : '#000',
        }}
      >
        <h2 className="mb-4 text-center" style={{ color: darkMode ? '#fff' : '#000' }}>
          تسجيل دخول المشرف
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            {error && (
              <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: darkMode ? '#fff' : '#000' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="أدخل البريد الإلكتروني"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              style={{
                borderRadius: '10px',
                backgroundColor: darkMode ? '#555' : '#fff',
                color: darkMode ? '#fff' : '#000',
                border: darkMode ? '1px solid #777' : '1px solid #ccc',
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: darkMode ? '#fff' : '#000' }}>
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-lg"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  borderRadius: '10px',
                  backgroundColor: darkMode ? '#555' : '#fff',
                  color: darkMode ? '#fff' : '#000',
                  border: darkMode ? '1px solid #777' : '1px solid #ccc',
                  paddingRight: '40px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: darkMode ? '#fff' : '#000'
                }}
                tabIndex={-1}
              >
                {showPassword ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-lg w-100"
            disabled={isLoading}
            style={{
              borderRadius: '10px',
              backgroundColor: darkMode ? '#444' : '#f8f9fa',
              color: darkMode ? '#fff' : '#000',
            }}
          >
            {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupervisorLogin;
