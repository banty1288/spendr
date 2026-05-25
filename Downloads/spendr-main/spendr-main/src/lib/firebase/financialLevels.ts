import { doc, getDoc, setDoc } from "firebase/firestore";
import { waitForFirestoreAuth } from "./assertAuth";
import { db } from "../firebase";
import { userFinancialLevelRef } from "./paths";
import type { FinancialLevelSummary } from "../../types/financialLevel";

export async function fetchUserFinancialLevel(
  uid: string
): Promise<FinancialLevelSummary | null> {
  await waitForFirestoreAuth(uid);
  const ref = userFinancialLevelRef(uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as FinancialLevelSummary;
}

export async function upsertUserFinancialLevel(
  uid: string,
  summary: FinancialLevelSummary
): Promise<FinancialLevelSummary> {
  await waitForFirestoreAuth(uid);
  const ref = userFinancialLevelRef(uid);
  await setDoc(ref, summary, { merge: true });
  return summary;
}
