import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { sanitizeEnv } from "./firebase/env";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: sanitizeEnv(import.meta.env.VITE_FIREBASE_API_KEY, "dummy_api_key"),
  authDomain: sanitizeEnv(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    "dummy_auth_domain"
  ),
  projectId: sanitizeEnv(
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
    "dummy_project_id"
  ),
  storageBucket: sanitizeEnv(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    "dummy_storage_bucket"
  ),
  messagingSenderId: sanitizeEnv(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    "dummy_sender_id"
  ),
  appId: sanitizeEnv(import.meta.env.VITE_FIREBASE_APP_ID, "dummy_app_id"),
};

const EXPECTED_FIREBASE_PROJECT = "spendr-app-85a7b";

// Check if credentials actually exist, warn if they are using dummies
if (firebaseConfig.apiKey === "dummy_api_key") {
  console.error(
    "FIREBASE ERROR: Environment variables are missing! Copy .env.example to .env.local with Firebase credentials."
  );
} else if (
  import.meta.env.DEV &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== EXPECTED_FIREBASE_PROJECT
) {
  console.warn(
    `FIREBASE WARNING: VITE_FIREBASE_PROJECT_ID is "${firebaseConfig.projectId}" but .firebaserc default is "${EXPECTED_FIREBASE_PROJECT}". ` +
      "Firestore rules deploy to .firebaserc — a project mismatch causes permission errors."
  );
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

/** Persist sessions in local storage before any auth listeners run. */
export const authReady = setPersistence(auth, browserLocalPersistence).catch(
  (err) => {
    console.warn("Firebase auth persistence could not be set:", err);
  }
);
