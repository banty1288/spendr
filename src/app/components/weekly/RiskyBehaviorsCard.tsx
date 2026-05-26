import { motion } from "motion/react";
import { AlertTriangle, Flame, AlertCircle } from "lucide-react";
import type { RiskyBehavior } from "../../../types/weeklyReport";
import { useCurrency } from "../../../hooks/useCurrency";

interface RiskyBehaviorsCardProps {
  behaviors: RiskyBehavior[];
  className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  impulse: <Flame size={18} className="text-[#ff3366]" />,
  emotional: <AlertCircle size={18} className="text-[#ffd60a]" />,
  recurring: <AlertTriangle size={18} className="text-[#ff6b35]" />,
  outlier: <AlertTriangle size={18} className="text-[#ff3366]" />,
};

export function RiskyBehaviorsCard({ behaviors, className = "" }: RiskyBehaviorsCardProps) {
  const { convertAndFormat } = useCurrency();

  if (behaviors.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-[#ff3366]/20 bg-gradient-to-br from-[#ff3366]/5 to-white/[0.02] p-6 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle size={20} className="text-[#ff3366]" />
        <h3 className="text-lg font-semibold text-white">Risky Behaviors Detected</h3>
      </div>

      <div className="space-y-3">
        {behaviors.map((behavior, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-lg border border-[#ff3366]/20 bg-[#ff3366]/[0.05] p-4 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {typeIcons[behavior.type] || <AlertTriangle size={18} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white text-sm">{behavior.description}</p>
                  <span className="text-xs font-medium text-[#ff3366]">
                    {behavior.confidence}% confident
                  </span>
                </div>
                <p className="text-xs text-white/60 mb-2">
                  {behavior.category} • {convertAndFormat(behavior.amount)}
                </p>
                <p className="text-xs text-[#00d9ff] font-medium">💡 {behavior.suggestion}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
