import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const DynamicText = () => {
  const { t } = useTranslation();
  const text = t('work_hadith'); // استخدم الترجمة حسب اللغة المختارة

  const colors = useMemo(() => [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F39C12",
    "#8E44AD",
    "#1abc9c",
    "#e74c3c",
    "#3498db",
    "#9b59b6",
    "#f1c40f"
  ], []);

  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    let timer;
    if (index < text.length) {
      timer = setTimeout(() => {
        setDisplayedText(text.slice(0, index + 1));
        setIndex(prev => prev + 1);
      }, 150);
    } else {
      timer = setTimeout(() => {
        setDisplayedText("");
        setIndex(0);
      }, 9000);
    }
    return () => clearTimeout(timer);
  }, [index, text]);

  useEffect(() => {
    const colorTimer = setInterval(() => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setColor(randomColor);
    }, 7000);
    return () => clearInterval(colorTimer);
  }, [colors]);

  // إعادة تعيين الكتابة عند تغيير اللغة
  useEffect(() => {
    setDisplayedText("");
    setIndex(0);
  }, [text]);

  return (
    <p style={{
      color,
      transition: 'color 0.5s ease-in-out',
      textAlign: 'center',
      fontWeight: '900'
    }}>
      {displayedText}
    </p>
  );
};

export default DynamicText;