import React, { createContext, useContext, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const themes = {
  dark: { icon: '🌙', label: 'Dark', color: 'bg-gray-700' },
  light: { icon: '☀️', label: 'Light', color: 'bg-yellow-300' },
  cyber: { icon: '💜', label: 'Cyber', color: 'bg-purple-600' }
};

const getThemeStyles = (theme) => {
  if (theme === 'cyber') {
    return {
      primary: 'from-violet-600 to-fuchsia-600',
      secondary: 'from-cyan-400 to-blue-600',
      bg: 'bg-[#0a0a0f]',
      card: 'bg-[#12121f] border border-violet-500/30',
      text: 'text-gray-100',
      textMuted: 'text-gray-400',
      accent: 'from-violet-500 to-fuchsia-500'
    };
  }
  if (theme === 'dark') {
    return {
      primary: 'from-blue-600 to-purple-600',
      secondary: 'from-cyan-500 to-blue-500',
      bg: 'bg-gray-900',
      card: 'bg-gray-800/80 backdrop-blur-sm',
      text: 'text-gray-100',
      textMuted: 'text-gray-400',
      accent: 'from-blue-500 to-purple-500'
    };
  }
  return {
    primary: 'from-purple-500 to-pink-500',
    secondary: 'from-pink-500 to-rose-500',
    bg: 'bg-gray-50',
    card: 'bg-white shadow-xl',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    accent: 'from-purple-400 to-pink-400'
  };
};

const themeOrder = ['dark', 'light', 'cyber'];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark' || theme === 'cyber') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setThemeState(themeOrder[nextIndex]);
  }, [theme]);

  const value = React.useMemo(() => ({
    theme,
    cycleTheme,
    themes,
    getThemeStyles: () => getThemeStyles(theme)
  }), [theme, cycleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};