import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  X, 
  Cloud, 
  HardDrive, 
  AlertCircle, 
  CheckCircle,
  FileText,
  FileImage,
  Loader2,
  FolderOpen,
  Tag
} from 'lucide-react';
import { documentStorageService } from '../../services/documentStorageService';
import { fileProcessingService } from '../../services/fileProcessingService';
import { UploadProgress, ProcessingOptions, UploadedDocument } from '../../types/documents';
import { useLanguage } from '../../contexts/LanguageContext';

interface FileUploadProps {
  userId: string;
  onUploadComplete: (document: UploadedDocument) => void;
  onUploadError: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  userId,
  onUploadComplete,
  onUploadError
}) => {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [storageType, setStorageType] = useState<'firebase' | 'local'>('firebase');
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    summaryLength: 'medium',
    includeKeyPoints: true,
    includeConcepts: true,
    includeRevisionNotes: true
  });
  const [isUploading, setIsUploading] = useState(false);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const subjects = [
    'Mathematics', 'Science', 'Tamil', 'English', 'Social Studies',
    'Computer Science', 'Arts', 'Physical Education', 'Environmental Studies'
  ];

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  }, []);

  const handleFileSelection = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = documentStorageService.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      onUploadError(errors.join('\n'));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelection(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress([]);

    for (const file of selectedFiles) {
      try {
        // Initialize progress
        const initialProgress: UploadProgress = {
          fileName: file.name,
          progress: 0,
          status: 'uploading'
        };
        setUploadProgress(prev => [...prev, initialProgress]);

        // Extract text content
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name 
              ? { ...p, status: 'processing', progress: 20 }
              : p
          )
        );

        const extractedText = await fileProcessingService.extractText(file);

        // Upload file based on storage type
        let fileUrl = '';
        let localData = '';

        if (storageType === 'firebase') {
          fileUrl = await documentStorageService.uploadToFirebase(
            file,
            userId,
            (progress) => {
              setUploadProgress(prev =>
                prev.map(p =>
                  p.fileName === file.name
                    ? { ...p, progress: 20 + (progress.progress * 0.3) }
                    : p
                )
              );
            }
          );
        } else {
          localData = await documentStorageService.storeLocally(file);
        }

        // Process content with AI
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name 
              ? { ...p, progress: 60 }
              : p
          )
        );

        const processedContent = await fileProcessingService.processContent(
          extractedText,
          processingOptions
        );

        // Create document object
        const document: Omit<UploadedDocument, 'id'> = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadDate: new Date(),
          lastModified: new Date(),
          subject: subject || undefined,
          topic: topic || undefined,
          tags,
          storageType,
          firebaseUrl: storageType === 'firebase' ? fileUrl : undefined,
          localData: storageType === 'local' ? localData : undefined,
          extractedText,
          summary: processedContent.summary,
          revisionNotes: processedContent.revisionNotes,
          keyPoints: processedContent.keyPoints,
          concepts: processedContent.concepts,
          userId,
          isProcessing: false
        };

        // Save to Firestore
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name 
              ? { ...p, progress: 90 }
              : p
          )
        );

        const documentId = await documentStorageService.saveDocument(document);

        // Complete
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name 
              ? { ...p, progress: 100, status: 'completed' }
              : p
          )
        );

        onUploadComplete({ ...document, id: documentId });

      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name 
              ? { ...p, status: 'error', error: error.message }
              : p
          )
        );
        onUploadError(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    // Reset form
    setTimeout(() => {
      setSelectedFiles([]);
      setUploadProgress([]);
      setIsUploading(false);
      setSubject('');
      setTopic('');
      setTags([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('word')) return FileImage;
    return File;
  };

  return (
    <div className="space-y-6">
      {/* Storage Type Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            onClick={() => setStorageType('firebase')}
            className={`p-4 rounded-lg border-2 transition-all ${
              storageType === 'firebase'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <Cloud className="h-6 w-6" />
              <div className="text-left">
                <h4 className="font-medium">Cloud Storage</h4>
                <p className="text-sm text-gray-600">Access from anywhere, persistent storage</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => setStorageType('local')}
            className={`p-4 rounded-lg border-2 transition-all ${
              storageType === 'local'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <HardDrive className="h-6 w-6" />
              <div className="text-left">
                <h4 className="font-medium">Local Storage</h4>
                <p className="text-sm text-gray-600">Offline access, privacy focused</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* File Organization */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Subject</option>
              {subjects.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-primary/60 hover:text-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <motion.button
              onClick={addTag}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add
            </motion.button>
          </div>
        </div>
      </div>

      {/* Processing Options */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Processing Options</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary Length</label>
            <select
              value={processingOptions.summaryLength}
              onChange={(e) => setProcessingOptions(prev => ({
                ...prev,
                summaryLength: e.target.value as 'short' | 'medium' | 'long'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="short">Short (2-3 sentences)</option>
              <option value="medium">Medium (1-2 paragraphs)</option>
              <option value="long">Long (3-4 paragraphs)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.includeKeyPoints}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  includeKeyPoints: e.target.checked
                }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Key Points</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.includeConcepts}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  includeConcepts: e.target.checked
                }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Concepts</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.includeRevisionNotes}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  includeRevisionNotes: e.target.checked
                }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Revision Notes</span>
            </label>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PDF, DOCX, TXT files up to 25MB each
              </p>
            </div>

            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FolderOpen className="h-4 w-4 mr-2 inline" />
              Browse Files
            </motion.button>
          </div>
        </div>

        {/* Selected Files */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-3"
            >
              <h4 className="font-medium text-gray-900">Selected Files</h4>
              {selectedFiles.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileIcon className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploadProgress.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-3"
            >
              <h4 className="font-medium text-gray-900">Upload Progress</h4>
              {uploadProgress.map((progress, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {progress.fileName}
                    </span>
                    <div className="flex items-center space-x-2">
                      {progress.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {progress.status === 'processing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      )}
                      {progress.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {progress.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        {progress.progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress.status === 'error'
                          ? 'bg-red-500'
                          : progress.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  {progress.error && (
                    <p className="text-sm text-red-600">{progress.error}</p>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 flex justify-end">
            <motion.button
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isUploading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
              whileHover={!isUploading ? { scale: 1.05 } : {}}
              whileTap={!isUploading ? { scale: 0.95 } : {}}
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload & Process</span>
                </div>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};