"use client";

import { getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";

// Use automatic initialization
const firebaseConfig = {
  apiKey: "AIzaSyBnEBwSpBKjrdYpOAZYvkVb1rDRvtcj6kk",
  authDomain: "next-firebase-48c0e.firebaseapp.com",
  projectId: "next-firebase-48c0e",
  storageBucket: "next-firebase-48c0e.appspot.com",
  messagingSenderId: "346705370435",
  appId: "1:346705370435:web:aa4ba68090a789bf9123f6",
};
const currentApps = getApps();
let auth: Auth;
let storage: FirebaseStorage;
if (!currentApps.length) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  const app = currentApps[0];
  auth = getAuth(app);
  storage = getStorage(app);
}
export { auth, storage };
