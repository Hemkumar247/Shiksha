import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Target, 
  Lightbulb, 
  CheckCircle,
  Calendar,
  Star,
  Volume2,
  Download,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  Layers,
  Award,
  Eye,
  FileText
} from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLanguage } from '../contexts/LanguageContext';
import { geminiService, LessonPlan } from '../services/geminiService';

export const LessonPlanner: React.FC = () => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [voiceInput, setVoiceInput] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Grade 3');
  const [selectedSubject, setSelectedSubject] = useState('Tamil');
  const [selectedDuration, setSelectedDuration] = useState(45);
  const [selectedTeachingStyle, setSelectedTeachingStyle] = useState('Interactive');
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const { speak, isSpeaking } = useSpeechSynthesis();

  const gradeOptions = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ];

  const subjectOptions = [
    'Tamil', 'English', 'Mathematics', 'Science', 'Social Studies',
    'Environmental Studies', 'Computer Science', 'Arts', 'Physical Education'
  ];

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' }
  ];

  const teachingStyleOptions = [
    'Interactive', 'Lecture-based', 'Hands-on', 'Discussion-based', 
    'Project-based', 'Inquiry-based', 'Collaborative', 'Visual'
  ];

  const steps = [
    {
      id: 'input',
      title: t('describeLessonTitle') || 'Describe Your Lesson',
      description: t('describeLessonSubtitle') || 'Use voice or typing to provide lesson details',
      prompt: t('lessonPrompt') || 'Tell me what subject, which grade, and how long the lesson should be...'
    },
    {
      id: 'generate',
      title: t('generatingLesson') || 'Generating Your Lesson...',
      description: t('generatingSubtext') || 'Creating your customized lesson plan',
      prompt: ''
    },
    {
      id: 'review',
      title: t('reviewLesson') || 'Your Lesson is Ready!',
      description: t('reviewSubtext') || 'Your lesson plan is ready',
      prompt: ''
    }
  ];

  const handleVoiceInput = (transcript: string) => {
    setVoiceInput(transcript);
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...learningObjectives];
    newObjectives[index] = value;
    setLearningObjectives(newObjectives);
  };

  const addObjective = () => {
    if (learningObjectives.length < 5) {
      setLearningObjectives([...learningObjectives, '']);
    }
  };

  const removeObjective = (index: number) => {
    if (learningObjectives.length > 1) {
      const newObjectives = learningObjectives.filter((_, i) => i !== index);
      setLearningObjectives(newObjectives);
    }
  };

  const handleGenerate = async () => {
    if (!voiceInput.trim()) {
      speak(t('provideDetails') || 'Please provide lesson details first', { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
      return;
    }

    const validObjectives = learningObjectives.filter(obj => obj.trim());
    if (validObjectives.length === 0) {
      setError('Please provide at least one learning objective');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(1);
    setError(null);
    
    speak(`${t('processingRequest') || 'Processing your request'} for ${selectedGrade} ${selectedSubject}`, { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
    
    try {
      // Check rate limit
      const rateLimitStatus = geminiService.getRateLimitStatus();
      if (!rateLimitStatus.canMakeRequest) {
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimitStatus.waitTime / 1000)} seconds.`);
      }

      setProcessingStage('Analyzing lesson requirements...');
      
      const lessonParams = {
        subject: selectedSubject,
        grade: selectedGrade,
        duration: selectedDuration,
        objectives: validObjectives,
        teachingStyle: selectedTeachingStyle,
        topic: voiceInput
      };

      setProcessingStage('Generating comprehensive lesson plan...');
      const plan = await geminiService.generateLessonPlan(lessonParams);
      
      setProcessingStage('Adding cultural context and assessments...');
      setGeneratedPlan(plan);
      setCurrentStep(2);
      
      speak(t('lessonReady') || 'Lesson is ready! Let\'s take a look', { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
    } catch (error: any) {
      console.error('Error generating lesson plan:', error);
      setError(error.message || 'Failed to generate lesson plan. Please try again.');
      setCurrentStep(0);
    } finally {
      setIsGenerating(false);
      setProcessingStage('');
    }
  };

  const handleRefreshLesson = async () => {
    if (!generatedPlan) return;
    
    const lessonParams = {
      subject: selectedSubject,
      grade: selectedGrade,
      duration: selectedDuration,
      objectives: learningObjectives.filter(obj => obj.trim()),
      teachingStyle: selectedTeachingStyle,
      topic: voiceInput
    };

    try {
      const refreshedPlan = await geminiService.refreshLessonPlan(lessonParams);
      setGeneratedPlan(refreshedPlan);
      speak('Lesson plan refreshed with new content', { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
    } catch (error: any) {
      setError(error.message || 'Failed to refresh lesson plan');
    }
  };

  const handleSpeak = (text: string) => {
    speak(text, { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
  };

  const handleDownload = () => {
    speak('Downloading lesson plan', { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
    // Download logic here
  };

  const ActivityTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'presentation':
        return <BookOpen className="h-4 w-4" />;
      case 'hands-on':
        return <Lightbulb className="h-4 w-4" />;
      case 'discussion':
        return <Users className="h-4 w-4" />;
      case 'assessment':
        return <CheckCircle className="h-4 w-4" />;
      case 'interactive':
        return <Layers className="h-4 w-4" />;
      case 'collaborative':
        return <Users className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'medium':
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'hard':
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              index <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {index + 1}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                index <= currentStep ? 'text-primary' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-20 h-0.5 mx-4 ${
                index < currentStep ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Generation Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('describeLessonTitle') || 'Describe Your Lesson Using Voice'}
              </h2>
              <p className="text-gray-600">
                {t('describeLessonSubtitle') || 'Use voice or typing to provide lesson details'}
              </p>
            </div>

            {/* Lesson Parameters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                Lesson Parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Grade Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teaching Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teaching Style
                  </label>
                  <select
                    value={selectedTeachingStyle}
                    onChange={(e) => setSelectedTeachingStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {teachingStyleOptions.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Learning Objectives
                  </label>
                  <button
                    onClick={addObjective}
                    disabled={learningObjectives.length >= 5}
                    className="text-sm text-primary hover:text-primary/80 disabled:text-gray-400"
                  >
                    + Add Objective
                  </button>
                </div>
                <div className="space-y-2">
                  {learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                        placeholder={`Learning objective ${index + 1}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {learningObjectives.length > 1 && (
                        <button
                          onClick={() => removeObjective(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Parameters Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Selected Parameters:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {selectedGrade}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {selectedSubject}
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {selectedDuration} minutes
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {selectedTeachingStyle}
                  </span>
                </div>
              </div>
            </div>

            {/* Voice Input Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Describe Your Lesson Topic
              </h3>
              <VoiceInput
                onTranscript={handleVoiceInput}
                placeholder={`Tell me about the ${selectedSubject} topic you want to teach to ${selectedGrade} students...`}
                autoSpeak={true}
              />
              
              {voiceInput && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">{t('yourRequest') || 'Your Request:'}</h4>
                  <p className="text-green-800">{voiceInput}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <motion.button
                onClick={handleGenerate}
                disabled={!voiceInput.trim() || learningObjectives.filter(obj => obj.trim()).length === 0}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  voiceInput.trim() && learningObjectives.filter(obj => obj.trim()).length > 0
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={voiceInput.trim() && learningObjectives.filter(obj => obj.trim()).length > 0 ? { scale: 1.05 } : {}}
                whileTap={voiceInput.trim() && learningObjectives.filter(obj => obj.trim()).length > 0 ? { scale: 0.95 } : {}}
              >
                {t('generateLesson') || 'Generate Lesson'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center space-y-6"
          >
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('generatingLesson') || 'Generating Your Lesson...'}
                </h2>
                <p className="text-gray-600">
                  Creating comprehensive lesson plan for {selectedGrade} {selectedSubject} ({selectedDuration} minutes)
                </p>
              </div>

              <div className="flex justify-center space-x-2 mb-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-primary rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>

              {/* Processing Stage Indicator */}
              {processingStage && (
                <motion.div
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800 text-sm">{processingStage}</span>
                  </div>
                </motion.div>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p>{t('generatingStructure') || '• Creating lesson structure'}</p>
                <p>{t('planningActivities') || '• Planning activities'}</p>
                <p>{t('addingFestivalContext') || '• Adding festival context'}</p>
                <p>{t('addingCulturalContext') || '• Adding Tamil culture'}</p>
                <p>• Creating assessment strategies</p>
                <p>• Adding differentiation options</p>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && generatedPlan && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('reviewLesson') || 'Your Lesson is Ready!'}
                </h2>
                <p className="text-gray-600">{t('reviewSubtext') || 'Your lesson plan is ready'}</p>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => handleSpeak(`${generatedPlan.title} lesson plan details`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Volume2 className="h-4 w-4" />
                  <span>{t('listen') || 'Listen'}</span>
                </motion.button>
                <motion.button
                  onClick={handleRefreshLesson}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Refresh Lesson Plan"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </motion.button>
                <motion.button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4" />
                  <span>{t('download') || 'Download'}</span>
                </motion.button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                <h3 className="text-xl font-bold">{generatedPlan.title}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {generatedPlan.subject}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {generatedPlan.grade}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {generatedPlan.duration} {language === 'ta' ? 'நிமிடங்கள்' : 'minutes'}
                  </span>
                  <span className="flex items-center">
                    <Layers className="h-4 w-4 mr-1" />
                    {selectedTeachingStyle}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Objectives */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    {t('learningObjectives') || 'Learning Objectives'}
                  </h4>
                  <ul className="space-y-2">
                    {generatedPlan.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Activities */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-secondary" />
                    {t('activities') || 'Activities'}
                  </h4>
                  <div className="space-y-4">
                    {generatedPlan.activities.map((activity) => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <ActivityTypeIcon type={activity.type} />
                            <span className="font-medium text-gray-900">{activity.name}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(activity.type)}`}>
                              {activity.type}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {activity.duration} {language === 'ta' ? 'நிமிடங்கள்' : 'minutes'}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{activity.description}</p>
                        
                        {/* Learning Objectives for Activity */}
                        {activity.learningObjectives && activity.learningObjectives.length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-xs font-medium text-gray-600 mb-1">Learning Objectives:</h6>
                            <div className="flex flex-wrap gap-1">
                              {activity.learningObjectives.map((obj, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {obj}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Materials */}
                        {activity.materials && activity.materials.length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-xs font-medium text-gray-600 mb-1">Materials:</h6>
                            <div className="flex flex-wrap gap-1">
                              {activity.materials.map((material, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Instructions */}
                        {activity.instructions && activity.instructions.length > 0 && (
                          <div>
                            <h6 className="text-xs font-medium text-gray-600 mb-1">Instructions:</h6>
                            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                              {activity.instructions.map((instruction, idx) => (
                                <li key={idx}>{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teaching Strategies */}
                {generatedPlan.teachingStrategies && generatedPlan.teachingStrategies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-purple-500" />
                      Teaching Strategies
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedPlan.teachingStrategies.map((strategy, index) => (
                        <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h5 className="font-medium text-purple-900 mb-2">{strategy.name}</h5>
                          <p className="text-purple-800 text-sm mb-2">{strategy.description}</p>
                          <div className="text-xs text-purple-700">
                            <strong>Implementation:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {strategy.implementation.map((impl, idx) => (
                                <li key={idx}>{impl}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Aids */}
                {generatedPlan.visualAids && generatedPlan.visualAids.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-green-500" />
                      Visual Aids & Resources
                    </h4>
                    <div className="space-y-3">
                      {generatedPlan.visualAids.map((aid, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-green-900">{aid.type}</h5>
                            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                              {aid.purpose}
                            </span>
                          </div>
                          <p className="text-green-800 text-sm mb-2">{aid.description}</p>
                          <div className="text-xs text-green-700">
                            <strong>Creation Steps:</strong>
                            <ol className="list-decimal list-inside mt-1">
                              {aid.creationInstructions.map((instruction, idx) => (
                                <li key={idx}>{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {t('requiredMaterials') || 'Required Materials'}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {generatedPlan.materials.map((material, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{material}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment Methods */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Assessment Methods
                  </h4>
                  <div className="space-y-3">
                    {generatedPlan.assessment.map((method, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-blue-900">{method.type}</h5>
                          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            {method.timeRequired}
                          </span>
                        </div>
                        <p className="text-blue-800 text-sm mb-2">{method.description}</p>
                        <div className="text-xs text-blue-700">
                          <strong>Rubric:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {method.rubric.map((criterion, idx) => (
                              <li key={idx}>{criterion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Differentiation Strategies */}
                {generatedPlan.differentiation && generatedPlan.differentiation.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-orange-500" />
                      Differentiation Strategies
                    </h4>
                    <div className="space-y-3">
                      {generatedPlan.differentiation.map((diff, index) => (
                        <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <h5 className="font-medium text-orange-900 mb-2">{diff.learnerType}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="text-xs font-medium text-orange-800 mb-1">Adaptations:</h6>
                              <ul className="list-disc list-inside text-xs text-orange-700">
                                {diff.adaptations.map((adaptation, idx) => (
                                  <li key={idx}>{adaptation}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="text-xs font-medium text-orange-800 mb-1">Support Materials:</h6>
                              <ul className="list-disc list-inside text-xs text-orange-700">
                                {diff.supportMaterials.map((material, idx) => (
                                  <li key={idx}>{material}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cultural Context */}
                {generatedPlan.culturalContext && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      {t('culturalContext') || 'Cultural Context'}
                    </h4>
                    <p className="text-orange-800 text-sm">{generatedPlan.culturalContext}</p>
                    {generatedPlan.festivals && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {generatedPlan.festivals.map((festival, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            {festival}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up Voice Input */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">
                {t('needModifications') || 'Need any modifications?'}
              </h4>
              <VoiceInput
                onTranscript={(text) => {
                  // Handle refinement requests
                  speak(t('makingChanges') || 'Making those changes for you', { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
                }}
                placeholder={t('modificationPrompt') || 'Tell me what changes you need...'}
                autoSpeak={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cache Status (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
          <p>Cache Size: {geminiService.getCacheSize()} items</p>
          <p>Rate Limit Status: {geminiService.getRateLimitStatus().canMakeRequest ? 'Available' : 'Limited'}</p>
        </div>
      )}
    </div>
  );
};