import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Cloud, 
  HardDrive,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Eye,
  BookOpen,
  Clock,
  User
} from 'lucide-react';
import { UploadedDocument } from '../../types/documents';
import { documentStorageService } from '../../services/documentStorageService';
import { useLanguage } from '../../contexts/LanguageContext';

interface DocumentListProps {
  userId: string;
  onDocumentSelect: (document: UploadedDocument) => void;
  onDocumentUpdate: (document: UploadedDocument) => void;
  onDocumentDelete: (documentId: string) => void;
  refreshTrigger?: number;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  userId,
  onDocumentSelect,
  onDocumentUpdate,
  onDocumentDelete,
  refreshTrigger
}) => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStorageType, setSelectedStorageType] = useState<'all' | 'firebase' | 'local'>('all');
  const [sortBy, setSortBy] = useState<'uploadDate' | 'fileName' | 'fileSize'>('uploadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [userId, refreshTrigger]);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, searchTerm, selectedSubject, selectedStorageType, sortBy, sortOrder]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const userDocuments = await documentStorageService.getUserDocuments(userId);
      setDocuments(userDocuments);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSubject = !selectedSubject || doc.subject === selectedSubject;
      const matchesStorageType = selectedStorageType === 'all' || doc.storageType === selectedStorageType;

      return matchesSearch && matchesSubject && matchesStorageType;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'fileSize':
          aValue = a.fileSize;
          bValue = b.fileSize;
          break;
        case 'uploadDate':
        default:
          aValue = new Date(a.uploadDate).getTime();
          bValue = new Date(b.uploadDate).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDocuments(filtered);
  };

  const handleDocumentAction = async (action: string, document: UploadedDocument) => {
    try {
      switch (action) {
        case 'view':
          onDocumentSelect(document);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete "${document.fileName}"?`)) {
            await documentStorageService.deleteDocument(document.id, document.firebaseUrl);
            onDocumentDelete(document.id);
            setDocuments(prev => prev.filter(doc => doc.id !== document.id));
          }
          break;
        case 'download':
          if (document.storageType === 'firebase' && document.firebaseUrl) {
            window.open(document.firebaseUrl, '_blank');
          } else if (document.storageType === 'local' && document.localData) {
            const link = document.createElement('a');
            link.href = document.localData;
            link.download = document.fileName;
            link.click();
          }
          break;
      }
    } catch (err) {
      setError(`Failed to ${action} document`);
      console.error(`Error ${action}ing document:`, err);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('word')) return BookOpen;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueSubjects = Array.from(new Set(documents.map(doc => doc.subject).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <div className="text-red-500">⚠️</div>
          <div>
            <h3 className="font-medium text-red-800">Error Loading Documents</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={loadDocuments}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedStorageType}
              onChange={(e) => setSelectedStorageType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Storage</option>
              <option value="firebase">Cloud Storage</option>
              <option value="local">Local Storage</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="uploadDate-desc">Newest First</option>
              <option value="uploadDate-asc">Oldest First</option>
              <option value="fileName-asc">Name A-Z</option>
              <option value="fileName-desc">Name Z-A</option>
              <option value="fileSize-desc">Largest First</option>
              <option value="fileSize-asc">Smallest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {documents.length === 0 
              ? "Upload your first document to get started"
              : "Try adjusting your search or filters"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document, index) => {
            const FileIcon = getFileIcon(document.fileType);
            return (
              <motion.div
                key={document.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onDocumentSelect(document)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {document.storageType === 'firebase' ? (
                          <Cloud className="h-4 w-4 text-blue-500" />
                        ) : (
                          <HardDrive className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(selectedDocument === document.id ? null : document.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {selectedDocument === document.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentAction('view', document);
                              setSelectedDocument(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentAction('download', document);
                              setSelectedDocument(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentAction('delete', document);
                              setSelectedDocument(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 truncate" title={document.fileName}>
                      {document.fileName}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span>{formatDate(document.uploadDate)}</span>
                    </div>

                    {/* Subject and Topic */}
                    {(document.subject || document.topic) && (
                      <div className="flex flex-wrap gap-2">
                        {document.subject && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {document.subject}
                          </span>
                        )}
                        {document.topic && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {document.topic}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {document.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{document.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Processing Status */}
                    {document.isProcessing && (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}

                    {/* Summary Preview */}
                    {document.summary && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {document.summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {selectedDocument && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};