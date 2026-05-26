import { AnimatePresence, motion } from "motion/react";
import { X, Sparkles } from "lucide-react";
import type { AchievementStatus } from "../../types/achievement";

interface AchievementUnlockModalProps {
  achievements: AchievementStatus[];
  onClose: () => void;
}

export function AchievementUnlockModal({ achievements, onClose }: AchievementUnlockModalProps) {
  return (
    <AnimatePresence>
      {achievements.length > 0 ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-xl rounded-[2rem] border border-border bg-card p-6 shadow-2xl shadow-black/60"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm font-semibold text-[#ffd60a]">
                  <Sparkles size={16} /> Achievement unlocked
                </div>
                <h2 className="mt-3 text-2xl font-bold text-white">New badge unlocked!</h2>
                <p className="text-white/60 text-sm mt-1">
                  Celebrate your progress and keep the momentum going.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-card shadow-sm p-2 text-white/80 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="rounded-3xl border border-border bg-card shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="grid h-14 w-14 place-items-center rounded-3xl bg-white/10 text-2xl">
                      {achievement.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{achievement.title}</p>
                      <p className="text-white/50 text-xs uppercase tracking-[0.18em]">
                        {achievement.rarity} badge
                      </p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 text-xs text-white/60">
                    <span>{achievement.progressText}</span>
                    <span>{achievement.rewardXp} XP</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-3xl bg-card px-5 py-3 text-sm font-semibold text-white transition hover:bg-card"
              >
                Keep going
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
