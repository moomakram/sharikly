import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const adminDoc = await getDoc(doc(db, 'admins', uid));
      if (adminDoc.exists()) {
        localStorage.setItem('admin-auth', uid);
        navigate('/admin-dashboard');
      } else {
        setError('أنت غير مصرح لك بالدخول.');
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('هذا البريد غير مسجل.');
      } else if (err.code === 'auth/wrong-password') {
        setError('كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني غير صالح.');
      } else {
        setError('فشل في تسجيل الدخول. حاول مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-primary">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
        <h2 className="mb-4 text-center text-white">تسجيل دخول الأدمن</h2>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-white">البريد الإلكتروني</label>
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="أدخل البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ borderRadius: '10px' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-white">كلمة المرور</label>
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ borderRadius: '10px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-light btn-lg w-100"
            disabled={isLoading}
            style={{ borderRadius: '10px' }}
          >
            {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
