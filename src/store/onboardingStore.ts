import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingData } from "../types/onboarding";

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

export const initialOnboardingData: OnboardingData = {
  monthlyIncome: "",
  biggestSpendingCategory: "",
  savingsGoals: [],
  targetSavings: "",
  financialGoals: [],
  timeHorizon: "",
  impulseFrequency: "",
  impulseCategories: [],
  emotionalTriggers: [],
  copingStrategy: "",
  budgetingHabits: [],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      data: { ...initialOnboardingData },
      setStep: (step) => set({ currentStep: step }),
      updateData: (partial) =>
        set((state) => ({ data: { ...state.data, ...partial } })),
      reset: () => set({ currentStep: 0, data: { ...initialOnboardingData } }),
    }),
    { name: "spendr-onboarding-v2" }
  )
);

// Re-export type for consumers that imported from store
export type { OnboardingData } from "../types/onboarding";
