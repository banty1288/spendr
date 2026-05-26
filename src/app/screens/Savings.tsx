import { motion } from "motion/react";
import { ArrowLeft, Target, TrendingUp, Award, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useCurrency } from "../../hooks/useCurrency";

export function Savings() {
  const navigate = useNavigate();
  const { convertAndFormat } = useCurrency();

  const goals = [
    {
      name: "Emergency Fund",
      current: 3200,
      target: 5000,
      color: "#00d9ff",
      icon: "🛡️",
      monthlyContribution: 400,
      monthsLeft: 4.5,
    },
    {
      name: "Vacation to Japan",
      current: 1850,
      target: 3000,
      color: "#ff3366",
      icon: "✈️",
      monthlyContribution: 200,
      monthsLeft: 5.75,
    },
    {
      name: "New MacBook Pro",
      current: 900,
      target: 2500,
      color: "#9d4edd",
      icon: "💻",
      monthlyContribution: 160,
      monthsLeft: 10,
    },
  ];

  const achievements = [
    { name: "First $1K Saved", earned: true, icon: "🎯" },
    { name: "30-Day Streak", earned: true, icon: "🔥" },
    { name: "Budget Master", earned: true, icon: "👑" },
    { name: "Savings Champion", earned: false, icon: "🏆" },
  ];

  return (
    <div className="min-h-screen pb-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00ff88]/30 rounded-full blur-[64px] will-change-transform" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00d9ff]/30 rounded-full blur-[64px] will-change-transform" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 pt-12 pb-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Savings</h1>
            <p className="text-white/60 text-sm">Track your financial goals</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-[#00ff88]/20 to-[#00d9ff]/20 backdrop-blur-sm p-6 rounded-3xl border border-[#00ff88]/30 mb-6 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 to-transparent"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#00ff88]/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <div className="relative">
            <p className="text-white/60 text-sm mb-2">Total Saved Across Goals</p>
            <div className="flex items-baseline gap-3 mb-1">
              <h2 className="text-5xl font-black bg-gradient-to-r from-[#00ff88] to-[#00d9ff] bg-clip-text text-transparent">
                {convertAndFormat(5950)}
              </h2>
              <span className="text-white/60 text-lg">/ {convertAndFormat(10500)}</span>
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#00ff88]" />
                <span className="text-[#00ff88] font-bold text-sm">+{convertAndFormat(395)}</span>
                <span className="text-white/60 text-sm">this month</span>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "56.7%" }}
                transition={{ delay: 0.3, duration: 1.2 }}
                className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d9ff] relative"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
            <p className="text-white/50 text-xs mt-2">
              At this rate, you'll complete all goals in ~10 months 🎯
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Active Goals</h3>
            <button className="bg-gradient-to-r from-[#00d9ff] to-[#00ff88] p-2 rounded-xl">
              <Plus size={18} className="text-black" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {goals.map((goal, index) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/10 relative overflow-hidden group cursor-pointer"
                >
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
                    style={{ backgroundColor: goal.color }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="text-4xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                          {goal.icon}
                        </motion.div>
                        <div>
                          <h4 className="text-white font-bold text-base">{goal.name}</h4>
                          <p className="text-white/60 text-xs">
                            {convertAndFormat(goal.current)} of {convertAndFormat(goal.target)}
                          </p>
                          <p className="text-white/40 text-xs mt-1">
                            {convertAndFormat(goal.monthlyContribution)}/month · ~{Math.ceil(goal.monthsLeft)}mo left
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-2xl font-black mb-1"
                          style={{ color: goal.color }}
                        >
                          {progress.toFixed(0)}%
                        </p>
                        <p className="text-white/50 text-xs">
                          {convertAndFormat(goal.target - goal.current)} to go
                        </p>
                      </div>
                    </div>
                    <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 1, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 rounded-full relative"
                        style={{
                          background: `linear-gradient(90deg, ${goal.color}, ${goal.color}dd)`,
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      </motion.div>
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
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award size={20} className="text-[#ffd60a]" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={`p-4 rounded-2xl border text-center ${
                  achievement.earned
                    ? "bg-gradient-to-br from-[#ffd60a]/20 to-[#ff9500]/20 border-[#ffd60a]/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className={`text-3xl mb-2 ${!achievement.earned && "grayscale opacity-30"}`}>
                  {achievement.icon}
                </div>
                <p
                  className={`text-xs ${
                    achievement.earned ? "text-white font-medium" : "text-white/40"
                  }`}
                >
                  {achievement.name}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#9d4edd]/20 to-[#c77dff]/20 backdrop-blur-sm p-5 rounded-3xl border border-[#9d4edd]/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-[#9d4edd] to-[#c77dff] p-3 rounded-2xl">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Financial Level</h3>
              <p className="text-white/60 text-xs">Keep saving to level up!</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-lg font-bold">Level 4</span>
            <span className="text-white/60 text-sm">2,150 XP to Level 5</span>
          </div>
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "68%" }}
              transition={{ delay: 0.7, duration: 1 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#9d4edd] to-[#c77dff] rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
