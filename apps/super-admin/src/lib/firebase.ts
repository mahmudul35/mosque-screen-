import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCZe9h4G-Y32iGSy1OYfKlBxg-ImUbKEy8",
  authDomain: "mosque-saas-d3283.firebaseapp.com",
  projectId: "mosque-saas-d3283",
  storageBucket: "mosque-saas-d3283.firebasestorage.app",
  messagingSenderId: "97509684620",
  appId: "1:97509684620:web:9a86428cbe28de9131d2a9"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export Services
export const auth = getAuth(app)
export const db = getFirestore(app)
