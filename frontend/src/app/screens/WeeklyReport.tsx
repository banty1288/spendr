import { useCallback, useRef, useState } from "react";
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
import { useTransactions } from "../../hooks/useTransactions";
import { AiError } from "../../services/ai/errors";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { generatePdfFromDom } from "../../services/pdf/pdfGenerator";

export function WeeklyReport() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { transactions, isLoading: isTxLoading } = useTransactions();
  const { convertAndFormat } = useCurrency();
  const {
    latestReport,
    isLoading,
    isDataLoading,
    isGenerating,
    error,
    canGenerate,
    hasMinimalData,
    hasGoodData,
    isBlockedByOnboarding,
    isBlockedByTransactions,
    generateReport,
  } = useWeeklyReport();
  
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!latestReport) return;
    setIsExporting(true);
    try {
      if (reportRef.current) {
        reportRef.current.style.width = "800px";
      }
      await generatePdfFromDom(reportRef, `Spendr_WeeklyReport_${latestReport.periodLabel.replace(/\s+/g, "")}.pdf`);
      toast.success("PDF Exported successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      if (reportRef.current) {
        reportRef.current.style.width = "";
      }
      setIsExporting(false);
    }
  };

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

  if (isLoading || isDataLoading || (!latestReport && isGenerating)) {
    return (
      <div className="min-h-screen pb-safe-nav relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">


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
      <div className="min-h-screen pb-safe-nav relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">


        </div>

        <div className="relative z-10">
          <div className="px-4 sm:px-6 pt-12 pb-36 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="bg-card shadow-sm  p-3 rounded-full border border-border"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">{t("weeklyReport.title", "Weekly Report")}</h1>
            </div>
          </div>

          <div className="px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#ff3366]/20 bg-gradient-to-br from-card to-white/[0.02] p-6 "
            >
              <div className="flex items-start gap-4">
                <AlertCircle size={24} className="text-[#ff3366] flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Unable to Generate Report</h2>
                  <p className="text-sm text-white/80 mb-4">{errorMessage}</p>
                  
                  {isBlockedByOnboarding && (
                    <div className="mb-4 p-3 rounded-lg bg-card shadow-sm border border-border">
                      <p className="text-xs text-white/70">
                        ✨ Complete your onboarding profile to unlock AI-powered financial insights.
                      </p>
                    </div>
                  )}
                  
                  {isBlockedByTransactions && (
                    <div className="mb-4 p-3 rounded-lg bg-card shadow-sm border border-border">
                      <p className="text-xs text-white/70 mb-2">
                        📝 Add your first transaction to get started with weekly reports.
                      </p>
                      <p className="text-xs text-white/50">
                        Pro tip: Log 5+ transactions to unlock detailed AI analysis.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/home")}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
                    >
                      Back to Home
                    </button>
                    {!isBlockedByOnboarding && !isBlockedByTransactions && canGenerate && (
                      <button
                        type="button"
                        onClick={() => handleGenerate(true)}
                        className="px-4 py-2 rounded-lg bg-card hover:bg-card transition-colors text-white text-sm font-medium flex items-center gap-2"
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
      <div className="min-h-screen pb-safe-nav relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">


        </div>

        <div className="relative z-10">
          <div className="px-4 sm:px-6 pt-12 pb-36 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="bg-card shadow-sm  p-3 rounded-full border border-border"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">{t("weeklyReport.title", "Weekly Report")}</h1>
            </div>
          </div>

          <div className="px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-gradient-to-br from-white/5 to-white/[0.02] p-8  text-center space-y-6"
            >
              <div className="text-5xl">📊</div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Your Weekly Financial Report</h2>
                <p className="text-sm text-white/60">
                  {isBlockedByOnboarding
                    ? "Complete your onboarding to get AI-powered insights"
                    : hasGoodData
                      ? "Generate detailed AI analysis with advanced spending patterns"
                      : hasMinimalData
                        ? "Start building your financial profile with your transactions"
                        : "Add transactions to unlock personalized financial insights"}
                </p>
              </div>

              {hasMinimalData && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-card border border-[#9d4edd]/20">
                    <p className="text-xs text-white/80">
                      💡 <span className="font-semibold">Getting Started:</span> You have {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  {!hasGoodData && (
                    <div className="p-3 rounded-lg bg-card border border-[#00d9ff]/20">
                      <p className="text-xs text-white/80">
                        📝 <span className="font-semibold">Tip:</span> Add {5 - transactions.length} more transactions to unlock full AI analysis
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={!canGenerate || isGenerating || isDataLoading}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-semibold hover:shadow-lg hover:shadow-[#00d9ff]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : isDataLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Loading data...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {hasGoodData ? t("weeklyReport.generate", "Generate AI Report") : t("weeklyReport.generate", "Generate Starter Report")}
                  </>
                )}
              </button>

              {!canGenerate && (
                <button
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="w-full px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} className="rotate-180" />
                  Add Transactions
                </button>
              )}
            </motion.div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-safe-nav relative overflow-hidden" ref={reportRef}>
      <div className="absolute inset-0 opacity-20">


      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 pt-12 pb-6 sticky top-0 z-50  bg-background/30 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="bg-card shadow-sm  p-3 rounded-full border border-border hover:bg-white/10 transition-colors no-print"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{t("weeklyReport.title", "Weekly Report")}</h1>
                <p className="text-xs text-white/50">{latestReport.periodLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting || isGenerating}
                className="bg-card shadow-sm  p-3 rounded-full border border-border hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Download size={20} className="text-[#00d9ff]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={isGenerating || isExporting}
                className="bg-card shadow-sm  p-3 rounded-full border border-border hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <RefreshCw size={20} className="text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-lg bg-card shadow-sm p-3 border border-border"
            >
              <p className="text-xs text-white/60">Income</p>
              <p className="text-lg font-bold text-[#00ff88]">
                {convertAndFormat(latestReport.totalIncome)}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg bg-card shadow-sm p-3 border border-border"
            >
              <p className="text-xs text-white/60">Expenses</p>
              <p className="text-lg font-bold text-white">{convertAndFormat(latestReport.totalExpenses)}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg bg-card shadow-sm p-3 border border-border"
            >
              <p className="text-xs text-white/60">Net Flow</p>
              <p className={`text-lg font-bold ${latestReport.netCashFlow >= 0 ? "text-[#00ff88]" : "text-[#ff3366]"}`}>
                {convertAndFormat(latestReport.netCashFlow)}
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
