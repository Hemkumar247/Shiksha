import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, BarChart3, Settings, LogOut, Users, Calendar, Camera, Route } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: t('dashboard') },
    { id: 'lessons', icon: BookOpen, label: t('lessons') },
    { id: 'students', icon: Users, label: t('students') },
    { id: 'analytics', icon: BarChart3, label: t('analytics') },
    { id: 'calendar', icon: Calendar, label: t('calendar') },
    { id: 'chalkvision', icon: Camera, label: t('chalkVision') },
    { id: 'pathfinder', icon: Route, label: t('pathfinder') },
    { id: 'profile', icon: User, label: t('profile') },
    { id: 'settings', icon: Settings, label: t('settings') }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-primary p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
                  <p className="text-sm text-gray-600">{t('appNameTamil')}</p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <motion.button
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">{t('logout')}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.nav
          className="w-64 bg-white shadow-sm min-h-screen"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};