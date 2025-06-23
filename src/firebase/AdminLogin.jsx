import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { loginAdmin } from '../firebase/admin'; // استيراد loginAdmin

const AdminLogin = () => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const uid = await loginAdmin(email, password); // استخدام loginAdmin
      localStorage.setItem('admin-auth', uid);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message === 'unauthorized'
        ? 'أنت غير مصرح لك بالدخول.'
        : 'فشل في تسجيل الدخول');
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
          تسجيل دخول الأدمن
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
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                borderRadius: '10px',
                backgroundColor: darkMode ? '#555' : '#fff',
                color: darkMode ? '#fff' : '#000',
                border: darkMode ? '1px solid #777' : '1px solid #ccc',
              }}
            />
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

export default AdminLogin;
