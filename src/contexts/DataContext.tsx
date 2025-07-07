import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LessonPlan, StudentFeedback, FeedbackAnalytics } from '../types';

interface DataContextType {
  lessonPlans: LessonPlan[];
  studentFeedback: StudentFeedback[];
  addLessonPlan: (lessonPlan: LessonPlan) => void;
  updateLessonPlan: (id: string, lessonPlan: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;
  getLessonPlan: (id: string) => LessonPlan | undefined;
  addStudentFeedback: (feedback: StudentFeedback) => void;
  getFeedbackForLesson: (lessonId: string) => StudentFeedback[];
  getFeedbackAnalytics: (lessonId?: string) => FeedbackAnalytics;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([
    // Sample lesson plan for demonstration
    {
      id: '1',
      title: 'Tamil Grammar - Nouns and Verbs',
      subject: 'Tamil',
      grade: 'Grade 3',
      duration: 45,
      objectives: [
        'Students will identify nouns and verbs in sentences',
        'Students will understand the difference between nouns and verbs',
        'Students will create sentences using nouns and verbs'
      ],
      activities: [
        {
          id: '1',
          name: 'Introduction',
          duration: 10,
          description: 'Introduce the concept of nouns and verbs',
          type: 'presentation'
        }
      ],
      materials: ['Blackboard', 'Chalk', 'Word cards', 'Tamil textbook'],
      assessment: 'Students will identify 5 nouns and 5 verbs from a given paragraph',
      culturalContext: 'Using examples from Tamil literature and daily life',
      festivals: ['Tamil New Year'],
      createdAt: new Date('2024-01-15'),
      teacherId: 'teacher1',
      preparationRequirements: [
        'Prepare word cards with nouns and verbs',
        'Review Tamil grammar rules',
        'Set up classroom for group activities',
        'Prepare assessment materials'
      ],
      teachingSequence: [
        {
          id: '1',
          step: 'Opening',
          description: 'Greet students and review previous lesson',
          duration: 5,
          materials: ['Attendance sheet'],
          notes: 'Check homework completion'
        },
        {
          id: '2',
          step: 'Introduction',
          description: 'Introduce nouns and verbs with examples',
          duration: 10,
          materials: ['Blackboard', 'Word cards'],
          notes: 'Use familiar objects and actions'
        },
        {
          id: '3',
          step: 'Guided Practice',
          description: 'Work through examples together',
          duration: 15,
          materials: ['Textbook', 'Worksheets'],
          notes: 'Encourage student participation'
        },
        {
          id: '4',
          step: 'Independent Practice',
          description: 'Students work on identifying nouns and verbs',
          duration: 10,
          materials: ['Practice sheets'],
          notes: 'Monitor and provide individual help'
        },
        {
          id: '5',
          step: 'Closure',
          description: 'Review key concepts and assign homework',
          duration: 5,
          materials: ['Homework sheets'],
          notes: 'Summarize main points'
        }
      ],
      discussionPrompts: [
        'Can you name three things you can see in this classroom?',
        'What actions are you doing right now?',
        'How do nouns and verbs work together in a sentence?',
        'Can you think of a noun that becomes a verb?',
        'What nouns and verbs do you use at home?'
      ],
      transitionPoints: [
        'Now that we understand what nouns are, let\'s explore verbs',
        'Let\'s move from examples to practice',
        'Time to work independently on what we\'ve learned',
        'Let\'s come together to share what we discovered'
      ],
      learningActivities: [
        {
          id: '1',
          type: 'interactive-group',
          title: 'Noun and Verb Sorting Game',
          description: 'Students work in groups to sort word cards into nouns and verbs',
          duration: 15,
          participants: 'Groups of 4-5 students',
          materials: ['Word cards', 'Sorting mats', 'Timer'],
          instructions: [
            'Divide into groups of 4-5 students',
            'Each group gets a set of word cards',
            'Sort cards into noun and verb categories',
            'Discuss any challenging words as a group',
            'Present findings to the class'
          ]
        },
        {
          id: '2',
          type: 'hands-on-demo',
          title: 'Action and Object Demonstration',
          description: 'Students demonstrate verbs and point to nouns',
          duration: 10,
          participants: 'Individual students',
          materials: ['Action cards', 'Classroom objects'],
          instructions: [
            'Student picks an action card',
            'Demonstrates the action (verb)',
            'Points to an object (noun) in the classroom',
            'Class identifies both the verb and noun',
            'Discuss how they work together'
          ]
        },
        {
          id: '3',
          type: 'problem-solving',
          title: 'Sentence Building Challenge',
          description: 'Create meaningful sentences using given nouns and verbs',
          duration: 12,
          participants: 'Pairs of students',
          materials: ['Noun cards', 'Verb cards', 'Writing materials'],
          instructions: [
            'Each pair gets noun and verb cards',
            'Create 5 different sentences',
            'Sentences must make sense',
            'Underline nouns and circle verbs',
            'Share best sentences with class'
          ]
        }
      ],
      pacing: {
        introduction: 10,
        mainContent: 20,
        activities: 10,
        assessment: 3,
        closure: 2
      }
    }
  ]);

  const [studentFeedback, setStudentFeedback] = useState<StudentFeedback[]>([
    // Sample feedback for demonstration
    {
      id: '1',
      lessonId: '1',
      studentName: 'Arun Kumar',
      rating: 5,
      clarityRating: 5,
      paceRating: 4,
      engagementRating: 5,
      understandingRating: 4,
      areasForImprovement: 'Could use more examples from daily life',
      teachingMethodsComments: 'The group activities were very engaging and fun',
      futureLessonSuggestions: 'More games and interactive activities',
      timestamp: new Date('2024-01-15T14:30:00'),
      isAnonymous: false
    },
    {
      id: '2',
      lessonId: '1',
      studentName: 'Priya Devi',
      rating: 4,
      clarityRating: 5,
      paceRating: 5,
      engagementRating: 4,
      understandingRating: 5,
      areasForImprovement: 'Sometimes the explanations were too fast',
      teachingMethodsComments: 'I liked the word sorting game',
      futureLessonSuggestions: 'More time for practice',
      timestamp: new Date('2024-01-15T14:35:00'),
      isAnonymous: false
    }
  ]);

  const addLessonPlan = (lessonPlan: LessonPlan) => {
    setLessonPlans(prev => [...prev, lessonPlan]);
  };

  const updateLessonPlan = (id: string, updates: Partial<LessonPlan>) => {
    setLessonPlans(prev => 
      prev.map(plan => 
        plan.id === id ? { ...plan, ...updates } : plan
      )
    );
  };

  const deleteLessonPlan = (id: string) => {
    setLessonPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const getLessonPlan = (id: string) => {
    return lessonPlans.find(plan => plan.id === id);
  };

  const addStudentFeedback = (feedback: StudentFeedback) => {
    setStudentFeedback(prev => [...prev, feedback]);
  };

  const getFeedbackForLesson = (lessonId: string) => {
    return studentFeedback.filter(feedback => feedback.lessonId === lessonId);
  };

  const getFeedbackAnalytics = (lessonId?: string): FeedbackAnalytics => {
    const relevantFeedback = lessonId 
      ? studentFeedback.filter(f => f.lessonId === lessonId)
      : studentFeedback;

    if (relevantFeedback.length === 0) {
      return {
        averageRating: 0,
        averageClarityRating: 0,
        averagePaceRating: 0,
        averageEngagementRating: 0,
        averageUnderstandingRating: 0,
        totalFeedbacks: 0,
        commonImprovementAreas: [],
        topTeachingMethods: [],
        frequentSuggestions: []
      };
    }

    const totalFeedbacks = relevantFeedback.length;
    
    return {
      averageRating: relevantFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks,
      averageClarityRating: relevantFeedback.reduce((sum, f) => sum + f.clarityRating, 0) / totalFeedbacks,
      averagePaceRating: relevantFeedback.reduce((sum, f) => sum + f.paceRating, 0) / totalFeedbacks,
      averageEngagementRating: relevantFeedback.reduce((sum, f) => sum + f.engagementRating, 0) / totalFeedbacks,
      averageUnderstandingRating: relevantFeedback.reduce((sum, f) => sum + f.understandingRating, 0) / totalFeedbacks,
      totalFeedbacks,
      commonImprovementAreas: extractCommonThemes(relevantFeedback.map(f => f.areasForImprovement)),
      topTeachingMethods: extractCommonThemes(relevantFeedback.map(f => f.teachingMethodsComments)),
      frequentSuggestions: extractCommonThemes(relevantFeedback.map(f => f.futureLessonSuggestions))
    };
  };

  const extractCommonThemes = (texts: string[]): string[] => {
    const words = texts
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  };

  return (
    <DataContext.Provider value={{
      lessonPlans,
      studentFeedback,
      addLessonPlan,
      updateLessonPlan,
      deleteLessonPlan,
      getLessonPlan,
      addStudentFeedback,
      getFeedbackForLesson,
      getFeedbackAnalytics
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};