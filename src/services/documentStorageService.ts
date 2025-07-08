import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { storage, db } from '../firebase/config';
import { UploadedDocument, UploadProgress } from '../types/documents';

export class DocumentStorageService {
  private readonly COLLECTION_NAME = 'documents';
  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private readonly ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  // Validate file before upload
  validateFile(file: File): { isValid: boolean; error?: string; warnings?: string[] } {
    const warnings: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 25MB`
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not supported. Allowed types: PDF, DOCX, TXT`
      };
    }

    // Add warnings for large files
    if (file.size > 10 * 1024 * 1024) {
      warnings.push('Large file detected. Upload may take longer.');
    }

    return { isValid: true, warnings };
  }

  // Upload file to Firebase Storage
  async uploadToFirebase(
    file: File, 
    userId: string, 
    onProgress: (progress: UploadProgress) => void
  ): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `user_uploads/${userId}/${fileName}`);
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({
            fileName: file.name,
            progress,
            status: 'uploading'
          });
        },
        (error) => {
          console.error('Upload error:', error);
          onProgress({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: error.message
          });
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress({
              fileName: file.name,
              progress: 100,
              status: 'completed'
            });
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  // Store file locally in browser storage
  async storeLocally(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to read file for local storage'));
      reader.readAsDataURL(file);
    });
  }

  // Save document metadata to Firestore
  async saveDocument(document: Omit<UploadedDocument, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...document,
        uploadDate: new Date(),
        lastModified: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving document:', error);
      throw new Error('Failed to save document metadata');
    }
  }

  // Update document
  async updateDocument(id: string, updates: Partial<UploadedDocument>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        lastModified: new Date()
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }

  // Get user documents
  async getUserDocuments(userId: string): Promise<UploadedDocument[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('uploadDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const documents: UploadedDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        } as UploadedDocument);
      });
      
      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  // Delete document
  async deleteDocument(id: string, firebaseUrl?: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
      
      // Delete from Firebase Storage if it exists
      if (firebaseUrl) {
        try {
          const storageRef = ref(storage, firebaseUrl);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  // Get local storage usage
  getLocalStorageUsage(): { used: number; available: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length;
      }
    }
    
    // Estimate available space (browsers typically allow 5-10MB)
    const estimated = 5 * 1024 * 1024; // 5MB estimate
    return {
      used,
      available: Math.max(0, estimated - used)
    };
  }
}

export const documentStorageService = new DocumentStorageService();