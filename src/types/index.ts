export interface Teacher {
  id: string;
  name: string;
  school: string;
  region: string;
  language: string;
  avatar?: string;
  joinedAt: Date;
}

export interface LessonPlan {
  id: string;
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
  createdAt: Date;
  teacherId: string;
  // New comprehensive planning fields
  preparationRequirements: string[];
  teachingSequence: TeachingStep[];
  discussionPrompts: string[];
  transitionPoints: string[];
  learningActivities: LearningActivity[];
  pacing: PacingGuide;
}

export interface Activity {
  id: string;
  name: string;
  duration: number;
  description: string;
  type: 'discussion' | 'hands-on' | 'presentation' | 'assessment';
}

export interface TeachingStep {
  id: string;
  step: string;
  description: string;
  duration: number;
  materials?: string[];
  notes?: string;
}

export interface LearningActivity {
  id: string;
  type: 'interactive-group' | 'hands-on-demo' | 'role-playing' | 'problem-solving' | 'real-world' | 'digital-multimedia';
  title: string;
  description: string;
  duration: number;
  participants: string;
  materials: string[];
  instructions: string[];
}

export interface PacingGuide {
  introduction: number;
  mainContent: number;
  activities: number;
  assessment: number;
  closure: number;
}

export interface StudentFeedback {
  id: string;
  lessonId: string;
  studentId?: string;
  studentName?: string;
  rating: number; // Overall effectiveness (1-5)
  clarityRating: number; // Instruction clarity (1-5)
  paceRating: number; // Lesson delivery pace (1-5)
  engagementRating: number; // Activity engagement (1-5)
  understandingRating: number; // Concept understanding (1-5)
  areasForImprovement: string;
  teachingMethodsComments: string;
  futureLessonSuggestions: string;
  timestamp: Date;
  isAnonymous: boolean;
}

export interface FeedbackAnalytics {
  averageRating: number;
  averageClarityRating: number;
  averagePaceRating: number;
  averageEngagementRating: number;
  averageUnderstandingRating: number;
  totalFeedbacks: number;
  commonImprovementAreas: string[];
  topTeachingMethods: string[];
  frequentSuggestions: string[];
}

export interface VoiceCommand {
  text: string;
  confidence: number;
  timestamp: Date;
}

export interface DashboardStats {
  totalLessons: number;
  totalStudents: number;
  averageRating: number;
  monthlyGrowth: number;
}