import type { OnboardingData } from "../../types/onboarding";
import { ONBOARDING_STEP_COUNT } from "../../types/onboarding";

export type StepValidationResult = { valid: true } | { valid: false; message: string };

export function validateOnboardingStep(
  step: number,
  data: OnboardingData
): StepValidationResult {
  switch (step) {
    case 0:
      if (!data.monthlyIncome.trim()) {
        return { valid: false, message: "Select your monthly income range." };
      }
      return { valid: true };

    case 1:
      if (!data.biggestSpendingCategory) {
        return { valid: false, message: "Select your biggest spending category." };
      }
      return { valid: true };

    case 2:
      if (data.savingsGoals.length === 0) {
        return { valid: false, message: "Pick at least one savings goal." };
      }
      if (!data.targetSavings.trim()) {
        return { valid: false, message: "Select a target savings amount." };
      }
      return { valid: true };

    case 3:
      if (data.financialGoals.length === 0) {
        return { valid: false, message: "Pick at least one financial goal." };
      }
      if (!data.timeHorizon.trim()) {
        return { valid: false, message: "Select a time horizon for your goals." };
      }
      return { valid: true };

    case 4:
      if (!data.impulseFrequency.trim()) {
        return { valid: false, message: "Select how often you impulse spend." };
      }
      if (data.impulseCategories.length === 0) {
        return { valid: false, message: "Select where impulse buys happen." };
      }
      return { valid: true };

    case 5:
      if (data.emotionalTriggers.length === 0) {
        return { valid: false, message: "Select at least one emotional trigger." };
      }
      if (!data.copingStrategy.trim()) {
        return { valid: false, message: "Select your current coping strategy." };
      }
      return { valid: true };

    case 6:
      if (data.budgetingHabits.length === 0) {
        return { valid: false, message: "Select at least one budgeting habit." };
      }
      return { valid: true };

    default:
      return { valid: false, message: "Invalid step." };
  }
}

export function isOnboardingStepValid(step: number, data: OnboardingData): boolean {
  return validateOnboardingStep(step, data).valid;
}

export function validateAllOnboardingSteps(data: OnboardingData): boolean {
  for (let i = 0; i < ONBOARDING_STEP_COUNT; i++) {
    if (!isOnboardingStepValid(i, data)) return false;
  }
  return true;
}
