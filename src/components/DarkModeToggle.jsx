import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const style = {
    position: 'fixed',
    bottom: '2rem',
    left: '2rem',
    zIndex: 1000,
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#fff' : '#333',
    border: 'none',
    borderRadius: '50%',
    padding: '0.5rem',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    cursor: 'pointer',
  };

  return (
    <button style={style} onClick={toggleDarkMode}>
      {darkMode ? <FaSun size={24} color="#f39c12" /> : <FaMoon size={24} color="#34495e" />}
    </button>
  );
};

export default DarkModeToggle;