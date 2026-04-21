// Firebase Configuration
// Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyA__FJwWy6VcRyWS1cO3Jmol6BcJSEiVdA",
  authDomain: "ehsanmo.firebaseapp.com",
  projectId: "ehsanmo",
  storageBucket: "ehsanmo.firebasestorage.app",
  messagingSenderId: "287723741565",
  appId: "1:287723741565:web:4be1f44d27dbe60f48ac14",
  measurementId: "G-347B8XCFLX"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
