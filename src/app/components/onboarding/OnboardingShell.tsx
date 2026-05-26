import { motion, AnimatePresence } from "motion/react";
import { OnboardingProgress } from "./OnboardingProgress";

interface OnboardingShellProps {
  currentStep: number;
  glow: string;
  direction: number;
  stepKey: number;
  children: React.ReactNode;
}

const stepVariants = {
  enter: (d: number) => ({ x: d > 0 ? 280 : -280, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -280 : 280, opacity: 0, scale: 0.96 }),
};

export function OnboardingShell({
  currentStep,
  glow,
  direction,
  stepKey,
  children,
}: OnboardingShellProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          key={`glow-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          transition={{ duration: 0.7 }}
          className="absolute top-16 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full blur-[140px]"
          style={{ background: glow }}
        />
      </div>

      <header className="relative z-10 px-6 pt-6 pb-2">
        <OnboardingProgress currentStep={currentStep} />
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-6 pb-safe-nav">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepKey}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
