import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type { WeeklyReport } from "../../types/weeklyReport";
import { executeAiTask } from "./aiService";
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
  return executeAiTask(
    {
      uid,
      userData,
      transactions,
      cacheKeyPrefix: `weekly_report_${weekStartDate}`,
      force,
    },
    () =>
      buildWeeklyReportPrompt({
        uid,
        displayName: userData?.displayName || "User",
        email: userData?.email || "",
        weekStartDate,
        weekEndDate,
        periodLabel,
        transactions,
        previousWeekExpenses,
        savingsGoals,
        emotionalTriggers,
        spendingProfile: userData?.profile?.budgetingHabits?.[0] || "General",
      }),
    (rawResponse) => parseWeeklyReport(rawResponse, uid, weekStartDate, weekEndDate)
  );
}
