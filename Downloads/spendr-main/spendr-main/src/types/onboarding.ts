/** Collected during the 7-step onboarding wizard */
export interface OnboardingData {
  monthlyIncome: string;
  biggestSpendingCategory: string;
  savingsGoals: string[];
  targetSavings: string;
  financialGoals: string[];
  timeHorizon: string;
  impulseFrequency: string;
  impulseCategories: string[];
  emotionalTriggers: string[];
  copingStrategy: string;
  budgetingHabits: string[];
}

export interface OnboardingStepMeta {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  glow: string;
}

export const ONBOARDING_STEP_COUNT = 7;
