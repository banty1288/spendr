import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { AchievementStatus } from "../../types/achievement";

const rarityStyles: Record<AchievementStatus["rarity"], string> = {
  common: "from-white/5 to-white/10 border-white/10",
  uncommon: "from-[#00d9ff]/10 to-[#00d9ff]/20 border-[#00d9ff]/30",
  rare: "from-[#9d4edd]/10 to-[#9d4edd]/20 border-[#9d4edd]/30",
  epic: "from-[#ff9500]/10 to-[#ff9500]/20 border-[#ff9500]/30",
  legendary: "from-[#ffd60a]/10 to-[#ffd60a]/20 border-[#ffd60a]/30",
};

export function AchievementBadgeCard({ achievement }: { achievement: AchievementStatus }) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-4 bg-gradient-to-br ${rarityStyles[achievement.rarity]} shadow-black/20 overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-3xl mb-3">{achievement.icon}</div>
          <h3 className="text-white font-semibold text-sm leading-snug">{t(`badges.${achievement.id}_title`, achievement.title)}</h3>
        </div>
        <div
          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
            achievement.earned
              ? "bg-white/10 text-[#fff]"
              : "bg-white/5 text-white/60"
          }`}
        >
          {achievement.rarity}
        </div>
      </div>

      <p className="text-white/60 text-xs mb-4 leading-relaxed">{t(`badges.${achievement.id}_desc`, achievement.description)}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-white/60 uppercase tracking-[0.18em]">
          <span>Progress</span>
          <span>{achievement.progressText}</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${achievement.percent}%` }}
            className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88]"
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
