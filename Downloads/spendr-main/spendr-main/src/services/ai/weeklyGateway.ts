import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type { WeeklyReport } from "../../types/weeklyReport";
import { generateJsonText } from "./client/index";
import {
  getCachedAnalysis,
  setCachedAnalysis,
  buildAnalysisCacheKey,
} from "./cache";
import { isAiEnabled } from "./config/index";
import { AiError, toAiError } from "./errors";
import { tryDevMockFallback } from "./devFallback";
import { buildWeeklyReportPrompt } from "./weeklyPrompts";
import { parseWeeklyReport } from "./weeklyParse";

export interface GenerateWeeklyReportParams {
  uid: string;
  userData: UserData | null | undefined;
  transactions: Transaction[];
  weekStartDate: string;
  weekEndDate: string;
  periodLabel: string;
  previousWeekExpenses?: number;
  savingsGoals?: string[];
  emotionalTriggers?: string[];
  force?: boolean;
}

export async function generateWeeklyReport({
  uid,
  userData,
  transactions,
  weekStartDate,
  weekEndDate,
  periodLabel,
  previousWeekExpenses = 0,
  savingsGoals,
  emotionalTriggers,
  force = false,
}: GenerateWeeklyReportParams): Promise<WeeklyReport> {
  if (!userData?.onboardingCompleted) {
    throw new AiError(
      "API",
      "Complete onboarding before generating weekly reports.",
      false
    );
  }

  if (transactions.length === 0) {
    throw new AiError(
      "EMPTY",
      "Add at least one transaction to generate a weekly report.",
      false
    );
  }

  const cacheKey = buildAnalysisCacheKey(uid, "weekly_report", weekStartDate);

  if (!force) {
    const cached = getCachedAnalysis(cacheKey);
    if (cached) {
      return cached as WeeklyReport;
    }
  }

  if (!isAiEnabled()) {
    const mock = tryDevMockFallback(
      new AiError("CONFIG", "AI is not configured.", false),
      { uid, transactions }
    );
    if (mock) return mock as WeeklyReport;
    throw new AiError(
      "CONFIG",
      "AI is not configured. Set VITE_GEMINI_API_KEY in .env.local.",
      false
    );
  }

  const prompt = buildWeeklyReportPrompt({
    uid,
    displayName: userData.displayName,
    email: userData.email,
    weekStartDate,
    weekEndDate,
    periodLabel,
    transactions,
    previousWeekExpenses,
    savingsGoals,
    emotionalTriggers,
    spendingProfile: userData.profile?.spendingProfile || "General",
  });

  try {
    const raw = await generateJsonText({ prompt });
    const report = parseWeeklyReport(raw, uid, weekStartDate, weekEndDate);
    setCachedAnalysis(cacheKey, report);
    return report;
  } catch (err) {
    const mock = tryDevMockFallback(err, { uid, transactions });
    if (mock) return mock as WeeklyReport;
    throw toAiError(err);
  }
}
