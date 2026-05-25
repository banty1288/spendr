import { motion } from "motion/react";
import { ArrowLeft, Flame, Trophy, Target, Zap, Star, Award } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useNavigate } from "react-router";

export function Gamification() {
  const navigate = useNavigate();

  const challenges = [
    {
      title: "No Impulse Week",
      description: "Go 7 days without impulse purchases",
      progress: 4,
      total: 7,
      reward: 250,
      color: "#00d9ff",
      icon: Target,
    },
    {
      title: "Savings Superstar",
      description: "Save $500 this month",
      progress: 340,
      total: 500,
      reward: 500,
      color: "#00ff88",
      icon: Star,
    },
    {
      title: "Budget Master",
      description: "Stay under budget in 3 categories",
      progress: 2,
      total: 3,
      reward: 150,
      color: "#9d4edd",
      icon: Trophy,
    },
  ];

  const recentRewards = [
    { name: "Daily Login Bonus", xp: 50, time: "2h ago", icon: "🎯" },
    { name: "Completed Transaction Review", xp: 100, time: "5h ago", icon: "✅" },
    { name: "3-Day Streak Bonus", xp: 150, time: "Yesterday", icon: "🔥" },
  ];

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
                    <h2 className="text-4xl font-black text-white">Level 4</h2>
                    <span className="text-[#ffd60a] text-sm font-bold">Elite</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-1">Total XP</p>
                <p className="text-white text-3xl font-black">8,450</p>
                <p className="text-[#00ff88] text-xs font-semibold">+250 today</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80 font-medium">Progress to Level 5: Financial Guru</span>
                <span className="text-white font-bold">6,850 / 10,000 XP</span>
              </div>
              <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "68.5%" }}
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
                  3,150 XP to go
                </div>
              </div>
              <p className="text-white/50 text-xs">You're ahead of 78% of Spendr users 🔥</p>
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
            <p className="text-white text-2xl font-black mb-1">12</p>
            <p className="text-white/60 text-xs">Day Streak</p>
          </div>
          <div className="bg-gradient-to-br from-[#00d9ff]/20 to-[#0099ff]/20 backdrop-blur-sm p-4 rounded-2xl border border-[#00d9ff]/30 text-center">
            <Award size={24} className="text-[#00d9ff] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">18</p>
            <p className="text-white/60 text-xs">Achievements</p>
          </div>
          <div className="bg-gradient-to-br from-[#00ff88]/20 to-[#00d9a5]/20 backdrop-blur-sm p-4 rounded-2xl border border-[#00ff88]/30 text-center">
            <Zap size={24} className="text-[#00ff88] mx-auto mb-2" />
            <p className="text-white text-2xl font-black mb-1">5</p>
            <p className="text-white/60 text-xs">Challenges</p>
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
            {challenges.map((challenge, index) => {
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
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-white font-semibold mb-4">Recent Rewards</h3>
          <div className="space-y-3">
            {recentRewards.map((reward, index) => (
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
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
