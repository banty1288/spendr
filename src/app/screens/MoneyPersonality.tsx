import { motion } from "motion/react";
import { ArrowLeft, Share2, Zap, Heart, Brain, AlertTriangle, Target, Sparkles, TrendingUp, Users } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useNavigate } from "react-router";

export function MoneyPersonality() {
  const navigate = useNavigate();

  const traits = [
    { name: "Spontaneity", value: 85, color: "#ff3366", trend: "+5%", icon: Zap },
    { name: "Discipline", value: 72, color: "#00ff88", trend: "+12%", icon: Target },
    { name: "Planning", value: 58, color: "#00d9ff", trend: "-3%", icon: Brain },
    { name: "Risk Appetite", value: 78, color: "#9d4edd", trend: "+8%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff3366]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#9d4edd]/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/home")}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <button className="bg-gradient-to-r from-[#00d9ff]/20 to-[#00ff88]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#00d9ff]/30 flex items-center gap-2">
            <Share2 size={18} className="text-[#00d9ff]" />
            <span className="text-white text-sm font-medium">Share</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-[#ff3366]/20 to-[#9d4edd]/20 backdrop-blur-sm p-8 rounded-3xl border border-[#ff3366]/30 mb-6 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#ff3366]/10 via-transparent to-[#9d4edd]/10"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff3366]/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <div className="relative text-center">
            <motion.div
              className="inline-block bg-gradient-to-br from-[#ff3366] to-[#9d4edd] p-5 rounded-3xl mb-4 relative"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Zap size={48} className="text-white" />
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#ffd60a] rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#ff3366] via-white to-[#9d4edd] bg-clip-text text-transparent mb-2">
              Impulse Explorer
            </h1>
            <p className="text-white/70 mb-1">Your Money Personality Type</p>
            <div className="flex items-center justify-center gap-2 mb-4 text-white/50 text-xs">
              <Users size={12} />
              <span>Shared by 18% of Gen Z users</span>
            </div>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ff3366] to-[#9d4edd] px-5 py-3 rounded-full">
              <Sparkles size={18} className="text-white" />
              <div className="text-left">
                <p className="text-white/80 text-xs">Personality Score</p>
                <p className="text-white font-black text-xl">78/100</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Brain size={20} className="text-[#9d4edd]" />
            Personality Traits
          </h2>
          <div className="space-y-5">
            {traits.map((trait, index) => {
              const Icon = trait.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: `${trait.color}20` }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <Icon size={14} style={{ color: trait.color }} />
                      </motion.div>
                      <span className="text-white font-medium text-sm">{trait.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: `${trait.color}20`,
                          color: trait.color
                        }}
                      >
                        {trait.trend}
                      </span>
                      <span className="text-white font-bold text-sm w-12 text-right">{trait.value}%</span>
                    </div>
                  </div>
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trait.value}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 1, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 rounded-full relative"
                      style={{ backgroundColor: trait.color }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: index * 0.3 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-4"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Heart size={20} className="text-[#00ff88]" />
            Strengths
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="bg-[#00ff88]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">You're excellent at seizing financial opportunities quickly</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#00ff88]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">Strong ability to enjoy money and create experiences</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#00ff88]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">Open to trying new investment strategies</p>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-4"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-[#ff3366]" />
            Areas to Watch
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="bg-[#ff3366]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#ff3366] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">Impulse purchases can derail long-term savings goals</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#ff3366]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#ff3366] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">Emotional spending spikes during stress or celebration</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#ff3366]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#ff3366] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">May benefit from automated savings to counterbalance spontaneity</p>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#00d9ff]/20 to-[#00ff88]/20 backdrop-blur-sm p-6 rounded-3xl border border-[#00d9ff]/30"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target size={20} className="text-[#00d9ff]" />
            AI Recommendations
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="bg-[#00d9ff]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">Set up a "fun money" budget of $200/month for guilt-free impulse buys</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#00d9ff]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">Implement 24-hour rule for purchases over $50</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#00d9ff]/20 p-1 rounded-lg mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full" />
              </div>
              <p className="text-white/80 text-sm">Automate 15% of income to savings before you can spend it</p>
            </li>
          </ul>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
