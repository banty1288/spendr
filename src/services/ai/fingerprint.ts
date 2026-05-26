import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";

/** Stable hash of inputs — changes when transactions or profile change */
export function buildAnalysisFingerprint(
  transactions: Transaction[],
  userData: UserData | null | undefined
): string {
  const txPart = transactions
    .map((t) => `${t.id}:${t.updatedAt}:${t.amount}:${t.type}`)
    .sort()
    .join("|");

  const profile = userData?.profile;
  const profilePart = profile
    ? [
        profile.monthlyIncome,
        profile.biggestSpendingCategory,
        (profile.savingsGoals ?? []).join(","),
        (profile.emotionalTriggers ?? []).join(","),
      ].join(";")
    : "";

  const prefPart = `${userData?.preferences?.currency || userData?.settings?.app?.currency || 'USD'}`;

  return `${transactions.length}::${txPart}::${userData?.balance ?? 0}::${profilePart}::${userData?.onboardingCompleted ? 1 : 0}::${prefPart}`;
}
