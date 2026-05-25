import { motion } from "motion/react";
import { ONBOARDING_STEPS } from "../../../lib/onboarding/constants";
import { ONBOARDING_STEP_COUNT } from "../../../types/onboarding";

interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const progressPercent = ((currentStep + 1) / ONBOARDING_STEP_COUNT) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs font-medium tracking-wider">
          STEP {currentStep + 1} OF {ONBOARDING_STEP_COUNT}
        </span>
        <span className="text-white/50 text-xs font-semibold tabular-nums">
          {Math.round(progressPercent)}%
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88]"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        {ONBOARDING_STEPS.map((step, i) => (
          <div
            key={step.id}
            className="h-1 flex-1 rounded-full overflow-hidden bg-white/[0.08]"
          >
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${step.gradient}`}
              initial={false}
              animate={{ width: i <= currentStep ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
