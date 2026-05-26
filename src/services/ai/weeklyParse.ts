import type { WeeklyReport } from "../../types/weeklyReport";
import { getGeminiModel } from "./config/index";

export function parseWeeklyReport(
  raw: string,
  uid: string,
  weekStartDate: string,
  weekEndDate: string
): WeeklyReport {
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON response from AI: ${raw.substring(0, 100)}`);
  }

  const now = new Date().toISOString();
  const model = getGeminiModel();

  return {
    id: `weekly_${weekStartDate}_${Date.now()}`,
    uid,
    weekStartDate,
    weekEndDate,
    periodLabel: String(parsed.periodLabel ?? ""),
    totalIncome: Number(parsed.totalIncome ?? 0),
    totalExpenses: Number(parsed.totalExpenses ?? 0),
    netCashFlow: Number(parsed.netCashFlow ?? 0),
    previousWeekExpenses: Number(parsed.previousWeekExpenses ?? 0),
    expenseChange: Number(parsed.expenseChange ?? 0),
    categoryBreakdown: (
      (parsed.categoryBreakdown as Array<unknown>) ?? []
    ).map((cat: unknown) => ({
      categoryId: String((cat as Record<string, unknown>).categoryId ?? ""),
      categoryName: String((cat as Record<string, unknown>).categoryName ?? ""),
      amount: Number((cat as Record<string, unknown>).amount ?? 0),
      percentOfTotal: Number((cat as Record<string, unknown>).percentOfTotal ?? 0),
      trend: (
        ["up", "down", "neutral"].includes(
          String((cat as Record<string, unknown>).trend ?? "")
        )
          ? (cat as Record<string, unknown>).trend
          : "neutral"
      ) as "up" | "down" | "neutral",
      trendPercent: Number((cat as Record<string, unknown>).trendPercent ?? 0),
    })),
    topCategory:
      (parsed.categoryBreakdown as Array<unknown>)?.[0] ?? null,
    wins: ((parsed.wins as Array<unknown>) ?? []).map((win: unknown) => {
      const winObj: Record<string, unknown> = {
        title: String((win as Record<string, unknown>).title ?? ""),
        description: String((win as Record<string, unknown>).description ?? ""),
        impact: (
          ["savings", "discipline", "consistency"].includes(
            String((win as Record<string, unknown>).impact ?? "")
          )
            ? (win as Record<string, unknown>).impact
            : "discipline"
        ) as "savings" | "discipline" | "consistency",
      };
      const amount = (win as Record<string, unknown>).amount;
      if (amount !== undefined && amount !== null) {
        winObj.amount = Number(amount);
      }
      return winObj;
    }) as Array<unknown>,
    highlightSummary: String(parsed.highlightSummary ?? ""),
    riskyBehaviors: ((parsed.riskyBehaviors as Array<unknown>) ?? []).map(
      (risk: unknown) => ({
        type: (
          ["impulse", "emotional", "recurring", "outlier"].includes(
            String((risk as Record<string, unknown>).type ?? "")
          )
            ? (risk as Record<string, unknown>).type
            : "outlier"
        ) as "impulse" | "emotional" | "recurring" | "outlier",
        description: String((risk as Record<string, unknown>).description ?? ""),
        category: String((risk as Record<string, unknown>).category ?? ""),
        amount: Number((risk as Record<string, unknown>).amount ?? 0),
        confidence: Number((risk as Record<string, unknown>).confidence ?? 0),
        suggestion: String((risk as Record<string, unknown>).suggestion ?? ""),
      })
    ),
    riskAssessment: String(parsed.riskAssessment ?? ""),
    emotionalTrends: ((parsed.emotionalTrends as Array<unknown>) ?? []).map(
      (trend: unknown) => {
        const trendObj: Record<string, unknown> = {
          date: String((trend as Record<string, unknown>).date ?? ""),
          spendingType: (
            ["rational", "emotional", "impulse"].includes(
              String((trend as Record<string, unknown>).spendingType ?? "")
            )
              ? (trend as Record<string, unknown>).spendingType
              : "rational"
          ) as "rational" | "emotional" | "impulse",
          amount: Number((trend as Record<string, unknown>).amount ?? 0),
        };
        const note = (trend as Record<string, unknown>).note;
        if (note) {
          trendObj.note = String(note);
        }
        return trendObj;
      }
    ) as Array<unknown>,
    emotionalInsight: String(parsed.emotionalInsight ?? ""),
    dominantEmotionalTrigger: (parsed.dominantEmotionalTrigger as string) ?? "Unknown",
    savingsProgress: ((parsed.savingsProgress as Array<unknown>) ?? []).map(
      (goal: unknown) => ({
        goalName: String((goal as Record<string, unknown>).goalName ?? ""),
        currentAmount: Number((goal as Record<string, unknown>).currentAmount ?? 0),
        targetAmount: Number((goal as Record<string, unknown>).targetAmount ?? 0),
        percentComplete: Number((goal as Record<string, unknown>).percentComplete ?? 0),
        weeklySavingsAmount: Number((goal as Record<string, unknown>).weeklySavingsAmount ?? 0),
        estimatedWeeksToGoal: Number((goal as Record<string, unknown>).estimatedWeeksToGoal ?? 0),
      })
    ),
    savingsRate: Number(parsed.savingsRate ?? 0),
    weeklyTrends: ((parsed.weeklyTrends as Array<unknown>) ?? []).map(
      (trend: unknown) => ({
        metric: String((trend as Record<string, unknown>).metric ?? ""),
        currentWeek: Number((trend as Record<string, unknown>).currentWeek ?? 0),
        previousWeek: Number((trend as Record<string, unknown>).previousWeek ?? 0),
        change: Number((trend as Record<string, unknown>).change ?? 0),
        changePercent: Number((trend as Record<string, unknown>).changePercent ?? 0),
        direction: (
          ["up", "down", "neutral"].includes(
            String((trend as Record<string, unknown>).direction ?? "")
          )
            ? (trend as Record<string, unknown>).direction
            : "neutral"
        ) as "up" | "down" | "neutral",
      })
    ),
    trendSummary: String(parsed.trendSummary ?? ""),
    improvementGoals: ((parsed.improvementGoals as Array<unknown>) ?? []).map(
      (goal: unknown) => {
        const goalObj: Record<string, unknown> = {
          goalId: String((goal as Record<string, unknown>).goalId ?? ""),
          title: String((goal as Record<string, unknown>).title ?? ""),
          description: String((goal as Record<string, unknown>).description ?? ""),
          priority: (
            ["high", "medium", "low"].includes(
              String((goal as Record<string, unknown>).priority ?? "")
            )
              ? (goal as Record<string, unknown>).priority
              : "medium"
          ) as "high" | "medium" | "low",
          aiReasoning: String((goal as Record<string, unknown>).aiReasoning ?? ""),
        };
        const targetAmount = (goal as Record<string, unknown>).targetAmount;
        if (targetAmount !== undefined && targetAmount !== null) {
          goalObj.targetAmount = Number(targetAmount);
        }
        const category = (goal as Record<string, unknown>).category;
        if (category) {
          goalObj.category = String(category);
        }
        return goalObj;
      }
    ) as Array<unknown>,
    coachingInsights: ((parsed.coachingInsights as Array<unknown>) ?? []).map(
      (insight: unknown) => {
        const insightObj: Record<string, unknown> = {
          category: String((insight as Record<string, unknown>).category ?? ""),
          insight: String((insight as Record<string, unknown>).insight ?? ""),
          actionableStep: String((insight as Record<string, unknown>).actionableStep ?? ""),
        };
        const emoji = (insight as Record<string, unknown>).emoji;
        if (emoji) {
          insightObj.emoji = String(emoji);
        }
        return insightObj;
      }
    ) as Array<unknown>,
    coachingMessage: String(parsed.coachingMessage ?? ""),
    healthScore: {
      discipline: Number(
        (parsed.healthScore as Record<string, unknown>)?.discipline ?? 0
      ),
      consistency: Number(
        (parsed.healthScore as Record<string, unknown>)?.consistency ?? 0
      ),
      savingsRate: Number(
        (parsed.healthScore as Record<string, unknown>)?.savingsRate ?? 0
      ),
      emotionalControl: Number(
        (parsed.healthScore as Record<string, unknown>)?.emotionalControl ?? 0
      ),
      overallScore: Number(
        (parsed.healthScore as Record<string, unknown>)?.overallScore ?? 0
      ),
    },
    generatedAt: now,
    generatedBy: model,
    modelVersion: "1.0",
  };
}
