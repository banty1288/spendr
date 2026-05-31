import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    console.log("Attempting sign in...");
    await signInAnonymously(auth);
    console.log("Success! API key is valid.");
    process.exit(0);
  } catch (err: any) {
    console.error("Firebase Auth Error:", err.code, err.message);
    process.exit(1);
  }
}

test();
