import { motion } from "motion/react";
import { Brain, AlertTriangle, TrendingUp, Sparkles, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import type { SpendrAIAnalysis } from "../../../services/ai/types";
import type { EmotionalSpendingInsights } from "../../../types/emotionalInsight";

interface AIInsightsCarouselProps {
  analysis: SpendrAIAnalysis | null | undefined;
  emotionalInsights: EmotionalSpendingInsights | null | undefined;
  isLoading: boolean;
}

export function AIInsightsCarousel({ analysis, emotionalInsights, isLoading }: AIInsightsCarouselProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-4 px-1">AI Insights</h3>
        <div className="flex gap-4 overflow-x-hidden">
          {[1, 2].map(i => (
            <div key={i} className="min-w-[280px] bg-card shadow-sm  p-5 rounded-3xl border border-border animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="h-4 w-24 bg-white/10 rounded-full" />
              </div>
              <div className="h-4 w-full bg-white/10 rounded-full mb-2" />
              <div className="h-4 w-3/4 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback if no AI data
  if (!analysis && !emotionalInsights) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate("/insights")}
        className="bg-card shadow-sm  p-6 rounded-3xl border border-dashed border-white/20 mb-6 cursor-pointer text-center group"
      >
        <Brain className="mx-auto text-[#00ff88] mb-3 opacity-50 group-hover:scale-110 transition-transform" size={32} />
        <h3 className="text-white font-medium mb-1">Unlock AI Insights</h3>
        <p className="text-white/50 text-xs">Analyze your spending patterns with AI</p>
      </motion.div>
    );
  }

  const cards: any[] = [];

  // Emotional Warnings
  // Gemini Insight Cards
  if (analysis?.financialInsights?.cards) {
    analysis.financialInsights.cards.slice(0, 3).forEach((c, idx) => {
      let icon = <Sparkles className="text-[#00d9ff]" size={20} />;
      let color = "#00d9ff";
      let bg = "from-card to-transparent";
      let borderColor = "border-[#00d9ff]/30";

      if (c.type === "strength") {
        icon = <TrendingUp className="text-[#00ff88]" size={20} />;
        color = "#00ff88";
        bg = "from-card to-transparent";
        borderColor = "border-[#00ff88]/30";
      } else if (c.type === "weakness") {
        icon = <Zap className="text-[#ffd60a]" size={20} />;
        color = "#ffd60a";
        bg = "from-card to-transparent";
        borderColor = "border-[#ffd60a]/30";
      }

      cards.push({
        id: `gemini-${idx}`,
        icon,
        title: c.title,
        color,
        content: c.description,
        bg,
        borderColor,
      });
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Brain size={18} className="text-[#c77dff]" />
          Smart Insights
        </h3>
        <button onClick={() => navigate("/insights")} className="text-white/50 text-xs flex items-center hover:text-white transition-colors">
          View all <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.1 }}
            onClick={() => navigate("/insights")}
            className={`min-w-[280px] max-w-[280px] snap-center bg-gradient-to-br ${card.bg}  p-5 rounded-3xl border ${card.borderColor} cursor-pointer group hover:bg-card shadow-sm transition-colors relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-card shadow-sm rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
            <div className="flex items-center gap-3 mb-3 relative">
              <div className="bg-white/10 p-2 rounded-xl  border border-white/5">
                {card.icon}
              </div>
              <h4 className="text-white font-medium text-sm">{card.title}</h4>
            </div>
            <p className="text-white/80 text-sm leading-relaxed relative">
              {card.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
