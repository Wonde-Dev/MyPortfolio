import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Sparkles } from 'lucide-react';

const ThemeChanger = () => {
  const { theme, cycleTheme, themes } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Theme Switch Toggle */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 cursor-pointer transition-colors group"
        onClick={cycleTheme}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cycleTheme();
          }
        }}
        aria-label="Change theme"
      >
        {/* Active Theme Indicator Slide */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white dark:bg-gray-700 shadow-md transition-all duration-300 flex items-center justify-center"
          style={{
            left: theme === 'dark' ? '4px' : theme === 'light' ? 'calc(50% - 2px)' : 'calc(100% - 26px)',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="w-4 h-4 rounded-full flex items-center justify-center">
            {theme === 'dark' && <Moon size={10} className="text-gray-600" />}
            {theme === 'light' && <Sun size={10} className="text-yellow-500" />}
            {theme === 'cyber' && <Sparkles size={10} className="text-violet-400" />}
          </div>
        </motion.div>

        {/* Theme Icons */}
        <div className="relative z-10 flex items-center gap-3 px-1">
          <span className={`w-5 h-5 flex items-center justify-center transition-all duration-300 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            <Moon size={14} />
          </span>
          <span className={`w-5 h-5 flex items-center justify-center transition-all duration-300 ${
            theme === 'light' ? 'text-yellow-500' : 'text-gray-400'
          }`}>
            <Sun size={14} />
          </span>
          <span className={`w-5 h-5 flex items-center justify-center transition-all duration-300 ${
            theme === 'cyber' ? 'text-violet-400' : 'text-gray-400'
          }`}>
            <Sparkles size={14} />
          </span>
        </div>

        {/* Hover Tooltip */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {themes[theme]?.label}
        </div>
      </motion.div>

      {/* Theme Name Display */}
      <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline capitalize">
        {themes[theme]?.label}
      </span>
    </div>
  );
};

export default ThemeChanger;