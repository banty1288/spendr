import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Zap, Plus, Loader2 } from "lucide-react";
import type { ChallengeRecommendation } from "../../../types/challenge";

interface ChallengeRecommendationsProps {
  recommendations: ChallengeRecommendation[];
  isGenerating: boolean;
  onGenerate: () => void;
  onAccept: (rec: ChallengeRecommendation) => void;
  isAccepting: boolean;
}

export function ChallengeRecommendations({
  recommendations,
  isGenerating,
  onGenerate,
  onAccept,
  isAccepting,
}: ChallengeRecommendationsProps) {
  if (isGenerating) {
    return (
      <div className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 text-center">
        <Loader2 size={32} className="text-[#00d9ff] animate-spin mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">Analyzing your spending...</h3>
        <p className="text-white/60 text-sm">
          Spendr AI is designing personalized challenges just for you.
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#00d9ff]/10 to-[#00ff88]/10 backdrop-blur-sm p-6 rounded-3xl border border-[#00d9ff]/20 flex flex-col items-center text-center">
        <div className="bg-gradient-to-br from-[#00d9ff] to-[#00ff88] p-4 rounded-full mb-4">
          <Sparkles size={28} className="text-black" />
        </div>
        <h3 className="text-white font-semibold mb-2">Ready for a challenge?</h3>
        <p className="text-white/60 text-sm mb-6">
          Generate AI-powered challenges based on your unique spending habits and goals.
        </p>
        <button
          onClick={onGenerate}
          className="bg-white text-black font-semibold px-6 py-3 rounded-2xl hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Sparkles size={18} />
          Generate Challenges
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Sparkles size={18} className="text-[#00d9ff]" />
          AI Recommendations
        </h3>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="text-[#00d9ff] text-sm font-semibold hover:underline"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-[#00d9ff]/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d9ff]/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{rec.title}</h4>
                    <span className="inline-block bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                      {rec.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#ffd60a]/20 px-2 py-1 rounded-full shrink-0">
                    <Zap size={14} className="text-[#ffd60a]" />
                    <span className="text-[#ffd60a] text-xs font-bold">+{rec.rewardXp}</span>
                  </div>
                </div>
                
                <p className="text-white/80 text-sm mb-3">
                  {rec.description}
                </p>
                <div className="bg-background/20 rounded-xl p-3 mb-4">
                  <p className="text-[#00d9ff] text-xs font-medium flex items-start gap-2">
                    <Sparkles size={14} className="shrink-0 mt-0.5" />
                    <span>{rec.reasoning}</span>
                  </p>
                </div>

                <button
                  onClick={() => onAccept(rec)}
                  disabled={isAccepting}
                  className="w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-semibold py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Plus size={18} />
                  Accept Challenge
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
