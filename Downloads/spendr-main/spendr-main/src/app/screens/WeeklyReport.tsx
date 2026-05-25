import { useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import { HealthScoreWidget } from "../components/weekly/HealthScoreWidget";
import { CategoryBreakdown } from "../components/weekly/CategoryBreakdown";
import { WinsCard } from "../components/weekly/WinsCard";
import { RiskyBehaviorsCard } from "../components/weekly/RiskyBehaviorsCard";
import { CoachingInsightsCard } from "../components/weekly/CoachingInsightsCard";
import { ImprovementGoalsCard } from "../components/weekly/ImprovementGoalsCard";
import { TrendsSummaryCard } from "../components/weekly/TrendsSummaryCard";
import { SavingsProgressCard } from "../components/weekly/SavingsProgressCard";
import { WeeklyReportSkeleton } from "../components/weekly/WeeklyReportSkeleton";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { AiError } from "../../services/ai/errors";
import { formatCurrency } from "../../lib/userDisplay";

export function WeeklyReport() {
  const navigate = useNavigate();
  const {
    latestReport,
    isLoading,
    isGenerating,
    error,
    canGenerate,
    isBlockedByOnboarding,
    isBlockedByTransactions,
    generateReport,
  } = useWeeklyReport();

  const handleGenerate = useCallback(
    async (force = false) => {
      if (isGenerating) return;
      try {
        await generateReport(force);
        toast.success(force ? "Report refreshed" : "Report generated successfully");
      } catch (err) {
        const message =
          err instanceof AiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not generate report.";
        toast.error(message);
      }
    },
    [generateReport, isGenerating]
  );

  const errorMessage = error
    ? error instanceof AiError
      ? error.message
      : error.message
    : null;

  if (isLoading || (!latestReport && isGenerating)) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#9d4edd]/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00d9ff]/30 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <WeeklyReportSkeleton />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (errorMessage && !latestReport) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#9d4edd]/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00d9ff]/30 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="px-6 pt-12 pb-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">Weekly Report</h1>
            </div>
          </div>

          <div className="px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#ff3366]/20 bg-gradient-to-br from-[#ff3366]/5 to-white/[0.02] p-6 backdrop-blur-xl"
            >
              <div className="flex items-start gap-4">
                <AlertCircle size={24} className="text-[#ff3366] flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Unable to Generate Report</h2>
                  <p className="text-sm text-white/80 mb-4">{errorMessage}</p>
                  {isBlockedByOnboarding && (
                    <p className="text-xs text-white/60 mb-4">
                      Complete onboarding before generating reports.
                    </p>
                  )}
                  {isBlockedByTransactions && (
                    <p className="text-xs text-white/60 mb-4">
                      Add at least one transaction to generate a report.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/home")}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
                    >
                      Back to Home
                    </button>
                    {!isBlockedByOnboarding && !isBlockedByTransactions && (
                      <button
                        type="button"
                        onClick={() => handleGenerate(true)}
                        className="px-4 py-2 rounded-lg bg-[#00d9ff]/20 hover:bg-[#00d9ff]/30 transition-colors text-white text-sm font-medium flex items-center gap-2"
                      >
                        <RefreshCw size={16} />
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!latestReport) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#9d4edd]/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00d9ff]/30 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="px-6 pt-12 pb-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">Weekly Report</h1>
            </div>
          </div>

          <div className="px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-xl text-center"
            >
              <div className="mb-4 text-4xl">📊</div>
              <h2 className="text-lg font-semibold text-white mb-2">No Report Generated Yet</h2>
              <p className="text-sm text-white/60 mb-6">
                Generate your first weekly financial report to see insights about your spending patterns.
              </p>
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={!canGenerate || isGenerating}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-semibold hover:shadow-lg hover:shadow-[#00d9ff]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 mx-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Report
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#9d4edd]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00d9ff]/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 pt-12 pb-6 sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Weekly Report</h1>
                <p className="text-xs text-white/50">{latestReport.periodLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <RefreshCw size={20} className="text-white" />
              )}
            </button>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-lg bg-white/5 p-3 border border-white/10"
            >
              <p className="text-xs text-white/60">Income</p>
              <p className="text-lg font-bold text-[#00ff88]">
                {formatCurrency(latestReport.totalIncome)}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg bg-white/5 p-3 border border-white/10"
            >
              <p className="text-xs text-white/60">Expenses</p>
              <p className="text-lg font-bold text-white">{formatCurrency(latestReport.totalExpenses)}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg bg-white/5 p-3 border border-white/10"
            >
              <p className="text-xs text-white/60">Net Flow</p>
              <p className={`text-lg font-bold ${latestReport.netCashFlow >= 0 ? "text-[#00ff88]" : "text-[#ff3366]"}`}>
                {formatCurrency(latestReport.netCashFlow)}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 space-y-6 mt-6">
          {/* Health Score */}
          <HealthScoreWidget healthScore={latestReport.healthScore} />

          {/* Category Breakdown */}
          <CategoryBreakdown
            categories={latestReport.categoryBreakdown}
            totalExpenses={latestReport.totalExpenses}
          />

          {/* Wins */}
          <WinsCard wins={latestReport.wins} />

          {/* Risky Behaviors */}
          <RiskyBehaviorsCard behaviors={latestReport.riskyBehaviors} />

          {/* Trends */}
          <TrendsSummaryCard
            trends={latestReport.weeklyTrends}
            summary={latestReport.trendSummary}
          />

          {/* Savings Progress */}
          {latestReport.savingsProgress.length > 0 && (
            <SavingsProgressCard
              savingsGoals={latestReport.savingsProgress}
              savingsRate={latestReport.savingsRate}
            />
          )}

          {/* Coaching */}
          <CoachingInsightsCard
            insights={latestReport.coachingInsights}
            message={latestReport.coachingMessage}
          />

          {/* Improvement Goals */}
          <ImprovementGoalsCard goals={latestReport.improvementGoals} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
