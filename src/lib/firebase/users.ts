import { getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { waitForFirestoreAuth } from "./assertAuth";
import { userDocRef } from "./paths";
import type { UserData } from "../../types/user";

const bootstrapByUid = new Map<string, Promise<UserData>>();

function permissionHint(err: unknown): string {
  if (err instanceof FirebaseError && err.code === "permission-denied") {
    return (
      " Firestore denied access. Confirm .env.local projectId matches your Firebase project " +
      "and run: npm run deploy:rules"
    );
  }
  return "";
}

/** Ensures `users/{uid}` exists; uid always comes from the signed-in Firebase user. */
export async function ensureUserDocument(
  _user?: User,
  forceTokenRefresh = false
): Promise<UserData> {
  const authed = await waitForFirestoreAuth(_user?.uid, forceTokenRefresh);
  const uid = authed.uid;

  const existing = bootstrapByUid.get(uid);
  if (existing) return existing;

  const promise = bootstrapUserDoc(authed);
  bootstrapByUid.set(uid, promise);

  try {
    return await promise;
  } finally {
    bootstrapByUid.delete(uid);
  }
}

async function bootstrapUserDoc(authed: User): Promise<UserData> {
  const userRef = userDocRef(authed.uid);

  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as UserData;
    }

    const initialData: UserData = {
      displayName: authed.displayName || "New User",
      email: authed.email || "",
      balance: 0,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };

    await setDoc(userRef, {
      ...initialData,
      updatedAt: serverTimestamp(),
    });

    return initialData;
  } catch (err) {
    const hint = permissionHint(err);
    console.error(`ensureUserDocument failed for users/${authed.uid}:${hint}`, err);
    throw err;
  }
}

/** Read profile for the current authenticated user. */
export async function fetchUserDocument(): Promise<UserData> {
  const authed = await waitForFirestoreAuth();
  const snap = await getDoc(userDocRef(authed.uid));

  if (!snap.exists()) {
    return ensureUserDocument(authed);
  }

  return snap.data() as UserData;
}

export async function updateUserDocument(
  updates: Partial<UserData>
): Promise<void> {
  const authed = await waitForFirestoreAuth();
  await updateDoc(userDocRef(authed.uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserSettings(
  settings: Partial<UserData["settings"]>
): Promise<void> {
  const authed = await waitForFirestoreAuth();
  const userRef = userDocRef(authed.uid);
  
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data() as UserData;
  const currentSettings = data.settings || {
    notifications: { spendingAlerts: true, savingsReminders: true, streakReminders: true, weeklyReports: true, aiCoaching: true, quietHours: false },
    privacy: { dataVisibility: "private", analyticsOptIn: true },
    app: { theme: "dark", currency: "USD", language: "en" }
  };
  
  const newSettings = {
    ...currentSettings,
    ...settings,
    notifications: { ...currentSettings.notifications, ...settings.notifications },
    privacy: { ...currentSettings.privacy, ...settings.privacy },
    app: { ...currentSettings.app, ...settings.app },
  };
  
  await updateDoc(userRef, {
    settings: newSettings,
    updatedAt: serverTimestamp(),
  });
}
