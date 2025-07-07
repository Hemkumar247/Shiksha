import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, BarChart3, Settings, LogOut, Users, Calendar, Camera, Route, Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleNavigation = (pageId: string) => {
    onNavigate?.(pageId);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-primary p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
                  <p className="text-sm text-gray-600">{t('appNameTamil')}</p>
                </div>
              </motion.div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
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

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <LanguageToggle />
              <motion.button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <motion.nav
          className="hidden lg:block w-64 bg-white shadow-sm min-h-screen sticky top-16"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.nav>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {/* Mobile Menu */}
              <motion.nav
                className="lg:hidden fixed top-16 left-0 right-0 bg-white shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {navItems.map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
                          currentPage === item.id
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <item.icon className="h-6 w-6" />
                        <div className="text-sm font-medium text-center">{item.label}</div>
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Mobile Logout */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <motion.button
                      className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">{t('logout')}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="animate-fade-in"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};