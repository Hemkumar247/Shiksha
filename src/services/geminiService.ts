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

  constructor(maxRequests: number = 15, timeWindowMs: number = 60000) {
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
  private rateLimiter = new RateLimiter(15, 60000); // 15 requests per minute
  private retryCount = 2;
  private retryDelay = 1000;

  private async makeRequest<T>(
    requestFn: () => Promise<T>,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('Returning cached result for:', cacheKey);
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
        console.log(`Making API request, attempt ${attempt + 1}`);
        const result = await requestFn();
        
        // Cache successful result
        if (cacheKey) {
          this.cache.set(cacheKey, result, cacheTTL);
          console.log('Cached result for:', cacheKey);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        if (attempt < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async generateLessonPlan(params: {
    subject: string;
    grade: string;
    duration: number;
    objectives: string[];
    teachingStyle: string;
    topic: string;
  }): Promise<LessonPlan> {
    console.log('Generating lesson plan with params:', params);
    
    const cacheKey = `lesson_${JSON.stringify(params)}`;
    
    return this.makeRequest(async () => {
      const prompt = this.createLessonPrompt(params);
      console.log('Sending prompt to Gemini API...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Received response from Gemini API');
      console.log('Response length:', text.length);
      
      let lessonPlan = this.parseLessonResponse(text, params);
      
      // Validate and sanitize content
      if (!ContentValidator.validateLessonPlan(lessonPlan)) {
        console.log('Generated plan failed validation, using fallback');
        lessonPlan = this.createFallbackLessonPlan(params);
      }

      // Ensure age-appropriate content
      if (!ContentValidator.isAgeAppropriate(JSON.stringify(lessonPlan), params.grade)) {
        console.log('Generated plan not age-appropriate, using fallback');
        lessonPlan = this.createFallbackLessonPlan(params);
      }

      console.log('Final lesson plan generated successfully');
      return lessonPlan;
    }, cacheKey, 15 * 60 * 1000); // Cache for 15 minutes
  }

  async generateLearningPathway(studentProfile: StudentProfile): Promise<LearningPathway> {
    console.log('Generating learning pathway for:', studentProfile.name);
    
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
      
      Generate 2-3 comprehensive visualization recommendations that include:
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
      
      Return as a simple JSON array format.
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

  // Simplified prompt creation methods
  private createLessonPrompt(params: any): string {
    return `
    Create a detailed lesson plan for:
    
    Subject: ${params.subject}
    Grade: ${params.grade}
    Duration: ${params.duration} minutes
    Topic: ${params.topic}
    Teaching Style: ${params.teachingStyle}
    Learning Objectives: ${params.objectives.join(', ')}
    
    Please provide a comprehensive lesson plan with:
    
    1. Clear lesson title
    2. Learning objectives (3-5 specific, measurable goals)
    3. Detailed activities with timing and descriptions
    4. Required materials list
    5. Assessment methods
    6. Teaching strategies
    7. Visual aids recommendations
    8. Differentiation for different learners
    9. Cultural context if applicable
    
    Make sure the lesson is:
    - Age-appropriate for ${params.grade}
    - Engaging and interactive
    - Practical for classroom implementation
    - Aligned with educational standards
    
    Please format your response clearly with sections for each component.
    `;
  }

  private createPathwayPrompt(studentProfile: StudentProfile): string {
    return `
    Create a personalized learning pathway for:
    
    Student: ${studentProfile.name}
    Grade: ${studentProfile.grade}
    Subject: ${studentProfile.subject}
    Performance Level: ${studentProfile.performanceLevel}
    Learning Style: ${studentProfile.learningStyle}
    Interests: ${studentProfile.interests.join(', ')}
    
    Please provide:
    
    1. Current and target skill levels
    2. Identified skill gaps (3-5 specific areas)
    3. Step-by-step learning path (5-7 progressive steps)
    4. Recommended resources and materials
    5. Timeline for completion
    6. Adaptive features for personalization
    7. Assessment methods
    8. Real-world applications
    
    Make the pathway:
    - Appropriate for ${studentProfile.grade}
    - Aligned with ${studentProfile.learningStyle} learning style
    - Connected to student interests: ${studentProfile.interests.join(', ')}
    - Progressive and achievable
    - Measurable and trackable
    
    Format the response clearly with sections for each component.
    `;
  }

  private createChalkVisionPrompt(grade: string): string {
    return `
    Analyze this educational image and provide:
    
    Target Grade: ${grade}
    
    1. Extract all visible text and content
    2. Identify main educational concepts
    3. Determine subject area and difficulty level
    4. Provide teaching suggestions and next steps
    5. Recommend visualization aids
    6. Create assessment questions
    
    Make all suggestions:
    - Age-appropriate for ${grade}
    - Pedagogically sound
    - Practical for classroom use
    - Engaging for students
    
    Format the response with clear sections.
    `;
  }

  // Simplified response parsing methods
  private parseLessonResponse(text: string, params: any): LessonPlan {
    console.log('Parsing lesson response...');
    
    // Try to extract structured content from the response
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract title
    const titleMatch = text.match(/(?:title|lesson)[:\s]*([^\n]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : `${params.subject} - ${params.topic}`;
    
    // Extract objectives
    const objectivesSection = this.extractSection(text, ['objective', 'goal', 'aim']);
    const objectives = objectivesSection.length > 0 ? objectivesSection : params.objectives;
    
    // Extract activities
    const activitiesSection = this.extractSection(text, ['activit', 'step', 'procedure']);
    const activities = this.parseActivities(activitiesSection, params.duration);
    
    // Extract materials
    const materialsSection = this.extractSection(text, ['material', 'resource', 'equipment']);
    const materials = materialsSection.length > 0 ? materialsSection : this.generateMaterials(params.subject);
    
    // Extract assessment
    const assessmentSection = this.extractSection(text, ['assessment', 'evaluation', 'test']);
    const assessment = this.parseAssessment(assessmentSection);
    
    // Extract teaching strategies
    const strategiesSection = this.extractSection(text, ['strategy', 'method', 'approach']);
    const teachingStrategies = this.parseTeachingStrategies(strategiesSection, params.teachingStyle);
    
    // Extract visual aids
    const visualSection = this.extractSection(text, ['visual', 'aid', 'diagram', 'chart']);
    const visualAids = this.parseVisualAids(visualSection, params.subject);
    
    // Extract differentiation
    const diffSection = this.extractSection(text, ['differentiat', 'adapt', 'support']);
    const differentiation = this.parseDifferentiation(diffSection, params.grade);
    
    const lessonPlan: LessonPlan = {
      title: title,
      subject: params.subject,
      grade: params.grade,
      duration: params.duration,
      objectives: objectives,
      activities: activities,
      materials: materials,
      assessment: assessment,
      teachingStrategies: teachingStrategies,
      visualAids: visualAids,
      differentiation: differentiation,
      culturalContext: this.extractCulturalContext(text),
      festivals: this.extractFestivals(text)
    };
    
    console.log('Lesson plan parsed successfully');
    return lessonPlan;
  }

  private parsePathwayResponse(text: string, studentProfile: StudentProfile): LearningPathway {
    // Extract pathway components from text
    const skillGaps = this.extractSection(text, ['gap', 'weakness', 'need']);
    const pathSteps = this.extractPathSteps(text);
    const resources = this.extractResources(text);
    const timeline = this.extractTimeline(text) || this.generateTimeline(studentProfile.performanceLevel);
    const adaptiveFeatures = this.extractSection(text, ['adaptive', 'personalized', 'customized']);
    
    return {
      studentName: studentProfile.name,
      currentLevel: studentProfile.performanceLevel,
      targetLevel: this.getTargetLevel(studentProfile.performanceLevel),
      skillGaps: skillGaps.length > 0 ? skillGaps : this.generateSkillGaps(studentProfile.subject, studentProfile.performanceLevel),
      recommendedPath: pathSteps.length > 0 ? pathSteps : this.generatePathSteps(studentProfile),
      resources: resources.length > 0 ? resources : this.generateResources(studentProfile),
      timeline: timeline,
      adaptiveFeatures: adaptiveFeatures.length > 0 ? adaptiveFeatures : this.generateAdaptiveFeatures(studentProfile),
      assessmentMethods: this.generateAssessmentMethods(studentProfile),
      realWorldApplications: this.generateRealWorldApplications(studentProfile)
    };
  }

  private parseChalkVisionResponse(text: string, grade: string): ChalkVisionAnalysis {
    const extractedText = this.extractSection(text, ['text', 'content', 'extract']).join(' ') || 'Content extracted from image';
    const concepts = this.extractSection(text, ['concept', 'topic', 'subject']);
    const suggestions = this.extractSuggestions(text);
    
    return {
      extractedText: extractedText,
      identifiedConcepts: concepts.length > 0 ? concepts : ['Basic concepts', 'Educational content'],
      subjectArea: this.identifySubjectArea(text) || 'General Education',
      gradeLevel: grade,
      difficultyLevel: this.identifyDifficulty(text) || 'Moderate',
      suggestions: suggestions.length > 0 ? suggestions : this.generateDefaultSuggestions(),
      visualizationRecommendations: [],
      nextSteps: this.extractSection(text, ['next', 'step', 'follow']),
      assessmentQuestions: []
    };
  }

  // Helper methods for parsing
  private extractSection(text: string, keywords: string[]): string[] {
    const lines = text.split('\n');
    const section: string[] = [];
    let inSection = false;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check if this line starts a relevant section
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        inSection = true;
        // Extract content after the keyword
        const content = line.replace(/^[^:]*:?\s*/, '').trim();
        if (content) section.push(content);
        continue;
      }
      
      // If we're in a section, continue collecting until we hit another section
      if (inSection) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.match(/^[A-Z][^:]*:/) && trimmed.length > 3) {
          section.push(trimmed);
        } else if (trimmed.match(/^[A-Z][^:]*:/)) {
          // Hit another section, stop collecting
          break;
        }
      }
    }
    
    return section.slice(0, 10); // Limit to reasonable number
  }

  private parseActivities(activitiesText: string[], duration: number): LessonActivity[] {
    if (activitiesText.length === 0) {
      return this.generateLessonActivities({ duration });
    }
    
    const activities: LessonActivity[] = [];
    const timePerActivity = Math.floor(duration / Math.max(activitiesText.length, 3));
    
    activitiesText.forEach((activity, index) => {
      activities.push({
        id: (index + 1).toString(),
        name: activity.substring(0, 50) + (activity.length > 50 ? '...' : ''),
        duration: timePerActivity,
        description: activity,
        type: this.determineActivityType(activity),
        materials: ['Basic classroom materials'],
        instructions: [activity],
        learningObjectives: ['Apply lesson concepts']
      });
    });
    
    return activities;
  }

  private parseAssessment(assessmentText: string[]): AssessmentMethod[] {
    if (assessmentText.length === 0) {
      return [{
        type: 'Formative Assessment',
        description: 'Ongoing evaluation through observation and questioning',
        rubric: ['Understanding demonstrated', 'Participation level', 'Question quality'],
        timeRequired: '10-15 minutes'
      }];
    }
    
    return assessmentText.map((assessment, index) => ({
      type: index === 0 ? 'Formative Assessment' : 'Summative Assessment',
      description: assessment,
      rubric: ['Meets expectations', 'Shows understanding', 'Applies concepts correctly'],
      timeRequired: '10-20 minutes'
    }));
  }

  private parseTeachingStrategies(strategiesText: string[], teachingStyle: string): TeachingStrategy[] {
    const defaultStrategies = this.generateTeachingStrategies(teachingStyle);
    
    if (strategiesText.length === 0) {
      return defaultStrategies;
    }
    
    return strategiesText.slice(0, 3).map((strategy, index) => ({
      name: strategy.substring(0, 30) + (strategy.length > 30 ? '...' : ''),
      description: strategy,
      implementation: [strategy],
      suitableFor: ['All learners']
    }));
  }

  private parseVisualAids(visualText: string[], subject: string): VisualAid[] {
    if (visualText.length === 0) {
      return this.generateVisualAids(subject);
    }
    
    return visualText.slice(0, 2).map(visual => ({
      type: 'Visual Aid',
      description: visual,
      purpose: 'Enhance understanding',
      creationInstructions: [visual]
    }));
  }

  private parseDifferentiation(diffText: string[], grade: string): DifferentiationStrategy[] {
    if (diffText.length === 0) {
      return this.generateDifferentiation(grade);
    }
    
    return [{
      learnerType: 'All Learners',
      adaptations: diffText.slice(0, 3),
      supportMaterials: ['Additional resources', 'Visual aids', 'Practice materials']
    }];
  }

  private extractCulturalContext(text: string): string | undefined {
    const culturalKeywords = ['culture', 'tradition', 'festival', 'heritage', 'tamil'];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (culturalKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        return line.trim();
      }
    }
    
    return 'Incorporating local cultural elements enhances learning relevance';
  }

  private extractFestivals(text: string): string[] | undefined {
    const festivals = ['pongal', 'diwali', 'tamil new year', 'harvest festival'];
    const found: string[] = [];
    
    festivals.forEach(festival => {
      if (text.toLowerCase().includes(festival)) {
        found.push(festival);
      }
    });
    
    return found.length > 0 ? found : undefined;
  }

  private extractPathSteps(text: string): PathStep[] {
    const steps: PathStep[] = [];
    const lines = text.split('\n');
    let currentStep: Partial<PathStep> = {};
    let stepCounter = 1;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^(step|phase|\d+\.)/i)) {
        if (currentStep.title) {
          steps.push(this.completePathStep(currentStep, stepCounter));
          stepCounter++;
        }
        currentStep = {
          id: stepCounter.toString(),
          title: trimmed.replace(/^(step|phase|\d+\.)\s*/i, ''),
          description: '',
          duration: '1-2 weeks',
          difficulty: 'Medium',
          prerequisites: [],
          activities: [],
          learningObjectives: [],
          assessmentCriteria: []
        };
      } else if (currentStep.title && trimmed.length > 10) {
        currentStep.description = (currentStep.description || '') + ' ' + trimmed;
      }
    }
    
    if (currentStep.title) {
      steps.push(this.completePathStep(currentStep, stepCounter));
    }
    
    return steps.slice(0, 7); // Limit to 7 steps
  }

  private completePathStep(step: Partial<PathStep>, index: number): PathStep {
    return {
      id: step.id || index.toString(),
      title: step.title || `Learning Step ${index}`,
      description: step.description || 'Detailed learning activities and objectives',
      duration: step.duration || '1-2 weeks',
      difficulty: step.difficulty || 'Medium',
      prerequisites: step.prerequisites || [],
      activities: step.activities || ['Interactive lessons', 'Practice exercises', 'Assessment activities'],
      learningObjectives: step.learningObjectives || ['Master key concepts', 'Apply learning', 'Demonstrate understanding'],
      assessmentCriteria: step.assessmentCriteria || ['Concept mastery', 'Skill application', 'Progress demonstration']
    };
  }

  private extractResources(text: string): Resource[] {
    const resourceKeywords = ['resource', 'material', 'tool', 'book', 'video'];
    const resources: Resource[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (resourceKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        resources.push({
          type: 'Educational Resource',
          title: line.trim().substring(0, 50),
          description: line.trim(),
          difficulty: 'Intermediate',
          estimatedTime: '30-45 minutes',
          interactivityLevel: 'Medium'
        });
      }
    }
    
    return resources.slice(0, 5);
  }

  private extractTimeline(text: string): string | null {
    const timeKeywords = ['week', 'month', 'day', 'timeline', 'duration'];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (timeKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        const timeMatch = line.match(/(\d+[-\s]*(?:week|month|day)s?)/i);
        if (timeMatch) {
          return timeMatch[1];
        }
      }
    }
    
    return null;
  }

  private extractSuggestions(text: string): ContentSuggestion[] {
    const suggestions: ContentSuggestion[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('recommend')) {
        suggestions.push({
          type: 'explanation',
          title: 'Teaching Suggestion',
          description: line.trim(),
          implementation: [line.trim()],
          timeRequired: '10-15 minutes'
        });
      }
    }
    
    return suggestions.slice(0, 3);
  }

  private identifySubjectArea(text: string): string | null {
    const subjects = ['mathematics', 'math', 'science', 'tamil', 'english', 'social', 'history'];
    const lowerText = text.toLowerCase();
    
    for (const subject of subjects) {
      if (lowerText.includes(subject)) {
        return subject.charAt(0).toUpperCase() + subject.slice(1);
      }
    }
    
    return null;
  }

  private identifyDifficulty(text: string): string | null {
    const difficulties = ['easy', 'basic', 'simple', 'hard', 'difficult', 'complex', 'advanced'];
    const lowerText = text.toLowerCase();
    
    for (const difficulty of difficulties) {
      if (lowerText.includes(difficulty)) {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      }
    }
    
    return null;
  }

  private generateDefaultSuggestions(): ContentSuggestion[] {
    return [{
      type: 'explanation',
      title: 'Provide Clear Examples',
      description: 'Use concrete examples to illustrate abstract concepts',
      implementation: ['Start with familiar examples', 'Progress to more complex cases', 'Encourage student examples'],
      timeRequired: '10-15 minutes'
    }];
  }

  private determineActivityType(activity: string): 'discussion' | 'hands-on' | 'presentation' | 'assessment' | 'interactive' | 'collaborative' {
    const lowerActivity = activity.toLowerCase();
    
    if (lowerActivity.includes('discuss') || lowerActivity.includes('talk')) return 'discussion';
    if (lowerActivity.includes('hands') || lowerActivity.includes('practice')) return 'hands-on';
    if (lowerActivity.includes('present') || lowerActivity.includes('show')) return 'presentation';
    if (lowerActivity.includes('test') || lowerActivity.includes('assess')) return 'assessment';
    if (lowerActivity.includes('group') || lowerActivity.includes('team')) return 'collaborative';
    
    return 'interactive';
  }

  // Keep all the existing fallback methods...
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