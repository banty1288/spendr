import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Transaction, TransactionInput } from "../../types/transaction";
import { waitForFirestoreAuth } from "./assertAuth";
import { userDocRef, userTransactionRef, userTransactionsRef } from "./paths";

function mapDoc(id: string, data: Record<string, unknown>): Transaction {
  return {
    id,
    merchant: String(data.merchant ?? ""),
    amount: Number(data.amount ?? 0),
    type: data.type === "income" ? "income" : "expense",
    categoryId: String(data.categoryId ?? "other"),
    notes: String(data.notes ?? ""),
    date: String(data.date ?? new Date().toISOString()),
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
  };
}

export async function fetchTransactions(uid: string): Promise<Transaction[]> {
  await waitForFirestoreAuth(uid);
  const q = query(userTransactionsRef(uid), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
}

export async function createTransaction(
  uid: string,
  input: TransactionInput
): Promise<Transaction> {
  await waitForFirestoreAuth(uid);
  const now = new Date().toISOString();
  const ref = await addDoc(userTransactionsRef(uid), {
    merchant: input.merchant.trim(),
    amount: Math.abs(input.amount),
    type: input.type,
    categoryId: input.categoryId,
    notes: (input.notes ?? "").trim(),
    date: input.date,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: ref.id,
    merchant: input.merchant.trim(),
    amount: Math.abs(input.amount),
    type: input.type,
    categoryId: input.categoryId,
    notes: (input.notes ?? "").trim(),
    date: input.date,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateTransaction(
  uid: string,
  id: string,
  input: TransactionInput
): Promise<Transaction> {
  await waitForFirestoreAuth(uid);
  const now = new Date().toISOString();
  const ref = userTransactionRef(uid, id);
  await updateDoc(ref, {
    merchant: input.merchant.trim(),
    amount: Math.abs(input.amount),
    type: input.type,
    categoryId: input.categoryId,
    notes: (input.notes ?? "").trim(),
    date: input.date,
    updatedAt: now,
  });

  const existing = await getDoc(userTransactionRef(uid, id));
  const createdAt = existing.exists()
    ? String(existing.data().createdAt ?? now)
    : now;

  return {
    id,
    merchant: input.merchant.trim(),
    amount: Math.abs(input.amount),
    type: input.type,
    categoryId: input.categoryId,
    notes: (input.notes ?? "").trim(),
    date: input.date,
    createdAt,
    updatedAt: now,
  };
}

export async function removeTransaction(uid: string, id: string): Promise<void> {
  await waitForFirestoreAuth(uid);
  await deleteDoc(userTransactionRef(uid, id));
}

export async function syncUserBalance(
  uid: string,
  balance: number
): Promise<void> {
  await waitForFirestoreAuth(uid);
  await setDoc(
    userDocRef(uid),
    { balance, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
