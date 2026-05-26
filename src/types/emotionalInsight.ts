export type EmotionalPatternType =
  | "late_night"
  | "stress"
  | "reward"
  | "impulse"
  | "weekend_spike"
  | "recurring"
  | "comfort"
  | "subscription_creep";

export type EmotionalRiskLevel = "low" | "medium" | "high";

export interface EmotionalInsightCard {
  type: EmotionalPatternType;
  title: string;
  summary: string;
  evidence: string;
  recommendation: string;
  severity: EmotionalRiskLevel;
  confidence: number;
}

export interface SpendingBehaviorTimelineItem {
  label: string;
  description: string;
  amount: number;
  riskLevel: EmotionalRiskLevel;
}

export interface EmotionalSpendingInsights {
  emotionalRiskScore: number;
  riskLevel: EmotionalRiskLevel;
  alerts: EmotionalInsightCard[];
  behavioralInsights: EmotionalInsightCard[];
  triggerAnalysis: {
    primaryTriggers: string[];
    summary: string;
  };
  savingsWarnings: string[];
  coachingRecommendations: string[];
  habitSuggestions: string[];
  motivationalFeedback: string;
  timeline: SpendingBehaviorTimelineItem[];
  generatedAt: string;
  fingerprint: string;
}

export interface EmotionalSpendingDocument extends EmotionalSpendingInsights {
  transactionCount: number;
  updatedAt: string;
}
