import { format } from "date-fns";
import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import { getCategoryById } from "../../lib/transactions/constants";
import { getCategoryBreakdown, getMonthTotals } from "../../lib/transactions/analytics";
import type { AiUserContext } from "./types";

export function buildTransactionsSummary(
  transactions: Transaction[],
  maxItems = 40
): string {
  if (transactions.length === 0) {
    return "No transactions recorded yet.";
  }

  const monthKey = format(new Date(), "yyyy-MM");
  const totals = getMonthTotals(transactions, monthKey);
  const breakdown = getCategoryBreakdown(transactions, monthKey);

  const lines = [
    `Total transactions: ${transactions.length}`,
    `This month income: $${totals.income.toFixed(2)}`,
    `This month expenses: $${totals.expenses.toFixed(2)}`,
    `Net: $${totals.net.toFixed(2)}`,
    "Category breakdown: " +
      breakdown.map((b) => `${b.name} $${b.value.toFixed(2)}`).join(", "),
    "Recent transactions:",
  ];

  for (const tx of transactions.slice(0, maxItems)) {
    const cat = getCategoryById(tx.categoryId);
    lines.push(
      `- ${tx.date.slice(0, 10)} | ${tx.type} | ${tx.merchant} | ${tx.amount.toFixed(2)} | ${cat.label}${tx.notes ? ` | ${tx.notes}` : ""}`
    );
  }

  return lines.join("\n");
}

export function buildAiUserContext(
  userData: UserData | null | undefined,
  transactions: Transaction[]
): AiUserContext {
  const profile = userData?.profile;
  const currency = userData?.preferences?.currency || userData?.settings?.app?.currency || "USD";

  return {
    displayName: userData?.displayName ?? "User",
    balance: userData?.balance ?? 0,
    transactionCount: transactions.length,
    monthlyIncome: profile?.monthlyIncome,
    monthlySpending: profile?.impulseFrequency
      ? `Impulse frequency: ${profile.impulseFrequency}`
      : undefined,
    savingsGoals: profile?.savingsGoals,
    emotionalTriggers: profile?.emotionalTriggers,
    transactionsSummary: buildTransactionsSummary(transactions),
    currency,
  };
}

export function formatContextForPrompt(ctx: AiUserContext): string {
  return [
    `User: ${ctx.displayName}`,
    `Currency: ${ctx.currency}`,
    `Balance: ${ctx.balance.toFixed(2)}`,
    `Transaction count: ${ctx.transactionCount}`,
    ctx.monthlyIncome ? `Stated income range: ${ctx.monthlyIncome}` : "",
    ctx.monthlySpending ? `Spending profile: ${ctx.monthlySpending}` : "",
    ctx.savingsGoals?.length
      ? `Savings goals: ${ctx.savingsGoals.join(", ")}`
      : "",
    ctx.emotionalTriggers?.length
      ? `Known emotional triggers: ${ctx.emotionalTriggers.join(", ")}`
      : "",
    "",
    ctx.transactionsSummary,
  ]
    .filter(Boolean)
    .join("\n");
}
