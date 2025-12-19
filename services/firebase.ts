
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvzWf8oHKSr3RPdkhFqME3Fk-nl8TeOjw",
  authDomain: "emarket-3b752.firebaseapp.com",
  projectId: "emarket-3b752",
  storageBucket: "emarket-3b752.firebasestorage.app",
  messagingSenderId: "316677542872",
  appId: "1:316677542872:web:44bb69da79edb2bbac98ad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
