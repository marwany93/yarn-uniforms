// Firebase Configuration and Initialization
// Replace the config object with your Firebase project credentials

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAPX3emAcbKCiWzBLjdQZ2-6ofdgaTTO6c",
  authDomain: "yarn-uniforms-8981f.firebaseapp.com",
  projectId: "yarn-uniforms-8981f",
  storageBucket: "yarn-uniforms-8981f.firebasestorage.app",
  messagingSenderId: "527215932801",
  appId: "1:527215932801:web:2e65f1c73bd7f9c5e5a480"
};

// Initialize Firebase (singleton pattern to avoid multiple instances)
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Export the app instance
export default app;

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY";
};
