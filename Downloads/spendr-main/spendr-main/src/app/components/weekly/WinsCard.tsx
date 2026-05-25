import { motion } from "motion/react";
import { TrendingUp, Zap, Target, Trophy } from "lucide-react";
import type { FinancialWin } from "../../../types/weeklyReport";

interface WinsCardProps {
  wins: FinancialWin[];
  className?: string;
}

const impactIcons: Record<string, React.ReactNode> = {
  savings: <Trophy size={18} className="text-[#ffd60a]" />,
  discipline: <Target size={18} className="text-[#00d9ff]" />,
  consistency: <TrendingUp size={18} className="text-[#00ff88]" />,
};

export function WinsCard({ wins, className = "" }: WinsCardProps) {
  if (wins.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy size={20} className="text-[#ffd60a]" />
        <h3 className="text-lg font-semibold text-white">Financial Wins</h3>
      </div>

      <div className="space-y-3">
        {wins.map((win, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {impactIcons[win.impact] || <Zap size={18} className="text-[#00d9ff]" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{win.title}</p>
                <p className="text-xs text-white/60 mt-1">{win.description}</p>
                {win.amount && (
                  <p className="text-xs font-medium text-[#00ff88] mt-2">
                    +${win.amount.toFixed(2)} saved
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
