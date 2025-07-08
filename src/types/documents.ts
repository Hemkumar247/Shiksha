export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  lastModified: Date;
  subject?: string;
  topic?: string;
  tags: string[];
  storageType: 'firebase' | 'local';
  firebaseUrl?: string;
  localData?: string; // Base64 for local storage
  extractedText: string;
  summary?: string;
  revisionNotes?: string;
  keyPoints?: string[];
  concepts?: string[];
  userId: string;
  isProcessing: boolean;
  processingError?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ProcessingOptions {
  summaryLength: 'short' | 'medium' | 'long';
  includeKeyPoints: boolean;
  includeConcepts: boolean;
  includeRevisionNotes: boolean;
  customPrompt?: string;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}