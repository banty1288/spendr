import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import type { FinancialLevelSummary } from "../../../types/financialLevel";

interface HealthScoreCardProps {
  financialLevel: FinancialLevelSummary | null;
  isLoading: boolean;
}

export function HealthScoreCard({ financialLevel, isLoading }: HealthScoreCardProps) {
  const navigate = useNavigate();

  if (isLoading || !financialLevel) {
    return (
      <div className="bg-card shadow-sm  p-5 rounded-3xl border border-border mb-6 relative overflow-hidden animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded-full mb-4" />
        <div className="h-4 w-full bg-white/10 rounded-full mb-3" />
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-white/10 rounded-full" />
          <div className="h-4 w-24 bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  // Ensure progress is a valid number, default to 0
  const progressPercent = typeof financialLevel.progress === 'number' && !isNaN(financialLevel.progress) 
    ? Math.max(0, Math.min(100, financialLevel.progress * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ delay: 0.1 }}
      onClick={() => navigate("/gamification")}
      className="bg-card shadow-sm  p-5 rounded-3xl border border-border mb-6 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-card rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">Financial Wellness</h3>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles size={16} className="text-[#00ff88]" />
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#00ff88] text-3xl font-black">Level {financialLevel.currentLevel}</span>
          </div>
        </div>
        
        <div className="relative h-4 bg-card shadow-sm rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00d9ff] via-[#00ff88] to-[#00d9a5] rounded-full"
          >

          </motion.div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-xs">Rank: <span className="text-[#00ff88] font-bold">{financialLevel.rankTitle}</span></p>
          <p className="text-white/50 text-xs">{financialLevel.xpToNext} XP to Level {financialLevel.nextLevel}</p>
        </div>
      </div>
    </motion.div>
  );
}
