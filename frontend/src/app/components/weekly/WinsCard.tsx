import { useRef, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, Zap, Target, Trophy, Share2, Loader2 } from "lucide-react";
import type { FinancialWin } from "../../../types/weeklyReport";
import { useCurrency } from "../../../hooks/useCurrency";
import { shareDomElement } from "../../../services/share/shareService";
import { toast } from "sonner";

interface WinsCardProps {
  wins: FinancialWin[];
  className?: string;
}

const impactIcons: Record<string, React.ReactNode> = {
  savings: <Trophy size={18} className="text-[#ffd60a]" />,
  discipline: <Target size={18} className="text-[#00d9ff]" />,
  consistency: <TrendingUp size={18} className="text-[#00ff88]" />,
};

export function WinsCard({ wins, className = "" }: WinsCardProps) {
  const { convertAndFormat } = useCurrency();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (wins.length === 0) {
    return null;
  }

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareDomElement(cardRef, `Spendr_Wins.png`, {
        title: "My Financial Wins!",
        text: "Check out my financial wins this week on Spendr!",
      });
    } catch (err) {
      toast.error("Could not generate share image.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-border bg-gradient-to-br from-white/5 to-white/[0.02] p-6  relative ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-[#ffd60a]" />
          <h3 className="text-lg font-semibold text-white">Financial Wins</h3>
        </div>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="bg-card shadow-sm p-2 rounded-full border border-border hover:bg-white/10 transition-colors disabled:opacity-50 no-print"
          title="Share Wins"
        >
          {isSharing ? <Loader2 size={16} className="text-[#ffd60a] animate-spin" /> : <Share2 size={16} className="text-[#ffd60a]" />}
        </button>
      </div>

      <div className="space-y-3">
        {wins.map((win, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-lg border border-border bg-white/[0.03] p-4  hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {impactIcons[win.impact] || <Zap size={18} className="text-[#00d9ff]" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{win.title}</p>
                <p className="text-xs text-white/60 mt-1">{win.description}</p>
                {win.amount && (
                  <p className="text-xs font-medium text-[#00ff88] mt-2">
                    +{convertAndFormat(win.amount)} saved
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
