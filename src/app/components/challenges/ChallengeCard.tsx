import { motion, AnimatePresence } from "motion/react";
import { Zap, Target, CheckCircle2, TrendingUp, AlertTriangle, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SavingsChallenge } from "../../../types/challenge";

interface ChallengeCardProps {
  challenge: SavingsChallenge;
  onUpdateProgress: (id: string, progress: number, complete: boolean) => void;
}

const categoryConfig: Record<string, { color: string; icon: any; tone: string }> = {
  savings_goals: { color: "#00ff88", icon: Target, tone: "green" },
  no_spend: { color: "#00d9ff", icon: AlertTriangle, tone: "cyan" },
  emotional_reduction: { color: "#9d4edd", icon: TrendingUp, tone: "purple" },
  subscription_cleanup: { color: "#ff6b35", icon: Zap, tone: "amber" },
  budget_discipline: { color: "#00d9ff", icon: CheckCircle2, tone: "cyan" },
  healthy_habit: { color: "#00ff88", icon: Target, tone: "green" },
  category_reduction: { color: "#ff3366", icon: TrendingUp, tone: "red" },
};

export function ChallengeCard({ challenge, onUpdateProgress }: ChallengeCardProps) {
  const { t } = useTranslation();
  const config = categoryConfig[challenge.category] || categoryConfig.savings_goals;
  const Icon = config.icon;
  const progressPercent = Math.min(
    100,
    (challenge.currentProgress / challenge.targetAmount) * 100
  );
  
  const isCompleted = challenge.status === "completed";
  
  // Fake update simulation for UI
  const handleSimulateProgress = () => {
    let add = challenge.targetAmount * 0.2; // Add 20%
    if (challenge.unit === "days" || challenge.unit === "items") add = 1;
    const newProgress = Math.min(challenge.targetAmount, challenge.currentProgress + add);
    const complete = newProgress >= challenge.targetAmount;
    onUpdateProgress(challenge.id, newProgress, complete);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/10 relative overflow-hidden group ${isCompleted ? 'opacity-50' : ''}`}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 transition-transform duration-1000 group-hover:scale-150"
        style={{ backgroundColor: config.color }}
      />
      
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 to-transparent z-10 flex items-center justify-center backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-background/50 p-4 rounded-full border border-[#00ff88]/50"
          >
            <CheckCircle2 size={32} className="text-[#00ff88]" />
          </motion.div>
        </div>
      )}

      <div className="relative z-0">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="p-3 rounded-2xl shrink-0"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon size={24} style={{ color: config.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold mb-1 truncate">{t(`challenges.${challenge.id}_title`, challenge.title)}</h4>
            <p className="text-white/60 text-sm line-clamp-2">{t(`challenges.${challenge.id}_desc`, challenge.description)}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 bg-[#ffd60a]/20 px-2 py-1 rounded-full">
              <Zap size={12} className="text-[#ffd60a]" />
              <span className="text-[#ffd60a] text-xs font-bold">+{challenge.rewardXp}</span>
            </div>
            <span className="text-white/40 text-[10px] uppercase tracking-wider block mt-2">
              {challenge.difficulty}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">
              {challenge.currentProgress} / {challenge.targetAmount} {challenge.unit}
            </span>
            <span className="text-white font-semibold">
              {Math.round(progressPercent)}%
            </span>
          </div>
          
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: config.color }}
            />
          </div>

          {!isCompleted && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSimulateProgress}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
              >
                <Play size={12} />
                Log Progress
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
