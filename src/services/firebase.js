import { initializeApp } from "firebase/app";
// CAMBIO IMPORTANTE: Usamos getAuth en lugar de initializeAuth manual
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Mantenemos el import para asegurar que el paquete esté disponible
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC9wRH0qtedF6NhCJF0CvT-vTn6OyP1V8k",
  authDomain: "frescapp-57eb3.firebaseapp.com",
  projectId: "frescapp-57eb3",
  storageBucket: "frescapp-57eb3.firebasestorage.app",
  messagingSenderId: "690772033761",
  appId: "1:690772033761:web:a2a13d9017ad84c84e77a0",
  measurementId: "G-B97XZCTM62"
};

// 1. Inicializar la App
export const app = initializeApp(firebaseConfig);

// 2. Inicializar Auth (CORRECCIÓN)
// Al usar getAuth(app) en React Native con AsyncStorage instalado, 
// la persistencia se configura automáticamente sin causar el error.
export const auth = getAuth(app);

// 3. Proveedor de Google
export const googleProvider = new GoogleAuthProvider();

// 4. Base de Datos
export const db = getFirestore(app);

// 5. Storage
export const storage = getStorage(app);