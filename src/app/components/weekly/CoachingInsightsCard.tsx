import { motion } from "motion/react";
import { MessageCircle, Lightbulb } from "lucide-react";
import type { CoachingInsight } from "../../../types/weeklyReport";

interface CoachingInsightsCardProps {
  insights: CoachingInsight[];
  message: string;
  className?: string;
}

export function CoachingInsightsCard({
  insights,
  message,
  className = "",
}: CoachingInsightsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Main Coaching Message */}
      <div className="rounded-2xl border border-[#9d4edd]/20 bg-gradient-to-br from-card to-white/[0.02] p-6 ">
        <div className="flex items-start gap-3">
          <MessageCircle size={20} className="text-[#9d4edd] flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Your Personalized Coaching</h3>
            <p className="text-sm text-white/80 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      {insights.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-border bg-white/[0.03] p-4  hover:border-white/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{insight.emoji || "💡"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{insight.insight}</p>
                  <p className="text-xs text-white/60 mt-2">👉 {insight.actionableStep}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
