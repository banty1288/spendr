/** Weekly AI Financial Report type definitions */

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentOfTotal: number;
  trend: "up" | "down" | "neutral";
  trendPercent: number;
}

export interface FinancialWin {
  title: string;
  description: string;
  impact: "savings" | "discipline" | "consistency";
  amount?: number;
}

export interface RiskyBehavior {
  type: "impulse" | "emotional" | "recurring" | "outlier";
  description: string;
  category: string;
  amount: number;
  confidence: number; // 0-100
  suggestion: string;
}

export interface WeeklyTrend {
  metric: string;
  currentWeek: number;
  previousWeek: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "neutral";
}

export interface ImprovementGoal {
  goalId: string;
  title: string;
  description: string;
  targetAmount?: number;
  category?: string;
  priority: "high" | "medium" | "low";
  aiReasoning: string;
}

export interface EmotionalTrendPoint {
  date: string; // ISO date
  spendingType: "rational" | "emotional" | "impulse";
  amount: number;
  note?: string;
}

export interface SavingsProgress {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  percentComplete: number;
  weeklySavingsAmount: number;
  estimatedWeeksToGoal: number;
}

export interface CoachingInsight {
  category: string;
  insight: string;
  actionableStep: string;
  emoji?: string;
}

export interface AIHealthScoreBreakdown {
  discipline: number; // 0-100
  consistency: number; // 0-100
  savingsRate: number; // 0-100
  emotionalControl: number; // 0-100
  overallScore: number; // 0-100
}

export interface WeeklyReport {
  id: string;
  uid: string;
  weekStartDate: string; // ISO date
  weekEndDate: string; // ISO date
  periodLabel: string; // e.g., "Jan 15-21, 2024"
  
  // Financial Summary
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  previousWeekExpenses: number;
  expenseChange: number; // percentage change vs previous week
  
  // Category Breakdown
  categoryBreakdown: CategorySpending[];
  topCategory: CategorySpending | null;
  
  // Financial Wins
  wins: FinancialWin[];
  highlightSummary: string; // AI-generated narrative
  
  // Risky Behaviors
  riskyBehaviors: RiskyBehavior[];
  riskAssessment: string; // AI assessment of overall risk level
  
  // Emotional Spending
  emotionalTrends: EmotionalTrendPoint[];
  emotionalInsight: string; // AI summary of emotional patterns
  dominantEmotionalTrigger?: string;
  
  // Savings & Progress
  savingsProgress: SavingsProgress[];
  savingsRate: number; // percentage
  
  // Trends
  weeklyTrends: WeeklyTrend[];
  trendSummary: string;
  
  // Improvement Goals
  improvementGoals: ImprovementGoal[];
  
  // Coaching
  coachingInsights: CoachingInsight[];
  coachingMessage: string; // Main motivational message
  
  // Health Score
  healthScore: AIHealthScoreBreakdown;
  
  // Metadata
  generatedAt: string; // ISO datetime
  generatedBy: string; // e.g., "gemini-pro", "gemini-1.5-pro"
  modelVersion: string;
  isGenerating?: boolean;
  error?: string;
}

export interface WeeklyReportInput {
  weekStartDate: string;
  weekEndDate: string;
}

export interface WeeklyReportListItem {
  id: string;
  periodLabel: string;
  generatedAt: string;
  totalExpenses: number;
  healthScore: number;
  highlights: string[];
}
