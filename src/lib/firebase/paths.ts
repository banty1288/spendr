import { collection, doc } from "firebase/firestore";
import { db } from "../firebase";

/** Top-level collection — must match `firestore.rules` */
export const USERS_COLLECTION = "users";
export const TRANSACTIONS_SUBCOLLECTION = "transactions";
export const AI_REPORTS_SUBCOLLECTION = "ai_reports";

export function userDocRef(uid: string) {
  return doc(db, USERS_COLLECTION, uid);
}

export function userTransactionsRef(uid: string) {
  return collection(db, USERS_COLLECTION, uid, TRANSACTIONS_SUBCOLLECTION);
}

export function userTransactionRef(uid: string, transactionId: string) {
  return doc(db, USERS_COLLECTION, uid, TRANSACTIONS_SUBCOLLECTION, transactionId);
}

export function userAiReportsRef(uid: string) {
  return collection(db, USERS_COLLECTION, uid, AI_REPORTS_SUBCOLLECTION);
}

export function userAiReportRef(uid: string, reportId: string) {
  return doc(db, USERS_COLLECTION, uid, AI_REPORTS_SUBCOLLECTION, reportId);
}
