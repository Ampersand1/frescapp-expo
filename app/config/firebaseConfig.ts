import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9wRH0qtedF6NhCJF0CvT-vTn6OyP1V8k",
  authDomain: "frescapp-57eb3.firebaseapp.com",
  projectId: "frescapp-57eb3",
  storageBucket: "frescapp-57eb3.firebasestorage.app",
  messagingSenderId: "690772033761",
  appId: "1:690772033761:web:a2a13d9017ad84c84e77a0",
  measurementId: "G-B97XZCTM62"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);