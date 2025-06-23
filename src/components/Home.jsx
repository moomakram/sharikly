import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DynamicSentence from './DynamicSentence';

const Home = () => {
  const [isLanguageMenuVisible, setLanguageMenuVisible] = useState(true);
  const { t } = useTranslation();
  const languages = [
    'English', 'Arabic', 'French', 'Spanish', 'German', 'Chinese', 'Japanese', 
    'Korean', 'Hindi', 'Russian', 'Portuguese', 'Italian', 'Dutch', 'Swedish', 
    'Turkish', 'Greek', 'Thai', 'Vietnamese', 'Hebrew', 'Polish', 'Czech', 
    'Hungarian', 'Finnish', 'Danish', 'Norwegian', 'Indonesian', 'Malay', 
    'Filipino', 'Swahili', 'Zulu', 'Afrikaans', 'Urdu', 'Bengali', 'Tamil', 
    'Telugu', 'Punjabi', 'Gujarati', 'Marathi', 'Kannada', 'Malayalam', 
    'Sinhala', 'Burmese', 'Khmer', 'Lao', 'Mongolian', 'Pashto', 'Farsi', 
    'Amharic', 'Hausa', 'Yoruba', 'Igbo', 'Somali', 'Tigrinya', 'Nepali', 
    'Tibetan', 'Georgian', 'Armenian', 'Azerbaijani', 'Kazakh', 'Uzbek', 
    'Turkmen', 'Kyrgyz', 'Tajik', 'Uighur', 'Latin', 'Esperanto', 'More...'
  ];

  const toggleLanguageMenu = () => {
    setLanguageMenuVisible(!isLanguageMenuVisible);
  };

  return (
    <div className="home-container">
      <div className="language-selector">
        <button className="toggle-button" onClick={toggleLanguageMenu}>
          {isLanguageMenuVisible ? 'Hide Languages' : 'Show Languages'}
        </button>
        {isLanguageMenuVisible && (
          <div className="language-menu" style={{ maxHeight: '200px', overflowY: 'scroll', position: 'absolute', left: '0' }}>
            <p>Select a language:</p>
            <ul>
              {languages.map((lang, index) => (
                <li key={index}>{lang}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <h1>{t('tagline')}</h1>
      <h2>{t('video_editing')}</h2>
      <h2>{t('engineering_design')}</h2>
      <h2>{t('programming')}</h2>
      <h2>{t('uiux_design')}</h2>
      <h2>{t('graphics')}</h2>
      <h2 style={{ textAlign: 'center', color: '#007bff' }}>
        {t('welcome_message')}! {t('choose_service')}
      </h2>
      <DynamicSentence />
    </div>
  );
};

export default Home;
