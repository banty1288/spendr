export type ChallengeCategory =
  | "savings_goals"
  | "no_spend"
  | "emotional_reduction"
  | "subscription_cleanup"
  | "budget_discipline"
  | "healthy_habit"
  | "category_reduction";

export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type ChallengeStatus = "active" | "completed" | "failed" | "abandoned";

export interface SavingsChallenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  
  /** The target metric (e.g., ₹5000 savings, 5 days no-spend) */
  targetAmount: number;
  
  /** The current progress toward the target */
  currentProgress: number;
  
  /** The metric unit (e.g., "USD", "days", "%") */
  unit: string;
  
  /** The XP rewarded upon completion */
  rewardXp: number;
  
  status: ChallengeStatus;
  
  /** ISO timestamp for when the challenge started */
  startDate: string;
  
  /** ISO timestamp for when the challenge ends (optional if open-ended) */
  endDate?: string;
  
  /** ISO timestamp for when the challenge was completed/failed/abandoned */
  completedDate?: string;
  
  /** Optional category ID if this challenge is tied to a specific spending category */
  targetCategoryId?: string;
}

export interface ChallengeRecommendation {
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  targetAmount: number;
  unit: string;
  rewardXp: number;
  durationDays: number;
  targetCategoryId?: string;
  reasoning: string;
}
