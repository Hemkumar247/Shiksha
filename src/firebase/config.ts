import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD6cC44wNOQbkrfo_pofVn7rY-Dh2a9QCc",
  authDomain: "shiksha-3ccc5.firebaseapp.com",
  projectId: "shiksha-3ccc5",
  storageBucket: "shiksha-3ccc5.firebasestorage.app",
  messagingSenderId: "542288196493",
  appId: "1:542288196493:web:37c1483d6c4833459cc3c4",
  measurementId: "G-3HYD4WFMT0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;