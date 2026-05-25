import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";

interface OnboardingNavProps {
  currentStep: number;
  totalSteps: number;
  canContinue: boolean;
  isPending: boolean;
  gradient: string;
  glow: string;
  onBack: () => void;
  onNext: () => void;
}

export function OnboardingNav({
  currentStep,
  totalSteps,
  canContinue,
  isPending,
  gradient,
  glow,
  onBack,
  onNext,
}: OnboardingNavProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center">
      <div className="w-full max-w-[430px] bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-8 px-6">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onBack}
              disabled={isPending}
              className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 disabled:opacity-50"
              aria-label="Previous step"
            >
              <ChevronLeft size={20} className="text-white" />
            </motion.button>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={isPending || !canContinue}
            className={`flex-1 h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
              canContinue
                ? `bg-gradient-to-r ${gradient} text-black shadow-lg`
                : "bg-white/10 text-white/40"
            }`}
            style={canContinue ? { boxShadow: `0 8px 30px ${glow}30` } : undefined}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-label="Saving" />
            ) : isLastStep ? (
              <>
                <Sparkles size={18} />
                Complete Setup
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
