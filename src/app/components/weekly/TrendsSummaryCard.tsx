import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { WeeklyTrend } from "../../../types/weeklyReport";

interface TrendsSummaryCardProps {
  trends: WeeklyTrend[];
  summary: string;
  className?: string;
}

export function TrendsSummaryCard({
  trends,
  summary,
  className = "",
}: TrendsSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl ${className}`}
    >
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Trends</h3>

      {summary && (
        <p className="text-sm text-white/80 mb-6 leading-relaxed">{summary}</p>
      )}

      {trends.length > 0 && (
        <div className="space-y-3">
          {trends.map((trend, idx) => {
            const isUp = trend.direction === "up";
            const icon = isUp ? (
              <TrendingUp size={16} className="text-[#ff3366]" />
            ) : trend.direction === "down" ? (
              <TrendingDown size={16} className="text-[#00ff88]" />
            ) : (
              <div className="w-4 h-4" />
            );

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <span className="text-sm font-medium text-white">{trend.metric}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{trend.currentWeek}</p>
                    <p className={`text-xs font-medium ${
                      isUp ? "text-[#ff3366]" : "text-[#00ff88]"
                    }`}>
                      {isUp ? "+" : ""}{trend.changePercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
