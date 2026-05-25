import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useOnboardingStore } from "../../store/onboardingStore";
import { useSaveOnboarding } from "../../hooks/useOnboarding";
import {
  ONBOARDING_STEPS,
  INCOME_RANGES,
  SPENDING_CATEGORIES,
  SAVINGS_OPTIONS,
  TARGET_SAVINGS,
  FINANCIAL_GOALS_OPTIONS,
  TIME_HORIZONS,
  IMPULSE_FREQUENCY,
  IMPULSE_CATEGORIES,
  EMOTIONAL_TRIGGERS,
  COPING_STRATEGIES,
  BUDGETING_HABITS,
} from "../../lib/onboarding/constants";
import { validateOnboardingStep } from "../../lib/onboarding/validation";
import { ONBOARDING_STEP_COUNT } from "../../types/onboarding";
import type { OnboardingData } from "../../types/onboarding";
import { OnboardingShell } from "../components/onboarding/OnboardingShell";
import { OnboardingStepHeader } from "../components/onboarding/OnboardingStepHeader";
import { OnboardingNav } from "../components/onboarding/OnboardingNav";
import { FieldLabel } from "../components/onboarding/FieldLabel";
import { PillSelector } from "../components/onboarding/PillSelector";
import { ChipSelector } from "../components/onboarding/ChipSelector";

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { currentStep, data, setStep, updateData } = useOnboardingStore();
  const { mutateAsync: saveOnboarding, isPending, isError } = useSaveOnboarding();
  const [direction, setDirection] = useState(1);

  const stepMeta = ONBOARDING_STEPS[currentStep];
  const StepIcon = stepMeta.icon;
  const validation = validateOnboardingStep(currentStep, data);
  const canContinue = validation.valid;

  const toggleArrayField = (
    field: keyof Pick<
      OnboardingData,
      | "savingsGoals"
      | "financialGoals"
      | "impulseCategories"
      | "emotionalTriggers"
      | "budgetingHabits"
    >,
    id: string
  ) => {
    const current = data[field];
    if (field === "emotionalTriggers" && id === "none") {
      updateData({ emotionalTriggers: current.includes("none") ? [] : ["none"] });
      return;
    }
    const withoutNone = current.filter((x) => x !== "none");
    const updated = withoutNone.includes(id)
      ? withoutNone.filter((x) => x !== id)
      : [...withoutNone, id];
    updateData({ [field]: updated });
  };

  const handleNext = async () => {
    const result = validateOnboardingStep(currentStep, data);
    if (!result.valid) {
      toast.error(result.message);
      return;
    }

    if (currentStep < ONBOARDING_STEP_COUNT - 1) {
      setDirection(1);
      setStep(currentStep + 1);
      return;
    }

    try {
      await saveOnboarding(data);
      toast.success("Profile setup complete!");
      navigate("/home", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save your profile. Please try again.";
      toast.error(message);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <FieldLabel>Monthly income range</FieldLabel>
            <PillSelector
              options={INCOME_RANGES}
              selected={data.monthlyIncome}
              onSelect={(v) => updateData({ monthlyIncome: v })}
            />
          </>
        );

      case 1:
        return (
          <>
            <FieldLabel>Biggest spending category</FieldLabel>
            <ChipSelector
              options={SPENDING_CATEGORIES}
              selected={
                data.biggestSpendingCategory ? [data.biggestSpendingCategory] : []
              }
              onToggle={(id) => updateData({ biggestSpendingCategory: id })}
              multi={false}
            />
          </>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <FieldLabel>What are you saving for?</FieldLabel>
              <ChipSelector
                options={SAVINGS_OPTIONS}
                selected={data.savingsGoals}
                onToggle={(id) => toggleArrayField("savingsGoals", id)}
              />
            </div>
            <div>
              <FieldLabel>Target savings amount</FieldLabel>
              <PillSelector
                options={TARGET_SAVINGS}
                selected={data.targetSavings}
                onSelect={(v) => updateData({ targetSavings: v })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <FieldLabel>Financial goals</FieldLabel>
              <ChipSelector
                options={FINANCIAL_GOALS_OPTIONS}
                selected={data.financialGoals}
                onToggle={(id) => toggleArrayField("financialGoals", id)}
              />
            </div>
            <div>
              <FieldLabel>Time horizon</FieldLabel>
              <PillSelector
                options={TIME_HORIZONS}
                selected={data.timeHorizon}
                onSelect={(v) => updateData({ timeHorizon: v })}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <FieldLabel>How often do you impulse spend?</FieldLabel>
              <PillSelector
                options={IMPULSE_FREQUENCY}
                selected={data.impulseFrequency}
                onSelect={(v) => updateData({ impulseFrequency: v })}
              />
            </div>
            <div>
              <FieldLabel>Where do impulse buys happen?</FieldLabel>
              <ChipSelector
                options={IMPULSE_CATEGORIES}
                selected={data.impulseCategories}
                onToggle={(id) => toggleArrayField("impulseCategories", id)}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <FieldLabel>Emotional spending triggers</FieldLabel>
              <ChipSelector
                options={EMOTIONAL_TRIGGERS}
                selected={data.emotionalTriggers}
                onToggle={(id) => toggleArrayField("emotionalTriggers", id)}
              />
            </div>
            <div>
              <FieldLabel>Your current coping strategy</FieldLabel>
              <PillSelector
                options={COPING_STRATEGIES}
                selected={data.copingStrategy}
                onSelect={(v) => updateData({ copingStrategy: v })}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <>
            <FieldLabel>How do you manage your budget today?</FieldLabel>
            <ChipSelector
              options={BUDGETING_HABITS}
              selected={data.budgetingHabits}
              onToggle={(id) => toggleArrayField("budgetingHabits", id)}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <OnboardingShell
        currentStep={currentStep}
        glow={stepMeta.glow}
        direction={direction}
        stepKey={currentStep}
      >
        <OnboardingStepHeader
          icon={StepIcon}
          title={stepMeta.title}
          subtitle={stepMeta.subtitle}
          gradient={stepMeta.gradient}
          glow={stepMeta.glow}
        />
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-5" />
        {renderStepContent()}
        {isError && (
          <p className="mt-4 text-sm text-[#ff6b6b] text-center" role="alert">
            Something went wrong while saving. Please try again.
          </p>
        )}
      </OnboardingShell>

      <OnboardingNav
        currentStep={currentStep}
        totalSteps={ONBOARDING_STEP_COUNT}
        canContinue={canContinue}
        isPending={isPending}
        gradient={stepMeta.gradient}
        glow={stepMeta.glow}
        onBack={handleBack}
        onNext={handleNext}
      />
    </>
  );
}
