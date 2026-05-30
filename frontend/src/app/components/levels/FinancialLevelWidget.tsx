import { motion } from "motion/react";
import { ArrowRight, Trophy, Sparkles } from "lucide-react";
import type { FinancialLevelSummary } from "../../../types/financialLevel";

interface FinancialLevelWidgetProps {
  level: FinancialLevelSummary;
}

export function FinancialLevelWidget({ level }: FinancialLevelWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-border bg-gradient-to-br from-[#080808] via-[#0f1115] to-[#0b0b0b] p-5 shadow-sm shadow-[#00ff88]/10"
    >
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-[0.22em] mb-2">
            Financial Level
          </p>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-card p-3">
              <Trophy size={24} className="text-[#00ff88]" />
            </div>
            <div>
              <p className="text-white text-2xl font-bold">Level {level.currentLevel}</p>
              <p className="text-white/60 text-sm">{level.rankTitle}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-card shadow-sm px-3 py-2 text-right">
          <p className="text-white/60 text-[11px] uppercase tracking-[0.18em]">XP</p>
          <p className="text-white text-lg font-semibold">{level.totalXp.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm text-white/70">
          <span>{level.currentXp} / 1000 XP</span>
          <span>{level.xpToNext} XP to Level {level.nextLevel}</span>
        </div>
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${level.progress}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00d9ff]"
          />
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-background/20 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-white/60 text-[11px] uppercase tracking-[0.24em]">
              Next milestone
            </p>
            <p className="text-white font-semibold leading-snug mt-2">
              {level.nextMilestone.title}
            </p>
          </div>
          <Sparkles className="text-[#ffd60a]" size={18} />
        </div>
        <p className="text-white/50 text-sm">{level.nextMilestone.description}</p>
      </div>

      <div className="mt-6 space-y-3">
        {level.recentGains.map((gain) => (
          <div
            key={gain.id}
            className="rounded-3xl bg-card shadow-sm border border-border p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold text-sm">{gain.title}</p>
                <p className="text-white/50 text-xs mt-1">{gain.subtitle}</p>
              </div>
              <div className="rounded-full bg-card px-3 py-1 text-[#00ff88] text-sm font-semibold">
                +{gain.xp} XP
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-card border border-[#00ff88]/20 px-4 py-3 text-sm font-semibold text-[#00ff88] transition hover:bg-card"
      >
        See your path to mastery
        <ArrowRight size={16} />
      </button>
    </motion.div>
  );
}
