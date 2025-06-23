import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Typewriter } from 'react-simple-typewriter';
import { FaBars } from 'react-icons/fa';

const Navbar = () => {
  const { darkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);

  const navbarStyle = darkMode
    ? { background: 'linear-gradient(45deg, #23272f, #3a3f47)', color: 'white' }
    : { background: 'linear-gradient(45deg, #0A1F44, rgba(10,31,68,0))', color: 'white' };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const languages = [
    { code: 'ar', label: 'العربية' },
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'it', label: 'Italiano' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'ru', label: 'Русский' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'zh', label: '中文' },
    { code: 'pt', label: 'Português' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'sv', label: 'Svenska' },
    { code: 'no', label: 'Norsk' },
    { code: 'da', label: 'Dansk' },
    { code: 'fi', label: 'Suomi' },
    { code: 'pl', label: 'Polski' },
    { code: 'cs', label: 'Čeština' }
  ];

  // إغلاق المودال عند الضغط خارجها
  React.useEffect(() => {
    if (!modalOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest('.navbar-modal-content')) setModalOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modalOpen]);

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark dark-mode' : 'navbar-light'} shadow-sm py-3`}
        style={navbarStyle}
      >
        <div className="container">
          {/* كل العناصر في صف واحد مع التفاف تلقائي للشاشات الصغيرة */}
          <div
            className="d-flex d-lg-none align-items-center"
            style={{
              gap: 10,
              width: '100%',
              flexWrap: 'wrap',
              minHeight: 60
            }}
          >
            {/* زر الهامبرجر */}
            <button
              className="btn btn-link"
              style={{ color: '#fff', fontSize: 22, padding: 0, flexShrink: 0 }}
              onClick={() => setModalOpen(true)}
              aria-label="القائمة"
            >
              <FaBars />
            </button>
            {/* زر اللغة */}
            <div className="dropdown language-dropdown" style={{ margin: 0, flexShrink: 0 }}>
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="languageDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  minWidth: 36,
                  height: 32,
                  fontSize: 14,
                  padding: '2px 8px'
                }}
              >
                {i18n.language.toUpperCase()}
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end language-scroll"
                aria-labelledby="languageDropdown"
              >
                {languages.map((lang) => (
                  <li key={lang.code}>
                    <button
                      className="dropdown-item"
                      onClick={() => changeLanguage(lang.code)}
                    >
                      {lang.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* الشعار */}
            <span
              className="navbar-brand fw-bold mb-0"
              style={{ color: '#fff', fontSize: 20, marginLeft: 8, flexShrink: 0 }}
            >
              Sharikly
            </span>
            {/* الجملة الديناميكية */}
            <span
              style={{
                whiteSpace: 'normal',
                fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
                textAlign: 'center',
                flexBasis: '100%',
                flexGrow: 1,
                marginTop: 4,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              <Typewriter
                words={[t('navbar_tagline')]}
                loop={1}
                typeSpeed={50}
                deleteSpeed={30}
                delaySpeed={1000}
              />
            </span>
          </div>

          {/* الشعار للشاشات الكبيرة */}
          <Link className="navbar-brand fw-bold d-none d-lg-block" to="/" style={{ marginLeft: '0' }}>
            Sharikly
          </Link>

          {/* النص الديناميكي للشاشات الكبيرة فقط */}
          <div className="flex-grow-1 d-none d-lg-flex justify-content-center align-items-center">
            <span
              style={{
                whiteSpace: 'normal',
                fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
                textAlign: 'center',
              }}
            >
              <Typewriter
                words={[t('navbar_tagline')]}
                loop={1}
                typeSpeed={50}
                deleteSpeed={30}
                delaySpeed={1000}
              />
            </span>
          </div>

          {/* روابط الدخول للشاشات الكبيرة فقط */}
          <div className="d-none d-lg-flex gap-3 align-items-center">
            <Link
              className="nav-link"
              to="/admin-login"
              style={{ color: 'gray', fontWeight: 'bold' }}
            >
              {t('admin_login')}
            </Link>
            <Link
              className="nav-link"
              to="/supervisor-login"
              style={{ color: 'gray', fontWeight: 'bold' }}
            >
              {t('supervisor_login')}
            </Link>
          </div>
        </div>

        {/* المودال المنبثق للشاشات الصغيرة */}
        {modalOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.25)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                className="navbar-modal-content"
                style={{
                  background: darkMode ? '#23272f' : '#fff',
                  borderRadius: 16,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                  padding: '32px 24px',
                  minWidth: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <button
                  className="btn btn-link"
                  style={{
                    position: 'absolute',
                    top: -18,
                    right: 8,
                    fontSize: 26,
                    color: darkMode ? '#fff' : '#222',
                    zIndex: 10
                  }}
                  onClick={() => setModalOpen(false)}
                  aria-label="إغلاق"
                >
                  ×
                </button>
                <Link
                  className="btn btn-primary mb-3"
                  to="/admin-login"
                  style={{ width: 180, fontWeight: 'bold' }}
                  onClick={() => setModalOpen(false)}
                >
                  {t('admin_login')}
                </Link>
                <Link
                  className="btn btn-outline-primary"
                  to="/supervisor-login"
                  style={{ width: 180, fontWeight: 'bold' }}
                  onClick={() => setModalOpen(false)}
                >
                  {t('supervisor_login')}
                </Link>
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
};

Navbar.propTypes = {
  darkMode: PropTypes.bool,
};

export default Navbar;