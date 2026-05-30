export interface CategoryBudget {
  categoryId: string;
  recommendedLimit: number;
  currentSpending: number;
}

export interface BudgetRecommendation {
  id?: string;
  userId: string;
  month: string; // e.g., "2024-06"
  totalBudgetLimit: number;
  healthScore: number; // 0-100
  categories: CategoryBudget[];
  savingGoalSuggestion: number;
  aiExplanation: string;
  createdAt: string;
}
