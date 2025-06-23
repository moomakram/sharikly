import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AdminSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      alert('يرجى إدخال البريد وكلمة المرور');
      return;
    }
    if (cleanPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف أو أكثر');
      return;
    }
    try {
      const auth = getAuth();
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      await addDoc(collection(db, 'admins'), {
        email: cleanEmail,
        role: 'admin',
        uid: userCred.user.uid,
        createdAt: new Date(),
      });
      setEmail('');
      setPassword('');
      alert('تم تسجيل الأدمن بنجاح');
    } catch (e) {
      alert('فشل تسجيل الأدمن: ' + e.message);
    }
  };

  return (
    <div className="container py-4">
      <h3>تسجيل أدمن جديد</h3>
      <div className="mb-3">
        <input
          type="email"
          placeholder="بريد الأدمن"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="form-control d-inline-block w-auto"
        />
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="كلمة المرور"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="form-control d-inline-block w-auto ms-2"
          />
          <button
            type="button"
            className="btn btn-outline-secondary ms-2"
            style={{ height: 38 }}
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? "إخفاء" : "إظهار"}
          </button>
        </div>
        <button className="btn btn-success ms-2" onClick={handleSignUp}>تسجيل أدمن جديد</button>
      </div>
    </div>
  );
};

export default AdminSignUp;
