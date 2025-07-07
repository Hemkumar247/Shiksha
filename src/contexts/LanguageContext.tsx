import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    appName: 'Shiksha',
    appNameTamil: 'कल्वी',
    logout: 'Logout',
    
    // Navigation
    dashboard: 'Dashboard',
    lessons: 'Lessons',
    students: 'Students',
    analytics: 'Analytics',
    calendar: 'Calendar',
    chalkVision: 'ChalkVision',
    pathfinder: 'PathFinder',
    profile: 'Profile',
    settings: 'Settings',
    feedback: 'Feedback',
    
    // Dashboard
    welcomeMessage: 'Welcome back, Sudha!',
    welcomeSubtext: 'You can create 3 new lessons today. Start with your voice guide!',
    totalLessons: 'Total Lessons',
    rating: 'Rating',
    monthlyGrowth: 'Monthly Growth',
    thisMonth: 'this month',
    recentLessons: 'Recent Lessons',
    culturalCalendar: 'Cultural Calendar',
    quickActions: 'Quick Actions',
    newLesson: 'New Lesson',
    studentGroups: 'Student Groups',
    assessment: 'Assessment',
    completed: 'Completed',
    inProgress: 'In Progress',
    createFestivalLessons: 'Create festival-based lessons!',
    createFestivalSubtext: 'Create festival-based lessons for better cultural connection',
    
    // PathFinder
    pathfinderTitle: 'PathFinder: AI-Driven Learning Pathways',
    pathfinderSubtitle: 'Create personalized learning journeys for multi-grade classrooms',
    studentAssessment: 'Student Assessment',
    currentGrade: 'Current Grade',
    subject: 'Subject',
    performanceLevel: 'Performance Level',
    learningStyle: 'Learning Style',
    interests: 'Interests',
    generatePathway: 'Generate Learning Pathway',
    generatingPathway: 'Generating Pathway...',
    pathwayReady: 'Learning Pathway Ready!',
    recommendedPath: 'Recommended Learning Path',
    skillGaps: 'Identified Skill Gaps',
    nextSteps: 'Next Steps',
    resources: 'Recommended Resources',
    timeline: 'Suggested Timeline',
    adaptivePath: 'Adaptive Learning Path',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    visual: 'Visual',
    auditory: 'Auditory',
    kinesthetic: 'Kinesthetic',
    reading: 'Reading/Writing',
    sports: 'Sports',
    arts: 'Arts',
    science: 'Science',
    technology: 'Technology',
    music: 'Music',
    studentName: 'Student Name',
    enterStudentName: 'Enter student name...',
    selectGrade: 'Select Grade',
    selectSubject: 'Select Subject',
    selectPerformance: 'Select Performance Level',
    selectLearningStyle: 'Select Learning Style',
    selectInterests: 'Select Interests (up to 3)',
    pathwayGenerated: 'Personalized pathway generated successfully!',
    
    // Lesson Planner
    describeLessonTitle: 'Describe Your Lesson Using Voice',
    describeLessonSubtitle: 'Use voice or typing to provide lesson details',
    lessonPrompt: 'Tell me what subject, which grade, and how long the lesson should be...',
    generatingLesson: 'Generating Your Lesson...',
    generatingSubtext: 'Creating your customized lesson plan',
    reviewLesson: 'Your Lesson is Ready!',
    reviewSubtext: 'Your lesson plan is ready',
    generateLesson: 'Generate Lesson',
    listen: 'Listen',
    download: 'Download',
    yourRequest: 'Your Request:',
    needModifications: 'Need any modifications?',
    modificationPrompt: 'Tell me what changes you need...',
    
    // Lesson Plan Content
    learningObjectives: 'Learning Objectives',
    activities: 'Activities',
    requiredMaterials: 'Required Materials',
    culturalContext: 'Cultural Context',
    evaluation: 'Assessment',
    
    // Voice Input
    clickMicToSpeak: 'Click mic and speak...',
    listening: 'Listening...',
    youSaid: 'You said:',
    requestRecorded: 'Your request has been recorded',
    micPermissionNeeded: 'Microphone permission needed',
    
    // ChalkVision
    chalkVisionSubtitle: 'AI-powered blackboard and textbook analysis',
    liveOCR: 'Live OCR + Semantic Mapping',
    liveOCRDescription: 'Point camera at blackboard to digitize and extract concepts',
    instantDifferentiation: 'Instant Differentiation Overlay',
    instantDifferentiationDescription: 'Grade-specific hints and simplified definitions',
    autoRecord: 'Auto-Record & Archive',
    autoRecordDescription: 'Automatically save board contents for later review',
    uploadImage: 'Upload Image',
    clickToUpload: 'Click to upload image',
    supportedFormats: 'PNG, JPG, JPEG up to 10MB',
    extractedContent: 'Extracted Content',
    uploadImageToAnalyze: 'Upload an image to analyze content',
    extractedText: 'Extracted Text',
    identifiedConcepts: 'Identified Concepts',
    suggestions: 'AI Suggestions',
    analyzing: 'Analyzing...',
    analyzeContent: 'Analyze Content',
    visualizedContent: 'Visualized Content',
    generating: 'Generating...',
    visualizeContent: 'Generate Visualization',
    downloadVisualization: 'Download',
    saveToArchive: 'Save to Archive',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    liveCamera: 'Live Camera',
    liveCameraDescription: 'Real-time board analysis',
    textbookScan: 'Textbook Scan',
    textbookScanDescription: 'Extract content from books',
    shareWithStudents: 'Share with Students',
    shareWithStudentsDescription: 'Send to student devices',
    
    // Sample Content
    sampleLessonTitle: 'Tamil Grammar - Nouns',
    sampleSubject: 'Tamil',
    sampleGrade: 'Grade 3',
    sampleDuration: '45 minutes',
    sampleObjective1: 'Students should understand what a noun is',
    sampleObjective2: 'Students should understand types of nouns',
    sampleObjective3: 'Students should identify nouns in sentences',
    sampleObjective4: 'Students should recognize the use of nouns in daily life',
    
    sampleActivity1: 'Introduction and Explanation',
    sampleActivity1Desc: 'Basic explanation of nouns with examples',
    sampleActivity2: 'Finding Examples',
    sampleActivity2Desc: 'Identifying names of objects in the classroom',
    sampleActivity3: 'Group Discussion',
    sampleActivity3Desc: 'Discussion with students about types of nouns',
    sampleActivity4: 'Assessment',
    sampleActivity4Desc: 'Questions to evaluate learning',
    
    sampleMaterial1: 'Blackboard and chalk',
    sampleMaterial2: 'Noun cards',
    sampleMaterial3: 'Classroom objects',
    sampleMaterial4: 'Tamil grammar book',
    
    sampleAssessment: 'Students should identify 5 nouns and use them in sentences',
    sampleCulturalContext: 'The beauty of Tamil grammar and the pride of classical Tamil',
    
    // Festivals
    pongal: 'Pongal',
    tamilNewYear: 'Tamil New Year',
    pongalContext: 'Tamil culture and agriculture',
    tamilNewYearContext: 'Tamil tradition and history',
    
    // Recent Lessons
    lesson1Title: 'Tamil Grammar - Verbs',
    lesson1Grade: 'Grade 3',
    lesson1Duration: '45 minutes',
    lesson2Title: 'Mathematics - Addition & Subtraction',
    lesson2Grade: 'Grade 2',
    lesson2Duration: '30 minutes',
    lesson3Title: 'Science - Plants',
    lesson3Grade: 'Grade 4',
    lesson3Duration: '40 minutes',
    
    // Generation Steps
    generatingStructure: '• Creating lesson structure',
    planningActivities: '• Planning activities',
    addingFestivalContext: '• Adding festival context',
    addingCulturalContext: '• Adding Tamil culture',
    
    // Voice Feedback
    lessonReady: 'Lesson is ready! Let\'s take a look',
    processingRequest: 'Processing your request. Please wait a moment',
    provideDetails: 'Please provide lesson details first',
    makingChanges: 'Making those changes for you'
  },
  ta: {
    // Header
    appName: 'शिक्षा',
    appNameTamil: 'Shiksha',
    logout: 'வெளியேறு',
    
    // Navigation
    dashboard: 'டாஷ்போர்டு',
    lessons: 'பாடங்கள்',
    students: 'மாணவர்கள்',
    analytics: 'பகுப்பாய்வு',
    calendar: 'காலண்டர்',
    chalkVision: 'சுண்ணாம்பு பார்வை',
    pathfinder: 'பாதை கண்டுபிடிப்பாளர்',
    profile: 'சுயவிவரம்',
    settings: 'அமைப்புகள்',
    feedback: 'கருத்து',
    
    // Dashboard
    welcomeMessage: 'வணக்கம், சுதா அக்கா!',
    welcomeSubtext: 'இன்று நீங்கள் 3 புதிய பாடங்களை உருவாக்கலாம். குரல் வழிகாட்டியுடன் தொடங்குங்கள்!',
    totalLessons: 'மொத்த பாடங்கள்',
    students: 'மாணவர்கள்',
    rating: 'மதிப்பீடு',
    monthlyGrowth: 'மாத வளர்ச்சி',
    thisMonth: 'இந்த மாதம்',
    recentLessons: 'சமீபத்திய பாடங்கள்',
    culturalCalendar: 'பண்டிகை காலண்டர்',
    quickActions: 'விரைவு செயல்கள்',
    newLesson: 'புதிய பாடம்',
    studentGroups: 'மாணவர் குழு',
    assessment: 'மதிப்பீடு',
    completed: 'முடிந்தது',
    inProgress: 'நடைபெறுகிறது',
    createFestivalLessons: 'பண்டிகை அடிப்படையிலான பாடங்களை உருவாக்குங்கள்!',
    createFestivalSubtext: 'Create festival-based lessons for better cultural connection',
    
    // PathFinder
    pathfinderTitle: 'பாதை கண்டுபிடிப்பாளர்: AI-உந்துதல் கற்றல் பாதைகள்',
    pathfinderSubtitle: 'பல-வகுப்பு வகுப்பறைகளுக்கு தனிப்பயனாக்கப்பட்ட கற்றல் பயணங்களை உருவாக்கவும்',
    studentAssessment: 'மாணவர் மதிப்பீடு',
    currentGrade: 'தற்போதைய வகுப்பு',
    subject: 'பாடம்',
    performanceLevel: 'செயல்திறன் நிலை',
    learningStyle: 'கற்றல் பாணி',
    interests: 'ஆர்வங்கள்',
    generatePathway: 'கற்றல் பாதையை உருவாக்கவும்',
    generatingPathway: 'பாதையை உருவாக்குகிறேன்...',
    pathwayReady: 'கற்றல் பாதை தயார்!',
    recommendedPath: 'பரிந்துரைக்கப்பட்ட கற்றல் பாதை',
    skillGaps: 'அடையாளம் காணப்பட்ட திறன் இடைவெளிகள்',
    nextSteps: 'அடுத்த படிகள்',
    resources: 'பரிந்துரைக்கப்பட்ட வளங்கள்',
    timeline: 'பரிந்துரைக்கப்பட்ட காலக்கெடு',
    adaptivePath: 'தகவமைப்பு கற்றல் பாதை',
    beginner: 'தொடக்கநிலை',
    intermediate: 'இடைநிலை',
    advanced: 'மேம்பட்ட',
    visual: 'காட்சி',
    auditory: 'செவிவழி',
    kinesthetic: 'இயக்கவியல்',
    reading: 'வாசிப்பு/எழுத்து',
    sports: 'விளையாட்டு',
    arts: 'கலைகள்',
    science: 'அறிவியல்',
    technology: 'தொழில்நுட்பம்',
    music: 'இசை',
    studentName: 'மாணவர் பெயர்',
    enterStudentName: 'மாணவர் பெயரை உள்ளிடவும்...',
    selectGrade: 'வகுப்பைத் தேர்ந்தெடுக்கவும்',
    selectSubject: 'பாடத்தைத் தேர்ந்தெடுக்கவும்',
    selectPerformance: 'செயல்திறன் நிலையைத் தேர்ந்தெடுக்கவும்',
    selectLearningStyle: 'கற்றல் பாணியைத் தேர்ந்தெடுக்கவும்',
    selectInterests: 'ஆர்வங்களைத் தேர்ந்தெடுக்கவும் (3 வரை)',
    pathwayGenerated: 'தனிப்பயனாக்கப்பட்ட பாதை வெற்றிகரமாக உருவாக்கப்பட்டது!',
    
    // Lesson Planner
    describeLessonTitle: 'குரல் மூலம் உங்கள் பாடத்தை விவரிக்கவும்',
    describeLessonSubtitle: 'Describe your lesson using voice or typing',
    lessonPrompt: 'எந்த பொருளுக்கு, எந்த வகுப்பிற்கு, எவ்வளவு நேரத்திற்கு பாடம் தேவை என்று சொல்லுங்கள்...',
    generatingLesson: 'பாடத்தை உருவாக்குகிறேன்...',
    generatingSubtext: 'Creating your customized lesson plan',
    reviewLesson: 'உங்கள் பாடம் தயார்!',
    reviewSubtext: 'Your lesson plan is ready',
    generateLesson: 'பாடத்தை உருவாக்கவும்',
    listen: 'கேட்கவும்',
    download: 'டவுன்லோடு',
    yourRequest: 'உங்கள் கோரிக்கை:',
    needModifications: 'மாற்றங்கள் தேவையா?',
    modificationPrompt: 'என்ன மாற்றம் வேண்டும் என்று சொல்லுங்கள்...',
    
    // Lesson Plan Content
    learningObjectives: 'கற்றல் நோக்கங்கள்',
    activities: 'செயல்பாடுகள்',
    requiredMaterials: 'தேவையான பொருள்கள்',
    culturalContext: 'கலாச்சார சூழல்',
    evaluation: 'மதிப்பீடு',
    
    // Voice Input
    clickMicToSpeak: 'மைக்கைக் கிளிக் செய்து பேசுங்கள்...',
    listening: 'கேட்கிறேன்...',
    youSaid: 'நீங்கள் சொன்னது:',
    requestRecorded: 'உங்கள் கோரிக்கை பதிவாகி விட்டது',
    micPermissionNeeded: 'மைக்ரோஃபோன் அனுமதி தேவை',
    
    // ChalkVision
    chalkVisionSubtitle: 'AI-powered blackboard and textbook analysis',
    liveOCR: 'நேரடி OCR + சொற்பொருள் வரைபடம்',
    liveOCRDescription: 'கரும்பலகையில் கேமராவை காட்டி கருத்துகளை பிரித்தெடுக்கவும்',
    instantDifferentiation: 'உடனடி வேறுபாடு மேலடுக்கு',
    instantDifferentiationDescription: 'வகுப்பு சார்ந்த குறிப்புகள் மற்றும் எளிமையான வரையறைகள்',
    autoRecord: 'தானியங்கி பதிவு மற்றும் காப்பகம்',
    autoRecordDescription: 'பலகை உள்ளடக்கங்களை தானாகவே சேமிக்கவும்',
    uploadImage: 'படத்தை பதிவேற்றவும்',
    clickToUpload: 'படத்தை பதிவேற்ற கிளிக் செய்யவும்',
    supportedFormats: 'PNG, JPG, JPEG 10MB வரை',
    extractedContent: 'பிரித்தெடுக்கப்பட்ட உள்ளடக்கம்',
    uploadImageToAnalyze: 'உள்ளடக்கத்தை பகுப்பாய்வு செய்ய படத்தை பதிவேற்றவும்',
    extractedText: 'பிரித்தெடுக்கப்பட்ட உரை',
    identifiedConcepts: 'அடையாளம் காணப்பட்ட கருத்துகள்',
    suggestions: 'AI பரிந்துரைகள்',
    analyzing: 'பகுப்பாய்வு செய்கிறேன்...',
    analyzeContent: 'உள்ளடக்கத்தை பகுப்பாய்வு செய்யவும்',
    visualizedContent: 'காட்சிப்படுத்தப்பட்ட உள்ளடக்கம்',
    generating: 'உருவாக்குகிறேன்...',
    visualizeContent: 'காட்சிப்படுத்தலை உருவாக்கவும்',
    downloadVisualization: 'டவுன்லோடு',
    saveToArchive: 'காப்பகத்தில் சேமிக்கவும்',
    startRecording: 'பதிவு தொடங்கவும்',
    stopRecording: 'பதிவு நிறுத்தவும்',
    liveCamera: 'நேரடி கேமரா',
    liveCameraDescription: 'நேரடி பலகை பகுப்பாய்வு',
    textbookScan: 'பாடப்புத்தக ஸ்கேன்',
    textbookScanDescription: 'புத்தகங்களிலிருந்து உள்ளடக்கத்தை பிரித்தெடுக்கவும்',
    shareWithStudents: 'மாணவர்களுடன் பகிரவும்',
    shareWithStudentsDescription: 'மாணவர் சாதனங்களுக்கு அனுப்பவும்',
    
    // Sample Content
    sampleLessonTitle: 'தமிழ் இலக்கணம் - பெயர்ச்சொல்',
    sampleSubject: 'தமிழ்',
    sampleGrade: 'வகுப்பு 3',
    sampleDuration: '45 நிமிடங்கள்',
    sampleObjective1: 'பெயர்ச்சொல் என்றால் என்ன என்பதை அறிந்து கொள்ள வேண்டும்',
    sampleObjective2: 'பெயர்ச்சொல்லின் வகைகளை புரிந்து கொள்ள வேண்டும்',
    sampleObjective3: 'வாக்கியங்களில் பெயர்ச்சொல்லை கண்டறிய வேண்டும்',
    sampleObjective4: 'அன்றாட வாழ்க்கையில் பெயர்ச்சொல்லின் பயன்பாட்டை உணர வேண்டும்',
    
    sampleActivity1: 'அறிமுகம் மற்றும் விளக்கம்',
    sampleActivity1Desc: 'பெயர்ச்சொல் பற்றிய அடிப்படை விளக்கம் மற்றும் எடுத்துக்காட்டுகள்',
    sampleActivity2: 'உதாரணங்களை கண்டறிதல்',
    sampleActivity2Desc: 'வகுப்பறையில் உள்ள பொருள்களின் பெயர்களை கண்டறிதல்',
    sampleActivity3: 'குழு விவாதம்',
    sampleActivity3Desc: 'மாணவர்களுடன் பெயர்ச்சொல்லின் வகைகள் பற்றிய விவாதம்',
    sampleActivity4: 'மதிப்பீடு',
    sampleActivity4Desc: 'கற்றதை மதிப்பிடும் வினாக்கள்',
    
    sampleMaterial1: 'கரும்பலகை மற்றும் சுண்ணாம்பு',
    sampleMaterial2: 'பெயர்ச்சொல் அட்டைகள்',
    sampleMaterial3: 'வகுப்பறை பொருள்கள்',
    sampleMaterial4: 'தமிழ் இலக்கண புத்தகம்',
    
    sampleAssessment: 'மாணவர்கள் 5 பெயர்ச்சொற்களை அடையாளம் கண்டு வாக்கியங்களில் பயன்படுத்த வேண்டும்',
    sampleCulturalContext: 'தமிழ் இலக்கணத்தின் அழகு மற்றும் செம்மொழி தமிழின் பெருமை',
    
    // Festivals
    pongal: 'பொங்கல்',
    tamilNewYear: 'தமிழ் புத்தாண்டு',
    pongalContext: 'தமிழ் கலாச்சாரம் மற்றும் விவசாயம்',
    tamilNewYearContext: 'தமிழ் பாரம்பரியம் மற்றும் வரலாறு',
    
    // Recent Lessons
    lesson1Title: 'தமிழ் இலக்கணம் - வினைச்சொல்',
    lesson1Grade: 'வகுப்பு 3',
    lesson1Duration: '45 நிமிடங்கள்',
    lesson2Title: 'கணிதம் - கூட்டல் கழித்தல்',
    lesson2Grade: 'வகுப்பு 2',
    lesson2Duration: '30 நிமிடங்கள்',
    lesson3Title: 'அறிவியல் - தாவரங்கள்',
    lesson3Grade: 'வகுப்பு 4',
    lesson3Duration: '40 நிமிடங்கள்',
    
    // Generation Steps
    generatingStructure: '• பாடத்தின் கட்டமைப்பை உருவாக்குகிறேன்',
    planningActivities: '• செயல்பாடுகளை திட்டமிடுகிறேன்',
    addingFestivalContext: '• பண்டிகை சூழலை இணைக்கிறேன்',
    addingCulturalContext: '• தமிழ் கலாச்சாரத்தை சேர்க்கிறேன்',
    
    // Voice Feedback
    lessonReady: 'பாடம் தயாராகி விட்டது! இப்போது பார்க்கலாம்',
    processingRequest: 'பாடத்தை உருவாக்கி வருகிறேன். சிறிது நேரம் காத்திருக்கவும்',
    provideDetails: 'முதலில் பாடத்தின் விவரங்களை கொடுக்கவும்',
    makingChanges: 'இந்த மாற்றத்தை செய்து தருகிறேன்'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};