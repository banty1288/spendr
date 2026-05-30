import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { SavingsChallenge, ChallengeStatus } from "../../types/challenge";

export async function fetchUserChallenges(uid: string): Promise<SavingsChallenge[]> {
  const q = query(
    collection(db, `users/${uid}/savings_challenges`),
    orderBy("startDate", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as SavingsChallenge)
  );
}

export async function addChallenge(uid: string, challenge: Omit<SavingsChallenge, "id" | "startDate">) {
  const challengeRef = doc(collection(db, `users/${uid}/savings_challenges`));
  const newChallenge: SavingsChallenge = {
    ...challenge,
    id: challengeRef.id,
    startDate: new Date().toISOString(),
  };

  await setDoc(challengeRef, {
    ...newChallenge,
    _createdAt: serverTimestamp(),
  });

  return newChallenge;
}

export async function updateChallengeProgress(
  uid: string,
  challengeId: string,
  updates: { currentProgress?: number; status?: ChallengeStatus }
) {
  const challengeRef = doc(db, `users/${uid}/savings_challenges/${challengeId}`);
  const payload: Record<string, any> = { ...updates, _updatedAt: serverTimestamp() };
  
  if (updates.status && updates.status !== "active") {
    payload.completedDate = new Date().toISOString();
  }

  await updateDoc(challengeRef, payload);
}
