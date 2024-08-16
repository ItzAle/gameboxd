// lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCcW7Ik62J96ngtIJ2gV5advw9nQ6URID0",
  authDomain: "gameboxd-c4a19.firebaseapp.com",
  projectId: "gameboxd-c4a19",
  storageBucket: "gameboxd-c4a19.appspot.com",
  messagingSenderId: "718246832080",
  appId: "1:718246832080:web:f5cf39676197ba8cfc7bd5",
  measurementId: "G-LZ440940DM",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, doc, getDoc, collection, getDocs, addDoc };
