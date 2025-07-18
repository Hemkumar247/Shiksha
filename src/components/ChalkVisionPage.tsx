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
  Pause
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { geminiService } from '../services/geminiService';

interface ExtractedContent {
  text: string;
  concepts: string[];
  difficulty: string;
  suggestions: string[];
}

interface VisualizedContent {
  title: string;
  description: string;
  visualType: string;
  content: string;
}

export const ChalkVisionPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  const [visualizedContent, setVisualizedContent] = useState<VisualizedContent | null>(null);
  const [selectedGrade, setSelectedGrade] = useState('Grade 3');
  const [isRecording, setIsRecording] = useState(false);

  const gradeOptions = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setExtractedContent(null);
      setVisualizedContent(null);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const prompt = `
        Analyze the content of this image. It's from a ${selectedGrade} classroom.
        Extract the text, identify key concepts, and suggest 3-5 teaching ideas.
        Format the response as a JSON object with the following structure:
        {
          "text": "...",
          "concepts": ["...", "..."],
          "suggestions": ["...", "..."]
        }
      `;
      const result = await geminiService.analyzeImage(selectedImage, prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedContent = JSON.parse(jsonMatch[0]);
        setExtractedContent({
          ...parsedContent,
          difficulty: selectedGrade,
        });
      } else {
        // Handle cases where the response is not valid JSON
        setExtractedContent({
          text: result,
          concepts: [],
          suggestions: [],
          difficulty: selectedGrade,
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      // You might want to show an error message to the user
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVisualizeContent = async () => {
    if (!extractedContent) return;

    setIsVisualizing(true);
    try {
      const result = await geminiService.generateVisualization(extractedContent.text, selectedGrade);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setVisualizedContent(JSON.parse(jsonMatch[0]));
      } else {
        // Handle cases where the response is not valid JSON
        setVisualizedContent({
          title: 'Visualization Idea',
          description: 'A creative way to represent the content.',
          visualType: 'Generated Idea',
          content: result,
        });
      }
    } catch (error) {
      console.error('Error visualizing content:', error);
      // You might want to show an error message to the user
    } finally {
      setIsVisualizing(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
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
                
                <motion.button
                  onClick={handleAnalyzeContent}
                  disabled={isAnalyzing}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
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
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Extracted Content Section */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-secondary" />
            {t('extractedContent')}
          </h3>

          {!extractedContent && !isAnalyzing && (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('uploadImageToAnalyze')}</p>
            </div>
          )}

          {extractedContent && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{t('extractedText')}</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{extractedContent.text}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">{t('identifiedConcepts')}</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedContent.concepts.map((concept, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">{t('suggestions')}</h4>
                <ul className="space-y-1">
                  {extractedContent.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-green-800 flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                onClick={handleVisualizeContent}
                disabled={isVisualizing}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isVisualizing
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-secondary text-white hover:bg-secondary/90'
                }`}
                whileHover={!isVisualizing ? { scale: 1.02 } : {}}
                whileTap={!isVisualizing ? { scale: 0.98 } : {}}
              >
                {isVisualizing ? (
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

      {/* Visualized Content Section */}
      {visualizedContent && (
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            {t('visualizedContent')}
          </h3>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{visualizedContent.title}</h4>
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {visualizedContent.visualType}
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                {selectedGrade}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{visualizedContent.description}</p>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-800">{visualizedContent.content}</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4">
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="h-4 w-4" />
                <span>{t('downloadVisualization')}</span>
              </motion.button>
              
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Archive className="h-4 w-4" />
                <span>{t('saveToArchive')}</span>
              </motion.button>
            </div>
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
    </div>
  );
};