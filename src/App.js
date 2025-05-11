import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Programming from './pages/Programming';
import UIUX from './pages/UIUX';
import Graphic from './pages/Graphic';
import VideoEditing from './pages/VideoEditing';
import Engineering from './pages/Engineering';
import AdminMessages from './pages/AdminMessages';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminChat from './pages/AdminChat';
import AdminRequests from './pages/AdminRequests';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programming" element={<Programming />} />
        <Route path="/uiux" element={<UIUX />} />
        <Route path="/graphic" element={<Graphic />} />
        <Route path="/video" element={<VideoEditing />} />
        <Route path="/engineering" element={<Engineering />} />
        <Route path="/admin/chat/:chatId" element={<AdminChat />} />

        {/* ✅ حماية صفحات الأدمن */}
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
      </Routes>
    </Router>
  );
}

export default App;
