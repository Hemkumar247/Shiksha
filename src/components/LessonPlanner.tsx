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
  Plus,
  Trash2,
  Save,
  Edit,
  ArrowRight,
  PlayCircle,
  MessageCircle,
  Shuffle
} from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { LessonPlan, TeachingStep, LearningActivity } from '../types';

export const LessonPlanner: React.FC = () => {
  const { t, language } = useLanguage();
  const { addLessonPlan, updateLessonPlan } = useData();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [voiceInput, setVoiceInput] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Grade 3');
  const [selectedSubject, setSelectedSubject] = useState('Tamil');
  const [selectedDuration, setSelectedDuration] = useState(45);
  const [isEditing, setIsEditing] = useState(false);
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

  const activityTypes = [
    { value: 'interactive-group', label: 'Interactive Group Exercise', icon: Users },
    { value: 'hands-on-demo', label: 'Hands-on Demonstration', icon: PlayCircle },
    { value: 'role-playing', label: 'Role-playing Scenario', icon: Users },
    { value: 'problem-solving', label: 'Problem-solving Challenge', icon: Target },
    { value: 'real-world', label: 'Real-world Application', icon: Star },
    { value: 'digital-multimedia', label: 'Digital/Multimedia Resource', icon: BookOpen }
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

  const generateComprehensivePlan = (): LessonPlan => {
    const gradeNumber = selectedGrade.split(' ')[1];
    
    return {
      id: Date.now().toString(),
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
      festivals: [t('tamilNewYear'), 'Tamil Language Day'],
      createdAt: new Date(),
      teacherId: 'teacher1',
      preparationRequirements: [
        'Review lesson objectives and materials',
        'Prepare visual aids and handouts',
        'Set up classroom for group activities',
        'Test any technology or multimedia resources',
        'Prepare assessment materials'
      ],
      teachingSequence: [
        {
          id: '1',
          step: 'Opening & Review',
          description: 'Greet students, take attendance, and review previous lesson',
          duration: Math.floor(selectedDuration * 0.1),
          materials: ['Attendance sheet', 'Previous lesson notes'],
          notes: 'Check homework and address any questions'
        },
        {
          id: '2',
          step: 'Introduction',
          description: 'Introduce new topic with engaging hook',
          duration: Math.floor(selectedDuration * 0.15),
          materials: ['Visual aids', 'Props or examples'],
          notes: 'Connect to students\' prior knowledge'
        },
        {
          id: '3',
          step: 'Main Content Delivery',
          description: 'Present core concepts with examples',
          duration: Math.floor(selectedDuration * 0.35),
          materials: ['Textbook', 'Blackboard', 'Handouts'],
          notes: 'Use multiple teaching methods for different learning styles'
        },
        {
          id: '4',
          step: 'Guided Practice',
          description: 'Work through examples together',
          duration: Math.floor(selectedDuration * 0.25),
          materials: ['Practice worksheets', 'Manipulatives'],
          notes: 'Encourage student participation and questions'
        },
        {
          id: '5',
          step: 'Assessment & Closure',
          description: 'Quick assessment and lesson summary',
          duration: Math.floor(selectedDuration * 0.15),
          materials: ['Assessment materials', 'Homework sheets'],
          notes: 'Assign homework and preview next lesson'
        }
      ],
      discussionPrompts: [
        'What do you already know about this topic?',
        'How does this connect to what we learned yesterday?',
        'Can you give me an example from your daily life?',
        'What questions do you have so far?',
        'How might you explain this to a friend?'
      ],
      transitionPoints: [
        'Now that we understand the basics, let\'s explore...',
        'Let\'s move from theory to practice',
        'Time to work together on applying what we\'ve learned',
        'Let\'s see how well you understand by...'
      ],
      learningActivities: [
        {
          id: '1',
          type: 'interactive-group',
          title: 'Collaborative Learning Exercise',
          description: 'Students work in small groups to explore concepts',
          duration: 15,
          participants: 'Groups of 4-5 students',
          materials: ['Group worksheets', 'Markers', 'Chart paper'],
          instructions: [
            'Divide into groups of 4-5 students',
            'Each group receives a different aspect to explore',
            'Discuss and create a visual representation',
            'Present findings to the class',
            'Ask questions and provide feedback'
          ]
        },
        {
          id: '2',
          type: 'hands-on-demo',
          title: 'Interactive Demonstration',
          description: 'Teacher demonstrates with student participation',
          duration: 10,
          participants: 'Whole class with individual volunteers',
          materials: ['Demo materials', 'Safety equipment if needed'],
          instructions: [
            'Teacher explains the demonstration',
            'Students predict outcomes',
            'Volunteers assist with demonstration',
            'Class observes and takes notes',
            'Discuss results and implications'
          ]
        },
        {
          id: '3',
          type: 'problem-solving',
          title: 'Challenge Activity',
          description: 'Students solve real-world problems using new concepts',
          duration: 12,
          participants: 'Pairs or small groups',
          materials: ['Problem scenarios', 'Solution sheets', 'Reference materials'],
          instructions: [
            'Present real-world problem scenario',
            'Students analyze the problem',
            'Apply lesson concepts to find solutions',
            'Compare different approaches',
            'Discuss most effective solutions'
          ]
        }
      ],
      pacing: {
        introduction: Math.floor(selectedDuration * 0.15),
        mainContent: Math.floor(selectedDuration * 0.35),
        activities: Math.floor(selectedDuration * 0.35),
        assessment: Math.floor(selectedDuration * 0.1),
        closure: Math.floor(selectedDuration * 0.05)
      }
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
    
    const plan = generateComprehensivePlan();
    setGeneratedPlan(plan);
    setCurrentStep(2);
    setIsGenerating(false);
    
    speak(t('lessonReady'), { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
  };

  const handleSavePlan = () => {
    if (generatedPlan) {
      if (isEditing) {
        updateLessonPlan(generatedPlan.id, generatedPlan);
        speak('Lesson plan updated successfully', { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
      } else {
        addLessonPlan(generatedPlan);
        speak('Lesson plan saved successfully', { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
      }
    }
  };

  const handleSpeak = (text: string) => {
    speak(text, { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
  };

  const handleDownload = () => {
    speak('Downloading lesson plan', { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
    // Download logic here
  };

  const addTeachingStep = () => {
    if (generatedPlan) {
      const newStep: TeachingStep = {
        id: Date.now().toString(),
        step: 'New Step',
        description: 'Description of the new step',
        duration: 5,
        materials: [],
        notes: ''
      };
      setGeneratedPlan({
        ...generatedPlan,
        teachingSequence: [...generatedPlan.teachingSequence, newStep]
      });
    }
  };

  const removeTeachingStep = (stepId: string) => {
    if (generatedPlan) {
      setGeneratedPlan({
        ...generatedPlan,
        teachingSequence: generatedPlan.teachingSequence.filter(step => step.id !== stepId)
      });
    }
  };

  const addLearningActivity = () => {
    if (generatedPlan) {
      const newActivity: LearningActivity = {
        id: Date.now().toString(),
        type: 'interactive-group',
        title: 'New Activity',
        description: 'Description of the new activity',
        duration: 10,
        participants: 'All students',
        materials: [],
        instructions: []
      };
      setGeneratedPlan({
        ...generatedPlan,
        learningActivities: [...generatedPlan.learningActivities, newActivity]
      });
    }
  };

  const removeLearningActivity = (activityId: string) => {
    if (generatedPlan) {
      setGeneratedPlan({
        ...generatedPlan,
        learningActivities: generatedPlan.learningActivities.filter(activity => activity.id !== activityId)
      });
    }
  };

  const ActivityTypeIcon = ({ type }: { type: string }) => {
    const activityType = activityTypes.find(at => at.value === type);
    const Icon = activityType?.icon || BookOpen;
    return <Icon className="h-4 w-4" />;
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
                  Creating comprehensive lesson plan for {selectedGrade} {selectedSubject} ({selectedDuration} minutes)
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
                <p>• Creating teaching sequence</p>
                <p>• Designing learning activities</p>
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
                  onClick={handleSavePlan}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="h-4 w-4" />
                  <span>Save Plan</span>
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

              <div className="p-6 space-y-8">
                {/* Preparation Requirements */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Pre-lesson Preparation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {generatedPlan.preparationRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-green-800">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teaching Sequence */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <ArrowRight className="h-5 w-5 mr-2 text-blue-500" />
                      Step-by-step Teaching Sequence
                    </h4>
                    <motion.button
                      onClick={addTeachingStep}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Step</span>
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    {generatedPlan.teachingSequence.map((step, index) => (
                      <div key={step.id} className="border border-gray-200 rounded-lg p-4 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <h5 className="font-medium text-gray-900">{step.step}</h5>
                              <span className="text-sm text-gray-500">({step.duration} min)</span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2 ml-11">{step.description}</p>
                            {step.materials && step.materials.length > 0 && (
                              <div className="ml-11">
                                <span className="text-xs font-medium text-gray-600">Materials: </span>
                                <span className="text-xs text-gray-600">{step.materials.join(', ')}</span>
                              </div>
                            )}
                            {step.notes && (
                              <div className="ml-11 mt-1">
                                <span className="text-xs font-medium text-gray-600">Notes: </span>
                                <span className="text-xs text-gray-600">{step.notes}</span>
                              </div>
                            )}
                          </div>
                          <motion.button
                            onClick={() => removeTeachingStep(step.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discussion Prompts */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-purple-500" />
                    Discussion Prompts & Questions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {generatedPlan.discussionPrompts.map((prompt, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-purple-800 text-sm">"{prompt}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Activities */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Engaging Learning Activities
                    </h4>
                    <motion.button
                      onClick={addLearningActivity}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Activity</span>
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    {generatedPlan.learningActivities.map((activity) => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-100 rounded-full">
                              <ActivityTypeIcon type={activity.type} />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{activity.title}</h5>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>{activity.duration} minutes</span>
                                <span>•</span>
                                <span>{activity.participants}</span>
                              </div>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => removeLearningActivity(activity.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3">{activity.description}</p>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-600">Materials: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {activity.materials.map((material, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-xs font-medium text-gray-600">Instructions:</span>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              {activity.instructions.map((instruction, idx) => (
                                <li key={idx} className="text-xs text-gray-600">{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transition Points */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Shuffle className="h-5 w-5 mr-2 text-indigo-500" />
                    Smooth Transition Points
                  </h4>
                  <div className="space-y-2">
                    {generatedPlan.transitionPoints.map((transition, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                        <ArrowRight className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <p className="text-indigo-800 text-sm">"{transition}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pacing Guide */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-500" />
                    Lesson Pacing Guide
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{generatedPlan.pacing.introduction}m</div>
                      <div className="text-sm text-orange-800">Introduction</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{generatedPlan.pacing.mainContent}m</div>
                      <div className="text-sm text-blue-800">Main Content</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{generatedPlan.pacing.activities}m</div>
                      <div className="text-sm text-green-800">Activities</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{generatedPlan.pacing.assessment}m</div>
                      <div className="text-sm text-purple-800">Assessment</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">{generatedPlan.pacing.closure}m</div>
                      <div className="text-sm text-gray-800">Closure</div>
                    </div>
                  </div>
                </div>

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