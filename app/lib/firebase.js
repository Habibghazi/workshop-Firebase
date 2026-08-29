// app/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyBdS2C6O8RFC4Uz6D4lm9aDfEBy-U7doF4",

  authDomain: "realtime-login-monitor.firebaseapp.com",

  projectId: "realtime-login-monitor",

  storageBucket: "realtime-login-monitor.firebasestorage.app",

  messagingSenderId: "898585723599",

  appId: "1:898585723599:web:72a6041c06568a3932adba",

  measurementId: "G-GG0LVBWB0R"

};



const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };