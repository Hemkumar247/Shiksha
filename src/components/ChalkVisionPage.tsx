import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  ScanText, 
  Eye, 
  Sparkles, 
  Download,
  BookOpen,
  Users,
  Archive,
  Layers,
  Zap,
  Image as ImageIcon,
  FileText,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { geminiService, ChalkVisionAnalysis, VisualizationRecommendation } from '../services/geminiService';

export const ChalkVisionPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingVisualization, setIsGeneratingVisualization] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ChalkVisionAnalysis | null>(null);
  const [visualizations, setVisualizations] = useState<VisualizationRecommendation[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('Grade 3');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');

  const gradeOptions = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        setAnalysisResult(null);
        setVisualizations([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    setProcessingStage('Extracting content from image...');
    
    try {
      // Check rate limit
      const rateLimitStatus = geminiService.getRateLimitStatus();
      if (!rateLimitStatus.canMakeRequest) {
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimitStatus.waitTime / 1000)} seconds.`);
      }

      setProcessingStage('Analyzing educational content...');
      const analysis = await geminiService.analyzeChalkVisionContent(selectedImage, selectedGrade);
      
      setProcessingStage('Generating teaching suggestions...');
      setAnalysisResult(analysis);
      
      setProcessingStage('Complete!');
    } catch (error: any) {
      console.error('Error analyzing content:', error);
      setError(error.message || 'Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setProcessingStage('');
    }
  };

  const handleGenerateVisualization = async () => {
    if (!analysisResult) return;
    
    setIsGeneratingVisualization(true);
    setError(null);
    
    try {
      // Check rate limit
      const rateLimitStatus = geminiService.getRateLimitStatus();
      if (!rateLimitStatus.canMakeRequest) {
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimitStatus.waitTime / 1000)} seconds.`);
      }

      const visualizationData = await geminiService.generateVisualization(
        analysisResult.extractedText, 
        selectedGrade
      );
      
      setVisualizations(visualizationData);
    } catch (error: any) {
      console.error('Error generating visualization:', error);
      setError(error.message || 'Failed to generate visualization. Please try again.');
    } finally {
      setIsGeneratingVisualization(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    if (!selectedImage) return;
    
    // Clear cache and re-analyze
    geminiService.clearCache();
    await handleAnalyzeContent();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
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

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'example': return <Lightbulb className="h-4 w-4" />;
      case 'explanation': return <FileText className="h-4 w-4" />;
      case 'activity': return <Users className="h-4 w-4" />;
      case 'assessment': return <Target className="h-4 w-4" />;
      case 'extension': return <Zap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('chalkVision')}</h1>
          <p className="text-gray-600">{t('chalkVisionSubtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <motion.button
            onClick={toggleRecording}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isRecording ? t('stopRecording') : t('startRecording')}</span>
          </motion.button>
        </div>
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
            <p className="text-red-800 font-medium">Analysis Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <ScanText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">{t('liveOCR')}</h3>
          </div>
          <p className="text-blue-800 text-sm">{t('liveOCRDescription')}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-500 rounded-full">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-900">{t('instantDifferentiation')}</h3>
          </div>
          <p className="text-green-800 text-sm">{t('instantDifferentiationDescription')}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-500 rounded-full">
              <Archive className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900">{t('autoRecord')}</h3>
          </div>
          <p className="text-purple-800 text-sm">{t('autoRecordDescription')}</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-primary" />
            {t('uploadImage')}
          </h3>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{t('clickToUpload')}</p>
                    <p className="text-sm text-gray-500">{t('supportedFormats')}</p>
                  </div>
                </div>
              </label>
            </div>

            {selectedImage && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Uploaded content"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                    <ImageIcon className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleAnalyzeContent}
                    disabled={isAnalyzing}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      isAnalyzing
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                    whileHover={!isAnalyzing ? { scale: 1.02 } : {}}
                    whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <span>{t('analyzing')}</span>
                      </>
                    ) : (
                      <>
                        <ScanText className="h-4 w-4" />
                        <span>{t('analyzeContent')}</span>
                      </>
                    )}
                  </motion.button>

                  {analysisResult && (
                    <motion.button
                      onClick={handleRefreshAnalysis}
                      disabled={isAnalyzing}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Refresh Analysis"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>

                {/* Processing Stage Indicator */}
                {isAnalyzing && processingStage && (
                  <motion.div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800 text-sm">{processingStage}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Analysis Results Section */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-secondary" />
            {t('extractedContent')}
          </h3>

          {!analysisResult && !isAnalyzing && (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('uploadImageToAnalyze')}</p>
            </div>
          )}

          {analysisResult && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Extracted Text */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('extractedText')}
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {analysisResult.extractedText}
                </p>
              </div>

              {/* Subject and Grade Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-900 text-sm">Subject Area</h5>
                  <p className="text-blue-800">{analysisResult.subjectArea}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-green-900 text-sm">Difficulty</h5>
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(analysisResult.difficultyLevel)}`}>
                    {analysisResult.difficultyLevel}
                  </span>
                </div>
              </div>

              {/* Identified Concepts */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">{t('identifiedConcepts')}</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.identifiedConcepts.map((concept, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">{t('suggestions')}</h4>
                <div className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSuggestionIcon(suggestion.type)}
                        <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {suggestion.type}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{suggestion.description}</p>
                      <div className="text-xs text-gray-600">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {suggestion.timeRequired}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              {analysisResult.nextSteps && analysisResult.nextSteps.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Recommended Next Steps</h4>
                  <ul className="space-y-1">
                    {analysisResult.nextSteps.map((step, index) => (
                      <li key={index} className="text-purple-800 text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Generate Visualization Button */}
              <motion.button
                onClick={handleGenerateVisualization}
                disabled={isGeneratingVisualization}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isGeneratingVisualization
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-secondary text-white hover:bg-secondary/90'
                }`}
                whileHover={!isGeneratingVisualization ? { scale: 1.02 } : {}}
                whileTap={!isGeneratingVisualization ? { scale: 0.98 } : {}}
              >
                {isGeneratingVisualization ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>{t('generating')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{t('visualizeContent')}</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Visualization Recommendations */}
      {visualizations.length > 0 && (
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            {t('visualizedContent')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visualizations.map((viz, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">{viz.title}</h4>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {viz.type}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{viz.description}</p>
                
                {/* Materials */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Required Materials:</h5>
                  <div className="flex flex-wrap gap-2">
                    {viz.materials.map((material, matIndex) => (
                      <span key={matIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Implementation Steps:</h5>
                  <ol className="list-decimal list-inside space-y-1">
                    {viz.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-gray-700 text-sm">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Learning Outcome */}
                <div className="bg-white p-3 rounded border border-yellow-200">
                  <h5 className="font-medium text-gray-900 mb-1">Expected Outcome:</h5>
                  <p className="text-gray-700 text-sm">{viz.learningOutcome}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-4 mt-6">
            <motion.button
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-4 w-4" />
              <span>{t('downloadVisualization')}</span>
            </motion.button>
            
            <motion.button
              className="flex items-center space-x-2 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Archive className="h-4 w-4" />
              <span>{t('saveToArchive')}</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold mb-4">{t('quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            className="flex items-center space-x-3 p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="h-6 w-6" />
            <div className="text-left">
              <p className="font-medium">{t('liveCamera')}</p>
              <p className="text-sm opacity-80">{t('liveCameraDescription')}</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-3 p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BookOpen className="h-6 w-6" />
            <div className="text-left">
              <p className="font-medium">{t('textbookScan')}</p>
              <p className="text-sm opacity-80">{t('textbookScanDescription')}</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-3 p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="h-6 w-6" />
            <div className="text-left">
              <p className="font-medium">{t('shareWithStudents')}</p>
              <p className="text-sm opacity-80">{t('shareWithStudentsDescription')}</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

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