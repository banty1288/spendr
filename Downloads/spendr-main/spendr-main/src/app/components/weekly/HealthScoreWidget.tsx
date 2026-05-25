import { motion } from "motion/react";
import type { AIHealthScoreBreakdown } from "../../../types/weeklyReport";

interface HealthScoreWidgetProps {
  healthScore: AIHealthScoreBreakdown;
  size?: "sm" | "lg";
  className?: string;
}

export function HealthScoreWidget({
  healthScore,
  size = "lg",
  className = "",
}: HealthScoreWidgetProps) {
  const metrics = [
    {
      label: "Discipline",
      value: healthScore.discipline,
      color: "from-[#9d4edd] to-[#c77dff]",
      icon: "🎯",
    },
    {
      label: "Consistency",
      value: healthScore.consistency,
      color: "from-[#00ff88] to-[#00d9ff]",
      icon: "📈",
    },
    {
      label: "Savings Rate",
      value: healthScore.savingsRate,
      color: "from-[#ffd60a] to-[#ff6b35]",
      icon: "💰",
    },
    {
      label: "Emotional Control",
      value: healthScore.emotionalControl,
      color: "from-[#00d9ff] to-[#9d4edd]",
      icon: "❤️",
    },
  ];

  const isSm = size === "sm";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d9ff]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#9d4edd]/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-white/60 mb-3">Financial Health Score</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#00d9ff] to-[#00ff88] bg-clip-text text-transparent">
                {Math.round(healthScore.overallScore)}
              </div>
              <p className="text-xs text-white/50 mt-2">Out of 100</p>
            </div>
            <div className="w-32 h-32 relative">
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full transform -rotate-90"
              >
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  opacity="0.1"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(healthScore.overallScore / 100) * 314.159} 314.159`}
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 314.159" }}
                  animate={{
                    strokeDasharray: `${(healthScore.overallScore / 100) * 314.159} 314.159`,
                  }}
                  transition={{ duration: 1 }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d9ff" />
                    <stop offset="100%" stopColor="#00ff88" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div
        className={`grid gap-3 ${
          isSm ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${metric.color} bg-opacity-10 p-4 backdrop-blur-sm`}
          >
            <div className="absolute inset-0 opacity-20 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{metric.icon}</span>
                <p className={`text-2xl font-bold text-white ${isSm ? "text-lg" : ""}`}>
                  {Math.round(metric.value)}
                </p>
              </div>
              <p className={`text-xs font-medium text-white/70 ${isSm ? "text-[10px]" : ""}`}>
                {metric.label}
              </p>
              <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
