import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/*
  =========================================
  🔥 FIREBASE CONFIGURATION INSTRUCTIONS 🔥
  =========================================
  
  1. Go to https://console.firebase.google.com/
  2. Create a new Project (or select existing)
  3. Go to Project Settings -> General -> "Your apps"
  4. Add a Web App (</>)
  5. Copy the firebaseConfig object they provide and replace the placeholders below.
  6. Enable 'Authentication' (Email/Password provider)
  7. Enable 'Firestore Database'
*/

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
