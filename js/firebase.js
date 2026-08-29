import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for sistem-kelurahan-58782.
// The Web API key is not a password; protect data with Firebase Auth/Firestore rules.
const firebaseConfig = {
    apiKey: "AIzaSyBo5cJOd9EBFKwlq3bv_BhA2E9sRN0H-Ew",
    authDomain: "sistem-kelurahan-58782.firebaseapp.com",
    projectId: "sistem-kelurahan-58782",
    storageBucket: "sistem-kelurahan-58782.firebasestorage.app",
    messagingSenderId: "482964956660",
    appId: "1:482964956660:web:65db19b725cebd911c45a1"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const appId = 'sistem-kelurahan-58782';
