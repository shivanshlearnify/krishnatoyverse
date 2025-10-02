import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDSMdRZLLQdWtSa1aBpYXjFJ2afHh0qoVQ",
  authDomain: "krishnatoyverse.firebaseapp.com",
  projectId: "krishnatoyverse",
  storageBucket: "krishnatoyverse.firebasestorage.app",
  messagingSenderId: "429409635749",
  appId: "1:429409635749:web:25722f455aeb2cdd2c6c4c",
  measurementId: "G-0K8BVLJ1F7"
};

// Initialize Firebase (singleton pattern to avoid re-initialization in Next.js)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db,storage  };