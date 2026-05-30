import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import {
  runSpendrAnalysis,
  invalidateSpendrAnalysisCache,
  buildSpendrAnalysisFingerprint,
  getSpendrAnalysisFromCache,
} from "./gateway";
import { AiError } from "./errors";
import type { GenerateAnalysisOptions, SpendrAIAnalysis } from "./types";

/** Full financial analysis — routed through gateway (cache, dedupe, quota mocks) */
export async function generateSpendrAnalysis(
  uid: string,
  userData: UserData | null | undefined,
  transactions: Transaction[],
  options?: GenerateAnalysisOptions
): Promise<SpendrAIAnalysis> {
  return runSpendrAnalysis({
    uid,
    userData,
    transactions,
    options,
  });
}

export { invalidateSpendrAnalysisCache, buildSpendrAnalysisFingerprint };

function fromCacheOrThrow<T>(
  uid: string,
  userData: UserData | null | undefined,
  transactions: Transaction[],
  pick: (full: SpendrAIAnalysis) => T
): T {
  const cached = getSpendrAnalysisFromCache(uid, transactions, userData);
  if (!cached) {
    throw new AiError(
      "API",
      "No cached analysis. Call generateSpendrAnalysis once via runAnalysis() first.",
      false
    );
  }
  return pick(cached);
}

/** Cache-only — does not call Gemini (avoids duplicate API usage) */
export function generateSpendingAnalysis(
  uid: string,
  userData: UserData | null | undefined,
  transactions: Transaction[]
) {
  return fromCacheOrThrow(uid, userData, transactions, (f) => f.spendingAnalysis);
}

export function detectEmotionalSpending(
  uid: string,
  userData: UserData | null | undefined,
  transactions: Transaction[]
) {
  return fromCacheOrThrow(uid, userData, transactions, (f) => f.emotionalSpending);
}

export function generateSavingsRecommendations(
  uid: string,
  userData: UserData | undefined | null,
  transactions: Transaction[]
) {
  return fromCacheOrThrow(
    uid,
    userData,
    transactions,
    (f) => f.savingsRecommendations
  );
}

export function generateFinancialInsights(
  uid: string,
  userData: UserData | null | undefined,
  transactions: Transaction[]
) {
  return fromCacheOrThrow(uid, userData, transactions, (f) => f.financialInsights);
}

export function generateWeeklySummary(
  uid: string,
  userData: UserData | null | undefined,
  transactions: Transaction[]
) {
  return fromCacheOrThrow(uid, userData, transactions, (f) => f.weeklySummary);
}

export function generateCoachingTip(
  uid: string,
  userData: UserData | null | undefined,
  transactions: Transaction[]
) {
  return fromCacheOrThrow(uid, userData, transactions, (f) => f.coaching);
}
