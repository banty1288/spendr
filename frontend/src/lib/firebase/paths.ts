import { collection, doc } from "firebase/firestore";
import { db } from "../firebase";

/** Top-level collection — must match `firestore.rules` */
export const USERS_COLLECTION = "users";
export const TRANSACTIONS_SUBCOLLECTION = "transactions";
export const AI_REPORTS_SUBCOLLECTION = "ai_reports";
export const EMOTIONAL_INSIGHTS_SUBCOLLECTION = "emotional_insights";
export const ACHIEVEMENTS_SUBCOLLECTION = "achievements";
export const FINANCIAL_LEVELS_SUBCOLLECTION = "financial_levels";
export const NOTIFICATIONS_SUBCOLLECTION = "notifications";
export const REWARDS_SUBCOLLECTION = "rewards";
export const SUBSCRIPTION_SUBCOLLECTION = "subscription";
export const SUBSCRIPTION_DOC = "current";
export const FINANCIAL_LEVELS_DOC = "summary";

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

export function userEmotionalInsightsRef(uid: string) {
  return collection(db, USERS_COLLECTION, uid, EMOTIONAL_INSIGHTS_SUBCOLLECTION);
}

export function userEmotionalInsightRef(uid: string, insightId = "current") {
  return doc(db, USERS_COLLECTION, uid, EMOTIONAL_INSIGHTS_SUBCOLLECTION, insightId);
}

export function userAchievementsRef(uid: string) {
  return collection(db, USERS_COLLECTION, uid, ACHIEVEMENTS_SUBCOLLECTION);
}

export function userAchievementRef(uid: string, achievementId: string) {
  return doc(db, USERS_COLLECTION, uid, ACHIEVEMENTS_SUBCOLLECTION, achievementId);
}

export function userFinancialLevelRef(uid: string) {
  return doc(db, USERS_COLLECTION, uid, FINANCIAL_LEVELS_SUBCOLLECTION, FINANCIAL_LEVELS_DOC);
}

export function userNotificationsRef(uid: string) {
  return collection(db, USERS_COLLECTION, uid, NOTIFICATIONS_SUBCOLLECTION);
}

export function userNotificationRef(uid: string, notificationId: string) {
  return doc(db, USERS_COLLECTION, uid, NOTIFICATIONS_SUBCOLLECTION, notificationId);
}

export function userSubscriptionRef(uid: string) {
  return doc(db, USERS_COLLECTION, uid, SUBSCRIPTION_SUBCOLLECTION, SUBSCRIPTION_DOC);
}

export function userRewardsRef(uid: string) {
  return collection(db, USERS_COLLECTION, uid, REWARDS_SUBCOLLECTION);
}
