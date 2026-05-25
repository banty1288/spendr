import { useCallback } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Brain,
  AlertCircle,
  Lightbulb,
  Target,
  Loader2,
  RefreshCw,
  Sparkles,
  PiggyBank,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useGeminiInsights } from "../../hooks/useGeminiInsights";
import { AiError } from "../../services/ai/errors";
import { getActiveGeminiModelLabel } from "../../services/ai/config/index";
import { getInsightColor, getInsightIcon } from "../components/ai/insightIcons";
import { AiInsightSection } from "../components/ai/AiInsightSection";
export function AIInsights() {
  const navigate = useNavigate();
  const {
    analysis,
    isLoading,
    isFetching,
    isError,
    error,
    isStale,
    hasAnalysis,
    canRun,
    isBlockedByOnboarding,
    isBlockedByTransactions,
    onboardingLoading,
    txLoading,
    runAnalysis,
  } = useGeminiInsights();

  const handleGenerate = useCallback(
    async (force = false) => {
      if (isLoading) return;
      try {
        await runAnalysis({ force });
        toast.success(force ? "Insights refreshed" : "AI analysis complete");
      } catch (err) {
        const message =
          err instanceof AiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Could not generate insights.";
        toast.error(message);
      }
    },
    [runAnalysis, isLoading]
  );

  const errorMessage =
    error instanceof AiError
      ? error.code === "QUOTA"
        ? `${error.message}${import.meta.env.DEV ? " Try again later or use the preview below." : ""}`
        : error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong.";

  const cards = analysis?.financialInsights.cards ?? [];
  const hero = analysis?.financialInsights;
  const showResults = hasAnalysis && !isLoading;

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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">AI Insights</h1>
              <p className="text-white/60 text-sm flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#00d9ff]" />
                {getActiveGeminiModelLabel()}
              </p>
            </div>
            {hasAnalysis && (
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={isLoading || !canRun}
                className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10 disabled:opacity-50"
                aria-label="Refresh insights"
              >
                <RefreshCw
                  size={18}
                  className={`text-[#00d9ff] ${isFetching ? "animate-spin" : ""}`}
                />
              </button>
            )}
          </div>

          {isStale && hasAnalysis && !isLoading && (
            <div className="bg-[#ffd60a]/10 border border-[#ffd60a]/30 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
              <p className="text-white/80 text-xs flex-1">
                Transactions changed — refresh analysis for updated insights.
              </p>
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                className="text-[#ffd60a] text-xs font-semibold shrink-0"
              >
                Refresh
              </button>
            </div>
          )}

          {(onboardingLoading || txLoading) && !hasAnalysis && (
            <div className="flex items-center justify-center gap-2 py-8 text-white/50 text-sm">
              <Loader2 size={18} className="animate-spin text-[#00d9ff]" />
              Loading your data…
            </div>
          )}

          {!hasAnalysis && !isLoading && !onboardingLoading && !txLoading && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 text-center">
              <Brain className="w-10 h-10 text-[#9d4edd] mx-auto mb-3" />
              {isBlockedByOnboarding ? (
                <>
                  <p className="text-white/80 text-sm mb-4">
                    Complete onboarding to unlock AI insights.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/setup")}
                    className="text-[#00d9ff] font-medium text-sm"
                  >
                    Finish setup →
                  </button>
                </>
              ) : isBlockedByTransactions ? (
                <>
                  <p className="text-white/80 text-sm mb-4">
                    Add transactions so Gemini can analyze your spending.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/transactions")}
                    className="text-[#00d9ff] font-medium text-sm"
                  >
                    Add transactions →
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/80 text-sm mb-4">
                    Tap below to analyze your spending. Requests run only when
                    you ask — no background calls.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerate(false)}
                    disabled={!canRun}
                    className="w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black py-3.5 rounded-2xl font-semibold disabled:opacity-50"
                  >
                    Generate AI insights
                  </button>
                </>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 text-[#9d4edd] animate-spin" />
              <p className="text-white/60 text-sm text-center max-w-xs">
                Gemini is analyzing your spending patterns…
              </p>
              <p className="text-white/40 text-xs">This may take up to 45 seconds</p>
            </div>
          )}

          {isError && !isLoading && !showResults && (
            <div className="bg-[#ff3366]/10 border border-[#ff3366]/30 rounded-3xl p-6 mb-6 text-center">
              <AlertCircle className="w-8 h-8 text-[#ff3366] mx-auto mb-3" />
              <p className="text-white/90 text-sm mb-4">{errorMessage}</p>
              {isBlockedByTransactions ? (
                <button
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="text-[#00d9ff] font-medium text-sm"
                >
                  Add transactions →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  disabled={!canRun}
                  className="bg-white/10 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#9d4edd]/20 to-[#c77dff]/20 backdrop-blur-sm p-6 rounded-3xl border border-[#9d4edd]/30 mb-6 relative overflow-hidden"
            >
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-[#9d4edd] to-[#c77dff] p-3 rounded-2xl">
                    <Brain size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      AI Behavioral Analysis
                    </h3>
                    <p className="text-white/60 text-xs mt-1">
                      Analysis ready · {getActiveGeminiModelLabel()}
                    </p>
                  </div>
                </div>
                <p className="text-white/90 leading-relaxed mb-3 text-sm">
                  {hero?.summary}
                </p>
                <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-white/50 text-xs">Financial Health</p>
                    <p className="text-[#00ff88] font-black text-2xl">
                      {hero?.healthScore ?? "—"}/100
                    </p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Discipline</span>
                      <span className="text-white font-semibold">
                        {hero?.disciplinePercent ?? 0}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${hero?.disciplinePercent ?? 0}%` }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="h-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {showResults && (
          <>
            <div className="px-6 space-y-4">
              {cards.map((insight, index) => {
                const Icon = getInsightIcon(insight.type);
                const color = getInsightColor(insight.type);
                return (
                  <motion.div
                    key={`${insight.type}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-2xl shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon size={24} style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-white font-bold">{insight.title}</h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                            style={{
                              backgroundColor: `${color}20`,
                              color,
                            }}
                          >
                            {insight.type}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed mb-3">
                          {insight.description}
                        </p>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `${color}15`,
                            color,
                          }}
                        >
                          {insight.metric}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="px-6 mt-2">
              <AiInsightSection title="Spending analysis" accent="#00d9ff" delay={0.2}>
                <p className="text-white/80 text-sm leading-relaxed mb-2">
                  {analysis!.spendingAnalysis.summary}
                </p>
                <p className="text-white/50 text-xs">
                  {analysis!.spendingAnalysis.trends}
                </p>
              </AiInsightSection>

              <AiInsightSection title="Emotional spending" accent="#9d4edd" delay={0.25}>
                <p className="text-white/80 text-sm leading-relaxed mb-3">
                  {analysis!.emotionalSpending.summary}
                </p>
                <p className="text-white/50 text-xs mb-2">
                  {analysis!.emotionalSpending.patterns}
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis!.emotionalSpending.triggers.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-[#9d4edd]/20 text-[#c77dff] text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </AiInsightSection>

              <AiInsightSection title="Savings recommendations" accent="#00ff88" delay={0.3}>
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank size={18} className="text-[#00ff88]" />
                  <p className="text-white font-medium text-sm">
                    {analysis!.savingsRecommendations.headline}
                  </p>
                </div>
                <ul className="space-y-2">
                  {analysis!.savingsRecommendations.recommendations.map((r, i) => (
                    <li key={i} className="text-white/75 text-sm flex gap-2">
                      <Lightbulb size={14} className="text-[#00ff88] shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </AiInsightSection>

              <AiInsightSection
                title={analysis!.weeklySummary.periodLabel}
                accent="#ffd60a"
                delay={0.35}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-[#ffd60a]" />
                  <span className="text-white/60 text-xs">Weekly summary</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-3">
                  {analysis!.weeklySummary.summary}
                </p>
                <ul className="space-y-1">
                  {analysis!.weeklySummary.highlights.map((h, i) => (
                    <li key={i} className="text-white/60 text-xs">
                      • {h}
                    </li>
                  ))}
                </ul>
              </AiInsightSection>

              <AiInsightSection title="AI financial coaching" accent="#00d9ff" delay={0.4}>
                <div className="flex items-start gap-3">
                  <MessageCircle size={20} className="text-[#00d9ff] shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">
                      {analysis!.coaching.title}
                    </p>
                    <p className="text-white/80 text-sm leading-relaxed mb-3">
                      {analysis!.coaching.message}
                    </p>
                    <p className="text-[#00d9ff] text-xs font-medium">
                      Next step: {analysis!.coaching.actionStep}
                    </p>
                  </div>
                </div>
              </AiInsightSection>
            </div>

            <div className="px-6 mt-6 space-y-3">
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={isLoading || !canRun}
                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-2xl font-medium text-sm disabled:opacity-50"
              >
                Regenerate analysis
              </button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate("/personality")}
                className="w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#00d9ff]/20"
              >
                <Target size={20} />
                <span>View Your Money Personality</span>
              </motion.button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
