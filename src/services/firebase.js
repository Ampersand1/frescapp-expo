import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC9wRH0qtedF6NhCJF0CvT-vTn6OyP1V8k",
  authDomain: "frescapp-57eb3.firebaseapp.com",
  projectId: "frescapp-57eb3",
  storageBucket: "frescapp-57eb3.firebasestorage.app",
  messagingSenderId: "690772033761",
  appId: "1:690772033761:web:a2a13d9017ad84c84e77a0",
  measurementId: "G-B97XZCTM62"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);
export { auth, db, firebaseConfig };