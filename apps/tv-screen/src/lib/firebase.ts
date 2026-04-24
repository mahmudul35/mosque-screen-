import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Using the identical DB config
const firebaseConfig = {
  apiKey: "AIzaSyCZe9h4G-Y32iGSy1OYfKlBxg-ImUbKEy8",
  authDomain: "mosque-saas-d3283.firebaseapp.com",
  projectId: "mosque-saas-d3283",
  storageBucket: "mosque-saas-d3283.firebasestorage.app",
  messagingSenderId: "97509684620",
  appId: "1:97509684620:web:9a86428cbe28de9131d2a9"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
