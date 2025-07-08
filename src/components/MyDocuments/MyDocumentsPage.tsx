import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { DocumentList } from './DocumentList';
import { DocumentDetail } from './DocumentDetail';
import { UploadedDocument } from '../../types/documents';
import { useLanguage } from '../../contexts/LanguageContext';

export const MyDocumentsPage: React.FC = () => {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<'list' | 'upload' | 'detail'>('list');
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Mock user ID - in a real app, this would come from authentication
  const userId = 'user123';

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadComplete = (document: UploadedDocument) => {
    showNotification('success', `Successfully uploaded and processed "${document.fileName}"`);
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('list');
  };

  const handleUploadError = (error: string) => {
    showNotification('error', error);
  };

  const handleDocumentSelect = (document: UploadedDocument) => {
    setSelectedDocument(document);
    setCurrentView('detail');
  };

  const handleDocumentUpdate = (updatedDocument: UploadedDocument) => {
    setSelectedDocument(updatedDocument);
    setRefreshTrigger(prev => prev + 1);
    showNotification('success', 'Document updated successfully');
  };

  const handleDocumentDelete = (documentId: string) => {
    setRefreshTrigger(prev => prev + 1);
    showNotification('success', 'Document deleted successfully');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3 text-primary" />
            My Documents
          </h1>
          <p className="text-gray-600 mt-1">
            Upload, organize, and get AI-powered insights from your study materials
          </p>
        </div>

        {currentView === 'list' && (
          <motion.button
            onClick={() => setCurrentView('upload')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </motion.button>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentView === 'upload' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upload New Document</h2>
              <motion.button
                onClick={() => setCurrentView('list')}
                className="text-gray-600 hover:text-gray-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Documents
              </motion.button>
            </div>
            <FileUpload
              userId={userId}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {currentView === 'list' && (
          <DocumentList
            userId={userId}
            onDocumentSelect={handleDocumentSelect}
            onDocumentUpdate={handleDocumentUpdate}
            onDocumentDelete={handleDocumentDelete}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentView === 'detail' && selectedDocument && (
          <DocumentDetail
            document={selectedDocument}
            onBack={handleBackToList}
            onDocumentUpdate={handleDocumentUpdate}
          />
        )}
      </motion.div>

      {/* Quick Stats */}
      {currentView === 'list' && (
        <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-4">Document Management Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">📚 Organize by Subject</h4>
              <p className="text-sm opacity-90">
                Use subjects and topics to categorize your documents for easy retrieval
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">🏷️ Tag Everything</h4>
              <p className="text-sm opacity-90">
                Add relevant tags to make your documents searchable and discoverable
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">🤖 AI Processing</h4>
              <p className="text-sm opacity-90">
                Let AI generate summaries, key points, and revision notes automatically
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};