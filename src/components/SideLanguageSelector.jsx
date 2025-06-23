import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SideLanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const languages = [
    'en', 'ar', 'fr', 'es', 'de', 'zh', 'hi', 'ru', 'ja', 'ko', 'it', 'pt', 'tr', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs'
  ];

  return (
    <div style={{ position: 'fixed', left: isOpen ? 0 : '-200px', top: 0, height: '100%', width: '200px', backgroundColor: '#f8f9fa', transition: 'left 0.3s', overflowY: 'auto', zIndex: 1000 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          right: '-40px',
          top: '20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          padding: '10px',
          cursor: 'pointer',
        }}
      >
        {isOpen ? '❌' : '🌐'}
      </button>
      <h5 style={{ textAlign: 'center', margin: '1rem 0' }}>🌍 Select Language</h5>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {languages.map((lang) => (
          <li key={lang} style={{ margin: '0.5rem 0', textAlign: 'center' }}>
            <button
              onClick={() => changeLanguage(lang)}
              style={{
                backgroundColor: i18n.language === lang ? '#007bff' : '#fff',
                color: i18n.language === lang ? '#fff' : '#000',
                border: '1px solid #007bff',
                borderRadius: '5px',
                padding: '5px 10px',
                cursor: 'pointer',
                width: '80%',
              }}
            >
              {lang.toUpperCase()}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideLanguageSelector;
