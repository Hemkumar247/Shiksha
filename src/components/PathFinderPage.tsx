import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Route, 
  User, 
  BookOpen, 
  TrendingUp, 
  Target, 
  Clock, 
  Star,
  Brain,
  Users,
  Download,
  Share2,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Award
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { geminiService, StudentProfile, LearningPathway } from '../services/geminiService';

export const PathFinderPage: React.FC = () => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPathway, setGeneratedPathway] = useState<LearningPathway | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    name: '',
    grade: 'Grade 3',
    subject: 'Mathematics',
    performanceLevel: 'Intermediate',
    learningStyle: 'Visual',
    interests: []
  });

  const gradeOptions = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ];

  const subjectOptions = [
    'Mathematics', 'Tamil', 'English', 'Science', 'Social Studies',
    'Environmental Studies', 'Computer Science', 'Arts'
  ];

  const performanceLevels = [
    { value: 'Beginner', label: t('beginner'), color: 'bg-red-100 text-red-800' },
    { value: 'Intermediate', label: t('intermediate'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Advanced', label: t('advanced'), color: 'bg-green-100 text-green-800' }
  ];

  const learningStyles = [
    { value: 'Visual', label: t('visual'), icon: '👁️' },
    { value: 'Auditory', label: t('auditory'), icon: '👂' },
    { value: 'Kinesthetic', label: t('kinesthetic'), icon: '🤲' },
    { value: 'Reading', label: t('reading'), icon: '📚' }
  ];

  const interestOptions = [
    { value: 'Sports', label: t('sports'), icon: '⚽' },
    { value: 'Arts', label: t('arts'), icon: '🎨' },
    { value: 'Science', label: t('science'), icon: '🔬' },
    { value: 'Technology', label: t('technology'), icon: '💻' },
    { value: 'Music', label: t('music'), icon: '🎵' }
  ];

  const handleInputChange = (field: keyof StudentProfile, value: any) => {
    setStudentProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setStudentProfile(prev => {
      const currentInterests = prev.interests;
      if (currentInterests.includes(interest)) {
        return {
          ...prev,
          interests: currentInterests.filter(i => i !== interest)
        };
      } else if (currentInterests.length < 3) {
        return {
          ...prev,
          interests: [...currentInterests, interest]
        };
      }
      return prev;
    });
  };

  const handleGeneratePathway = async () => {
    if (!studentProfile.name.trim()) {
      alert('Please enter student name');
      return;
    }

    setIsGenerating(true);
    try {
      const pathway = await geminiService.generateLearningPathway(studentProfile);
      setGeneratedPathway(pathway);
    } catch (error) {
      console.error('Error generating pathway:', error);
      alert('Error generating pathway. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('pathfinderTitle')}</h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('pathfinderSubtitle')}</p>
        </div>
        <div className="flex items-center justify-center sm:justify-end">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
            <Route className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Student Profile Form */}
      <motion.div
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          {t('studentAssessment')}
        </h3>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Student Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('studentName')}
              </label>
              <input
                type="text"
                value={studentProfile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('enterStudentName')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('currentGrade')}
              </label>
              <select
                value={studentProfile.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              >
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('subject')}
              </label>
              <select
                value={studentProfile.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              >
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Performance Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('performanceLevel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {performanceLevels.map((level) => (
                <motion.button
                  key={level.value}
                  onClick={() => handleInputChange('performanceLevel', level.value)}
                  className={`p-4 rounded-lg text-sm font-medium transition-all touch-manipulation ${
                    studentProfile.performanceLevel === level.value
                      ? level.color + ' ring-2 ring-primary'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {level.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Learning Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('learningStyle')}
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {learningStyles.map((style) => (
                <motion.button
                  key={style.value}
                  onClick={() => handleInputChange('learningStyle', style.value)}
                  className={`p-4 rounded-lg text-center transition-all touch-manipulation ${
                    studentProfile.learningStyle === style.value
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <div className="text-sm font-medium">{style.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('interests')} ({studentProfile.interests.length}/3)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {interestOptions.map((interest) => (
                <motion.button
                  key={interest.value}
                  onClick={() => handleInterestToggle(interest.value)}
                  disabled={!studentProfile.interests.includes(interest.value) && studentProfile.interests.length >= 3}
                  className={`p-4 rounded-lg text-center transition-all touch-manipulation ${
                    studentProfile.interests.includes(interest.value)
                      ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                      : studentProfile.interests.length >= 3
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={studentProfile.interests.length < 3 || studentProfile.interests.includes(interest.value) ? { scale: 1.02 } : {}}
                  whileTap={studentProfile.interests.length < 3 || studentProfile.interests.includes(interest.value) ? { scale: 0.98 } : {}}
                >
                  <div className="text-2xl mb-2">{interest.icon}</div>
                  <div className="text-sm font-medium">{interest.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <motion.button
              onClick={handleGeneratePathway}
              disabled={isGenerating || !studentProfile.name.trim()}
              className={`w-full sm:w-auto px-8 py-4 rounded-lg font-medium transition-all touch-manipulation ${
                isGenerating || !studentProfile.name.trim()
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg'
              }`}
              whileHover={!isGenerating && studentProfile.name.trim() ? { scale: 1.05 } : {}}
              whileTap={!isGenerating && studentProfile.name.trim() ? { scale: 0.95 } : {}}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>{t('generatingPathway')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>{t('generatePathway')}</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Generated Pathway */}
      {generatedPathway && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Pathway Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 sm:p-6 rounded-xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{t('pathwayReady')}</h3>
                <p className="opacity-90 text-sm sm:text-base">Personalized pathway for {generatedPathway.studentName}</p>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  className="p-2 sm:p-3 bg-white/20 rounded-lg hover:bg-white/30 touch-manipulation"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
                <motion.button
                  className="p-2 sm:p-3 bg-white/20 rounded-lg hover:bg-white/30 touch-manipulation"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Pathway Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Current → Target</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                    {generatedPathway.currentLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Target:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {generatedPathway.targetLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{t('timeline')}</h4>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{generatedPathway.timeline}</p>
              <p className="text-sm text-gray-600">Estimated completion</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Path Steps</h4>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{generatedPathway.recommendedPath.length}</p>
              <p className="text-sm text-gray-600">Learning milestones</p>
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              {t('skillGaps')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedPathway.skillGaps.map((gap, index) => (
                <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">{gap}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Path Steps */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
              <Route className="h-5 w-5 mr-2 text-primary" />
              {t('recommendedPath')}
            </h4>
            <div className="space-y-4">
              {generatedPathway.recommendedPath.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="relative p-4 bg-gray-50 rounded-lg border border-gray-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h5 className="font-medium text-gray-900">{step.title}</h5>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(step.difficulty)}`}>
                            {step.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">{step.duration}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{step.description}</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-600">Activities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {step.activities.map((activity, actIndex) => (
                              <span key={actIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                        {step.prerequisites.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">Prerequisites:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {step.prerequisites.map((prereq, preIndex) => (
                                <span key={preIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {prereq}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < generatedPathway.recommendedPath.length - 1 && (
                    <div className="absolute left-4 top-12 w-0.5 h-8 bg-gray-300"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-green-500" />
              {t('resources')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generatedPathway.resources.map((resource, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-green-900">{resource.title}</h5>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {resource.type}
                    </span>
                  </div>
                  <p className="text-green-800 text-sm">{resource.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Adaptive Features */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              {t('adaptivePath')}
            </h4>
            <div className="space-y-2">
              {generatedPathway.adaptiveFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};