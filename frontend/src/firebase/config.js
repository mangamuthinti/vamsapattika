import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
// TODO: Replace with your Firebase project credentials
// Go to Firebase Console > Project Settings > General > Your apps > Web app
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHvdD9862fTVSoGGEthC3tZDwhDp_Gaec",
  authDomain: "family-tree-app-59935.firebaseapp.com",
  databaseURL: "https://family-tree-app-59935-default-rtdb.firebaseio.com",
  projectId: "family-tree-app-59935",
  storageBucket: "family-tree-app-59935.firebasestorage.app",
  messagingSenderId: "892083128298",
  appId: "1:892083128298:web:10bd310a906d6217b09493",
  measurementId: "G-CGKDG8J4DM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Realtime Database
export const database = getDatabase(app);

export default app;
