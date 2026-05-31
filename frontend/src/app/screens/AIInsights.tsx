import { useCallback, Suspense, lazy } from "react";
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
import { format } from "date-fns";
import { toast } from "sonner";
import { useGeminiInsights } from "../../hooks/useGeminiInsights";
import { useTransactionAnalytics } from "../../hooks/useTransactions";
import { AiError } from "../../services/ai/errors";
import { getActiveGeminiModelLabel } from "../../services/ai/config/index";
import { getInsightColor, getInsightIcon } from "../components/ai/insightIcons";
import { AiInsightSection } from "../components/ai/AiInsightSection";
import { PageShell } from "../components/ui/PageShell";
import { BackButton } from "../components/ui/BackButton";
import { EmptyState } from "../components/ui/EmptyState";

const SpendingTrendWidget = lazy(() => import("../components/home/SpendingTrendWidget").then(m => ({ default: m.SpendingTrendWidget })));

export function AIInsights() {
  const navigate = useNavigate();
  
  const monthKey = format(new Date(), "yyyy-MM");
  const { breakdown, monthly: monthlyTrendData, isLoading: isTrendLoading } = useTransactionAnalytics(monthKey);
  const totalSpending = breakdown.reduce((acc, item) => acc + item.value, 0);

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
    <PageShell orbs={[{ color: "var(--primary)", position: "top-left" }, { color: "var(--accent)", position: "bottom-right" }]}>
      <div className="relative">
        <div className="px-4 sm:px-6 pt-12 pb-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <BackButton onClick={() => navigate("/home")} />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-foreground">AI Insights</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
                <Sparkles size={12} className="text-primary" />
                {getActiveGeminiModelLabel()} Powered
              </p>
            </div>
            {hasAnalysis && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => handleGenerate(true)}
                disabled={isLoading || !canRun}
                className="bg-card shadow-sm p-3 rounded-full border border-border disabled:opacity-50 shrink-0"
                aria-label="Refresh insights"
              >
                <RefreshCw
                  size={18}
                  className={`text-primary ${isFetching ? "animate-spin" : ""}`}
                />
              </motion.button>
            )}
          </motion.div>

          <div className="mb-8">
            <Suspense fallback={<div className="h-64 bg-card rounded-3xl border border-border animate-pulse" />}>
              <SpendingTrendWidget monthlyData={monthlyTrendData} totalSpending={totalSpending} isLoading={isTrendLoading} />
            </Suspense>
          </div>

          {isStale && hasAnalysis && !isLoading && (
            <div className="bg-card border border-primary/30 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between gap-3 shadow-lg">
              <p className="text-foreground/80 text-xs flex-1">
                Transactions changed — refresh analysis for updated insights.
              </p>
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                className="text-primary text-xs font-bold shrink-0"
              >
                Refresh
              </button>
            </div>
          )}

          {(onboardingLoading || txLoading) && !hasAnalysis && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="animate-spin">
                <Loader2 size={32} className="text-primary" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Analyzing your finances…</p>
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
                  accentColor="var(--primary)"
                />
              ) : isBlockedByTransactions ? (
                <EmptyState
                  icon={<Sparkles size={36} />}
                  title="Add transactions first"
                  description="Finny needs your spending data to generate personalized financial insights."
                  action={{ label: "Add Transactions →", onClick: () => navigate("/transactions") }}
                  accentColor="var(--primary)"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-primary/30 rounded-3xl p-8 mb-4 text-center shadow-[0_10px_40px_rgba(0,212,255,0.1)]"
                >
                  <div
                    className="inline-flex p-4 bg-primary/10 rounded-3xl mb-5 animate-pulse"
                  >
                    <Brain size={40} className="text-primary" />
                  </div>
                  <h3 className="text-foreground font-black text-xl mb-2">Ready for AI Analysis</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                    Finny will analyze your spending patterns and generate personalized insights.
                    No background calls — only when you ask.
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleGenerate(false)}
                    disabled={!canRun}
                    className="w-full bg-gradient-to-r from-primary to-accent text-background py-4 rounded-2xl font-black disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
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
                <div
                  className="w-16 h-16 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"
                />
                <Brain size={24} className="text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-foreground text-sm font-bold mb-1">Finny is analyzing your spending</p>
                <p className="text-muted-foreground text-xs">This may take up to 45 seconds</p>
              </div>
            </motion.div>
          )}

          {isError && !isLoading && !showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-destructive/30 rounded-3xl p-6 mb-4 text-center shadow-lg"
            >
              <div className="inline-flex p-3 bg-destructive/10 rounded-2xl mb-3">
                <AlertCircle size={24} className="text-destructive" />
              </div>
              <p className="text-foreground/90 text-sm mb-4 leading-relaxed font-medium">{errorMessage}</p>
              {isBlockedByTransactions ? (
                <button
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="text-primary font-bold text-sm"
                >
                  Add transactions →
                </button>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleGenerate(true)}
                  disabled={!canRun}
                  className="bg-muted hover:bg-muted/80 px-5 py-2.5 rounded-xl text-foreground text-sm font-bold disabled:opacity-50 transition-colors"
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
              className="bg-card p-6 rounded-3xl border border-primary/30 mb-8 relative overflow-hidden shadow-[0_10px_30px_rgba(0,212,255,0.1)]"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl">
                    <Brain size={28} className="text-background" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-black text-lg">
                      AI Behavioral Analysis
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1 font-medium">
                      Analysis ready · {getActiveGeminiModelLabel()}
                    </p>
                  </div>
                </div>
                <p className="text-foreground/90 leading-relaxed mb-4 text-sm font-medium">
                  {hero?.summary}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold mb-1">Financial Health</p>
                    <p className="text-accent font-black text-3xl drop-shadow-[0_0_8px_rgba(0,255,153,0.4)]">
                      {hero?.healthScore ?? "—"}/100
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5 ml-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Discipline</span>
                      <span className="text-foreground font-bold">
                        {hero?.disciplinePercent ?? 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${hero?.disciplinePercent ?? 0}%` }}
                        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-accent"
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
            <div className="px-6 space-y-4 mb-8">
              {cards.map((insight, index) => {
                const Icon = getInsightIcon(insight.type);
                const color = getInsightColor(insight.type);
                return (
                  <motion.div
                    key={`${insight.type}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-card shadow-sm p-5 rounded-3xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-2xl shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon size={24} style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-foreground font-bold">{insight.title}</h3>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${color}15`,
                              color,
                            }}
                          >
                            {insight.type}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {insight.description}
                        </p>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm"
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

            <div className="px-6 mt-2 space-y-4">
              <AiInsightSection title="Spending analysis" accent="var(--primary)" delay={0.2}>
                <p className="text-foreground/90 text-sm leading-relaxed mb-2 font-medium">
                  {analysis!.spendingAnalysis.summary}
                </p>
                <p className="text-muted-foreground text-xs">
                  {analysis!.spendingAnalysis.trends}
                </p>
              </AiInsightSection>

              <AiInsightSection title="Emotional spending" accent="#8B5CF6" delay={0.25}>
                <p className="text-foreground/90 text-sm leading-relaxed mb-3 font-medium">
                  {analysis!.emotionalSpending.summary}
                </p>
                <p className="text-muted-foreground text-xs mb-3">
                  {analysis!.emotionalSpending.patterns}
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis!.emotionalSpending.triggers.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-full bg-muted text-[#8B5CF6] text-xs font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </AiInsightSection>

              <AiInsightSection title="Savings recommendations" accent="var(--accent)" delay={0.3}>
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank size={20} className="text-accent" />
                  <p className="text-foreground font-bold text-sm">
                    {analysis!.savingsRecommendations.headline}
                  </p>
                </div>
                <ul className="space-y-3">
                  {analysis!.savingsRecommendations.recommendations.map((r, i) => (
                    <li key={i} className="text-muted-foreground text-sm flex gap-3 items-start bg-muted/50 p-3 rounded-2xl">
                      <Lightbulb size={16} className="text-accent shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </AiInsightSection>

              <AiInsightSection
                title={analysis!.weeklySummary.periodLabel}
                accent="#FFD60A"
                delay={0.35}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-[#FFD60A]" />
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Weekly summary</span>
                </div>
                <p className="text-foreground/90 text-sm leading-relaxed mb-4 font-medium">
                  {analysis!.weeklySummary.summary}
                </p>
                <ul className="space-y-2">
                  {analysis!.weeklySummary.highlights.map((h, i) => (
                    <li key={i} className="text-muted-foreground text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFD60A]" /> {h}
                    </li>
                  ))}
                </ul>
              </AiInsightSection>

              <AiInsightSection title="AI financial coaching" accent="var(--primary)" delay={0.4}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
                    <MessageCircle size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-black mb-1.5 text-base">
                      {analysis!.coaching.title}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {analysis!.coaching.message}
                    </p>
                    <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-xl text-primary text-xs font-bold border border-primary/20">
                      Next step: {analysis!.coaching.actionStep}
                    </div>
                  </div>
                </div>
              </AiInsightSection>
            </div>

            <div className="px-6 mt-8 space-y-4 pb-12">
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={isLoading || !canRun}
                className="w-full bg-card shadow-sm border border-border text-foreground py-4 rounded-2xl font-bold text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                Regenerate analysis
              </button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate("/personality")}
                className="w-full bg-gradient-to-r from-primary to-accent text-background py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
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
