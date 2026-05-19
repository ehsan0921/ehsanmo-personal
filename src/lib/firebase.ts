import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA__FJwWy6VcRyWS1cO3Jmol6BcJSEiVdA",
  authDomain: "ehsanmo.firebaseapp.com",
  projectId: "ehsanmo",
  storageBucket: "ehsanmo.firebasestorage.app",
  messagingSenderId: "287723741565",
  appId: "1:287723741565:web:4be1f44d27dbe60f48ac14",
  measurementId: "G-347B8XCFLX",
} as const;

const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const SUPERADMIN_EMAIL = "Ehsan0921@gmail.com";
