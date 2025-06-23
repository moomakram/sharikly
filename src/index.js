import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

window.alert = function() {
  // يمكنك هنا أيضًا تسجيل رسالة في الكونسول إذا أردت
  // console.log('تم منع ظهور alert');
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
