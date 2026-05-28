import { z } from "zod";
import type { WeeklyReport } from "../../types/weeklyReport";
import { getGeminiModel } from "./config/index";

export const CategorySpendingSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  amount: z.number().default(0),
  percentOfTotal: z.number().default(0),
  trend: z.enum(["up", "down", "neutral"]).default("neutral"),
  trendPercent: z.number().default(0),
});

export const FinancialWinSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: z.number().optional(),
  impact: z.enum(["savings", "discipline", "consistency"]).default("discipline"),
});

export const RiskyBehaviorSchema = z.object({
  type: z.enum(["impulse", "emotional", "recurring", "outlier"]).default("outlier"),
  description: z.string(),
  category: z.string(),
  amount: z.number().default(0),
  confidence: z.number().default(0),
  suggestion: z.string(),
});

export const EmotionalTrendPointSchema = z.object({
  date: z.string(),
  spendingType: z.enum(["rational", "emotional", "impulse"]).default("rational"),
  amount: z.number().default(0),
  note: z.string().optional(),
});

export const SavingsProgressSchema = z.object({
  goalName: z.string(),
  currentAmount: z.number().default(0),
  targetAmount: z.number().default(0),
  percentComplete: z.number().default(0),
  weeklySavingsAmount: z.number().default(0),
  estimatedWeeksToGoal: z.number().default(0),
});

export const WeeklyTrendSchema = z.object({
  metric: z.string(),
  currentWeek: z.number().default(0),
  previousWeek: z.number().default(0),
  change: z.number().default(0),
  changePercent: z.number().default(0),
  direction: z.enum(["up", "down", "neutral"]).default("neutral"),
});

export const ImprovementGoalSchema = z.object({
  goalId: z.string(),
  title: z.string(),
  description: z.string(),
  targetAmount: z.number().optional(),
  category: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  aiReasoning: z.string(),
});

export const CoachingInsightSchema = z.object({
  category: z.string(),
  insight: z.string(),
  actionableStep: z.string(),
  emoji: z.string().optional(),
});

export const WeeklyReportSchema = z.object({
  periodLabel: z.string().default(""),
  totalIncome: z.number().default(0),
  totalExpenses: z.number().default(0),
  netCashFlow: z.number().default(0),
  previousWeekExpenses: z.number().default(0),
  expenseChange: z.number().default(0),
  categoryBreakdown: z.array(CategorySpendingSchema).default([]),
  wins: z.array(FinancialWinSchema).default([]),
  highlightSummary: z.string().default(""),
  riskyBehaviors: z.array(RiskyBehaviorSchema).default([]),
  riskAssessment: z.string().default(""),
  emotionalTrends: z.array(EmotionalTrendPointSchema).default([]),
  emotionalInsight: z.string().default(""),
  dominantEmotionalTrigger: z.string().default("Unknown"),
  savingsProgress: z.array(SavingsProgressSchema).default([]),
  savingsRate: z.number().default(0),
  weeklyTrends: z.array(WeeklyTrendSchema).default([]),
  trendSummary: z.string().default(""),
  improvementGoals: z.array(ImprovementGoalSchema).default([]),
  coachingInsights: z.array(CoachingInsightSchema).default([]),
  coachingMessage: z.string().default(""),
  healthScore: z.object({
    discipline: z.number().default(0),
    consistency: z.number().default(0),
    savingsRate: z.number().default(0),
    emotionalControl: z.number().default(0),
    overallScore: z.number().default(0),
  }).default({ discipline: 0, consistency: 0, savingsRate: 0, emotionalControl: 0, overallScore: 0 }),
});

export function parseWeeklyReport(
  raw: string,
  uid: string,
  weekStartDate: string,
  weekEndDate: string
): WeeklyReport {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON response from AI: ${raw.substring(0, 100)}`);
  }

  // Safe Runtime Parsing via Zod
  const result = WeeklyReportSchema.safeParse(parsedJson);

  if (!result.success) {
    console.error("[Zod Parsing Error]", result.error.format());
    throw new Error("AI returned malformed data structure that failed Zod validation.");
  }

  const now = new Date().toISOString();
  const model = getGeminiModel();
  const validated = result.data;

  return {
    ...validated,
    id: `weekly_${weekStartDate}_${Date.now()}`,
    uid,
    weekStartDate,
    weekEndDate,
    topCategory: validated.categoryBreakdown[0] ?? null,
    generatedAt: now,
    generatedBy: model,
    modelVersion: "1.0",
  };
}
