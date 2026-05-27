import { motion } from "motion/react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import type { WeeklyReport } from "../../../types/weeklyReport";
import { useCurrency } from "../../../hooks/useCurrency";

interface WeeklyReportPreviewProps {
  report: WeeklyReport | null;
  isGenerating?: boolean;
  onGenerate?: () => void;
  transactionsCount?: number;
  className?: string;
}

export function WeeklyReportPreview({
  report,
  isGenerating,
  onGenerate,
  transactionsCount,
  className = "",
}: WeeklyReportPreviewProps) {
  const navigate = useNavigate();
  const { convertAndFormat } = useCurrency();

  if (!report) {
    const threshold = 5;
    const remaining = Math.max(0, threshold - (transactionsCount ?? 0));
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border border-border bg-gradient-to-br from-white/5 to-white/[0.02] p-6  overflow-hidden group cursor-pointer hover:border-white/20 transition-colors ${className}`}
        onClick={() => navigate("/weekly-report")}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#00d9ff]" />
            <h3 className="text-lg font-semibold text-white">Weekly Report</h3>
          </div>
          <ArrowRight size={20} className="text-white/60 group-hover:text-white transition-colors" />
        </div>
        <p className="text-sm text-white/60 mb-4">
          {transactionsCount === 0
            ? "Add your first transaction to see your weekly financial profile and starter insights."
            : `Add ${remaining} more transaction${remaining === 1 ? "" : "s"} to unlock deeper AI analysis.`}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onGenerate?.();
          }}
          disabled={isGenerating}
          className="w-full px-4 py-2 rounded-lg bg-card hover:bg-card transition-colors text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Now
            </>
          )}
        </button>
      </motion.div>
    );
  }

  const highlightWins = report.wins.slice(0, 2);
  const topRisk = report.riskyBehaviors[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate("/weekly-report")}
      className={`rounded-2xl border border-border bg-gradient-to-br from-white/5 to-white/[0.02] p-6  overflow-hidden group cursor-pointer hover:border-white/20 transition-colors ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#00d9ff]" />
            <h3 className="text-lg font-semibold text-white">Weekly Report</h3>
          </div>
          <p className="text-xs text-white/50">{report.periodLabel}</p>
        </div>
        <ArrowRight size={20} className="text-white/60 group-hover:text-white transition-colors" />
      </div>

      {/* Health Score */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1">
          <p className="text-xs text-white/60 mb-1">Financial Health</p>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88]"
              initial={{ width: 0 }}
              animate={{ width: `${report.healthScore.overallScore}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#00d9ff]">
            {Math.round(report.healthScore.overallScore)}
          </p>
          <p className="text-xs text-white/50">/100</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-border">
        <div>
          <p className="text-xs text-white/60">Income</p>
          <p className="text-[#00ff88] font-bold text-lg mt-1">
            {convertAndFormat(report.totalIncome)}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/60">Expenses</p>
          <p className="text-white font-bold text-lg mt-1">
            {convertAndFormat(report.totalExpenses)}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/60">Savings Rate</p>
          <p className="text-sm font-semibold text-[#00d9ff]">
            {report.savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Highlights */}
      {highlightWins.length > 0 && (
        <div className="mb-3 space-y-2">
          <p className="text-xs font-medium text-white/70">🎉 Highlights</p>
          {highlightWins.map((win: any, idx: number) => (
            <p key={idx} className="text-xs text-white/60 line-clamp-1">
              • {win.title}
            </p>
          ))}
        </div>
      )}

      {/* Risk Alert */}
      {topRisk && (
        <div className="p-2 rounded-lg bg-card border border-[#ff3366]/20">
          <p className="text-xs font-medium text-[#ff3366] mb-1">⚠️ Risky Behavior Detected</p>
          <p className="text-xs text-white/70 line-clamp-1">{topRisk.description}</p>
        </div>
      )}

      {/* Coaching Snippet */}
      {report.coachingMessage && (
        <p className="text-xs text-white/60 mt-4 line-clamp-2 italic">
          💭 "{report.coachingMessage.substring(0, 80)}..."
        </p>
      )}
    </motion.div>
  );
}
