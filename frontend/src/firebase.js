// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <--- ADD THIS LINE

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8gyXlvgYyco-3_zxvDNnxd7ph1s6KxxU",
  authDomain: "kastamonushop.firebaseapp.com",
  projectId: "kastamonushop",
  storageBucket: "kastamonushop.firebasestorage.app",
  messagingSenderId: "800987522037",
  appId: "1:800987522037:web:2cced53bdf9f2436b676bc",
  measurementId: "G-GLJRSYGC7T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth so GoogleButton.jsx can use it
export const auth = getAuth(app);