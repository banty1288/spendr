import { useCallback } from "react";
import { motion } from "motion/react";
import {
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
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useGeminiInsights } from "../../hooks/useGeminiInsights";
import { AiError } from "../../services/ai/errors";
import { getActiveGeminiModelLabel } from "../../services/ai/config/index";
import { getInsightColor, getInsightIcon } from "../components/ai/insightIcons";
import { AiInsightSection } from "../components/ai/AiInsightSection";
import { PageShell } from "../components/ui/PageShell";
import { BackButton } from "../components/ui/BackButton";
import { EmptyState } from "../components/ui/EmptyState";
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
    <PageShell orbs={[{ color: "#9d4edd", position: "top-left" }, { color: "#00d9ff", position: "bottom-right" }]}>
      <div className="relative">
        <div className="px-4 sm:px-6 pt-12 pb-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <BackButton onClick={() => navigate("/home")} />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">AI Insights</h1>
              <p className="text-white/50 text-sm flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#9d4edd]" />
                {getActiveGeminiModelLabel()}
              </p>
            </div>
            {hasAnalysis && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => handleGenerate(true)}
                disabled={isLoading || !canRun}
                className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10 disabled:opacity-50 shrink-0"
                aria-label="Refresh insights"
              >
                <RefreshCw
                  size={18}
                  className={`text-[#9d4edd] ${isFetching ? "animate-spin" : ""}`}
                />
              </motion.button>
            )}
          </motion.div>

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
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={32} className="text-[#9d4edd]" />
              </motion.div>
              <p className="text-white/50 text-sm">Loading your data…</p>
            </div>
          )}

          {!hasAnalysis && !isLoading && !onboardingLoading && !txLoading && (
            <div className="mb-4">
              {isBlockedByOnboarding ? (
                <EmptyState
                  icon={<Brain size={36} />}
                  title="Complete your setup"
                  description="Finish onboarding to unlock AI-powered spending insights personalized to your goals."
                  action={{ label: "Finish Setup →", onClick: () => navigate("/setup") }}
                  accentColor="#9d4edd"
                />
              ) : isBlockedByTransactions ? (
                <EmptyState
                  icon={<Sparkles size={36} />}
                  title="Add transactions first"
                  description="Gemini needs your spending data to generate personalized financial insights."
                  action={{ label: "Add Transactions →", onClick: () => navigate("/transactions") }}
                  accentColor="#9d4edd"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-[#9d4edd]/15 to-[#00d9ff]/10 border border-[#9d4edd]/30 rounded-3xl p-8 mb-4 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="inline-flex p-4 bg-[#9d4edd]/20 rounded-3xl mb-5"
                  >
                    <Brain size={40} className="text-[#9d4edd]" />
                  </motion.div>
                  <h3 className="text-white font-bold text-lg mb-2">Ready for AI Analysis</h3>
                  <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">
                    Gemini will analyze your spending patterns and generate personalized insights.
                    No background calls — only when you ask.
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleGenerate(false)}
                    disabled={!canRun}
                    className="w-full bg-gradient-to-r from-[#9d4edd] to-[#00d9ff] text-white py-4 rounded-2xl font-bold disabled:opacity-50 shadow-lg shadow-[#9d4edd]/25"
                  >
                    Generate AI Insights
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 rounded-full border-2 border-[#9d4edd]/30 border-t-[#9d4edd]"
                />
                <Brain size={22} className="text-[#9d4edd] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm font-medium mb-1">Gemini is analyzing your spending</p>
                <p className="text-white/40 text-xs">This may take up to 45 seconds</p>
              </div>
            </motion.div>
          )}

          {isError && !isLoading && !showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#ff3366]/10 border border-[#ff3366]/30 rounded-3xl p-6 mb-4 text-center"
            >
              <div className="inline-flex p-3 bg-[#ff3366]/20 rounded-2xl mb-3">
                <AlertCircle size={24} className="text-[#ff3366]" />
              </div>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">{errorMessage}</p>
              {isBlockedByTransactions ? (
                <button
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="text-[#00d9ff] font-medium text-sm"
                >
                  Add transactions →
                </button>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleGenerate(true)}
                  disabled={!canRun}
                  className="bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  Try again
                </motion.button>
              )}
            </motion.div>
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
    </PageShell>
  );
}
