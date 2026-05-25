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
  where,
} from "firebase/firestore";
import type { WeeklyReport } from "../../types/weeklyReport";
import { waitForFirestoreAuth } from "./assertAuth";
import {
  userAiReportRef,
  userAiReportsRef,
  userDocRef,
} from "./paths";

function mapDoc(id: string, data: Record<string, unknown>): WeeklyReport {
  return {
    id,
    uid: String(data.uid ?? ""),
    weekStartDate: String(data.weekStartDate ?? ""),
    weekEndDate: String(data.weekEndDate ?? ""),
    periodLabel: String(data.periodLabel ?? ""),
    totalIncome: Number(data.totalIncome ?? 0),
    totalExpenses: Number(data.totalExpenses ?? 0),
    netCashFlow: Number(data.netCashFlow ?? 0),
    previousWeekExpenses: Number(data.previousWeekExpenses ?? 0),
    expenseChange: Number(data.expenseChange ?? 0),
    categoryBreakdown: (data.categoryBreakdown as Array<unknown>) ?? [],
    topCategory: data.topCategory ?? null,
    wins: (data.wins as Array<unknown>) ?? [],
    highlightSummary: String(data.highlightSummary ?? ""),
    riskyBehaviors: (data.riskyBehaviors as Array<unknown>) ?? [],
    riskAssessment: String(data.riskAssessment ?? ""),
    emotionalTrends: (data.emotionalTrends as Array<unknown>) ?? [],
    emotionalInsight: String(data.emotionalInsight ?? ""),
    dominantEmotionalTrigger: (data.dominantEmotionalTrigger as string) ?? undefined,
    savingsProgress: (data.savingsProgress as Array<unknown>) ?? [],
    savingsRate: Number(data.savingsRate ?? 0),
    weeklyTrends: (data.weeklyTrends as Array<unknown>) ?? [],
    trendSummary: String(data.trendSummary ?? ""),
    improvementGoals: (data.improvementGoals as Array<unknown>) ?? [],
    coachingInsights: (data.coachingInsights as Array<unknown>) ?? [],
    coachingMessage: String(data.coachingMessage ?? ""),
    healthScore: data.healthScore ?? {
      discipline: 0,
      consistency: 0,
      savingsRate: 0,
      emotionalControl: 0,
      overallScore: 0,
    },
    generatedAt: String(data.generatedAt ?? ""),
    generatedBy: String(data.generatedBy ?? "gemini-pro"),
    modelVersion: String(data.modelVersion ?? "1.0"),
    isGenerating: Boolean(data.isGenerating ?? false),
    error: (data.error as string) ?? undefined,
  };
}

/**
 * Save a weekly report to Firestore
 */
export async function saveWeeklyReport(
  uid: string,
  report: WeeklyReport
): Promise<WeeklyReport> {
  await waitForFirestoreAuth(uid);
  const reportRef = userAiReportRef(uid, report.id);
  
  await setDoc(reportRef, {
    ...report,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return report;
}

/**
 * Fetch a single weekly report
 */
export async function fetchWeeklyReport(
  uid: string,
  reportId: string
): Promise<WeeklyReport | null> {
  await waitForFirestoreAuth(uid);
  const reportRef = userAiReportRef(uid, reportId);
  const snap = await getDoc(reportRef);
  
  if (!snap.exists()) {
    return null;
  }

  return mapDoc(snap.id, snap.data());
}

/**
 * Fetch all weekly reports for a user, ordered by date (most recent first)
 */
export async function fetchWeeklyReports(uid: string): Promise<WeeklyReport[]> {
  await waitForFirestoreAuth(uid);
  const q = query(
    userAiReportsRef(uid),
    orderBy("weekStartDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
}

/**
 * Fetch weekly reports for a specific date range
 */
export async function fetchWeeklyReportsByDateRange(
  uid: string,
  startDate: string,
  endDate: string
): Promise<WeeklyReport[]> {
  await waitForFirestoreAuth(uid);
  const q = query(
    userAiReportsRef(uid),
    where("weekStartDate", ">=", startDate),
    where("weekStartDate", "<=", endDate),
    orderBy("weekStartDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
}

/**
 * Fetch the latest weekly report
 */
export async function fetchLatestWeeklyReport(uid: string): Promise<WeeklyReport | null> {
  await waitForFirestoreAuth(uid);
  const q = query(
    userAiReportsRef(uid),
    orderBy("weekStartDate", "desc")
  );
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return null;
  }

  return mapDoc(snap.docs[0].id, snap.docs[0].data());
}

/**
 * Update a weekly report
 */
export async function updateWeeklyReport(
  uid: string,
  reportId: string,
  updates: Partial<WeeklyReport>
): Promise<void> {
  await waitForFirestoreAuth(uid);
  const reportRef = userAiReportRef(uid, reportId);
  
  await updateDoc(reportRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a weekly report
 */
export async function deleteWeeklyReport(
  uid: string,
  reportId: string
): Promise<void> {
  await waitForFirestoreAuth(uid);
  const reportRef = userAiReportRef(uid, reportId);
  await deleteDoc(reportRef);
}

/**
 * Check if a report exists for a specific week
 */
export async function checkWeeklyReportExists(
  uid: string,
  weekStartDate: string
): Promise<boolean> {
  await waitForFirestoreAuth(uid);
  const q = query(
    userAiReportsRef(uid),
    where("weekStartDate", "==", weekStartDate)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
