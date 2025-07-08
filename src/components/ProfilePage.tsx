import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award, 
  Edit3, 
  Camera, 
  Save, 
  X,
  School,
  Globe,
  Users,
  TrendingUp,
  Star,
  Clock,
  Target,
  Badge,
  Heart,
  Coffee,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  location: string;
  joinedDate: string;
  subjects: string[];
  grades: string[];
  experience: number;
  bio: string;
  avatar?: string;
  achievements: Achievement[];
  stats: ProfileStats;
  preferences: TeacherPreferences;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
}

interface ProfileStats {
  totalLessons: number;
  totalStudents: number;
  averageRating: number;
  hoursTeaching: number;
  lessonsThisMonth: number;
  studentEngagement: number;
}

interface TeacherPreferences {
  favoriteSubjects: string[];
  teachingStyle: string;
  interests: string[];
  languages: string[];
}

export const ProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

  const [profile, setProfile] = useState<TeacherProfile>({
    id: '1',
    name: 'Sudha Krishnamurthy',
    email: 'sudha.krishnamurthy@school.edu',
    phone: '+91 9876543210',
    school: 'Government Higher Secondary School',
    location: 'Chennai, Tamil Nadu',
    joinedDate: '2020-08-15',
    subjects: ['Tamil', 'Mathematics', 'Science'],
    grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'],
    experience: 12,
    bio: 'Passionate educator with over 12 years of experience in primary education. Specializing in Tamil language instruction and integrating cultural context into modern teaching methods. Committed to creating inclusive learning environments that celebrate Tamil heritage while preparing students for the future.',
    achievements: [
      {
        id: '1',
        title: 'Excellence in Teaching Award',
        description: 'Recognized for outstanding contribution to Tamil education',
        date: '2023-12-15',
        icon: '🏆',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        id: '2',
        title: 'Digital Innovation Champion',
        description: 'Successfully integrated AI tools in classroom teaching',
        date: '2023-10-20',
        icon: '💡',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        id: '3',
        title: 'Student Engagement Leader',
        description: 'Achieved 95% student engagement rate',
        date: '2023-09-10',
        icon: '⭐',
        color: 'bg-green-100 text-green-800'
      },
      {
        id: '4',
        title: 'Cultural Heritage Advocate',
        description: 'Promoted Tamil culture through innovative lesson plans',
        date: '2023-08-05',
        icon: '🎭',
        color: 'bg-purple-100 text-purple-800'
      }
    ],
    stats: {
      totalLessons: 127,
      totalStudents: 2340,
      averageRating: 4.9,
      hoursTeaching: 1250,
      lessonsThisMonth: 23,
      studentEngagement: 95
    },
    preferences: {
      favoriteSubjects: ['Tamil Literature', 'Cultural Studies', 'Primary Mathematics'],
      teachingStyle: 'Interactive & Cultural Integration',
      interests: ['Tamil Poetry', 'Educational Technology', 'Student Psychology'],
      languages: ['Tamil', 'English', 'Hindi']
    }
  });

  const [editedProfile, setEditedProfile] = useState<TeacherProfile>(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof TeacherProfile, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    trend?: string;
  }> = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Profile</h1>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </div>
        {!isEditing ? (
          <motion.button
            onClick={handleEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </motion.button>
        ) : (
          <div className="flex space-x-2 w-full sm:w-auto">
            <motion.button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-1 sm:flex-none justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </motion.button>
            <motion.button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex-1 sm:flex-none justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <motion.div
        className="bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 rounded-xl text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold">
              {profile.name.charAt(0)}
            </div>
            {isEditing && (
              <motion.button
                className="absolute bottom-0 right-0 p-2 bg-white text-primary rounded-full shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Camera className="h-4 w-4" />
              </motion.button>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-2xl sm:text-3xl font-bold bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg px-3 py-2 w-full mb-2"
                placeholder="Full Name"
              />
            ) : (
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{profile.name}</h2>
            )}
            
            <div className="space-y-2 text-white/90">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <School className="h-4 w-4" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-2 py-1 text-sm flex-1"
                    placeholder="School Name"
                  />
                ) : (
                  <span className="text-sm">{profile.school}</span>
                )}
              </div>
              
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <MapPin className="h-4 w-4" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-2 py-1 text-sm flex-1"
                    placeholder="Location"
                  />
                ) : (
                  <span className="text-sm">{profile.location}</span>
                )}
              </div>
              
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{profile.experience} years of experience</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Lessons"
          value={profile.stats.totalLessons}
          color="bg-blue-500"
          trend="+12 this month"
        />
        <StatCard
          icon={Users}
          label="Students Taught"
          value={profile.stats.totalStudents.toLocaleString()}
          color="bg-green-500"
          trend="+45 this year"
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={profile.stats.averageRating}
          color="bg-yellow-500"
          trend="+0.2 this month"
        />
        <StatCard
          icon={Clock}
          label="Teaching Hours"
          value={`${profile.stats.hoursTeaching}h`}
          color="bg-purple-500"
          trend="+85h this month"
        />
        <StatCard
          icon={Target}
          label="This Month"
          value={profile.stats.lessonsThisMonth}
          color="bg-orange-500"
          trend="23 lessons"
        />
        <StatCard
          icon={TrendingUp}
          label="Engagement"
          value={`${profile.stats.studentEngagement}%`}
          color="bg-red-500"
          trend="+5% this month"
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'activity', label: 'Activity', icon: TrendingUp }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-4 text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">{profile.bio}</p>
                )}
              </div>

              {/* Teaching Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects I Teach</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Levels</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.grades.map((grade, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {grade}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Teaching Style</h4>
                    <p className="text-gray-600 bg-purple-50 px-3 py-2 rounded-lg">{profile.preferences.teachingStyle}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferences.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">My Achievements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${achievement.color}`}>
                            Achievement
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              
              {/* Activity Timeline */}
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    action: 'Created new lesson plan',
                    details: 'Tamil Grammar - Nouns and Verbs for Grade 3',
                    time: '2 hours ago',
                    icon: BookOpen,
                    color: 'bg-blue-500'
                  },
                  {
                    id: 2,
                    action: 'Received student feedback',
                    details: 'Average rating: 4.8/5 for Mathematics lesson',
                    time: '5 hours ago',
                    icon: Star,
                    color: 'bg-yellow-500'
                  },
                  {
                    id: 3,
                    action: 'Completed lesson delivery',
                    details: 'Science - Plants and Animals for Grade 2',
                    time: '1 day ago',
                    icon: Target,
                    color: 'bg-green-500'
                  },
                  {
                    id: 4,
                    action: 'Updated student progress',
                    details: 'Marked assessments for 25 students',
                    time: '2 days ago',
                    icon: Users,
                    color: 'bg-purple-500'
                  }
                ].map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`p-2 rounded-full ${activity.color}`}>
                      <activity.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.action}</h4>
                      <p className="text-gray-600 text-sm mt-1">{activity.details}</p>
                      <p className="text-gray-500 text-xs mt-2">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};