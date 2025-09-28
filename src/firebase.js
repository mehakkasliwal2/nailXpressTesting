// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtGAIdtcPW7leVAgJjqbXC2trUfcfwoKQ",
  authDomain: "nailxpress-d810e.firebaseapp.com",
  databaseURL: "https://nailxpress-d810e-default-rtdb.firebaseio.com",
  projectId: "nailxpress-d810e",
  storageBucket: "nailxpress-d810e.appspot.com",
  messagingSenderId: "559671141494",
  appId: "1:559671141494:web:80e2c97c353ab529916b57",
  measurementId: "G-NQQCV7EKQE"
};

// Alternative: If you create a new project, replace the above config with the new one

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };