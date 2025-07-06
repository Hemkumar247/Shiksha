import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  Users, 
  BookOpen, 
  Calendar,
  Award,
  Target,
  Clock,
  Download
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AnalyticsPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const performanceData = [
    { subject: 'Tamil', score: 92, trend: '+5%', color: 'bg-blue-500' },
    { subject: 'Mathematics', score: 88, trend: '+3%', color: 'bg-green-500' },
    { subject: 'Science', score: 85, trend: '+7%', color: 'bg-purple-500' },
    { subject: 'English', score: 79, trend: '+2%', color: 'bg-orange-500' },
    { subject: 'Social Studies', score: 91, trend: '+4%', color: 'bg-red-500' }
  ];

  const weeklyStats = [
    { day: 'Mon', lessons: 8, students: 45, engagement: 92 },
    { day: 'Tue', lessons: 12, students: 52, engagement: 88 },
    { day: 'Wed', lessons: 10, students: 48, engagement: 95 },
    { day: 'Thu', lessons: 15, students: 61, engagement: 89 },
    { day: 'Fri', lessons: 11, students: 49, engagement: 93 },
    { day: 'Sat', lessons: 6, students: 28, engagement: 87 },
    { day: 'Sun', lessons: 3, students: 15, engagement: 85 }
  ];

  const achievements = [
    {
      title: 'Top Performer',
      description: 'Highest student engagement this month',
      icon: Star,
      color: 'bg-yellow-500',
      value: '96%'
    },
    {
      title: 'Lesson Master',
      description: 'Created 50+ lessons this month',
      icon: BookOpen,
      color: 'bg-blue-500',
      value: '52'
    },
    {
      title: 'Cultural Champion',
      description: 'Most festival-themed lessons',
      icon: Award,
      color: 'bg-purple-500',
      value: '15'
    },
    {
      title: 'Voice Expert',
      description: 'Highest voice interaction rate',
      icon: Target,
      color: 'bg-green-500',
      value: '89%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Performance</h1>
          <p className="text-gray-600">Track your teaching performance and student engagement</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.9</p>
              <p className="text-sm text-green-600 mt-1">+0.2 this month</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Student Engagement</p>
              <p className="text-2xl font-bold text-gray-900">91%</p>
              <p className="text-sm text-green-600 mt-1">+5% this month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Lesson Time</p>
              <p className="text-2xl font-bold text-gray-900">42m</p>
              <p className="text-sm text-blue-600 mt-1">Optimal range</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Voice Usage</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-sm text-purple-600 mt-1">High adoption</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subject Performance */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Subject-wise Performance</h3>
        <div className="space-y-4">
          {performanceData.map((subject, index) => (
            <div key={subject.subject} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700">
                {subject.subject}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <motion.div
                  className={`h-3 rounded-full ${subject.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.score}%` }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                />
              </div>
              <div className="w-12 text-sm font-bold text-gray-900">
                {subject.score}%
              </div>
              <div className="w-12 text-sm text-green-600">
                {subject.trend}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Activity Chart */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity Overview</h3>
        <div className="grid grid-cols-7 gap-4">
          {weeklyStats.map((day, index) => (
            <div key={day.day} className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">{day.day}</div>
              <motion.div
                className="bg-primary rounded-lg p-4 text-white"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-lg font-bold">{day.lessons}</div>
                <div className="text-xs opacity-80">lessons</div>
              </motion.div>
              <div className="mt-2 text-xs text-gray-600">
                <div>{day.students} students</div>
                <div className="text-green-600">{day.engagement}% engaged</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 ${achievement.color} rounded-full flex items-center justify-center mb-3`}>
                <achievement.icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
              <div className="text-2xl font-bold text-primary">{achievement.value}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights and Recommendations */}
      <motion.div
        className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold mb-4">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">🎯 Performance Highlights</h4>
            <ul className="text-sm opacity-90 space-y-1">
              <li>• Tamil lessons show highest engagement (96%)</li>
              <li>• Voice-based lessons perform 23% better</li>
              <li>• Festival-themed content increases retention by 31%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">💡 Recommendations</h4>
            <ul className="text-sm opacity-90 space-y-1">
              <li>• Consider more interactive Math activities</li>
              <li>• Increase voice usage in English lessons</li>
              <li>• Plan more cultural context integration</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};