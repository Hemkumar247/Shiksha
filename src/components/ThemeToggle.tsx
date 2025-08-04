import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return Sun;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System';
      default:
        return 'Light Mode';
    }
  };

  const Icon = getIcon();

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Current: ${getLabel()}. Click to cycle through themes.`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </motion.div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
        {getLabel()}
      </span>
      {theme === 'system' && (
        <div className="flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            ({actualTheme === 'dark' ? '🌙' : '☀️'})
          </span>
        </div>
      )}
    </motion.button>
  );
};