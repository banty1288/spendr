/** Insight card shown in the AI Insights UI */
export type InsightCardType =
  | "strength"
  | "weakness"
  | "trigger"
  | "suggestion";

export interface InsightCard {
  type: InsightCardType;
  title: string;
  description: string;
  metric: string;
}

export interface SpendingAnalysis {
  summary: string;
  topCategories: string[];
  trends: string;
}

export interface EmotionalSpendingAnalysis {
  summary: string;
  triggers: string[];
  patterns: string;
}

export interface SavingsRecommendations {
  headline: string;
  recommendations: string[];
  projectedAnnualSavings?: string;
}

export interface WeeklySummary {
  periodLabel: string;
  summary: string;
  highlights: string[];
}

export interface CoachingMessage {
  title: string;
  message: string;
  actionStep: string;
}

/** Full Gemini analysis payload */
export interface SpendrAIAnalysis {
  spendingAnalysis: SpendingAnalysis;
  emotionalSpending: EmotionalSpendingAnalysis;
  savingsRecommendations: SavingsRecommendations;
  financialInsights: {
    summary: string;
    healthScore: number;
    disciplinePercent: number;
    cards: InsightCard[];
  };
  weeklySummary: WeeklySummary;
  coaching: CoachingMessage;
}

export interface AiUserContext {
  displayName: string;
  balance: number;
  transactionCount: number;
  monthlyIncome?: string;
  monthlySpending?: string;
  savingsGoals?: string[];
  emotionalTriggers?: string[];
  transactionsSummary: string;
  language: string;
  currency: string;
}

export interface AiServiceError {
  code:
    | "CONFIG"
    | "API"
    | "PARSE"
    | "EMPTY"
    | "QUOTA"
    | "TIMEOUT"
    | "MODEL_NOT_FOUND"
    | "UNKNOWN";
  message: string;
  retryable: boolean;
}

export interface GenerateAnalysisOptions {
  /** Skip cache and in-flight dedupe (still dedupes concurrent identical forced runs) */
  force?: boolean;
}

export interface NewsItem {
  title: string;
  source: string;
  time: string;
  description: string;
  imageUrl?: string;
  url?: string;
}

export interface TrendingTopic {
  title: string;
  description: string;
}

export interface MarketSnapshot {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  percentChange: string;
}

export interface DailyHubContent {
  news: NewsItem[];
  savingTip: string;
  aiMoneyTip: string;
  trendingTopics: TrendingTopic[];
  market: MarketSnapshot[];
}
