import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { BudgetRecommendation } from "../../types/budget";

const COLLECTION_NAME = "budgets";

// Budgets are unique per user per month: `${userId}_${month}`
export async function saveBudget(
  userId: string,
  month: string,
  data: Omit<BudgetRecommendation, "id" | "createdAt" | "userId" | "month">
): Promise<void> {
  const budgetId = `${userId}_${month}`;
  const docRef = doc(db, COLLECTION_NAME, budgetId);
  await setDoc(docRef, {
    ...data,
    userId,
    month,
    createdAt: serverTimestamp(),
  });
}

export async function getBudget(
  userId: string,
  month: string
): Promise<BudgetRecommendation | null> {
  const budgetId = `${userId}_${month}`;
  const docRef = doc(db, COLLECTION_NAME, budgetId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...(data as Omit<BudgetRecommendation, "id" | "createdAt">),
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
  };
}
