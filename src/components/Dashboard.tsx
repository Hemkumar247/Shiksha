import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Star, TrendingUp, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const stats = [
    { 
      id: 'lessons', 
      title: t('totalLessons'),
      value: '127', 
      icon: BookOpen, 
      color: 'bg-blue-500',
      trend: '+12%',
      page: 'lessons'
    },
    { 
      id: 'students', 
      title: t('students'),
      value: '2,340', 
      icon: Users, 
      color: 'bg-green-500',
      trend: '+8%',
      page: 'students'
    },
    { 
      id: 'rating', 
      title: t('rating'),
      value: '4.9', 
      icon: Star, 
      color: 'bg-yellow-500',
      trend: '+0.2',
      page: 'analytics'
    },
    { 
      id: 'growth', 
      title: t('monthlyGrowth'),
      value: '23%', 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      trend: '+5%',
      page: 'analytics'
    }
  ];

  const recentLessons = [
    {
      id: 1,
      title: t('lesson1Title'),
      grade: t('lesson1Grade'),
      duration: t('lesson1Duration'),
      createdAt: new Date('2024-01-15'),
      status: 'completed'
    },
    {
      id: 2,
      title: t('lesson2Title'),
      grade: t('lesson2Grade'),
      duration: t('lesson2Duration'),
      createdAt: new Date('2024-01-14'),
      status: 'in-progress'
    },
    {
      id: 3,
      title: t('lesson3Title'),
      grade: t('lesson3Grade'),
      duration: t('lesson3Duration'),
      createdAt: new Date('2024-01-13'),
      status: 'completed'
    }
  ];

  const upcomingFestivals = [
    {
      name: t('pongal'),
      date: new Date('2024-01-14'),
      relevance: t('pongalContext')
    },
    {
      name: t('tamilNewYear'),
      date: new Date('2024-04-14'),
      relevance: t('tamilNewYearContext')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div
        className="bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 rounded-xl text-white"
        variants={itemVariants}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('welcomeMessage')}</h2>
        <p className="mt-2 opacity-90 text-sm sm:text-base">
          {t('welcomeSubtext')}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all touch-manipulation"
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.(stat.page)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${stat.color} flex-shrink-0`}>
                <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center">
              <span className="text-xs sm:text-sm text-green-600 font-medium">{stat.trend}</span>
              <span className="text-xs sm:text-sm text-gray-500 ml-2">{t('thisMonth')}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Lessons */}
        <motion.div
          className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate?.('lessons')}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('recentLessons')}
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {recentLessons.map((lesson) => (
              <motion.div
                key={lesson.id}
                className="flex items-center space-x-3 sm:space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  lesson.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <BookOpen className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    lesson.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{lesson.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{lesson.grade}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    lesson.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lesson.status === 'completed' ? t('completed') : t('inProgress')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cultural Calendar */}
        <motion.div
          className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate?.('calendar')}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('culturalCalendar')}
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {upcomingFestivals.map((festival, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3 sm:space-x-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">{festival.name}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{festival.relevance}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    {format(festival.date, 'MMM d')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-4 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800 font-medium">
                {t('createFestivalLessons')}
              </p>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {t('createFestivalSubtext')}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
        variants={itemVariants}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('quickActions')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.button
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg hover:shadow-md transition-all touch-manipulation"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('lessons')}
          >
            <BookOpen className="h-6 w-6 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium">{t('newLesson')}</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-secondary to-green-600 text-white rounded-lg hover:shadow-md transition-all touch-manipulation"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('students')}
          >
            <Users className="h-6 w-6 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium">{t('studentGroups')}</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-md transition-all touch-manipulation sm:col-span-2 lg:col-span-1"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('analytics')}
          >
            <Star className="h-6 w-6 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium">{t('assessment')}</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};