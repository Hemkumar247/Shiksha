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
}

export interface Activity {
  id: string;
  name: string;
  duration: number;
  description: string;
  type: 'discussion' | 'hands-on' | 'presentation' | 'assessment';
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