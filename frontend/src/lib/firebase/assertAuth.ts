import type { User } from "firebase/auth";
import { auth } from "../firebase";

/**
 * Waits until Firebase Auth is ready and the ID token is attached for Firestore.
 * Use forceRefresh after sign-in so the first Firestore request carries a fresh token.
 */
export async function waitForFirestoreAuth(
  expectedUid?: string,
  forceRefresh = false
): Promise<User> {
  await auth.authStateReady();

  const current = auth.currentUser;
  if (!current) {
    throw new Error("Not authenticated. Sign in before accessing Firestore.");
  }

  if (expectedUid && current.uid !== expectedUid) {
    throw new Error(
      `Auth UID mismatch: expected ${expectedUid}, got ${current.uid}.`
    );
  }

  await current.getIdToken(forceRefresh);
  return current;
}
