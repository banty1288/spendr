import { getDoc, setDoc } from "firebase/firestore";
import type {
  EmotionalSpendingDocument,
  EmotionalSpendingInsights,
} from "../../types/emotionalInsight";
import { waitForFirestoreAuth } from "./assertAuth";
import { userEmotionalInsightRef } from "./paths";

export async function getEmotionalInsightsDocument(
  uid: string
): Promise<EmotionalSpendingDocument | null> {
  await waitForFirestoreAuth(uid);
  const snapshot = await getDoc(userEmotionalInsightRef(uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as EmotionalSpendingDocument;
}

export async function setEmotionalInsightsDocument(
  uid: string,
  insights: EmotionalSpendingInsights,
  transactionCount: number
): Promise<void> {
  await waitForFirestoreAuth(uid);
  const now = new Date().toISOString();
  const data: EmotionalSpendingDocument = {
    ...insights,
    transactionCount,
    updatedAt: now,
  };

  await setDoc(userEmotionalInsightRef(uid), data);
}
