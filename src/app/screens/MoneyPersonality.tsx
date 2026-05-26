import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Share2, Zap, Heart, Brain, AlertTriangle, 
  Target, Sparkles, RefreshCw, Loader2, Quote, Lightbulb
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { useUserData } from "../../hooks/useUserData";
import { useTransactions } from "../../hooks/useTransactions";
import { usePersonalityStore } from "../../store/personalityStore";
import type { PersonalityType } from "../../types/personality";
import { shareDomElement } from "../../services/share/shareService";
import { toast } from "sonner";

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

export function MoneyPersonality() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: userData } = useUserData();
  const { transactions } = useTransactions();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const { 
    personality, loading, error, initialized, 
    fetchPersonality, generatePersonality 
  } = usePersonalityStore();

  useEffect(() => {
    if (user?.uid && !initialized && !loading) {
      fetchPersonality(user.uid);
    }
  }, [user?.uid, initialized, loading, fetchPersonality]);

  const handleGenerate = () => {
    if (user?.uid && userData && transactions.length > 0) {
      generatePersonality(user.uid, userData, transactions, true);
    }
  };

  const hasData = userData && transactions.length > 0;
  const config = getTypeConfig(personality?.type);
  const Icon = config.icon;

  const handleShare = async () => {
    if (!personality) return;
    setIsSharing(true);
    try {
      await shareDomElement(cardRef, `Spendr_${personality.type.replace(/\s+/g, "")}.png`, {
        title: `I'm a ${personality.type}!`,
        text: `My AI-analyzed Money Personality is ${personality.type}. ${personality.summary}`,
      });
    } catch (err) {
      toast.error("Could not generate share image.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen pb-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff3366]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#9d4edd]/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 pt-12 pb-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/home")}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          
          {personality && (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-gradient-to-r from-[#00d9ff]/20 to-[#00ff88]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#00d9ff]/30 flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {isSharing ? <Loader2 size={18} className="text-[#00d9ff] animate-spin" /> : <Share2 size={18} className="text-[#00d9ff]" />}
              <span className="text-white text-sm font-medium">Share</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl mb-6 text-white flex flex-col items-center gap-3 text-center"
            >
              <AlertTriangle className="text-red-400" />
              <p className="text-sm">{error}</p>
              <button 
                onClick={handleGenerate}
                className="bg-red-500/30 px-4 py-2 rounded-full text-xs font-bold"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {(!personality || loading) && !error ? (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              {loading ? (
                <>
                  <Loader2 size={48} className="text-[#ff3366] animate-spin mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">Analyzing Behavior...</h2>
                  <p className="text-white/60 text-sm max-w-[250px]">
                    Our AI is processing your transactions, emotional triggers, and savings patterns.
                  </p>
                </>
              ) : (
                <>
                  <Brain size={64} className="text-[#00d9ff] mb-6 opacity-50" />
                  <h2 className="text-2xl font-bold text-white mb-2">Discover Your Personality</h2>
                  <p className="text-white/60 text-sm max-w-[280px] mb-8">
                    Let Gemini analyze your spending habits to reveal your true Money Personality and get tailored coaching.
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={!hasData}
                    className="bg-gradient-to-r from-[#ff3366] to-[#9d4edd] text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles size={20} />
                    {hasData ? "Generate AI Analysis" : "Need more data..."}
                  </button>
                  {!hasData && (
                    <p className="text-white/40 text-xs mt-4">
                      Add some transactions and complete onboarding first.
                    </p>
                  )}
                </>
              )}
            </motion.div>
          ) : personality && !loading ? (
            <motion.div
              key="personality-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Hero Card */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-gradient-to-br ${config.bg.replace('from-', 'from-').replace('to-', 'to-')}/20 backdrop-blur-sm p-8 rounded-3xl border border-${config.color}/30 mb-6 relative overflow-hidden`}
              >
                <div className="relative text-center z-10">
                  <div className={`inline-block bg-gradient-to-br ${config.bg} p-5 rounded-3xl mb-4`}>
                    <Icon size={48} className="text-white" />
                  </div>
                  <h1 className={`text-4xl font-black bg-gradient-to-r ${config.bg} bg-clip-text text-transparent mb-2`}>
                    {personality.type}
                  </h1>
                  <p className="text-white/70 mb-4">{personality.summary}</p>
                  
                  <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${config.bg} px-5 py-3 rounded-full`}>
                    <Sparkles size={18} className="text-white" />
                    <div className="text-left">
                      <p className="text-white/80 text-xs">Personality Match</p>
                      <p className="text-white font-black text-xl">{personality.score}/100</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Motivational Advice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6 text-center italic relative"
              >
                <Quote className="absolute top-4 left-4 text-white/10" size={32} />
                <p className="text-white/90 relative z-10 text-lg font-medium px-4">
                  "{personality.motivationalAdvice}"
                </p>
              </motion.div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10"
                >
                  <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Heart size={20} className="text-[#00ff88]" /> Strengths
                  </h2>
                  <ul className="space-y-3">
                    {personality.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="bg-[#00ff88]/20 p-1 rounded-lg mt-0.5">
                          <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
                        </div>
                        <p className="text-white/80 text-sm">{str}</p>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10"
                >
                  <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-[#ff3366]" /> Areas to Watch
                  </h2>
                  <ul className="space-y-3">
                    {personality.weaknesses.map((wk, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="bg-[#ff3366]/20 p-1 rounded-lg mt-0.5">
                          <div className="w-1.5 h-1.5 bg-[#ff3366] rounded-full" />
                        </div>
                        <p className="text-white/80 text-sm">{wk}</p>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Emotional Triggers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6"
              >
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Brain size={20} className="text-[#ffd60a]" /> Emotional Triggers
                </h2>
                <div className="flex flex-wrap gap-2">
                  {personality.emotionalTriggers.map((trigger, i) => (
                    <span key={i} className="bg-[#ffd60a]/20 text-[#ffd60a] px-3 py-1.5 rounded-full text-xs font-medium border border-[#ffd60a]/30">
                      {trigger}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* AI Coaching & Savings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-[#00d9ff]/20 to-[#00ff88]/20 backdrop-blur-sm p-6 rounded-3xl border border-[#00d9ff]/30 mb-8"
              >
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Target size={20} className="text-[#00d9ff]" /> AI Coaching
                </h2>
                <p className="text-white/90 text-sm leading-relaxed mb-6">
                  {personality.coaching}
                </p>
                
                <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm">
                  <Lightbulb size={16} className="text-[#00ff88]" /> Opportunities
                </h3>
                <ul className="space-y-3">
                  {personality.savingsOpportunities.map((opp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="bg-[#00d9ff]/20 p-1 rounded-lg mt-0.5">
                        <div className="w-1.5 h-1.5 bg-[#00d9ff] rounded-full" />
                      </div>
                      <p className="text-white/80 text-sm">{opp}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <div className="flex justify-center pb-8">
                <button
                  onClick={handleGenerate}
                  className="text-white/50 text-xs flex items-center gap-2 hover:text-white transition-colors"
                >
                  <RefreshCw size={14} />
                  Recalculate Personality
                </button>
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
