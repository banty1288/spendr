export interface FinancialXpGain {
  id: string;
  title: string;
  subtitle: string;
  xp: number;
  timestamp: string;
}

export interface FinancialMilestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  unlocked: boolean;
}

export interface FinancialLevelSummary {
  currentLevel: number;
  currentXp: number;
  totalXp: number;
  rankTitle: string;
  progress: number;
  nextLevel: number;
  nextLevelXp: number;
  xpToNext: number;
  nextMilestone: FinancialMilestone;
  milestonesUnlocked: FinancialMilestone[];
  recentGains: FinancialXpGain[];
  achievementXp: number;
  transactionXp: number;
  behaviorXp: number;
  updatedAt: string;
}
