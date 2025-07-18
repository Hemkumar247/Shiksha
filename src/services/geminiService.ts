import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyARfMwr6GwOOi6YkGFLVoJaYvHRhSDRqZc';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface StudentProfile {
  name: string;
  grade: string;
  subject: string;
  performanceLevel: string;
  learningStyle: string;
  interests: string[];
}

export interface LearningPathway {
  studentName: string;
  currentLevel: string;
  targetLevel: string;
  skillGaps: string[];
  recommendedPath: PathStep[];
  resources: Resource[];
  timeline: string;
  adaptiveFeatures: string[];
}

export interface PathStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  prerequisites: string[];
  activities: string[];
}

export interface Resource {
  type: string;
  title: string;
  description: string;
  url?: string;
  difficulty: string;
}

export class GeminiService {
  private visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async generateLearningPathway(studentProfile: StudentProfile): Promise<LearningPathway> {
    const prompt = `
    Create a personalized learning pathway for a student with the following profile:
    
    Student Name: ${studentProfile.name}
    Current Grade: ${studentProfile.grade}
    Subject: ${studentProfile.subject}
    Performance Level: ${studentProfile.performanceLevel}
    Learning Style: ${studentProfile.learningStyle}
    Interests: ${studentProfile.interests.join(', ')}
    
    Please generate a comprehensive learning pathway that includes:
    1. Identified skill gaps based on current performance
    2. A step-by-step learning path with 5-7 progressive steps
    3. Recommended resources for each step
    4. Estimated timeline for completion
    5. Adaptive features that cater to their learning style and interests
    
    Format the response as a detailed JSON structure that includes all the above elements.
    Make sure the pathway is age-appropriate for ${studentProfile.grade} and incorporates their interests in ${studentProfile.interests.join(', ')}.
    
    Consider multi-grade classroom scenarios where students might be at different levels within the same grade.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse JSON from Gemini response, using fallback');
      }
      
      // Fallback: Create structured response from text
      return this.createFallbackPathway(studentProfile, text);
    } catch (error) {
      console.error('Error generating learning pathway:', error);
      return this.createFallbackPathway(studentProfile);
    }
  }

  async generateVisualization(content: string, grade: string): Promise<string> {
    const prompt = `
    Create a detailed visualization description for the following educational content:
    
    Content: ${content}
    Target Grade: ${grade}
    
    Generate a comprehensive description of how to visualize this content in an engaging, age-appropriate way for ${grade} students. Include:
    1. Visual elements (diagrams, charts, animations)
    2. Interactive components
    3. Real-world examples and analogies
    4. Step-by-step breakdown
    5. Assessment opportunities
    
    Make it practical for teachers to implement in a classroom setting.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating visualization:', error);
      return 'Unable to generate visualization at this time. Please try again later.';
    }
  }

  async analyzeImage(imageData: string, prompt: string): Promise<string> {
    try {
      const imagePart = {
        inlineData: {
          data: imageData.split(',')[1],
          mimeType: 'image/jpeg'
        }
      };
      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing image:', error);
      return 'Unable to analyze image at this time. Please try again later.';
    }
  }

  private createFallbackPathway(studentProfile: StudentProfile, aiText?: string): LearningPathway {
    const gradeNumber = parseInt(studentProfile.grade.replace('Grade ', ''));
    
    return {
      studentName: studentProfile.name,
      currentLevel: studentProfile.performanceLevel,
      targetLevel: this.getTargetLevel(studentProfile.performanceLevel),
      skillGaps: this.generateSkillGaps(studentProfile.subject, studentProfile.performanceLevel),
      recommendedPath: this.generatePathSteps(studentProfile),
      resources: this.generateResources(studentProfile),
      timeline: this.generateTimeline(studentProfile.performanceLevel),
      adaptiveFeatures: this.generateAdaptiveFeatures(studentProfile)
    };
  }

  private getTargetLevel(currentLevel: string): string {
    switch (currentLevel) {
      case 'Beginner': return 'Intermediate';
      case 'Intermediate': return 'Advanced';
      case 'Advanced': return 'Expert';
      default: return 'Intermediate';
    }
  }

  private generateSkillGaps(subject: string, level: string): string[] {
    const gaps: { [key: string]: { [key: string]: string[] } } = {
      'Mathematics': {
        'Beginner': ['Basic number recognition', 'Simple addition/subtraction', 'Pattern recognition'],
        'Intermediate': ['Multiplication tables', 'Fraction concepts', 'Word problem solving'],
        'Advanced': ['Algebraic thinking', 'Geometry applications', 'Data interpretation']
      },
      'Tamil': {
        'Beginner': ['Letter recognition', 'Basic vocabulary', 'Simple sentence formation'],
        'Intermediate': ['Grammar rules', 'Reading comprehension', 'Creative writing'],
        'Advanced': ['Literary analysis', 'Advanced grammar', 'Poetry appreciation']
      },
      'Science': {
        'Beginner': ['Basic observation skills', 'Simple experiments', 'Nature awareness'],
        'Intermediate': ['Scientific method', 'Hypothesis formation', 'Data collection'],
        'Advanced': ['Complex experiments', 'Theory application', 'Research skills']
      }
    };

    return gaps[subject]?.[level] || ['Foundation concepts', 'Practical application', 'Critical thinking'];
  }

  private generatePathSteps(studentProfile: StudentProfile): PathStep[] {
    const baseSteps = [
      {
        id: '1',
        title: 'Foundation Assessment',
        description: `Evaluate current understanding of ${studentProfile.subject} concepts`,
        duration: '1 week',
        difficulty: 'Easy',
        prerequisites: [],
        activities: ['Diagnostic quiz', 'Practical demonstration', 'Peer discussion']
      },
      {
        id: '2',
        title: 'Core Concept Building',
        description: `Build fundamental ${studentProfile.subject} skills`,
        duration: '2 weeks',
        difficulty: 'Medium',
        prerequisites: ['Foundation Assessment'],
        activities: ['Interactive lessons', 'Hands-on practice', 'Group activities']
      },
      {
        id: '3',
        title: 'Application Practice',
        description: 'Apply learned concepts to real-world scenarios',
        duration: '2 weeks',
        difficulty: 'Medium',
        prerequisites: ['Core Concept Building'],
        activities: ['Project work', 'Problem solving', 'Case studies']
      },
      {
        id: '4',
        title: 'Advanced Integration',
        description: 'Integrate multiple concepts for complex understanding',
        duration: '3 weeks',
        difficulty: 'Hard',
        prerequisites: ['Application Practice'],
        activities: ['Research projects', 'Presentations', 'Peer teaching']
      },
      {
        id: '5',
        title: 'Mastery Demonstration',
        description: 'Demonstrate mastery through comprehensive assessment',
        duration: '1 week',
        difficulty: 'Hard',
        prerequisites: ['Advanced Integration'],
        activities: ['Final project', 'Comprehensive test', 'Portfolio review']
      }
    ];

    return baseSteps;
  }

  private generateResources(studentProfile: StudentProfile): Resource[] {
    return [
      {
        type: 'Interactive Tool',
        title: `${studentProfile.subject} Learning Games`,
        description: `Age-appropriate games for ${studentProfile.grade} students`,
        difficulty: studentProfile.performanceLevel,
      },
      {
        type: 'Video Content',
        title: 'Educational Videos',
        description: `Visual learning materials matching ${studentProfile.learningStyle} style`,
        difficulty: studentProfile.performanceLevel,
      },
      {
        type: 'Practice Worksheets',
        title: 'Skill Building Exercises',
        description: 'Progressive worksheets for skill development',
        difficulty: studentProfile.performanceLevel,
      },
      {
        type: 'Project Ideas',
        title: `${studentProfile.interests[0]} Integration Projects`,
        description: `Projects combining ${studentProfile.subject} with student interests`,
        difficulty: studentProfile.performanceLevel,
      }
    ];
  }

  private generateTimeline(performanceLevel: string): string {
    switch (performanceLevel) {
      case 'Beginner': return '8-10 weeks';
      case 'Intermediate': return '6-8 weeks';
      case 'Advanced': return '4-6 weeks';
      default: return '6-8 weeks';
    }
  }

  private generateAdaptiveFeatures(studentProfile: StudentProfile): string[] {
    const features = [
      `${studentProfile.learningStyle} learning approach prioritized`,
      `Integration with ${studentProfile.interests.join(' and ')} interests`,
      `Pace adjusted for ${studentProfile.performanceLevel} level`,
      'Regular progress checkpoints',
      'Flexible activity options'
    ];

    return features;
  }
}

export const geminiService = new GeminiService();