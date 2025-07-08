import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  HardDrive, 
  Cloud, 
  Tag, 
  RefreshCw,
  Download,
  Edit,
  Save,
  X,
  BookOpen,
  Lightbulb,
  Target,
  Brain,
  Copy,
  Check,
  Share2,
  Printer
} from 'lucide-react';
import { UploadedDocument, ProcessingOptions } from '../../types/documents';
import { fileProcessingService } from '../../services/fileProcessingService';
import { documentStorageService } from '../../services/documentStorageService';
import { useLanguage } from '../../contexts/LanguageContext';

interface DocumentDetailProps {
  document: UploadedDocument;
  onBack: () => void;
  onDocumentUpdate: (document: UploadedDocument) => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  document,
  onBack,
  onDocumentUpdate
}) => {
  const { t } = useLanguage();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDocument, setEditedDocument] = useState(document);
  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'keypoints' | 'concepts' | 'original'>('summary');
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    summaryLength: 'medium',
    includeKeyPoints: true,
    includeConcepts: true,
    includeRevisionNotes: true
  });
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleRegenerateSummary = async () => {
    setIsRegenerating(true);
    try {
      const processedContent = await fileProcessingService.processContent(
        document.extractedText,
        processingOptions
      );

      const updatedDocument = {
        ...document,
        summary: processedContent.summary,
        revisionNotes: processedContent.revisionNotes,
        keyPoints: processedContent.keyPoints,
        concepts: processedContent.concepts,
        lastModified: new Date()
      };

      await documentStorageService.updateDocument(document.id, updatedDocument);
      onDocumentUpdate(updatedDocument);
    } catch (error) {
      console.error('Error regenerating summary:', error);
      alert('Failed to regenerate summary. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await documentStorageService.updateDocument(document.id, {
        fileName: editedDocument.fileName,
        subject: editedDocument.subject,
        topic: editedDocument.topic,
        tags: editedDocument.tags,
        lastModified: new Date()
      });
      
      onDocumentUpdate(editedDocument);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Failed to update document. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedDocument(document);
    setIsEditing(false);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = () => {
    if (document.storageType === 'firebase' && document.firebaseUrl) {
      window.open(document.firebaseUrl, '_blank');
    } else if (document.storageType === 'local' && document.localData) {
      const link = document.createElement('a');
      link.href = document.localData;
      link.download = document.fileName;
      link.click();
    }
  };

  const exportContent = (format: 'txt' | 'json') => {
    const content = {
      fileName: document.fileName,
      summary: document.summary,
      revisionNotes: document.revisionNotes,
      keyPoints: document.keyPoints,
      concepts: document.concepts,
      originalText: document.extractedText
    };

    let exportData: string;
    let mimeType: string;
    let fileName: string;

    if (format === 'json') {
      exportData = JSON.stringify(content, null, 2);
      mimeType = 'application/json';
      fileName = `${document.fileName}_processed.json`;
    } else {
      exportData = `
Document: ${content.fileName}

SUMMARY:
${content.summary || 'No summary available'}

REVISION NOTES:
${content.revisionNotes || 'No revision notes available'}

KEY POINTS:
${content.keyPoints?.map((point, i) => `${i + 1}. ${point}`).join('\n') || 'No key points available'}

CONCEPTS:
${content.concepts?.join(', ') || 'No concepts available'}

ORIGINAL TEXT:
${content.originalText}
      `.trim();
      mimeType = 'text/plain';
      fileName = `${document.fileName}_processed.txt`;
    }

    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addTag = (newTag: string) => {
    if (newTag.trim() && !editedDocument.tags.includes(newTag.trim())) {
      setEditedDocument(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedDocument(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BookOpen, available: !!document.summary },
    { id: 'notes', label: 'Revision Notes', icon: Lightbulb, available: !!document.revisionNotes },
    { id: 'keypoints', label: 'Key Points', icon: Target, available: !!document.keyPoints?.length },
    { id: 'concepts', label: 'Concepts', icon: Brain, available: !!document.concepts?.length },
    { id: 'original', label: 'Original Text', icon: FileText, available: true }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Details</h1>
            <p className="text-gray-600">View and manage your document</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </motion.button>

          <motion.button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </motion.button>
        </div>
      </div>

      {/* Document Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedDocument.fileName}
                  onChange={(e) => setEditedDocument(prev => ({ ...prev, fileName: e.target.value }))}
                  className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:border-primary outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">{document.fileName}</h2>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  {document.storageType === 'firebase' ? (
                    <Cloud className="h-4 w-4 text-blue-500" />
                  ) : (
                    <HardDrive className="h-4 w-4 text-gray-500" />
                  )}
                  <span>{document.storageType === 'firebase' ? 'Cloud Storage' : 'Local Storage'}</span>
                </div>
                <span>{formatFileSize(document.fileSize)}</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(document.uploadDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleSaveEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </motion.button>
              <motion.button
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDocument.subject || ''}
                onChange={(e) => setEditedDocument(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter subject..."
              />
            ) : (
              <p className="text-gray-900">{document.subject || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDocument.topic || ''}
                onChange={(e) => setEditedDocument(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter topic..."
              />
            ) : (
              <p className="text-gray-900">{document.topic || 'Not specified'}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? editedDocument.tags : document.tags).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                {isEditing && (
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary/60 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <input
                type="text"
                placeholder="Add tag..."
                className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Processing Options */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Processing</h3>
          <motion.button
            onClick={handleRegenerateSummary}
            disabled={isRegenerating}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isRegenerating
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
            whileHover={!isRegenerating ? { scale: 1.05 } : {}}
            whileTap={!isRegenerating ? { scale: 0.95 } : {}}
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Regenerate Summary</span>
              </>
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary Length</label>
            <select
              value={processingOptions.summaryLength}
              onChange={(e) => setProcessingOptions(prev => ({
                ...prev,
                summaryLength: e.target.value as any
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="keyPoints"
              checked={processingOptions.includeKeyPoints}
              onChange={(e) => setProcessingOptions(prev => ({
                ...prev,
                includeKeyPoints: e.target.checked
              }))}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="keyPoints" className="text-sm font-medium text-gray-700">
              Key Points
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="concepts"
              checked={processingOptions.includeConcepts}
              onChange={(e) => setProcessingOptions(prev => ({
                ...prev,
                includeConcepts: e.target.checked
              }))}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="concepts" className="text-sm font-medium text-gray-700">
              Concepts
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="revisionNotes"
              checked={processingOptions.includeRevisionNotes}
              onChange={(e) => setProcessingOptions(prev => ({
                ...prev,
                includeRevisionNotes: e.target.checked
              }))}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="revisionNotes" className="text-sm font-medium text-gray-700">
              Revision Notes
            </label>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.filter(tab => tab.available).map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Export Options */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-medium text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h4>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => {
                  const content = activeTab === 'summary' ? document.summary :
                                activeTab === 'notes' ? document.revisionNotes :
                                activeTab === 'keypoints' ? document.keyPoints?.join('\n') :
                                activeTab === 'concepts' ? document.concepts?.join(', ') :
                                document.extractedText;
                  if (content) copyToClipboard(content, activeTab);
                }}
                className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copiedText === activeTab ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {copiedText === activeTab ? 'Copied!' : 'Copy'}
                </span>
              </motion.button>

              <div className="relative group">
                <motion.button
                  className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Export</span>
                </motion.button>
                
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[100px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => exportContent('txt')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    As TXT
                  </button>
                  <button
                    onClick={() => exportContent('json')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    As JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Display */}
          <div className="prose max-w-none">
            {activeTab === 'summary' && (
              <div className="bg-blue-50 p-6 rounded-lg">
                {document.summary ? (
                  <p className="text-gray-800 leading-relaxed">{document.summary}</p>
                ) : (
                  <p className="text-gray-500 italic">No summary available. Click "Regenerate Summary" to create one.</p>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-green-50 p-6 rounded-lg">
                {document.revisionNotes ? (
                  <div className="text-gray-800 whitespace-pre-line">{document.revisionNotes}</div>
                ) : (
                  <p className="text-gray-500 italic">No revision notes available. Enable revision notes and regenerate summary.</p>
                )}
              </div>
            )}

            {activeTab === 'keypoints' && (
              <div className="bg-yellow-50 p-6 rounded-lg">
                {document.keyPoints && document.keyPoints.length > 0 ? (
                  <ul className="space-y-2">
                    {document.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-800">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No key points available. Enable key points and regenerate summary.</p>
                )}
              </div>
            )}

            {activeTab === 'concepts' && (
              <div className="bg-purple-50 p-6 rounded-lg">
                {document.concepts && document.concepts.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {document.concepts.map((concept, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No concepts available. Enable concepts and regenerate summary.</p>
                )}
              </div>
            )}

            {activeTab === 'original' && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">
                  {document.extractedText}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};