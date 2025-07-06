import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Clock,
  Users,
  BookOpen,
  Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'festival' | 'lesson' | 'exam' | 'holiday';
  description?: string;
  grade?: string;
  subject?: string;
}

export const CalendarPage: React.FC = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState('all');

  const events: Event[] = [
    {
      id: '1',
      title: 'Pongal Festival',
      date: new Date('2024-01-14'),
      type: 'festival',
      description: 'Tamil harvest festival celebration'
    },
    {
      id: '2',
      title: 'Tamil Grammar - Grade 3',
      date: new Date('2024-01-15'),
      type: 'lesson',
      grade: 'Grade 3',
      subject: 'Tamil'
    },
    {
      id: '3',
      title: 'Mathematics Test',
      date: new Date('2024-01-16'),
      type: 'exam',
      grade: 'Grade 4',
      subject: 'Mathematics'
    },
    {
      id: '4',
      title: 'Republic Day',
      date: new Date('2024-01-26'),
      type: 'holiday',
      description: 'National holiday'
    },
    {
      id: '5',
      title: 'Science Project Presentation',
      date: new Date('2024-01-18'),
      type: 'lesson',
      grade: 'Grade 5',
      subject: 'Science'
    },
    {
      id: '6',
      title: 'Tamil New Year',
      date: new Date('2024-04-14'),
      type: 'festival',
      description: 'Traditional Tamil New Year celebration'
    }
  ];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(event.date, date) && 
      (filterType === 'all' || event.type === filterType)
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'festival': return 'bg-orange-500';
      case 'lesson': return 'bg-blue-500';
      case 'exam': return 'bg-red-500';
      case 'holiday': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'festival': return Star;
      case 'lesson': return BookOpen;
      case 'exam': return Clock;
      case 'holiday': return Calendar;
      default: return Calendar;
    }
  };

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cultural Calendar</h1>
          <p className="text-gray-600">Plan lessons around festivals and important dates</p>
        </div>
        <motion.button
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="festival">Festivals</option>
                <option value="lesson">Lessons</option>
                <option value="exam">Exams</option>
                <option value="holiday">Holidays</option>
              </select>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {monthDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <motion.div
                    key={day.toISOString()}
                    className={`p-2 min-h-[80px] border border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-primary/10 border-primary' : ''
                    } ${isToday ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedDate(day)}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                  >
                    <div className={`text-sm font-medium ${
                      isSameMonth(day, currentDate) ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => {
                  const Icon = getEventTypeIcon(event.type);
                  return (
                    <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${getEventTypeColor(event.type)}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        {event.grade && event.subject && (
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {event.grade}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {event.subject}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No events on this date</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Upcoming Events */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => {
                const Icon = getEventTypeIcon(event.type);
                return (
                  <motion.div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`p-2 rounded-full ${getEventTypeColor(event.type)}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{format(event.date, 'MMM d, yyyy')}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Festival Suggestions */}
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-xl text-white"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4">Festival Lesson Ideas</h3>
            <div className="space-y-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <h4 className="font-medium">Pongal Celebration</h4>
                <p className="text-sm opacity-90 mt-1">Create lessons about harvest, gratitude, and Tamil culture</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <h4 className="font-medium">Tamil New Year</h4>
                <p className="text-sm opacity-90 mt-1">Explore traditions, calendar systems, and cultural values</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};