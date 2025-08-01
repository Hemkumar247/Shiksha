import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LessonPlanner } from './components/LessonPlanner';
import { StudentsPage } from './components/StudentsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { CalendarPage } from './components/CalendarPage';
import { PathFinderPage } from './components/PathFinderPage';
import { FeedbackPage } from './components/FeedbackPage';
import { MyDocumentsPage } from './components/MyDocuments/MyDocumentsPage';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'lessons':
        return <LessonPlanner />;
      case 'students':
        return <StudentsPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'pathfinder':
        return <PathFinderPage />;
      case 'documents':
        return <MyDocumentsPage />;
      case 'profile':
        return (
          <ProfilePage />
        );
      case 'settings':
        return (
          <SettingsPage />
        );
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <LanguageProvider>
      <DataProvider>
        <div className="min-h-screen bg-background">
          <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: 'text-sm'
            }}
          />
        </div>
      </DataProvider>
    </LanguageProvider>
  );
}

export default App;