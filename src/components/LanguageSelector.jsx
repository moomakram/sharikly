import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const languages = [
  { code: 'ar', name: 'العربية' },
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'zh', name: '中文' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'sv', name: 'Svenska' },
  { code: 'no', name: 'Norsk' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'pl', name: 'Polski' },
  { code: 'cs', name: 'Čeština' }
];

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showArrow, setShowArrow] = useState(true);

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setOpen(false);
  };

  useEffect(() => {
    const arrowTimer = setTimeout(() => setShowArrow(false), 3000); // إخفاء السهم بعد 3 ثوانٍ
    return () => clearTimeout(arrowTimer); // تنظيف المؤقت عند إلغاء المكون
  }, []);

  useEffect(() => {
    if (open) {
      console.log('Menu opened'); // تحقق من فتح القائمة
      const closeTimer = setTimeout(() => {
        console.log('Menu closed automatically'); // تحقق من إغلاق القائمة تلقائيًا
        setOpen(false);
      }, 10000); // إغلاق القائمة بعد 10 ثوانٍ
      return () => clearTimeout(closeTimer); // تنظيف المؤقت عند إغلاق القائمة يدويًا
    }
  }, [open]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      position: 'relative',
      marginLeft: 16
    }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* زر تغيير اللغة */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: 40,
            height: 40,
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 20,
            position: 'relative',
          }}
          title={t('choose_language')}
        >
          🌐
        </button>

        {/* السهم الذي يشير إلى الزر */}
        {showArrow && (
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '-50px',
            transform: 'translateY(-50%)',
            fontSize: '2rem',
            color: '#ff5722',
            animation: 'pulse 1s infinite',
          }}>
            ⇦
          </div>
        )}
      </div>

      {/* القائمة المنسدلة */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 48,
          left: 0,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          minWidth: 140,
          zIndex: 1000,
          padding: '8px 0'
        }}>
          <div style={{ fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 6 }}>
            {t('choose_language')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 200, overflowY: 'auto' }}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                style={{
                  background: i18n.language === lang.code ? '#007bff' : 'transparent',
                  color: i18n.language === lang.code ? '#fff' : '#222',
                  border: 'none',
                  padding: '8px 0',
                  cursor: 'pointer',
                  fontWeight: i18n.language === lang.code ? 'bold' : 'normal'
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;