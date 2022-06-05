// Import the functions you need from the SDKs you need
import { getApp, initializeApp, getApps } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDbU77fJTtuQGFtCSuvljMt38jDa3WchA",
  authDomain: "production-demo-6d601.firebaseapp.com",
  projectId: "production-demo-6d601",
  storageBucket: "production-demo-6d601.appspot.com",
  messagingSenderId: "711644234932",
  appId: "1:711644234932:web:992024d6337ab4734b03e1",
  measurementId: "G-X1L2JL2ZRQ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export {app, db, storage};