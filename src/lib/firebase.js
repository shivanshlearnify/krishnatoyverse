import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAwaYpIqkxbso8lxzlbfXDgxSnKD6Tdd80",
  authDomain: "krishnatoyverse-58344.firebaseapp.com",
  projectId: "krishnatoyverse-58344",
  storageBucket: "krishnatoyverse-58344.firebasestorage.app",
  messagingSenderId: "118490338651",
  appId: "1:118490338651:web:60aa76115872997348f67e",
  measurementId: "G-G3B2SR3HLE"
};

// Initialize Firebase (singleton pattern to avoid re-initialization in Next.js)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth  = getAuth(app);

export { db,storage,auth  };