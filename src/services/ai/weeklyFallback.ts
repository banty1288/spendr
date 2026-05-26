import type { Transaction } from "../types/transaction";
import type { WeeklyReport } from "../types/weeklyReport";
import { format, startOfWeek, subWeeks } from "date-fns";

/**
 * Generate a lightweight fallback report when transaction data is limited
 * This allows users to see a report even with minimal spending history
 */
export function generateFallbackWeeklyReport(
  uid: string,
  transactions: Transaction[],
  weekStartDate: string,
  weekEndDate: string,
  periodLabel: string
): WeeklyReport {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = subWeeks(today, -1);

  // Filter transactions for this week
  const weekTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= weekStart && txDate <= weekEnd;
  });

  // Calculate basic metrics
  const totalIncome = weekTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + (tx.baseAmountUsd ?? tx.amount), 0);

  const totalExpenses = weekTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + (tx.baseAmountUsd ?? tx.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;

  // Previous week calculation
  const prevWeekStart = subWeeks(weekStart, 1);
  const prevWeekEnd = weekStart;
  const prevWeekTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= prevWeekStart && txDate < prevWeekEnd;
  });
  const previousWeekExpenses = prevWeekTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + (tx.baseAmountUsd ?? tx.amount), 0);

  const expenseChange = previousWeekExpenses > 0 
    ? ((totalExpenses - previousWeekExpenses) / previousWeekExpenses) * 100
    : 0;

  // Category breakdown
  const categoryMap = new Map<string, number>();
  weekTransactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const current = categoryMap.get(tx.categoryId) || 0;
      categoryMap.set(tx.categoryId, current + (tx.baseAmountUsd ?? tx.amount));
    });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      categoryName: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
      amount,
      percentOfTotal: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      trend: "neutral" as const,
      trendPercent: 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const now = new Date().toISOString();

  return {
    id: `weekly_${weekStartDate}_${Date.now()}`,
    uid,
    weekStartDate,
    weekEndDate,
    periodLabel,
    totalIncome,
    totalExpenses,
    netCashFlow,
    previousWeekExpenses,
    expenseChange,
    categoryBreakdown,
    topCategory: categoryBreakdown[0] || null,
    wins: [
      {
        title: "Started tracking",
        description: "You're on your way to financial awareness!",
        impact: "consistency",
      },
    ],
    highlightSummary:
      weekTransactions.length > 0
        ? `You logged ${weekTransactions.length} transaction${weekTransactions.length === 1 ? "" : "s"} this week.`
        : "Start logging transactions to get personalized insights.",
    riskyBehaviors: [],
    riskAssessment: "Need more transaction history for behavioral analysis",
    emotionalTrends: [],
    emotionalInsight:
      "Track more transactions to reveal emotional spending patterns.",
    dominantEmotionalTrigger: "Unknown",
    savingsProgress: [],
    savingsRate: totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0,
    weeklyTrends: [
      {
        metric: "Total Spending",
        currentWeek: totalExpenses,
        previousWeek: previousWeekExpenses,
        change: totalExpenses - previousWeekExpenses,
        changePercent: expenseChange,
        direction:
          totalExpenses > previousWeekExpenses ? "up" : totalExpenses < previousWeekExpenses ? "down" : "neutral",
      },
    ],
    trendSummary:
      weekTransactions.length > 0
        ? "Log more transactions to reveal spending trends."
        : "Add your first transactions to start building your financial profile.",
    improvementGoals: [
      {
        goalId: "goal_1",
        title: "Build transaction history",
        description: "Add more transactions to unlock AI insights",
        priority: "high",
        aiReasoning: "Starting your financial tracking journey",
      },
    ],
    coachingInsights: [
      {
        category: "Getting Started",
        insight:
          "Every transaction you log helps Spendr understand your spending patterns better.",
        actionableStep: "Add 5-10 transactions from this week",
        emoji: "📝",
      },
    ],
    coachingMessage:
      "Welcome to your weekly financial report! You're starting your journey to financial awareness. " +
      "As you log more transactions, Spendr will unlock deeper AI insights into your spending habits, emotional triggers, and personalized recommendations.",
    healthScore: {
      discipline: Math.min(50, weekTransactions.length * 10),
      consistency: Math.min(50, weekTransactions.length * 10),
      savingsRate: Math.max(0, Math.min(100, (netCashFlow / Math.max(1, totalIncome)) * 100)),
      emotionalControl: 50,
      overallScore: Math.min(60, 40 + weekTransactions.length * 5),
    },
    generatedAt: now,
    generatedBy: "fallback-generator",
    modelVersion: "1.0",
  };
}
