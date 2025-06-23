import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';
import Typewriter from 'typewriter-effect';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaStar, FaDraftingCompass } from 'react-icons/fa';
import LanguageSelector from '../components/LanguageSelector';
import mainImage from '../images/acd0698c-8b14-4b99-8441-225002664d7f.jpg';
import DynamicText from '../components/DynamicText';
import { useTheme } from '../context/ThemeContext';
import videoImg from '../images/57316546-552d-4281-a6a4-814faf3a4feb.jpg';
import engineeringImg from '../images/1760d4e5-a94e-4c08-a967-e38b205f389b.jpg';
import graphicsImg from '../images/f2d8768f-2b2e-4de4-857b-4f87805827f1.jpg';
import uiuxImg from '../images/49b56c2a-e39b-4abb-ba93-750a95ed0ab0.jpg';
import programmingImg from '../images/d2912c92-4528-489d-ab82-bde57f7a2a48.jpg';

const smoothScrollTo = (element, duration = 1800) => {
  if (!element) return;
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  const easeInOutCubic = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  };

  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  };

  requestAnimationFrame(animation);
};

const Home = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const companyFeaturesRef = useRef(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 1000 });
    const savedLanguage = localStorage.getItem('language') || 'en'; // Default to English if no language is saved
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  useEffect(() => {
    const handleLangChange = (lng) => {
      // إعادة تحميل الصفحة عند تغيير اللغة
      window.location.reload();
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n]);

  const services = [
    { name: t('programming_chat'), path: '/programming', icon: '💻', image: uiuxImg }, // استخدم صورة تصميم الواجهات هنا
    { name: t('uiux_design'), path: '/uiux', icon: '🎨', image: programmingImg },      // استخدم صورة البرمجة هنا
    { name: t('graphics'), path: '/graphic', icon: '🖌️', image: graphicsImg },
    { name: t('video_editing'), path: '/video', icon: '🎥', image: videoImg },
    { name: t('engineering_design'), path: '/engineering', icon: <FaDraftingCompass color="#007bff" />, image: engineeringImg },
  ];

  return (
    <div className={`${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px 0 18px' }}>
        <LanguageSelector />
        <span style={{
          fontWeight: 'bold',
          fontSize: 15,
          color: darkMode ? '#ffe082' : '#0d6efd',
          letterSpacing: 0.5,
          userSelect: 'none'
        }}>
          {t('choose_language') || 'اختر اللغة'}
        </span>
      </div>
      <div className="container py-4">
        <div
          className={`min-vh-100 d-flex flex-column ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <div
            className="background-animation"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: -1,
              background: 'linear-gradient(120deg, rgba(255, 0, 150, 0.5), rgba(0, 204, 255, 0.5))',
              animation: 'gradientAnimation 10s infinite',
            }}
          ></div>

          <div className="d-flex flex-nowrap justify-content-around align-items-start" style={{ overflowX: 'auto', padding: '1rem' }}>
            <div className={`cards-container ${darkMode ? 'dark-mode' : ''}`}>
              {services.slice(3).map((service, index) => (
                <motion.div
                  key={service.name}
                  className="card-item mb-3"
                  initial={{ x: '-100vw' }}
                  animate={{ x: 0 }}
                  transition={{ delay: index * 0.3, type: 'spring', stiffness: 50 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => navigate(service.path)}
                  data-aos="fade-up"
                >
                  <div className="card shadow-sm text-center h-100" style={{ transition: 'transform 0.3s ease-in-out' }}>
                    <div className="card-header" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 'bold' }}>
                      {service.icon}{' '}
                      <span style={{ display: 'inline-block', minWidth: 80 }}>
                        {service.name}
                      </span>
                    </div>
                    <div
                      className="card-body"
                      style={{
                        backgroundImage: `url(${service.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '10px',
                        transition: 'transform 0.3s ease-in-out',
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem' }}>
              <div
                className="image-and-title-wrapper"
                style={{
                  textAlign: 'center',
                  marginBottom: '20px',
                  color: darkMode ? 'white' : 'black',
                  fontWeight: 'bold',
                }}
              >
                <h2
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', // تعديل الحجم ليكون متجاوبًا
                    marginBottom: '0.5rem',
                    animation: 'fadeIn 2s',
                    fontWeight: '800',
                    textAlign: 'center',
                    color: darkMode ? '#fff' : '#000',
                  }}
                >
                  <Typewriter
                    options={{
                      strings: [t('welcome_message'), t('choose_service')],
                      autoStart: true,
                      loop: true,
                      delay: 75,
                    }}
                  />
                </h2>
                <h3
                  style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.8rem)', // تعديل الحجم ليكون متجاوبًا
                    animation: 'fadeIn 2s 1s',
                  }}
                >
                  {t('choose_service')}
                </h3>
                <button
                  className="glow-button"
                  onClick={() => {
                    if (companyFeaturesRef.current) {
                      smoothScrollTo(companyFeaturesRef.current, 1200);
                    }
                  }}
                >
                  {t('start_now')}
                </button>
              </div>
              <motion.img
                src={mainImage}
                alt={t('main_visual_alt')}
                className="central-image"
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto',
                  margin: '0 auto',
                  borderRadius: '15px',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.3s ease-in-out',
                }}
                whileHover={{ scale: 1.05 }}
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                transition={{ duration: 1, type: 'spring', stiffness: 50 }}
              />
            </div>

            <div className={`cards-container ${darkMode ? 'dark-mode' : ''}`}>
              {services.slice(0, 3).map((service, index) => (
                <motion.div
                  key={service.name}
                  className="card-item mb-3"
                  initial={{ x: '100vw' }}
                  animate={{ x: 0 }}
                  transition={{ delay: index * 0.3, type: 'spring', stiffness: 50 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => navigate(service.path)}
                  data-aos="fade-up"
                >
                  <div className="card shadow-sm text-center h-100" style={{ transition: 'transform 0.3s ease-in-out' }}>
                    <div className="card-header" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 'bold' }}>
                      {service.icon}{' '}
                      <span style={{ display: 'inline-block', minWidth: 80 }}>
                        {service.name}
                      </span>
                    </div>
                    <div
                      className="card-body"
                      style={{
                        backgroundImage: `url(${service.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '10px',
                        transition: 'transform 0.3s ease-in-out',
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-section"></div>

          <div
            className="parent-section"
            style={{ marginTop: '3rem' }}
            ref={featuresRef}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: window.innerWidth < 900 ? 'column' : 'row',
                gap: '2.5rem',
                justifyContent: 'center',
                alignItems: 'stretch',
                width: '100%',
                maxWidth: 1200,
                margin: '0 auto'
              }}
            >
              <div
                ref={companyFeaturesRef}
                style={{
                  flex: 1,
                  background: darkMode ? '#23272f' : '#fff',
                  borderRadius: '16px',
                  padding: 'clamp(1.2rem, 2vw, 2.2rem)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  border: darkMode ? '1px solid #333' : '1px solid #e6e6e6',
                  minWidth: 260
                }}>
                <div style={{
                  background: darkMode ? '#23272f' : '#f3f6fa',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  padding: 'clamp(0.5rem, 1vw, 1.2rem)',
                  fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)',
                  fontWeight: 'bold',
                  color: darkMode ? '#fff' : '#222',
                  textAlign: 'center',
                  marginBottom: 18
                }}>
                  <DynamicText />
                </div>
                <div style={{
                  fontWeight: 'bold',
                  color: '#111',
                  fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)',
                  textAlign: 'center',
                  marginBottom: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  <span>{t('company_aim')}</span>
                  <FaStar style={{ color: '#ffc107', fontSize: '1.2em', marginRight: 4 }} />
                </div>
                <ul style={{
                  margin: 0,
                  paddingRight: 18,
                  fontSize: 'clamp(1rem, 1.3vw, 1.18rem)',
                  lineHeight: 2,
                  color: darkMode ? '#e0e0e0' : '#333'
                }}>
                  <li>{t('feature_1')}</li>
                  <li>{t('feature_2')}</li>
                  <li>{t('feature_3')}</li>
                  <li>{t('feature_4')}</li>
                </ul>
              </div>

              <div
                style={{
                  width: '2px',
                  background: darkMode ? '#444' : '#d1d1d1',
                  margin: window.innerWidth < 900 ? '2rem auto' : '0 1.5rem',
                  borderRadius: '1px',
                  alignSelf: 'center',
                  height: window.innerWidth < 900 ? '2px' : '90%',
                  minHeight: window.innerWidth < 900 ? 0 : 180,
                  display: window.innerWidth < 900 ? 'none' : 'block'
                }}
              />

              <div style={{
                flex: 1,
                background: darkMode ? '#23272f' : '#fff',
                borderRadius: '16px',
                padding: 'clamp(1.2rem, 2vw, 2.2rem)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                border: darkMode ? '1px solid #333' : '1px solid #e6e6e6',
                minWidth: 260
              }}>
                <h5 style={{
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: darkMode ? '#fff' : '#222',
                  textAlign: 'center',
                  fontSize: 'clamp(1.2rem, 2vw, 1.7rem)',
                  letterSpacing: '1px'
                }}>
                  <span role="img" aria-label="wolf" style={{ fontSize: '1.3em', marginLeft: 6 }}></span>
                  {t('why_wolf_logo')}
                </h5>
                <ul style={{
                  margin: 0,
                  paddingRight: 18,
                  fontSize: 'clamp(1rem, 1.3vw, 1.18rem)',
                  lineHeight: 2,
                  color: darkMode ? '#e0e0e0' : '#333'
                }}>
                  <li>{t('wolf_trait_1')}</li>
                  <li>{t('wolf_trait_2')}</li>
                  <li>{t('wolf_trait_3')}</li>
                  <li>{t('wolf_trait_4')}</li>
                  <li>{t('wolf_trait_5')}</li>
                  <li>{t('wolf_trait_6')}</li>
                </ul>
                <p style={{
                  marginTop: '1rem',
                  fontWeight: 'bold',
                  color: '#007bff',
                  textAlign: 'center',
                  fontSize: 'clamp(1rem, 1.3vw, 1.15rem)'
                }}>
                  {t('wolf_traits_reflect_company')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
