// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { get } from "http";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeWy_0qSso2eFog_8qmCtYoNYLsD9vk_k",
  authDomain: "yt-clone-21cdb.firebaseapp.com",
  projectId: "yt-clone-21cdb",
  // storageBucket: "yt-clone-21cdb.appspot.com",
  // messagingSenderId: "881822571719",
  appId: "1:881822571719:web:03cd492695ab32fd65b2e2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * Sign the user in with google popup
 * @returns Promise<UserCredential>
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Sign the user out
 * @returns Promise<void>
 */
export function signOut() {
  return auth.signOut();
}

/**
 * trigger a callback when the auth state changes
 * @returns a function to unsubscribe callback
 */
export function onAuthStateChangedHelper(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}
