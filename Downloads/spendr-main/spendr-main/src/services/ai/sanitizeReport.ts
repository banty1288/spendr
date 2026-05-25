import type { WeeklyReport } from "../../types/weeklyReport";

/**
 * Sanitize a weekly report for Firestore storage
 * Removes undefined/null values and replaces them with safe defaults
 * Firestore does not accept undefined values, so we must remove them
 */
export function sanitizeWeeklyReport(report: WeeklyReport): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  // Helper to safely include fields, omitting undefined/null
  const setIfValid = (key: string, value: unknown): void => {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  };

  // Core fields (always present)
  sanitized.id = report.id;
  sanitized.uid = report.uid;
  sanitized.weekStartDate = report.weekStartDate;
  sanitized.weekEndDate = report.weekEndDate;
  sanitized.periodLabel = report.periodLabel || "";
  sanitized.generatedAt = report.generatedAt;
  sanitized.generatedBy = report.generatedBy || "unknown";
  sanitized.modelVersion = report.modelVersion || "1.0";

  // Financial summary
  sanitized.totalIncome = report.totalIncome || 0;
  sanitized.totalExpenses = report.totalExpenses || 0;
  sanitized.netCashFlow = report.netCashFlow || 0;
  sanitized.previousWeekExpenses = report.previousWeekExpenses || 0;
  sanitized.expenseChange = report.expenseChange || 0;

  // Category breakdown
  sanitized.categoryBreakdown = (report.categoryBreakdown || []).map((cat) => ({
    categoryId: cat.categoryId || "",
    categoryName: cat.categoryName || "",
    amount: cat.amount || 0,
    percentOfTotal: cat.percentOfTotal || 0,
    trend: cat.trend || "neutral",
    trendPercent: cat.trendPercent || 0,
  }));

  setIfValid("topCategory", report.topCategory);

  // Wins
  sanitized.wins = (report.wins || []).map((win) => ({
    title: win.title || "",
    description: win.description || "",
    impact: win.impact || "discipline",
    ...(win.amount !== undefined && { amount: win.amount }),
  }));
  sanitized.highlightSummary = report.highlightSummary || "";

  // Risky behaviors
  sanitized.riskyBehaviors = (report.riskyBehaviors || []).map((risk) => ({
    type: risk.type || "outlier",
    description: risk.description || "",
    category: risk.category || "",
    amount: risk.amount || 0,
    confidence: risk.confidence ?? 0,
    suggestion: risk.suggestion || "",
  }));
  sanitized.riskAssessment = report.riskAssessment || "";

  // Emotional spending
  sanitized.emotionalTrends = (report.emotionalTrends || []).map((trend) => ({
    date: trend.date || "",
    spendingType: trend.spendingType || "rational",
    amount: trend.amount || 0,
    ...(trend.note && { note: trend.note }),
  }));
  sanitized.emotionalInsight = report.emotionalInsight || "";
  
  // dominantEmotionalTrigger - provide safe default
  sanitized.dominantEmotionalTrigger = report.dominantEmotionalTrigger || "Unknown";

  // Savings & progress
  sanitized.savingsProgress = (report.savingsProgress || []).map((prog) => ({
    goalName: prog.goalName || "",
    currentAmount: prog.currentAmount || 0,
    targetAmount: prog.targetAmount || 0,
    percentComplete: prog.percentComplete || 0,
    weeklySavingsAmount: prog.weeklySavingsAmount || 0,
    estimatedWeeksToGoal: prog.estimatedWeeksToGoal || 0,
  }));
  sanitized.savingsRate = report.savingsRate ?? 0;

  // Trends
  sanitized.weeklyTrends = (report.weeklyTrends || []).map((trend) => ({
    metric: trend.metric || "",
    currentWeek: trend.currentWeek || 0,
    previousWeek: trend.previousWeek || 0,
    change: trend.change || 0,
    changePercent: trend.changePercent || 0,
    direction: trend.direction || "neutral",
  }));
  sanitized.trendSummary = report.trendSummary || "";

  // Improvement goals
  sanitized.improvementGoals = (report.improvementGoals || []).map((goal) => ({
    goalId: goal.goalId || "",
    title: goal.title || "",
    description: goal.description || "",
    priority: goal.priority || "medium",
    aiReasoning: goal.aiReasoning || "",
    ...(goal.targetAmount !== undefined && { targetAmount: goal.targetAmount }),
    ...(goal.category && { category: goal.category }),
  }));

  // Coaching
  sanitized.coachingInsights = (report.coachingInsights || []).map((insight) => ({
    category: insight.category || "",
    insight: insight.insight || "",
    actionableStep: insight.actionableStep || "",
    ...(insight.emoji && { emoji: insight.emoji }),
  }));
  sanitized.coachingMessage = report.coachingMessage || "";

  // Health score
  sanitized.healthScore = {
    discipline: report.healthScore?.discipline ?? 0,
    consistency: report.healthScore?.consistency ?? 0,
    savingsRate: report.healthScore?.savingsRate ?? 0,
    emotionalControl: report.healthScore?.emotionalControl ?? 0,
    overallScore: report.healthScore?.overallScore ?? 0,
  };

  // Optional fields
  if (report.isGenerating !== undefined) {
    sanitized.isGenerating = report.isGenerating;
  }
  if (report.error) {
    sanitized.error = report.error;
  }

  return sanitized;
}

/**
 * Validate that an object has no undefined values
 * Useful for debugging serialization issues
 */
export function hasUndefinedValues(obj: unknown, path = ""): string[] {
  const issues: string[] = [];

  function traverse(current: unknown, currentPath: string): void {
    if (current === undefined) {
      issues.push(`Undefined value at: ${currentPath}`);
      return;
    }

    if (current === null || current instanceof Date) {
      return; // null and Date are allowed
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        traverse(item, `${currentPath}[${index}]`);
      });
    } else if (typeof current === "object") {
      Object.entries(current).forEach(([key, value]) => {
        traverse(value, currentPath ? `${currentPath}.${key}` : key);
      });
    }
  }

  traverse(obj, path);
  return issues;
}
