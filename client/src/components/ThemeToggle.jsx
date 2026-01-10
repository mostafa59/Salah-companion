import { useState, useEffect } from 'react';

const ThemeToggle = () => {
  // 1. Initialize state from LocalStorage (remembers your choice)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // 2. The Effect: Runs whenever 'darkMode' changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark'); // Adds 'dark' to <html>
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 transition-all hover:scale-110"
      title="Toggle Dark Mode"
    >
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

export default ThemeToggle;
