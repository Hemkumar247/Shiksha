import React from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Languages className="h-4 w-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">
        {language === 'en' ? 'தமிழ்' : 'English'}
      </span>
    </motion.button>
  );
};