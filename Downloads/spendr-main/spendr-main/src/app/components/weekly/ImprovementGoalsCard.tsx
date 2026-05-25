import { motion } from "motion/react";
import { Target, Flag, Zap } from "lucide-react";
import type { ImprovementGoal } from "../../../types/weeklyReport";

interface ImprovementGoalsCardProps {
  goals: ImprovementGoal[];
  className?: string;
}

const priorityColors: Record<string, string> = {
  high: "from-[#ff3366] to-[#ff6b35] border-[#ff3366]/30",
  medium: "from-[#ffd60a] to-[#ff6b35] border-[#ffd60a]/30",
  low: "from-[#00ff88] to-[#00d9ff] border-[#00ff88]/30",
};

const priorityIcons: Record<string, React.ReactNode> = {
  high: <Zap size={18} className="text-[#ff3366]" />,
  medium: <Flag size={18} className="text-[#ffd60a]" />,
  low: <Target size={18} className="text-[#00ff88]" />,
};

export function ImprovementGoalsCard({ goals, className = "" }: ImprovementGoalsCardProps) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <Target size={20} className="text-[#00d9ff]" />
        <h3 className="text-lg font-semibold text-white">Next Week Goals</h3>
      </div>

      <div className="space-y-3">
        {goals.map((goal, idx) => (
          <motion.div
            key={goal.goalId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-lg border bg-gradient-to-r ${priorityColors[goal.priority]} p-4 backdrop-blur-sm`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {priorityIcons[goal.priority]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white text-sm">{goal.title}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full bg-black/30 text-white capitalize`}>
                    {goal.priority}
                  </span>
                </div>
                <p className="text-xs text-white/80 mb-2">{goal.description}</p>
                <p className="text-xs text-white/60">💭 {goal.aiReasoning}</p>
                {goal.targetAmount && (
                  <p className="text-xs font-medium text-white/80 mt-2">
                    Target: ${goal.targetAmount.toFixed(2)}
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
