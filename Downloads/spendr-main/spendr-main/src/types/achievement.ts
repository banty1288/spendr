export type AchievementCategory =
  | "savings"
  | "streak"
  | "budgeting"
  | "consistency"
  | "emotional"
  | "growth"
  | "onboarding";

export type AchievementRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  rewardXp: number;
  total: number;
  progressLabel: string;
}

export interface UserAchievementRecord {
  id: string;
  unlockedAt: string;
  rarity: AchievementRarity;
  title: string;
  rewardXp: number;
}

export interface AchievementStatus extends AchievementDefinition {
  earned: boolean;
  unlockedAt?: string;
  current: number;
  percent: number;
  progressText: string;
}
