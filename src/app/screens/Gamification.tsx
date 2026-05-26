import { motion } from "motion/react";
import { Flame, Target, Trophy, Zap, Award } from "lucide-react";
import { FinancialLevelWidget } from "../components/levels/FinancialLevelWidget";
import { useNavigate } from "react-router";
import { useTransactions } from "../../hooks/useTransactions";
import { useUserData } from "../../hooks/useUserData";
import { useAchievements } from "../../hooks/useAchievements";
import { useFinancialLevels } from "../../hooks/useFinancialLevels";
import { useChallenges } from "../../hooks/useChallenges";
import { AchievementBadgeCard } from "../components/achievements/AchievementBadgeCard";
import { AchievementUnlockModal } from "../components/achievements/AchievementUnlockModal";
import { ChallengeCard } from "../components/challenges/ChallengeCard";
import { RewardTimeline } from "../components/rewards/RewardTimeline";
import { useRewards } from "../../hooks/useRewards";
import { PageShell } from "../components/ui/PageShell";
import { BackButton } from "../components/ui/BackButton";
import { EmptyState } from "../components/ui/EmptyState";
import { useTranslation } from "react-i18next";

export function Gamification() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const { data: userData } = useUserData();
  const { statuses, recentUnlocked, openUnlocks, isLoading: achievementsLoading, onClearUnlocks } = useAchievements(transactions, userData ?? null);
  const { financialLevel } = useFinancialLevels(transactions, statuses, userData ?? null);
  const { rewards, isLoading: rewardsLoading } = useRewards();

  const unlockedCount = statuses.filter((achievement) => achievement.earned).length;
  const rareCount = statuses.filter(
    (achievement) =>
      achievement.earned &&
      ["rare", "epic", "legendary"].includes(achievement.rarity)
  ).length;
  const streakAchievement = statuses.find((achievement) => achievement.id === "seven_day_savings_streak");
  const upcoming = statuses
    .filter((achievement) => !achievement.earned)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);
  const rareHighlights = statuses
    .filter(
      (achievement) =>
        achievement.earned &&
        ["rare", "epic", "legendary"].includes(achievement.rarity)
    )
    .slice(0, 3);

  const totalXp = financialLevel.totalXp;
  const currentLevel = financialLevel.currentLevel;
  const levelProgress = financialLevel.progress;
  const levelTitle = financialLevel.rankTitle;
  const xpToNext = financialLevel.xpToNext;

  const { challenges } = useChallenges(userData ?? null, transactions);
  const activeChallenges = challenges.filter(c => c.status === "active" || c.status === "completed");

  return (
    <PageShell orbs={[{ color: "#ffd60a", position: "top-right" }, { color: "#ff6b35", position: "bottom-left" }]}>

      <div className="relative px-4 sm:px-6 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-7"
        >
          <BackButton onClick={() => navigate("/home")} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{t("gamification.title", "Rewards")}</h1>
            <p className="text-white/50 text-sm">{t("gamification.levels", "Level up your finances")}</p>
          </div>
        </motion.div>

        <FinancialLevelWidget level={financialLevel} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-card to-card  p-6 rounded-3xl border border-[#ffd60a]/30 mb-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-card to-transparent opacity-65" />
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-card rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#ffd60a] to-[#ff9500] p-3 rounded-2xl relative">
                  <Trophy size={32} className="text-black" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff88] rounded-full border-2 border-black" />
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">{t("gamification.currentLevel", "Current Level")}</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-white">Level {currentLevel}</h2>
                    <span className="text-[#ffd60a] text-sm font-bold">{levelTitle}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-1">Total XP</p>
                <p className="text-white text-3xl font-black">{totalXp.toLocaleString()}</p>
                <p className="text-[#00ff88] text-xs font-semibold">{xpToNext} {t("gamification.xpToNext", "XP to next level")}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80 font-medium">Progress toward Level {currentLevel + 1}</span>
                <span className="text-white font-bold">{totalXp % 1000} / 1000 XP</span>
              </div>
              <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ffd60a] via-[#ff9500] to-[#ffd60a] rounded-full relative"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_linear_infinite]"
                    style={{ "--tw-translate-x": "-100%" } as React.CSSProperties}
                  />
                </motion.div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-black text-xs font-bold">
                  {Math.round(levelProgress)}%
                </div>
              </div>
              <p className="text-white/50 text-xs">Earn badges to climb faster and unlock rare milestones.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-gradient-to-br from-card to-card  p-4 rounded-2xl border border-[#ff6b35]/30 text-center">
            <Flame size={24} className="text-[#ff6b35] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">
              {streakAchievement?.current ?? 0}
            </p>
            <p className="text-white/60 text-xs">{t("gamification.streak", "Savings streak")}</p>
          </div>
          <div className="bg-gradient-to-br from-card to-card  p-4 rounded-2xl border border-[#00d9ff]/30 text-center">
            <Award size={24} className="text-[#00d9ff] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">{unlockedCount}</p>
            <p className="text-white/60 text-xs">{t("gamification.unlocked", "Badges unlocked")}</p>
          </div>
          <div className="bg-gradient-to-br from-card to-card  p-4 rounded-2xl border border-[#00ff88]/30 text-center">
            <Zap size={24} className="text-[#00ff88] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">{rareCount}</p>
            <p className="text-white/60 text-xs">Rare badges</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-white font-semibold mb-4">{t("gamification.challenges", "Active Challenges")}</h3>
          <div className="space-y-4">
            {activeChallenges.length > 0 ? (
              activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onUpdateProgress={() => {}}
                />
              ))
            ) : (
              <EmptyState
                icon={<Target size={32} />}
                title="No active challenges"
                description="Accept a challenge from the Home screen to start earning XP and building better habits."
                accentColor="#00d9ff"
              />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <h3 className="text-white font-semibold mb-4">{t("gamification.badges", "Badge gallery")}</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {statuses.map((achievement) => (
              <AchievementBadgeCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Reward History</h3>
            {rewardsLoading && <div className="w-4 h-4 rounded-full border-2 border-[#00ff88] border-t-transparent animate-spin" />}
          </div>
          
          <RewardTimeline rewards={rewards} />
        </motion.div>
      </div>

      <AchievementUnlockModal achievements={openUnlocks} onClose={onClearUnlocks} />
    </PageShell>
  );
}
