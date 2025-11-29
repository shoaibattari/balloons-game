// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGWxaog2w2-QUA-_n_whxVAOm9_OcKvVw",
  authDomain: "jp-react-firebase.firebaseapp.com",
  databaseURL: "https://jp-react-firebase-default-rtdb.firebaseio.com",
  projectId: "jp-react-firebase",
  storageBucket: "jp-react-firebase.firebasestorage.app",
  messagingSenderId: "360201720489",
  appId: "1:360201720489:web:e3f46d9d24b45630d38fb8",
  measurementId: "G-5G2SR5SXXW",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
