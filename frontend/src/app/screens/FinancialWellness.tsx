import React from "react";
import { motion } from "motion/react";
import { Flame, Target, Trophy, Zap, Award, Activity } from "lucide-react";
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

export function FinancialWellness() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const { data: userData } = useUserData();
  const { statuses, openUnlocks, onClearUnlocks } = useAchievements(transactions, userData ?? null);
  const { financialLevel } = useFinancialLevels(transactions, statuses, userData ?? null);
  const { rewards, isLoading: rewardsLoading } = useRewards();

  const unlockedCount = statuses.filter((a) => a.earned).length;
  const rareCount = statuses.filter((a) => a.earned && ["rare", "epic", "legendary"].includes(a.rarity)).length;
  const streakAchievement = statuses.find((a) => a.id === "seven_day_savings_streak");

  const { challenges } = useChallenges(userData ?? null, transactions);
  const activeChallenges = challenges.filter(c => c.status === "active" || c.status === "completed");

  const totalXp = financialLevel.totalXp;
  const currentLevel = financialLevel.currentLevel;
  const levelProgress = financialLevel.progress;
  const levelTitle = financialLevel.rankTitle;
  const xpToNext = financialLevel.xpToNext;

  return (
    <PageShell orbs={[{ color: "#00ff88", position: "top-right" }, { color: "#00d9ff", position: "bottom-left" }]}>
      <div className="relative px-4 sm:px-6 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-7"
        >
          <BackButton onClick={() => navigate("/home")} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity size={24} className="text-[#00ff88]" />
              Financial Wellness
            </h1>
            <p className="text-white/50 text-sm">Track your habits, earn rewards, level up</p>
          </div>
        </motion.div>

        {/* Level Widget (Redesigned slightly for Wellness) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-card to-card p-6 rounded-3xl border border-[#00ff88]/30 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-[#00d9ff]/5" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#00ff88] to-[#00d9ff] p-3 rounded-2xl">
                  <Trophy size={32} className="text-black" />
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Financial Health Level</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-white">Lvl {currentLevel}</h2>
                    <span className="text-[#00ff88] text-sm font-bold">{levelTitle}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-1">Total Wellness XP</p>
                <p className="text-white text-3xl font-black">{totalXp.toLocaleString()}</p>
                <p className="text-[#00d9ff] text-xs font-semibold">{xpToNext} XP to next level</p>
              </div>
            </div>
            
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mt-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00ff88] to-[#00d9ff] rounded-full"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-black text-xs font-bold mix-blend-difference text-white">
                {Math.round(levelProgress)}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-card p-4 rounded-2xl border border-border text-center">
            <Flame size={24} className="text-[#ff6b35] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">{streakAchievement?.current ?? 0}</p>
            <p className="text-white/60 text-xs">Day Streak</p>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border text-center">
            <Award size={24} className="text-[#00d9ff] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">{unlockedCount}</p>
            <p className="text-white/60 text-xs">Milestones</p>
          </div>
          <div className="bg-card p-4 rounded-2xl border border-border text-center">
            <Zap size={24} className="text-[#ffd60a] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">{rareCount}</p>
            <p className="text-white/60 text-xs">Rare Unlocks</p>
          </div>
        </motion.div>

        {/* Active Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-white font-semibold mb-4">Habit Building Challenges</h3>
          <div className="space-y-4">
            {activeChallenges.length > 0 ? (
              activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} onUpdateProgress={() => {}} />
              ))
            ) : (
              <EmptyState
                icon={<Target size={32} />}
                title="No active challenges"
                description="Accept a challenge from the Home screen to start building better habits."
                accentColor="#00d9ff"
              />
            )}
          </div>
        </motion.div>

        {/* Achievements Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <h3 className="text-white font-semibold mb-4">Milestone Gallery</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {statuses.map((achievement) => (
              <AchievementBadgeCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </motion.div>

        {/* Reward Timeline */}
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
