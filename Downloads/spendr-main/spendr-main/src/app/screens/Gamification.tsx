import { motion } from "motion/react";
import { ArrowLeft, Flame, Target, Trophy, Zap, Award } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { FinancialLevelWidget } from "../components/levels/FinancialLevelWidget";
import { useNavigate } from "react-router";
import { useTransactions } from "../../hooks/useTransactions";
import { useUserData } from "../../hooks/useUserData";
import { useAchievements } from "../../hooks/useAchievements";
import { useFinancialLevels } from "../../hooks/useFinancialLevels";
import { AchievementBadgeCard } from "../components/achievements/AchievementBadgeCard";
import { AchievementUnlockModal } from "../components/achievements/AchievementUnlockModal";

export function Gamification() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { data: userData } = useUserData();
  const {
    statuses,
    recentUnlocked,
    openUnlocks,
    isLoading: achievementsLoading,
    onClearUnlocks,
  } = useAchievements(transactions, userData ?? null);
  const { financialLevel } = useFinancialLevels(transactions, statuses, userData ?? null);

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

  const recentRewards = financialLevel.recentGains.map((gain) => ({
    name: gain.title,
    xp: gain.xp,
    time: "recent",
    icon: <Zap size={18} className="text-[#00d9ff]" />,
  }));

  const challenges = upcoming.map((achievement) => ({
    title: achievement.title,
    description: achievement.description,
    progress: achievement.current,
    total: achievement.total,
    reward: achievement.rewardXp,
    color:
      achievement.rarity === "rare"
        ? "#9d4edd"
        : achievement.rarity === "epic"
        ? "#00ff88"
        : achievement.rarity === "uncommon"
        ? "#00d9ff"
        : "#ffd60a",
    icon: Target,
  }));

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffd60a]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ff6b35]/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Rewards</h1>
            <p className="text-white/60 text-sm">Level up your finances</p>
          </div>
        </div>

        <FinancialLevelWidget level={financialLevel} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-[#ffd60a]/20 to-[#ff9500]/20 backdrop-blur-sm p-6 rounded-3xl border border-[#ffd60a]/30 mb-6 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#ffd60a]/10 to-transparent"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -right-10 -top-10 w-40 h-40 bg-[#ffd60a]/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-gradient-to-br from-[#ffd60a] to-[#ff9500] p-3 rounded-2xl relative"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Trophy size={32} className="text-black" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff88] rounded-full border-2 border-black"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Current Level</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-white">Level {currentLevel}</h2>
                    <span className="text-[#ffd60a] text-sm font-bold">{levelTitle}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-1">Total XP</p>
                <p className="text-white text-3xl font-black">{totalXp.toLocaleString()}</p>
                <p className="text-[#00ff88] text-xs font-semibold">{xpToNext} XP to next level</p>
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
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
          <div className="bg-gradient-to-br from-[#ff6b35]/20 to-[#f7931e]/20 backdrop-blur-sm p-4 rounded-2xl border border-[#ff6b35]/30 text-center">
            <Flame size={24} className="text-[#ff6b35] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">
              {streakAchievement?.current ?? 0}
            </p>
            <p className="text-white/60 text-xs">Savings streak</p>
          </div>
          <div className="bg-gradient-to-br from-[#00d9ff]/20 to-[#0099ff]/20 backdrop-blur-sm p-4 rounded-2xl border border-[#00d9ff]/30 text-center">
            <Award size={24} className="text-[#00d9ff] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">{unlockedCount}</p>
            <p className="text-white/60 text-xs">Badges unlocked</p>
          </div>
          <div className="bg-gradient-to-br from-[#00ff88]/20 to-[#00d9a5]/20 backdrop-blur-sm p-4 rounded-2xl border border-[#00ff88]/30 text-center">
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
          <h3 className="text-white font-semibold mb-4">Active Challenges</h3>
          <div className="space-y-4">
            {challenges.length > 0 ? (
              challenges.map((challenge, index) => {
                const Icon = challenge.icon;
                const progress = (challenge.progress / challenge.total) * 100;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/10 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
                      style={{ backgroundColor: challenge.color }}
                    />
                    <div className="relative">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="p-3 rounded-2xl shrink-0"
                          style={{ backgroundColor: `${challenge.color}20` }}
                        >
                          <Icon size={24} style={{ color: challenge.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{challenge.title}</h4>
                          <p className="text-white/60 text-sm">{challenge.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 bg-[#ffd60a]/20 px-2 py-1 rounded-full">
                            <Zap size={12} className="text-[#ffd60a]" />
                            <span className="text-[#ffd60a] text-xs font-bold">{challenge.reward}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Progress</span>
                          <span className="text-white font-semibold">
                            {challenge.progress} / {challenge.total}
                          </span>
                        </div>
                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ backgroundColor: challenge.color }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/10 p-6 text-white/60">
                You’re on track! Unlock a new challenge by logging more spending and savings activity.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <h3 className="text-white font-semibold mb-4">Badge gallery</h3>
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
        >
          <h3 className="text-white font-semibold mb-4">Recent Rewards</h3>
          <div className="space-y-3">
            {recentRewards.length > 0 ? (
              recentRewards.map((reward, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center gap-4"
                >
                  <div className="text-2xl">{reward.icon}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{reward.name}</p>
                    <p className="text-white/40 text-xs">{reward.time}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#00d9ff]/20 to-[#00ff88]/20 px-3 py-1.5 rounded-full">
                    <Zap size={14} className="text-[#00d9ff]" />
                    <span className="text-white font-bold text-sm">+{reward.xp}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/10 p-6 text-white/60">
                No badge unlocks yet. Complete your first achievement to start collecting XP rewards.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AchievementUnlockModal achievements={openUnlocks} onClose={onClearUnlocks} />
      <BottomNav />
    </div>
  );
}
