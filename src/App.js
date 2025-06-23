import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // تأكد من استيراد Navbar بشكل صحيح
import DarkModeToggle from './components/DarkModeToggle';
import Home from './pages/Home';
import Programming from './pages/Programming';
import UIUX from './pages/UIUX';
import Graphics from './pages/Graphics';
import Video from './pages/Video';
import Engineering from './pages/Engineering';
import AdminMessages from './pages/AdminMessages';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminChat from './pages/AdminChat';
import AdminRequests from './pages/AdminRequests';
import SupervisorLogin from './pages/SupervisorLogin'; // استيراد صفحة تسجيل دخول المشرف
import SupervisorDashboard from './pages/SupervisorDashboard'; // لوحة تحكم المشرف
import Graphic from './pages/Graphic'; // Import the Graphic component
import AdminsManager from './pages/AdminsManager'; // Import the AdminsManager component
import i18n from './i18n'; // استيراد مكتبة الترجمة

// Context API for Dark Mode
export const DarkModeContext = createContext();

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  useEffect(() => {
    const dynamicSentence = i18n.t('dynamic_sentence');
  }, []);

  useEffect(() => {
    const workHadith = i18n.t('work_hadith');
  }, []);

  const changeLanguage = (lang) => {
    console.log(`Language changed to: ${lang}`);
    i18n.changeLanguage(lang); // تغيير اللغة
    // إزالة إعادة تحميل الصفحة
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <Router>
        {/* عرض Navbar */}
        <Navbar darkMode={darkMode} changeLanguage={changeLanguage} />
        <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programming" element={<Programming />} />
          <Route path="/uiux" element={<UIUX />} />
          <Route path="/graphics" element={<Graphics />} />
          <Route path="/graphic" element={<Graphic />} /> {/* Add this route */}
          <Route path="/video" element={<Video />} />
          <Route path="/engineering" element={<Engineering />} />
          <Route path="/admin/chat/:chatId" element={<AdminChat />} />
          <Route
            path="/admin/messages"
            element={
              <ProtectedAdminRoute>
                <AdminMessages />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedAdminRoute>
                <AdminRequests />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/supervisor-login" element={<SupervisorLogin />} /> {/* مسار تسجيل دخول المشرف */}
          <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} /> {/* لوحة تحكم المشرف */}
          <Route path="/admins-manager" element={<AdminsManager />} /> {/* Add this route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} /> {/* Add a fallback route for unmatched paths */}
        </Routes>
      </Router>
    </DarkModeContext.Provider>
  );
}

export default App;