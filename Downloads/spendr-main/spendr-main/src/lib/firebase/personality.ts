import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { PersonalityAnalysis, PersonalityDocument } from "../../types/personality";

export async function getPersonalityDocument(uid: string): Promise<PersonalityDocument | null> {
  const docRef = doc(db, "users", uid, "personality", "current");
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data() as PersonalityDocument;
  }
  return null;
}

export async function setPersonalityDocument(
  uid: string,
  analysis: PersonalityAnalysis,
  transactionCount: number
): Promise<void> {
  const docRef = doc(db, "users", uid, "personality", "current");
  const now = new Date().toISOString();
  
  const existing = await getPersonalityDocument(uid);
  
  const data: PersonalityDocument = {
    ...analysis,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    transactionCount,
  };
  
  await setDoc(docRef, data);
}
