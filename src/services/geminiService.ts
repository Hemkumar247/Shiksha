import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { debounce } from 'lodash';

const API_KEY = 'AIzaSyARfMwr6GwOOi6YkGFLVoJaYvHRhSDRqZc';
const genAI = new GoogleGenerativeAI(API_KEY);

// Interfaces
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
  assessmentMethods: AssessmentMethod[];
  realWorldApplications: string[];
}

export interface PathStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  prerequisites: string[];
  activities: string[];
  learningObjectives: string[];
  assessmentCriteria: string[];
}

export interface Resource {
  type: string;
  title: string;
  description: string;
  url?: string;
  difficulty: string;
  estimatedTime: string;
  interactivityLevel: string;
}

export interface AssessmentMethod {
  type: string;
  description: string;
  rubric: string[];
  timeRequired: string;
}

export interface LessonPlan {
  title: string;
  subject: string;
  grade: string;
  duration: number;
  objectives: string[];
  activities: LessonActivity[];
  materials: string[];
  assessment: AssessmentMethod[];
  culturalContext?: string;
  festivals?: string[];
  teachingStrategies: TeachingStrategy[];
  visualAids: VisualAid[];
  differentiation: DifferentiationStrategy[];
}

export interface LessonActivity {
  id: string;
  name: string;
  duration: number;
  description: string;
  type: 'discussion' | 'hands-on' | 'presentation' | 'assessment' | 'interactive' | 'collaborative';
  materials: string[];
  instructions: string[];
  learningObjectives: string[];
}

export interface TeachingStrategy {
  name: string;
  description: string;
  implementation: string[];
  suitableFor: string[];
}

export interface VisualAid {
  type: string;
  description: string;
  purpose: string;
  creationInstructions: string[];
}

export interface DifferentiationStrategy {
  learnerType: string;
  adaptations: string[];
  supportMaterials: string[];
}

export interface ChalkVisionAnalysis {
  extractedText: string;
  identifiedConcepts: string[];
  subjectArea: string;
  gradeLevel: string;
  difficultyLevel: string;
  suggestions: ContentSuggestion[];
  visualizationRecommendations: VisualizationRecommendation[];
  nextSteps: string[];
  assessmentQuestions: AssessmentQuestion[];
}

export interface ContentSuggestion {
  type: 'example' | 'explanation' | 'activity' | 'assessment' | 'extension';
  title: string;
  description: string;
  implementation: string[];
  timeRequired: string;
}

export interface VisualizationRecommendation {
  type: string;
  title: string;
  description: string;
  materials: string[];
  steps: string[];
  learningOutcome: string;
}

export interface AssessmentQuestion {
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'practical' | 'oral';
  question: string;
  expectedAnswer?: string;
  rubric?: string[];
  difficulty: string;
}

// Cache and Rate Limiting
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 60, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.timeWindow - (Date.now() - oldestRequest));
  }
}

// Content Validator
class ContentValidator {
  static validateLearningPathway(pathway: any): boolean {
    const required = ['studentName', 'currentLevel', 'targetLevel', 'recommendedPath'];
    return required.every(field => pathway && pathway[field]);
  }

  static validateLessonPlan(plan: any): boolean {
    const required = ['title', 'subject', 'grade', 'objectives', 'activities'];
    return required.every(field => plan && plan[field]);
  }

  static validateChalkVisionAnalysis(analysis: any): boolean {
    const required = ['extractedText', 'identifiedConcepts', 'suggestions'];
    return required.every(field => analysis && analysis[field]);
  }

  static sanitizeContent(content: string): string {
    // Remove potentially harmful content
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  static isAgeAppropriate(content: string, grade: string): boolean {
    const gradeNum = parseInt(grade.replace('Grade ', ''));
    const inappropriateWords = ['violence', 'inappropriate', 'adult'];
    
    // Simple content filtering - in production, use more sophisticated filtering
    const hasInappropriateContent = inappropriateWords.some(word => 
      content.toLowerCase().includes(word)
    );

    return !hasInappropriateContent;
  }
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });
  private visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  private cache = new APICache();
  private rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute
  private retryCount = 3;
  private retryDelay = 1000;

  // Debounced methods to prevent rapid-fire requests
  private debouncedGeneratePathway = debounce(this.generateLearningPathway.bind(this), 500);
  private debouncedGenerateLesson = debounce(this.generateLessonPlan.bind(this), 500);
  private debouncedAnalyzeContent = debounce(this.analyzeChalkVisionContent.bind(this), 500);

  private async makeRequest<T>(
    requestFn: () => Promise<T>,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check rate limit
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getWaitTime();
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Make request with retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        const result = await requestFn();
        
        // Cache successful result
        if (cacheKey) {
          this.cache.set(cacheKey, result, cacheTTL);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async generateLearningPathway(studentProfile: StudentProfile): Promise<LearningPathway> {
    const cacheKey = `pathway_${JSON.stringify(studentProfile)}`;
    
    return this.makeRequest(async () => {
      const prompt = this.createPathwayPrompt(studentProfile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      let pathway = this.parsePathwayResponse(text, studentProfile);
      
      // Validate and sanitize content
      if (!ContentValidator.validateLearningPathway(pathway)) {
        pathway = this.createFallbackPathway(studentProfile);
      }

      // Ensure age-appropriate content
      if (!ContentValidator.isAgeAppropriate(JSON.stringify(pathway), studentProfile.grade)) {
        pathway = this.createFallbackPathway(studentProfile);
      }

      return pathway;
    }, cacheKey, 20 * 60 * 1000); // Cache for 20 minutes
  }

  async generateLessonPlan(params: {
    subject: string;
    grade: string;
    duration: number;
    objectives: string[];
    teachingStyle: string;
    topic: string;
  }): Promise<LessonPlan> {
    const cacheKey = `lesson_${JSON.stringify(params)}`;
    
    return this.makeRequest(async () => {
      const prompt = this.createLessonPrompt(params);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      let lessonPlan = this.parseLessonResponse(text, params);
      
      // Validate and sanitize content
      if (!ContentValidator.validateLessonPlan(lessonPlan)) {
        lessonPlan = this.createFallbackLessonPlan(params);
      }

      // Ensure age-appropriate content
      if (!ContentValidator.isAgeAppropriate(JSON.stringify(lessonPlan), params.grade)) {
        lessonPlan = this.createFallbackLessonPlan(params);
      }

      return lessonPlan;
    }, cacheKey, 15 * 60 * 1000); // Cache for 15 minutes
  }

  async analyzeChalkVisionContent(imageData: string, grade: string): Promise<ChalkVisionAnalysis> {
    const cacheKey = `chalkvision_${imageData.substring(0, 100)}_${grade}`;
    
    return this.makeRequest(async () => {
      const prompt = this.createChalkVisionPrompt(grade);
      
      // Convert base64 to proper format for Gemini
      const imagePart = {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: "image/jpeg"
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      let analysis = this.parseChalkVisionResponse(text, grade);
      
      // Validate and sanitize content
      if (!ContentValidator.validateChalkVisionAnalysis(analysis)) {
        analysis = this.createFallbackChalkVisionAnalysis();
      }

      // Ensure age-appropriate content
      if (!ContentValidator.isAgeAppropriate(JSON.stringify(analysis), grade)) {
        analysis = this.createFallbackChalkVisionAnalysis();
      }

      return analysis;
    }, cacheKey, 10 * 60 * 1000); // Cache for 10 minutes
  }

  async generateVisualization(content: string, grade: string): Promise<VisualizationRecommendation[]> {
    const cacheKey = `visualization_${content.substring(0, 50)}_${grade}`;
    
    return this.makeRequest(async () => {
      const prompt = `
      Create detailed visualization recommendations for the following educational content:
      
      Content: ${content}
      Target Grade: ${grade}
      
      Generate 3-5 comprehensive visualization recommendations that include:
      1. Type of visualization (diagram, model, animation, interactive demo, etc.)
      2. Clear title and description
      3. Required materials (easily available in schools)
      4. Step-by-step implementation instructions
      5. Expected learning outcome
      
      Make visualizations:
      - Age-appropriate for ${grade}
      - Practical for classroom implementation
      - Engaging and interactive
      - Aligned with curriculum standards
      - Inclusive for different learning styles
      
      Format as JSON array with proper structure.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.warn('Could not parse visualization JSON, using fallback');
      }
      
      return this.createFallbackVisualizations(content, grade);
    }, cacheKey, 25 * 60 * 1000); // Cache for 25 minutes
  }

  // Prompt creation methods
  private createPathwayPrompt(studentProfile: StudentProfile): string {
    return `
    Create a comprehensive, personalized learning pathway for:
    
    Student: ${studentProfile.name}
    Grade: ${studentProfile.grade}
    Subject: ${studentProfile.subject}
    Current Performance: ${studentProfile.performanceLevel}
    Learning Style: ${studentProfile.learningStyle}
    Interests: ${studentProfile.interests.join(', ')}
    
    Generate a detailed pathway including:
    
    1. SKILL GAP ANALYSIS:
       - Identify 3-5 specific skill gaps based on current performance
       - Prioritize gaps by importance and difficulty
    
    2. LEARNING PATH (5-7 progressive steps):
       - Each step with clear title, description, duration
       - Specific learning objectives for each step
       - Prerequisites and dependencies
       - Age-appropriate activities and exercises
       - Assessment criteria for completion
    
    3. RESOURCES & MATERIALS:
       - Interactive tools and games
       - Visual/audio materials matching learning style
       - Practice worksheets and exercises
       - Real-world application projects
       - Include estimated time and interactivity level
    
    4. ASSESSMENT METHODS:
       - Formative and summative assessments
       - Rubrics and success criteria
       - Self-assessment opportunities
       - Peer evaluation activities
    
    5. REAL-WORLD APPLICATIONS:
       - Connect learning to student interests
       - Practical applications in daily life
       - Career connections and future pathways
    
    6. ADAPTIVE FEATURES:
       - Accommodations for learning style
       - Differentiation strategies
       - Support for multi-grade classroom
       - Flexible pacing options
    
    Ensure all content is:
    - Pedagogically sound and research-based
    - Age-appropriate for ${studentProfile.grade}
    - Culturally sensitive and inclusive
    - Measurable and trackable
    - Engaging and motivating
    
    Format as detailed JSON structure.
    `;
  }

  private createLessonPrompt(params: any): string {
    return `
    Create a comprehensive lesson plan with these specifications:
    
    Subject: ${params.subject}
    Grade Level: ${params.grade}
    Duration: ${params.duration} minutes
    Topic: ${params.topic}
    Teaching Style: ${params.teachingStyle}
    Learning Objectives: ${params.objectives.join(', ')}
    
    Generate a detailed lesson plan including:
    
    1. LESSON STRUCTURE:
       - Clear learning objectives (SMART format)
       - Detailed activities with timing and instructions
       - Materials list with alternatives
       - Assessment methods and rubrics
    
    2. TEACHING STRATEGIES:
       - Multiple strategies suited to ${params.teachingStyle}
       - Implementation guidelines
       - Classroom management tips
       - Student engagement techniques
    
    3. VISUAL AIDS & RESOURCES:
       - Recommended visual aids with creation instructions
       - Digital and physical resource suggestions
       - Interactive elements and demonstrations
       - Supporting materials for different learning styles
    
    4. DIFFERENTIATION:
       - Adaptations for different ability levels
       - Support for diverse learners
       - Extension activities for advanced students
       - Scaffolding for struggling learners
    
    5. ASSESSMENT:
       - Formative assessment checkpoints
       - Summative assessment options
       - Rubrics and success criteria
       - Self and peer assessment opportunities
    
    6. CULTURAL CONTEXT:
       - Local cultural connections
       - Festival and tradition integration
       - Community relevance
       - Cross-curricular connections
    
    Ensure the lesson is:
    - Aligned with curriculum standards
    - Age-appropriate and engaging
    - Inclusive and accessible
    - Practical for classroom implementation
    - Measurable for learning outcomes
    
    Format as structured JSON.
    `;
  }

  private createChalkVisionPrompt(grade: string): string {
    return `
    Analyze this blackboard/textbook image and provide comprehensive educational analysis:
    
    Target Grade Level: ${grade}
    
    Please identify and analyze:
    
    1. CONTENT EXTRACTION:
       - Extract all visible text, equations, diagrams
       - Identify mathematical formulas, scientific concepts, or language elements
       - Note any drawings, charts, or visual elements
    
    2. CONCEPT IDENTIFICATION:
       - List main educational concepts present
       - Determine subject area and topic
       - Assess difficulty level and grade appropriateness
    
    3. EDUCATIONAL SUGGESTIONS:
       - Recommend next teaching steps
       - Suggest additional examples or explanations
       - Propose interactive activities
       - Identify potential student misconceptions
    
    4. VISUALIZATION RECOMMENDATIONS:
       - Suggest visual aids to enhance understanding
       - Recommend hands-on activities
       - Propose digital tools or manipulatives
       - Design assessment questions
    
    5. DIFFERENTIATION IDEAS:
       - Adaptations for different learning styles
       - Simplifications for struggling learners
       - Extensions for advanced students
       - Multi-sensory learning opportunities
    
    6. ASSESSMENT QUESTIONS:
       - Create various question types (multiple choice, short answer, practical)
       - Include different difficulty levels
       - Provide rubrics for evaluation
       - Suggest oral assessment opportunities
    
    Ensure all suggestions are:
    - Age-appropriate for ${grade}
    - Pedagogically sound
    - Practical for classroom implementation
    - Aligned with learning standards
    - Engaging and interactive
    
    Format as structured JSON response.
    `;
  }

  // Response parsing methods
  private parsePathwayResponse(text: string, studentProfile: StudentProfile): LearningPathway {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          studentName: studentProfile.name,
          assessmentMethods: parsed.assessmentMethods || [],
          realWorldApplications: parsed.realWorldApplications || []
        };
      }
    } catch (error) {
      console.warn('Could not parse pathway JSON, using fallback');
    }
    
    return this.createFallbackPathway(studentProfile);
  }

  private parseLessonResponse(text: string, params: any): LessonPlan {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          subject: params.subject,
          grade: params.grade,
          duration: params.duration,
          teachingStrategies: parsed.teachingStrategies || [],
          visualAids: parsed.visualAids || [],
          differentiation: parsed.differentiation || []
        };
      }
    } catch (error) {
      console.warn('Could not parse lesson JSON, using fallback');
    }
    
    return this.createFallbackLessonPlan(params);
  }

  private parseChalkVisionResponse(text: string, grade: string): ChalkVisionAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          gradeLevel: grade,
          visualizationRecommendations: parsed.visualizationRecommendations || [],
          assessmentQuestions: parsed.assessmentQuestions || []
        };
      }
    } catch (error) {
      console.warn('Could not parse ChalkVision JSON, using fallback');
    }
    
    return this.createFallbackChalkVisionAnalysis();
  }

  // Fallback methods
  private createFallbackPathway(studentProfile: StudentProfile): LearningPathway {
    return {
      studentName: studentProfile.name,
      currentLevel: studentProfile.performanceLevel,
      targetLevel: this.getTargetLevel(studentProfile.performanceLevel),
      skillGaps: this.generateSkillGaps(studentProfile.subject, studentProfile.performanceLevel),
      recommendedPath: this.generatePathSteps(studentProfile),
      resources: this.generateResources(studentProfile),
      timeline: this.generateTimeline(studentProfile.performanceLevel),
      adaptiveFeatures: this.generateAdaptiveFeatures(studentProfile),
      assessmentMethods: this.generateAssessmentMethods(studentProfile),
      realWorldApplications: this.generateRealWorldApplications(studentProfile)
    };
  }

  private createFallbackLessonPlan(params: any): LessonPlan {
    return {
      title: `${params.subject} - ${params.topic}`,
      subject: params.subject,
      grade: params.grade,
      duration: params.duration,
      objectives: params.objectives || [`Students will understand ${params.topic}`],
      activities: this.generateLessonActivities(params),
      materials: this.generateMaterials(params.subject),
      assessment: this.generateAssessmentMethods({ subject: params.subject, grade: params.grade }),
      teachingStrategies: this.generateTeachingStrategies(params.teachingStyle),
      visualAids: this.generateVisualAids(params.subject),
      differentiation: this.generateDifferentiation(params.grade)
    };
  }

  private createFallbackChalkVisionAnalysis(): ChalkVisionAnalysis {
    return {
      extractedText: "Content analysis in progress...",
      identifiedConcepts: ["Basic concepts", "Fundamental principles"],
      subjectArea: "General Education",
      gradeLevel: "Elementary",
      difficultyLevel: "Moderate",
      suggestions: [{
        type: 'explanation',
        title: 'Provide Additional Context',
        description: 'Add more detailed explanations for better understanding',
        implementation: ['Use visual aids', 'Provide examples', 'Encourage questions'],
        timeRequired: '10-15 minutes'
      }],
      visualizationRecommendations: [],
      nextSteps: ['Review content', 'Practice exercises', 'Assessment'],
      assessmentQuestions: []
    };
  }

  private createFallbackVisualizations(content: string, grade: string): VisualizationRecommendation[] {
    return [
      {
        type: 'Interactive Diagram',
        title: 'Concept Visualization',
        description: 'Visual representation of key concepts',
        materials: ['Chart paper', 'Colored markers', 'Sticky notes'],
        steps: ['Draw main concept', 'Add supporting details', 'Use colors for categories'],
        learningOutcome: 'Students will visually understand the relationship between concepts'
      }
    ];
  }

  // Helper methods for fallback content generation
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
        'Beginner': ['Number recognition and counting', 'Basic addition and subtraction', 'Pattern identification'],
        'Intermediate': ['Multiplication and division mastery', 'Fraction understanding', 'Word problem solving strategies'],
        'Advanced': ['Algebraic thinking and equations', 'Geometric reasoning', 'Data analysis and interpretation']
      },
      'Tamil': {
        'Beginner': ['Letter recognition and formation', 'Basic vocabulary building', 'Simple sentence construction'],
        'Intermediate': ['Grammar rule application', 'Reading comprehension skills', 'Creative writing techniques'],
        'Advanced': ['Literary analysis and interpretation', 'Advanced grammar concepts', 'Poetry and prose appreciation']
      },
      'Science': {
        'Beginner': ['Observation and questioning skills', 'Basic scientific vocabulary', 'Simple experiment procedures'],
        'Intermediate': ['Scientific method application', 'Hypothesis formation and testing', 'Data collection and recording'],
        'Advanced': ['Complex experimental design', 'Theory application and analysis', 'Research methodology and presentation']
      }
    };

    return gaps[subject]?.[level] || ['Foundation knowledge building', 'Practical skill application', 'Critical thinking development'];
  }

  private generatePathSteps(studentProfile: StudentProfile): PathStep[] {
    const baseSteps = [
      {
        id: '1',
        title: 'Foundation Assessment and Goal Setting',
        description: `Comprehensive evaluation of current ${studentProfile.subject} understanding and establishment of learning goals`,
        duration: '1-2 weeks',
        difficulty: 'Easy',
        prerequisites: [],
        activities: ['Diagnostic assessment', 'Learning style inventory', 'Goal setting workshop', 'Baseline skill demonstration'],
        learningObjectives: ['Identify current skill level', 'Set SMART learning goals', 'Understand learning preferences'],
        assessmentCriteria: ['Completion of diagnostic tests', 'Clear goal articulation', 'Self-reflection quality']
      },
      {
        id: '2',
        title: 'Core Concept Building',
        description: `Systematic development of fundamental ${studentProfile.subject} concepts and skills`,
        duration: '2-3 weeks',
        difficulty: 'Medium',
        prerequisites: ['Foundation Assessment'],
        activities: ['Interactive concept lessons', 'Guided practice sessions', 'Peer collaboration', 'Concept mapping'],
        learningObjectives: ['Master core concepts', 'Apply basic principles', 'Connect related ideas'],
        assessmentCriteria: ['Concept demonstration', 'Practice exercise completion', 'Peer explanation ability']
      },
      {
        id: '3',
        title: 'Skill Application and Practice',
        description: 'Hands-on application of learned concepts through varied practice opportunities',
        duration: '2-3 weeks',
        difficulty: 'Medium',
        prerequisites: ['Core Concept Building'],
        activities: ['Problem-solving workshops', 'Real-world applications', 'Creative projects', 'Skill demonstrations'],
        learningObjectives: ['Apply concepts to new situations', 'Develop problem-solving strategies', 'Build confidence'],
        assessmentCriteria: ['Problem-solving accuracy', 'Strategy explanation', 'Creative application quality']
      },
      {
        id: '4',
        title: 'Advanced Integration and Synthesis',
        description: 'Integration of multiple concepts for complex understanding and higher-order thinking',
        duration: '3-4 weeks',
        difficulty: 'Hard',
        prerequisites: ['Skill Application'],
        activities: ['Complex project work', 'Research investigations', 'Presentation preparation', 'Peer teaching'],
        learningObjectives: ['Synthesize multiple concepts', 'Conduct independent research', 'Communicate learning effectively'],
        assessmentCriteria: ['Project quality and depth', 'Research thoroughness', 'Presentation clarity']
      },
      {
        id: '5',
        title: 'Mastery Demonstration and Reflection',
        description: 'Comprehensive demonstration of learning through portfolio and reflection',
        duration: '1-2 weeks',
        difficulty: 'Hard',
        prerequisites: ['Advanced Integration'],
        activities: ['Portfolio compilation', 'Comprehensive assessment', 'Learning reflection', 'Future planning'],
        learningObjectives: ['Demonstrate mastery', 'Reflect on learning journey', 'Plan continued growth'],
        assessmentCriteria: ['Portfolio completeness', 'Mastery demonstration', 'Reflection depth']
      }
    ];

    return baseSteps;
  }

  private generateResources(studentProfile: StudentProfile): Resource[] {
    return [
      {
        type: 'Interactive Digital Tool',
        title: `${studentProfile.subject} Learning Platform`,
        description: `Adaptive online platform with ${studentProfile.learningStyle.toLowerCase()} learning activities`,
        difficulty: studentProfile.performanceLevel,
        estimatedTime: '30-45 minutes per session',
        interactivityLevel: 'High'
      },
      {
        type: 'Educational Videos',
        title: 'Concept Explanation Videos',
        description: `Visual and auditory content matching ${studentProfile.learningStyle} preferences`,
        difficulty: studentProfile.performanceLevel,
        estimatedTime: '10-20 minutes per video',
        interactivityLevel: 'Medium'
      },
      {
        type: 'Practice Workbook',
        title: 'Progressive Skill Building Exercises',
        description: 'Structured worksheets with increasing difficulty levels',
        difficulty: studentProfile.performanceLevel,
        estimatedTime: '20-30 minutes per exercise',
        interactivityLevel: 'Low'
      },
      {
        type: 'Project-Based Learning',
        title: `${studentProfile.interests[0]} Integration Project`,
        description: `Real-world projects combining ${studentProfile.subject} with student interests`,
        difficulty: studentProfile.performanceLevel,
        estimatedTime: '2-3 hours per project',
        interactivityLevel: 'Very High'
      },
      {
        type: 'Peer Learning Network',
        title: 'Study Group Activities',
        description: 'Collaborative learning opportunities with classmates',
        difficulty: studentProfile.performanceLevel,
        estimatedTime: '45-60 minutes per session',
        interactivityLevel: 'High'
      }
    ];
  }

  private generateTimeline(performanceLevel: string): string {
    switch (performanceLevel) {
      case 'Beginner': return '10-12 weeks with flexible pacing';
      case 'Intermediate': return '8-10 weeks with regular checkpoints';
      case 'Advanced': return '6-8 weeks with accelerated options';
      default: return '8-10 weeks with adaptive pacing';
    }
  }

  private generateAdaptiveFeatures(studentProfile: StudentProfile): string[] {
    return [
      `${studentProfile.learningStyle} learning approach prioritized throughout pathway`,
      `Content integration with ${studentProfile.interests.join(', ')} to maintain engagement`,
      `Pace adjustment based on ${studentProfile.performanceLevel} starting level`,
      'Regular progress monitoring with adaptive difficulty adjustment',
      'Multiple assessment formats to accommodate different strengths',
      'Flexible scheduling options for different learning speeds',
      'Peer collaboration opportunities matching learning preferences',
      'Real-world application emphasis connecting to student interests'
    ];
  }

  private generateAssessmentMethods(studentProfile: any): AssessmentMethod[] {
    return [
      {
        type: 'Formative Assessment',
        description: 'Ongoing evaluation through quizzes and observations',
        rubric: ['Understanding demonstrated', 'Participation level', 'Question quality'],
        timeRequired: '10-15 minutes daily'
      },
      {
        type: 'Project-Based Assessment',
        description: 'Comprehensive evaluation through practical projects',
        rubric: ['Creativity and innovation', 'Technical accuracy', 'Presentation quality'],
        timeRequired: '2-3 class periods'
      },
      {
        type: 'Peer Assessment',
        description: 'Student evaluation of peer work and collaboration',
        rubric: ['Constructive feedback', 'Collaboration skills', 'Communication clarity'],
        timeRequired: '20-30 minutes per session'
      },
      {
        type: 'Self-Reflection Assessment',
        description: 'Student self-evaluation of learning progress',
        rubric: ['Self-awareness', 'Goal progress', 'Learning strategy effectiveness'],
        timeRequired: '15-20 minutes weekly'
      }
    ];
  }

  private generateRealWorldApplications(studentProfile: StudentProfile): string[] {
    const applications: { [key: string]: string[] } = {
      'Mathematics': [
        'Budget planning and money management for family expenses',
        'Cooking and recipe scaling for different serving sizes',
        'Sports statistics analysis and performance tracking',
        'Architecture and design projects using geometric principles',
        'Environmental data collection and analysis for school projects'
      ],
      'Tamil': [
        'Community storytelling and cultural preservation projects',
        'Local newspaper writing and journalism activities',
        'Traditional poetry and literature appreciation events',
        'Family history documentation and interview projects',
        'Cultural festival planning and presentation activities'
      ],
      'Science': [
        'Home gardening and plant growth experiments',
        'Weather monitoring and climate change awareness',
        'Nutrition analysis and healthy eating promotion',
        'Simple machine construction for daily life problems',
        'Environmental conservation projects in the community'
      ]
    };

    const subjectApplications = applications[studentProfile.subject] || [
      'Community service projects applying learned concepts',
      'Family and home-based practical applications',
      'School and peer teaching opportunities',
      'Local business and industry connections',
      'Creative arts and expression projects'
    ];

    // Filter applications based on student interests
    return subjectApplications.filter(app => 
      studentProfile.interests.some(interest => 
        app.toLowerCase().includes(interest.toLowerCase())
      )
    ).slice(0, 3).concat(subjectApplications.slice(0, 2));
  }

  private generateLessonActivities(params: any): LessonActivity[] {
    return [
      {
        id: '1',
        name: 'Opening and Engagement',
        duration: Math.floor(params.duration * 0.15),
        description: 'Hook students with engaging opener and review previous learning',
        type: 'presentation',
        materials: ['Presentation slides', 'Props or visual aids'],
        instructions: ['Greet students warmly', 'Present engaging question or scenario', 'Connect to prior knowledge'],
        learningObjectives: ['Activate prior knowledge', 'Generate interest in topic']
      },
      {
        id: '2',
        name: 'Direct Instruction',
        duration: Math.floor(params.duration * 0.25),
        description: 'Systematic presentation of new concepts and skills',
        type: 'presentation',
        materials: ['Textbook', 'Visual aids', 'Examples'],
        instructions: ['Present concepts clearly', 'Use multiple examples', 'Check for understanding'],
        learningObjectives: ['Understand new concepts', 'See practical applications']
      },
      {
        id: '3',
        name: 'Guided Practice',
        duration: Math.floor(params.duration * 0.3),
        description: 'Structured practice with teacher support and feedback',
        type: 'hands-on',
        materials: ['Practice worksheets', 'Manipulatives', 'Group materials'],
        instructions: ['Work through examples together', 'Provide immediate feedback', 'Address misconceptions'],
        learningObjectives: ['Apply new learning with support', 'Build confidence']
      },
      {
        id: '4',
        name: 'Independent Practice',
        duration: Math.floor(params.duration * 0.2),
        description: 'Individual application of learned concepts',
        type: 'hands-on',
        materials: ['Individual worksheets', 'Assessment tools'],
        instructions: ['Monitor student work', 'Provide individual support', 'Collect formative data'],
        learningObjectives: ['Demonstrate independent mastery', 'Identify areas for improvement']
      },
      {
        id: '5',
        name: 'Closure and Assessment',
        duration: Math.floor(params.duration * 0.1),
        description: 'Summarize learning and assess understanding',
        type: 'assessment',
        materials: ['Exit tickets', 'Summary charts'],
        instructions: ['Review key concepts', 'Assess understanding', 'Preview next lesson'],
        learningObjectives: ['Consolidate learning', 'Prepare for future learning']
      }
    ];
  }

  private generateMaterials(subject: string): string[] {
    const materials: { [key: string]: string[] } = {
      'Mathematics': ['Calculator', 'Geometric shapes', 'Number charts', 'Graph paper', 'Measuring tools'],
      'Tamil': ['Tamil alphabet charts', 'Story books', 'Writing materials', 'Audio recordings', 'Cultural artifacts'],
      'Science': ['Magnifying glass', 'Simple lab equipment', 'Natural specimens', 'Charts and diagrams', 'Safety equipment'],
      'English': ['Dictionary', 'Reading books', 'Writing materials', 'Audio-visual aids', 'Grammar charts'],
      'Social Studies': ['Maps', 'Historical pictures', 'Cultural artifacts', 'Timeline materials', 'Community resources']
    };

    return materials[subject] || ['Textbook', 'Notebook', 'Writing materials', 'Visual aids', 'Reference materials'];
  }

  private generateTeachingStrategies(teachingStyle: string): TeachingStrategy[] {
    return [
      {
        name: 'Interactive Questioning',
        description: 'Engage students through strategic questioning techniques',
        implementation: ['Use open-ended questions', 'Wait time for responses', 'Build on student answers'],
        suitableFor: ['All learning styles', 'Mixed ability groups']
      },
      {
        name: 'Collaborative Learning',
        description: 'Promote peer interaction and shared learning experiences',
        implementation: ['Form diverse groups', 'Assign specific roles', 'Monitor group dynamics'],
        suitableFor: ['Social learners', 'Communication skill development']
      },
      {
        name: 'Visual Learning Support',
        description: 'Use visual aids and graphic organizers to enhance understanding',
        implementation: ['Create concept maps', 'Use charts and diagrams', 'Incorporate multimedia'],
        suitableFor: ['Visual learners', 'Complex concept explanation']
      }
    ];
  }

  private generateVisualAids(subject: string): VisualAid[] {
    return [
      {
        type: 'Concept Map',
        description: 'Visual representation of topic relationships',
        purpose: 'Help students see connections between ideas',
        creationInstructions: ['Start with main concept', 'Add related subtopics', 'Draw connecting lines', 'Use colors for categories']
      },
      {
        type: 'Interactive Chart',
        description: 'Student-manipulable visual display',
        purpose: 'Engage students in active learning',
        creationInstructions: ['Design moveable parts', 'Use bright colors', 'Include student interaction points', 'Make it durable']
      }
    ];
  }

  private generateDifferentiation(grade: string): DifferentiationStrategy[] {
    return [
      {
        learnerType: 'Advanced Learners',
        adaptations: ['Provide extension activities', 'Offer leadership roles', 'Increase complexity'],
        supportMaterials: ['Advanced reading materials', 'Research projects', 'Mentoring opportunities']
      },
      {
        learnerType: 'Struggling Learners',
        adaptations: ['Break tasks into smaller steps', 'Provide additional practice', 'Use concrete examples'],
        supportMaterials: ['Simplified worksheets', 'Visual aids', 'One-on-one support']
      },
      {
        learnerType: 'English Language Learners',
        adaptations: ['Use visual supports', 'Provide native language resources', 'Encourage peer translation'],
        supportMaterials: ['Bilingual dictionaries', 'Picture cards', 'Translation apps']
      }
    ];
  }

  // Public utility methods
  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size();
  }

  public getRateLimitStatus(): { canMakeRequest: boolean; waitTime: number } {
    return {
      canMakeRequest: this.rateLimiter.canMakeRequest(),
      waitTime: this.rateLimiter.getWaitTime()
    };
  }

  // Content refresh methods
  public async refreshPathway(studentProfile: StudentProfile): Promise<LearningPathway> {
    const cacheKey = `pathway_${JSON.stringify(studentProfile)}`;
    this.cache.set(cacheKey, null, 0); // Clear cache for this item
    return this.generateLearningPathway(studentProfile);
  }

  public async refreshLessonPlan(params: any): Promise<LessonPlan> {
    const cacheKey = `lesson_${JSON.stringify(params)}`;
    this.cache.set(cacheKey, null, 0); // Clear cache for this item
    return this.generateLessonPlan(params);
  }
}

export const geminiService = new GeminiService();