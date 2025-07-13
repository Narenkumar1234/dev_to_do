// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBk_-kKto76UXFX59Ga0DamtC2Gg8YY47o",
  authDomain: "dev-notes-app-ec49c.firebaseapp.com",
  projectId: "dev-notes-app-ec49c",
  storageBucket: "dev-notes-app-ec49c.firebasestorage.app",
  messagingSenderId: "877900985409",
  appId: "1:877900985409:web:03e71f10863d0b873282c0",
  measurementId: "G-CZXX3X1X15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Analytics
// export const analytics = getAnalytics(app);

export default app;
