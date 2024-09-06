import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCcW7Ik62J96ngtIJ2gV5advw9nQ6URID0",
  authDomain: "gameboxd-c4a19.firebaseapp.com",
  projectId: "gameboxd-c4a19",
  storageBucket: "gameboxd-c4a19.appspot.com",
  messagingSenderId: "718246832080",
  appId: "1:718246832080:web:f5cf39676197ba8cfc7bd5",
  measurementId: "G-LZ440940DM",
};

let app;
let db;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db, collection, getDocs, query, where, addDoc, updateDoc, deleteDoc };
export const createUserProfile = async (user) => {
  const userRef = doc(db, "users", user.email);

  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      username: user.name,
      bio: "",
      profilePicture: "",
      email: "",
    });
  }
};
