import { motion } from "motion/react";
import { Zap, Heart, Sparkles, Brain, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import type { PersonalityAnalysis, PersonalityType } from "../../../types/personality";

interface PersonalitySnapshotCardProps {
  personality: PersonalityAnalysis | null;
  isLoading: boolean;
}

function getTypeConfig(type?: PersonalityType) {
  switch (type) {
    case "Impulse Explorer":
      return { color: "#ff3366", icon: Zap, bg: "from-[#ff3366] to-[#9d4edd]" };
    case "Silent Saver":
      return { color: "#00ff88", icon: Heart, bg: "from-[#00ff88] to-[#00d9ff]" };
    case "Reward Spender":
      return { color: "#9d4edd", icon: Sparkles, bg: "from-[#9d4edd] to-[#ff3366]" };
    case "Future Builder":
      return { color: "#00d9ff", icon: Brain, bg: "from-[#00d9ff] to-[#9d4edd]" };
    case "Comfort Buyer":
      return { color: "#ffd60a", icon: Target, bg: "from-[#ffd60a] to-[#ff3366]" };
    default:
      return { color: "#ff3366", icon: Zap, bg: "from-[#ff3366] to-[#9d4edd]" };
  }
}

export function PersonalitySnapshotCard({ personality, isLoading }: PersonalitySnapshotCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/10 mb-6 animate-pulse">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-white/10 rounded-full mb-2" />
            <div className="h-4 w-full bg-white/10 rounded-full mb-1" />
            <div className="h-4 w-3/4 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!personality) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => navigate("/personality")}
        className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-dashed border-white/20 mb-6 cursor-pointer group text-center"
      >
        <Brain className="mx-auto text-[#00d9ff] mb-3 opacity-50" size={32} />
        <h3 className="text-white font-medium mb-1">Discover your Personality</h3>
        <p className="text-white/50 text-xs">Let AI analyze your spending style</p>
      </motion.div>
    );
  }

  const config = getTypeConfig(personality.type);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={() => navigate("/personality")}
      className="bg-gradient-to-br from-[#9d4edd]/20 to-[#c77dff]/20 backdrop-blur-sm p-5 rounded-3xl border border-[#9d4edd]/30 mb-6 relative overflow-hidden cursor-pointer group"
    >
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 bg-[#9d4edd]/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <div className="relative flex items-start gap-4">
        <motion.div
          className={`bg-gradient-to-br ${config.bg} p-3 rounded-2xl shrink-0`}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          <Icon size={24} className="text-white" />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold">{personality.type}</h3>
            <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-white/70 font-bold border border-white/10">
              {personality.score}/100 Match
            </span>
          </div>
          
          <p className="text-white/80 text-sm leading-relaxed mb-2 italic">
            "{personality.coaching}"
          </p>
        </div>
        
        <ArrowRight size={20} className="text-[#9d4edd] shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}
