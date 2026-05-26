import { motion } from "motion/react";
import { PiggyBank } from "lucide-react";
import type { SavingsProgress } from "../../../types/weeklyReport";
import { useCurrency } from "../../../hooks/useCurrency";

interface SavingsProgressCardProps {
  savingsGoals: SavingsProgress[];
  savingsRate: number;
  className?: string;
}

export function SavingsProgressCard({
  savingsGoals,
  savingsRate,
  className = "",
}: SavingsProgressCardProps) {
  const { convertAndFormat } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-border bg-gradient-to-br from-white/5 to-white/[0.02] p-6  ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PiggyBank size={20} className="text-[#00ff88]" />
          <h3 className="text-lg font-semibold text-white">Savings Progress</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#00ff88]">{savingsRate.toFixed(1)}%</p>
          <p className="text-xs text-white/50">Savings Rate</p>
        </div>
      </div>

      {savingsGoals.length > 0 ? (
        <div className="space-y-4">
          {savingsGoals.map((goal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">{goal.goalName}</p>
                <span className="text-xs font-semibold text-[#00d9ff]">
                  {goal.percentComplete.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d9ff] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.percentComplete}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-white/60">
                  {convertAndFormat(goal.currentAmount)} / {convertAndFormat(goal.targetAmount)}
                </p>
                <p className="text-xs text-white/60">
                  {goal.estimatedWeeksToGoal} weeks to goal
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/60">No active savings goals</p>
      )}
    </motion.div>
  );
}
