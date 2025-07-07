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
  GraduationCap
} from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLanguage } from '../contexts/LanguageContext';

interface Activity {
  id: string;
  name: string;
  duration: number;
  description: string;
  type: 'discussion' | 'hands-on' | 'presentation' | 'assessment';
}

interface LessonPlan {
  title: string;
  subject: string;
  grade: string;
  duration: number;
  objectives: string[];
  activities: Activity[];
  materials: string[];
  assessment: string;
  culturalContext?: string;
  festivals?: string[];
}

export const LessonPlanner: React.FC = () => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [voiceInput, setVoiceInput] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Grade 3');
  const [selectedSubject, setSelectedSubject] = useState('Tamil');
  const [selectedDuration, setSelectedDuration] = useState(45);
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

  const steps = [
    {
      id: 'input',
      title: t('describeLessonTitle'),
      description: t('describeLessonSubtitle'),
      prompt: t('lessonPrompt')
    },
    {
      id: 'generate',
      title: t('generatingLesson'),
      description: t('generatingSubtext'),
      prompt: ''
    },
    {
      id: 'review',
      title: t('reviewLesson'),
      description: t('reviewSubtext'),
      prompt: ''
    }
  ];

  const handleVoiceInput = (transcript: string) => {
    setVoiceInput(transcript);
  };

  const generateSamplePlan = (): LessonPlan => {
    // Generate content based on selected parameters
    const gradeNumber = selectedGrade.split(' ')[1];
    
    return {
      title: `${selectedSubject} - ${voiceInput || t('sampleLessonTitle')}`,
      subject: selectedSubject,
      grade: selectedGrade,
      duration: selectedDuration,
      objectives: [
        `${selectedGrade} students should understand the basic concepts`,
        `Students should be able to apply knowledge practically`,
        `Students should demonstrate understanding through activities`,
        `Students should connect learning to real-life situations`
      ],
      activities: [
        {
          id: '1',
          name: t('sampleActivity1'),
          duration: Math.floor(selectedDuration * 0.2),
          description: `Introduction and explanation suitable for ${selectedGrade}`,
          type: 'presentation'
        },
        {
          id: '2',
          name: t('sampleActivity2'),
          duration: Math.floor(selectedDuration * 0.4),
          description: `Hands-on activity designed for ${selectedGrade} level`,
          type: 'hands-on'
        },
        {
          id: '3',
          name: t('sampleActivity3'),
          duration: Math.floor(selectedDuration * 0.3),
          description: `Group discussion appropriate for ${selectedGrade}`,
          type: 'discussion'
        },
        {
          id: '4',
          name: t('sampleActivity4'),
          duration: Math.floor(selectedDuration * 0.1),
          description: `Assessment suitable for ${selectedGrade} students`,
          type: 'assessment'
        }
      ],
      materials: [
        `${selectedSubject} textbook for ${selectedGrade}`,
        'Blackboard and chalk',
        'Visual aids and charts',
        'Activity worksheets'
      ],
      assessment: `Students should demonstrate understanding appropriate for ${selectedGrade} level`,
      culturalContext: t('sampleCulturalContext'),
      festivals: [t('tamilNewYear'), 'Tamil Language Day']
    };
  };

  const handleGenerate = async () => {
    if (!voiceInput.trim()) {
      speak(t('provideDetails'), { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
      return;
    }

    setIsGenerating(true);
    setCurrentStep(1);
    
    speak(`${t('processingRequest')} for ${selectedGrade} ${selectedSubject}`, { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const plan = generateSamplePlan();
    setGeneratedPlan(plan);
    setCurrentStep(2);
    setIsGenerating(false);
    
    speak(t('lessonReady'), { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
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
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                {t('describeLessonTitle')}
              </h2>
              <p className="text-gray-600">
                {t('describeLessonSubtitle')}
              </p>
            </div>

            {/* Grade and Subject Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                Lesson Parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <h4 className="font-medium text-green-900 mb-2">{t('yourRequest')}</h4>
                  <p className="text-green-800">{voiceInput}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <motion.button
                onClick={handleGenerate}
                disabled={!voiceInput.trim()}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  voiceInput.trim()
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={voiceInput.trim() ? { scale: 1.05 } : {}}
                whileTap={voiceInput.trim() ? { scale: 0.95 } : {}}
              >
                {t('generateLesson')}
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
                  {t('generatingLesson')}
                </h2>
                <p className="text-gray-600">
                  Creating lesson plan for {selectedGrade} {selectedSubject} ({selectedDuration} minutes)
                </p>
              </div>

              <div className="flex justify-center space-x-2">
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

              <div className="mt-6 text-sm text-gray-500">
                <p>{t('generatingStructure')}</p>
                <p>{t('planningActivities')}</p>
                <p>{t('addingFestivalContext')}</p>
                <p>{t('addingCulturalContext')}</p>
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
                  {t('reviewLesson')}
                </h2>
                <p className="text-gray-600">{t('reviewSubtext')}</p>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => handleSpeak(`${generatedPlan.title} lesson plan details`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Volume2 className="h-4 w-4" />
                  <span>{t('listen')}</span>
                </motion.button>
                <motion.button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4" />
                  <span>{t('download')}</span>
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
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Objectives */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    {t('learningObjectives')}
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
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-secondary" />
                    {t('activities')}
                  </h4>
                  <div className="space-y-3">
                    {generatedPlan.activities.map((activity) => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <ActivityTypeIcon type={activity.type} />
                            <span className="font-medium text-gray-900">{activity.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {activity.duration} {language === 'ta' ? 'நிமிடங்கள்' : 'minutes'}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {t('requiredMaterials')}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {generatedPlan.materials.map((material, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{material}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cultural Context */}
                {generatedPlan.culturalContext && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      {t('culturalContext')}
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

                {/* Assessment */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {t('evaluation')}
                  </h4>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                    {generatedPlan.assessment}
                  </p>
                </div>
              </div>
            </div>

            {/* Follow-up Voice Input */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">
                {t('needModifications')}
              </h4>
              <VoiceInput
                onTranscript={(text) => {
                  // Handle refinement requests
                  speak(t('makingChanges'), { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
                }}
                placeholder={t('modificationPrompt')}
                autoSpeak={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};