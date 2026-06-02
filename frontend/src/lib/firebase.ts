import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  indexedDBLocalPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
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

const isConfigValid =
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("dummy_");

function warnAboutAuthDomainConfiguration() {
  if (!import.meta.env.DEV) return;

  const authDomain = firebaseConfig.authDomain;
  const projectId = firebaseConfig.projectId;
  const currentHost =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  const currentOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:5173";

  if (
    authDomain === "localhost" ||
    authDomain === "127.0.0.1" ||
    authDomain.includes("://") ||
    authDomain.includes(":")
  ) {
    console.warn(
      "FIREBASE WARNING: VITE_FIREBASE_AUTH_DOMAIN must be the Firebase Auth domain " +
        `(usually "${projectId}.firebaseapp.com"), not the local dev URL. ` +
        `Keep authDomain as "${projectId}.firebaseapp.com" and add "${currentHost}" ` +
        "in Firebase Console > Authentication > Settings > Authorized domains."
    );
  }

  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    console.info(
      `Firebase Auth dev origin: ${currentOrigin}. If Google sign-in fails with ` +
        `"auth/unauthorized-domain", add "${currentHost}" in Firebase Console > ` +
        "Authentication > Settings > Authorized domains. Firebase stores the domain only, not the port."
    );
  }
}

if (!isConfigValid) {
  console.error(
    "FIREBASE ERROR: Environment variables are missing or invalid! " +
    "Copy .env.example to .env.local and add your real Firebase credentials to prevent app crashes."
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

warnAboutAuthDomainConfiguration();


export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
});
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/** Persist sessions in local storage before any auth listeners run. */
export const authReady = isConfigValid
  ? setPersistence(auth, indexedDBLocalPersistence)
      .catch(() => setPersistence(auth, browserLocalPersistence))
      .catch((err) => {
        console.warn("Firebase auth persistence could not be set:", err);
      })
  : Promise.resolve();
