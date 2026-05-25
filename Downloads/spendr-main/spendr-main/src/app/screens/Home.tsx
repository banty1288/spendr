import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { format, isAfter, parseISO, startOfWeek, subDays } from "date-fns";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CalendarDays,
  Clock,
  Flame,
  HeartPulse,
  Lightbulb,
  LineChart,
  Loader2,
  MessageCircle,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import { MonthlyBarChart } from "../components/transactions";
import { WeeklyReportPreview } from "../components/weekly/WeeklyReportPreview";
import { FinancialSetupChecklist, LowDataEmptyState } from "../components/ui/LowDataDashboard";
import { useAuthStore } from "../../store/authStore";
import { usePersonalityStore } from "../../store/personalityStore";
import { useUserData } from "../../hooks/useUserData";
import { useTransactions } from "../../hooks/useTransactions";
import { useGeminiInsights } from "../../hooks/useGeminiInsights";
import { useEmotionalInsights } from "../../hooks/useEmotionalInsights";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { useAchievements } from "../../hooks/useAchievements";
import { useFinancialLevels } from "../../hooks/useFinancialLevels";
import { AchievementUnlockModal } from "../components/achievements/AchievementUnlockModal";
import { FinancialLevelWidget } from "../components/levels/FinancialLevelWidget";
import {
  computeBalanceFromTransactions,
  getCategoryBreakdown,
  getMonthTotals,
  getMonthlySummaries,
} from "../../lib/transactions/analytics";
import { getCategoryById } from "../../lib/transactions/constants";
import { formatRelativeTime } from "../../lib/transactions/format";
import { formatCurrency, getGreeting } from "../../lib/userDisplay";
import { AiError } from "../../services/ai/errors";
import type { InsightCardType, SpendrAIAnalysis } from "../../services/ai/types";
import type { Transaction } from "../../types/transaction";
import type { EmotionalRiskLevel } from "../../types/emotionalInsight";

type DashboardTone = "cyan" | "green" | "purple" | "red" | "amber";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

const toneClasses: Record<DashboardTone, string> = {
  cyan: "from-[#00d9ff]/20 to-[#00ff88]/10 border-[#00d9ff]/25",
  green: "from-[#00ff88]/20 to-[#00d9ff]/10 border-[#00ff88]/25",
  purple: "from-[#9d4edd]/20 to-[#c77dff]/10 border-[#9d4edd]/25",
  red: "from-[#ff3366]/20 to-[#9d4edd]/10 border-[#ff3366]/25",
  amber: "from-[#ffd60a]/20 to-[#ff6b35]/10 border-[#ffd60a]/25",
};

const insightTone: Record<InsightCardType, DashboardTone> = {
  strength: "green",
  weakness: "red",
  trigger: "amber",
  suggestion: "cyan",
};

const riskTone: Record<EmotionalRiskLevel, DashboardTone> = {
  low: "green",
  medium: "amber",
  high: "red",
};

const riskText: Record<EmotionalRiskLevel, string> = {
  low: "text-[#00ff88]",
  medium: "text-[#ffd60a]",
  high: "text-[#ff3366]",
};

function patternLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DashboardCard({
  children,
  className = "",
  delay = 0,
  onClick,
}: DashboardCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className="min-w-0"
    >
      <Component
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`block min-w-0 w-full max-w-full overflow-hidden text-left bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] break-words ${className}`}
      >
        {children}
      </Component>
    </motion.div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 ${className}`}
    />
  );
}

function ProgressBar({
  value,
  tone = "cyan",
}: {
  value: number;
  tone?: DashboardTone;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const fill =
    tone === "green"
      ? "from-[#00ff88] to-[#00d9ff]"
      : tone === "red"
        ? "from-[#ff3366] to-[#ff6b35]"
        : tone === "amber"
          ? "from-[#ffd60a] to-[#ff6b35]"
          : tone === "purple"
            ? "from-[#9d4edd] to-[#c77dff]"
            : "from-[#00d9ff] to-[#00ff88]";

  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${fill}`}
      />
    </div>
  );
}

function scoreTone(score: number): DashboardTone {
  if (score >= 78) return "green";
  if (score >= 58) return "cyan";
  if (score >= 40) return "amber";
  return "red";
}

function clampScore(score: number) {
  return Math.round(Math.min(100, Math.max(0, score)));
}

function getRecentStreak(transactions: Transaction[]): number {
  const days = new Set(transactions.map((tx) => tx.date.slice(0, 10)));
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const key = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (!days.has(key)) {
      if (i === 0) continue;
      break;
    }
    streak += 1;
  }
  return streak;
}

function getWeeklySummary(transactions: Transaction[]) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const current = transactions.filter((tx) => isAfter(parseISO(tx.date), start));
  const income = current
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = current
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  return {
    count: current.length,
    income,
    expenses,
    net: income - expenses,
  };
}

function buildFallbackInsightCards(
  transactions: Transaction[],
  analysis?: SpendrAIAnalysis
) {
  if (analysis?.financialInsights.cards.length) {
    return analysis.financialInsights.cards.slice(0, 4).map((card) => ({
      type: card.type,
      title: card.title,
      description: card.description,
      metric: card.metric,
    }));
  }

  const monthKey = format(new Date(), "yyyy-MM");
  const breakdown = getCategoryBreakdown(transactions, monthKey);
  const top = breakdown[0];
  const weekly = getWeeklySummary(transactions);
  const lowData = transactions.length < 5;
  const noData = transactions.length === 0;

  if (noData) {
    return [
      {
        type: "strength" as InsightCardType,
        title: "Your spending profile is starting",
        description:
          "Add your first transactions to unlock your personal financial picture and emotion-aware coaching.",
        metric: "First step",
      },
      {
        type: "trigger" as InsightCardType,
        title: "Data building",
        description:
          "Spendr is waiting for enough history to reveal emotional spending triggers and category pressure points.",
        metric: "Need 5 transactions",
      },
      {
        type: "suggestion" as InsightCardType,
        title: "Start small",
        description:
          "Record your next two purchases now to begin generating meaningful insights this week.",
        metric: "2 more",
      },
    ];
  }

  if (lowData) {
    return [
      {
        type: "strength" as InsightCardType,
        title: "Early momentum",
        description:
          "Every entry helps Spendr refine your financial behavior and personalize advice faster.",
        metric: `${transactions.length} entries`,
      },
      {
        type: "trigger" as InsightCardType,
        title: top ? `${top.name} pressure` : "Pattern building",
        description: top
          ? `${top.name} is showing up early in your spend mix. Keep tracking for clearer emotional context.`
          : "Keep logging expenses to reveal your strongest spending triggers.",
        metric: top ? formatCurrency(top.value) : `+${5 - transactions.length} to unlock`,
      },
      {
        type: "suggestion" as InsightCardType,
        title: "AI unlock goal",
        description: `Add ${5 - transactions.length} more transaction${transactions.length === 4 ? "" : "s"} to unlock deeper AI analysis.`,
        metric: "Starter report",
      },
    ];
  }

  return [
    {
      type: "strength" as InsightCardType,
      title: weekly.net >= 0 ? "Positive weekly flow" : "Clear signal detected",
      description:
        weekly.net >= 0
          ? "You are keeping this week balanced. Keep protecting that gap between income and spending."
          : "This week is running expense-heavy. A small pause before discretionary purchases can stabilize the month.",
      metric: formatCurrency(Math.abs(weekly.net)),
    },
    {
      type: "trigger" as InsightCardType,
      title: top ? `${top.name} pressure` : "Pattern building",
      description: top
        ? `${top.name} is leading this month's expenses. Watch it closely when mood or convenience drives decisions.`
        : "Add a few more transactions and Spendr will start detecting emotional spending patterns.",
      metric: top ? formatCurrency(top.value) : "Need data",
    },
    {
      type: "suggestion" as InsightCardType,
      title: "One-tap reset",
      description:
        "Pick one category to cap for the next seven days. Short commitments are easier to keep and easier to repeat.",
      metric: "7 day focus",
    },
  ];
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 mb-3">
      <h2 className="text-white font-semibold leading-snug break-words">{title}</h2>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-[#00d9ff] text-sm flex items-center gap-1"
        >
          <span>{action}</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const { data: userData, isLoading: isProfileLoading } = useUserData();
  const { transactions, isLoading: txLoading } = useTransactions();
  const {
    analysis,
    isLoading: aiLoading,
    isStale,
    canRun,
    runAnalysis,
  } = useGeminiInsights();
  const {
    insights: emotionalInsights,
    storedInsights: storedEmotionalInsights,
    isGenerating: emotionalGenerating,
    canRun: canRunEmotional,
    runAnalysis: runEmotionalAnalysis,
  } = useEmotionalInsights();
  const {
    personality,
    loading: personalityLoading,
    initialized: personalityInitialized,
    fetchPersonality,
  } = usePersonalityStore();
  const {
    latestReport,
    isGenerating: reportGenerating,
    canGenerate,
    generateReport,
  } = useWeeklyReport();

  const {
    statuses: achievements,
    recentUnlocked,
    openUnlocks,
    isLoading: achievementsLoading,
    onClearUnlocks,
  } = useAchievements(transactions, userData ?? null);

  const { financialLevel } = useFinancialLevels(transactions, achievements, userData ?? null);

  const unlockedBadges = achievements.filter((achievement) => achievement.earned);
  const upcomingBadges = achievements
    .filter((achievement) => !achievement.earned)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);
  const rareHighlights = unlockedBadges
    .filter(
      (achievement) =>
        achievement.rarity === "rare" ||
        achievement.rarity === "epic" ||
        achievement.rarity === "legendary"
    )
    .slice(0, 3);

  useEffect(() => {
    if (authUser?.uid && !personalityInitialized && !personalityLoading) {
      void fetchPersonality(authUser.uid);
    }
  }, [
    authUser?.uid,
    personalityInitialized,
    personalityLoading,
    fetchPersonality,
  ]);

  const isLoading = isProfileLoading || txLoading;
  const displayName = userData?.displayName ?? authUser?.displayName ?? "there";
  const balance =
    transactions.length > 0
      ? computeBalanceFromTransactions(transactions)
      : (userData?.balance ?? 0);

  const monthKey = format(new Date(), "yyyy-MM");
  const monthTotals = useMemo(
    () => getMonthTotals(transactions, monthKey),
    [transactions, monthKey]
  );
  const monthlyChart = useMemo(
    () => getMonthlySummaries(transactions, 6),
    [transactions]
  );
  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(transactions, monthKey),
    [transactions, monthKey]
  );
  const weekly = useMemo(() => getWeeklySummary(transactions), [transactions]);
  const recent = transactions.slice(0, 5);
  const streak = getRecentStreak(transactions);

  const savingsRate =
    monthTotals.income > 0 ? (monthTotals.net / monthTotals.income) * 100 : 0;
  const savingsScore = clampScore(50 + savingsRate * 0.8);
  const healthScore = clampScore(
    analysis?.financialInsights.healthScore ??
      savingsScore * 0.5 +
        (balance >= 0 ? 22 : 8) +
        Math.min(20, transactions.length * 1.5)
  );
  const healthTone = scoreTone(healthScore);
  const topCategory = categoryBreakdown[0];
  const aiCards = buildFallbackInsightCards(transactions, analysis);
  const emotionalTriggers = analysis?.emotionalSpending.triggers ?? [];
  const lowData = transactions.length > 0 && transactions.length < 5;
  const noData = transactions.length === 0;
  const hasReport = Boolean(latestReport);
  const onboardingComplete = Boolean(userData?.onboardingCompleted);

  const checklistItems = [
    {
      title: "Complete onboarding",
      subtitle: onboardingComplete
        ? "Your profile is ready for smarter insights."
        : "Tell Spendr a bit more about your goals.",
      completed: onboardingComplete,
    },
    {
      title: "Add transactions",
      subtitle: transactions.length === 0
        ? "Your spending profile is still empty."
        : `${transactions.length} transaction${transactions.length === 1 ? "" : "s"} logged so far.`,
      completed: transactions.length >= 5,
    },
    {
      title: "Run AI insights",
      subtitle: analysis ? "Dashboard intelligence is active." : "Start your first AI session.",
      completed: Boolean(analysis),
    },
    {
      title: "Generate starter report",
      subtitle: hasReport ? "Weekly summary ready." : "Get your first financial overview.",
      completed: hasReport,
    },
  ];

  const handleRunAi = useCallback(async () => {
    try {
      await runAnalysis({ force: isStale });
      toast.success(isStale ? "Dashboard insights refreshed" : "AI dashboard updated");
    } catch (err) {
      const message =
        err instanceof AiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not generate AI insights.";
      toast.error(message);
    }
  }, [runAnalysis, isStale]);

  const handleRunEmotional = useCallback(async () => {
    try {
      await runEmotionalAnalysis({ force: true });
      toast.success("Emotional spending intelligence updated");
    } catch (err) {
      const message =
        err instanceof AiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not analyze emotional spending.";
      toast.error(message);
    }
  }, [runEmotionalAnalysis]);

  const handleGenerateWeeklyReport = useCallback(async () => {
    try {
      await generateReport(false);
      toast.success("✨ Weekly report generated! Check your report to see AI insights.");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Could not generate weekly report";
      
      if (errorMsg.includes("onboarding")) {
        toast.error("Complete onboarding to unlock AI insights");
      } else if (errorMsg.includes("transaction")) {
        toast.error("Add your first transaction to get started");
      } else {
        toast.error(errorMsg);
      }
    }
  }, [generateReport]);

  return (
    <div className="min-h-screen pb-32 sm:pb-36 relative overflow-x-clip bg-black">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 36, 0], y: [0, -24, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 right-[-120px] h-72 w-72 sm:h-80 sm:w-80 bg-[#00d9ff]/20 rounded-full blur-[110px]"
        />
        <motion.div
          animate={{ x: [0, -28, 0], y: [0, 42, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-80 left-[-160px] h-80 w-80 sm:h-96 sm:w-96 bg-[#9d4edd]/20 rounded-full blur-[130px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
      </div>

      <main className="relative z-10 w-full min-w-0 px-3 min-[375px]:px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6"
        >
          <div className="min-w-0 flex-1">
            <p className="text-white/55 text-sm">{getGreeting()}</p>
            <h1 className="text-white text-xl min-[375px]:text-2xl font-bold truncate">
              {isProfileLoading ? "Loading..." : displayName}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleRunAi}
              disabled={!canRun || aiLoading}
              className="h-10 min-[375px]:h-11 px-3 min-[375px]:px-4 rounded-2xl bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              <span>{analysis ? "Refresh AI" : "Run AI"}</span>
            </button>
          </div>
        </motion.header>

        {isLoading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-44" />
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
            </div>
            <SkeletonBlock className="h-60" />
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] gap-4 sm:gap-5">
            <div className="min-w-0 space-y-4 sm:space-y-5">
              <DashboardCard
                delay={0.05}
                onClick={() => navigate("/transactions")}
                className={`bg-gradient-to-br ${toneClasses[healthTone]} relative overflow-hidden`}
              >
                <div className="absolute right-0 top-0 w-36 h-36 bg-white/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-5 gap-3">
                    <div className="min-w-0">
                      <p className="text-white/60 text-sm">Monthly financial health</p>
                      <div className="flex items-end gap-3 mt-1">
                        <h2 className="text-white text-4xl min-[375px]:text-5xl font-black leading-none">
                          {healthScore}
                        </h2>
                        <span className="text-white/45 text-sm mb-2">/100</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 min-[375px]:w-14 min-[375px]:h-14 rounded-2xl bg-black/25 border border-white/10 flex items-center justify-center shrink-0">
                      <HeartPulse className="text-[#00ff88]" size={26} />
                    </div>
                  </div>
                  <ProgressBar value={healthScore} tone={healthTone} />
                  <div className="grid grid-cols-1 min-[390px]:grid-cols-3 gap-3 mt-5">
                    <div className="min-w-0">
                      <p className="text-white/45 text-xs">Balance</p>
                      <p className="text-white font-bold truncate">
                        {formatCurrency(balance)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/45 text-xs">Income</p>
                      <p className="text-[#00ff88] font-bold truncate">
                        {formatCurrency(monthTotals.income)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/45 text-xs">Spent</p>
                      <p className="text-white font-bold truncate">
                        {formatCurrency(monthTotals.expenses)}
                      </p>
                    </div>
                  </div>
                </div>
              </DashboardCard>

              <FinancialLevelWidget level={financialLevel} />

              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 gap-3">
                <DashboardCard delay={0.1}>
                  <div className="flex items-center justify-between mb-4">
                    <PiggyBank className="text-[#00ff88]" size={22} />
                    <span className="text-[#00ff88] text-2xl font-black">
                      {savingsScore}
                    </span>
                  </div>
                  <p className="text-white font-semibold">Savings score</p>
                  <p className="text-white/45 text-xs mt-1">
                    {monthTotals.net >= 0
                      ? `${formatCurrency(monthTotals.net)} protected this month`
                      : `${formatCurrency(Math.abs(monthTotals.net))} over income`}
                  </p>
                </DashboardCard>

                <DashboardCard delay={0.13}>
                  <div className="flex items-center justify-between mb-4">
                    <Flame className="text-[#ff6b35]" size={22} />
                    <span className="text-[#ff6b35] text-2xl font-black">
                      {streak}
                    </span>
                  </div>
                  <p className="text-white font-semibold">Money streak</p>
                  <p className="text-white/45 text-xs mt-1">
                    Active tracking days from recent entries
                  </p>
                </DashboardCard>

                <DashboardCard delay={0.16}>
                  <div className="flex items-center justify-between mb-4">
                    <ShieldCheck className="text-[#00d9ff]" size={22} />
                    <span className="text-[#00d9ff] text-2xl font-black">
                      {analysis?.financialInsights.disciplinePercent ??
                        clampScore(55 + savingsRate)}
                    </span>
                  </div>
                  <p className="text-white font-semibold">Discipline</p>
                  <p className="text-white/45 text-xs mt-1">
                    AI-adjusted control signal
                  </p>
                </DashboardCard>
              </div>

              <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-[0.2em]">
                        Badge collection
                      </p>
                      <h3 className="text-white text-lg font-semibold mt-2">
                        Recent unlocks & progress
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/gamification")}
                      className="text-[#00d9ff] text-xs font-semibold"
                    >
                      View all
                    </button>
                  </div>

                  {unlockedBadges.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {unlockedBadges.slice(0, 3).map((achievement) => (
                        <div
                          key={achievement.id}
                          className="rounded-3xl border border-white/10 bg-black/15 p-3 text-center"
                        >
                          <div className="text-2xl mb-2">{achievement.icon}</div>
                          <p className="text-white text-xs font-semibold">
                            {achievement.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-black/10 p-5 text-white/60 text-sm">
                      No badges unlocked yet. Log transactions consistently to start collecting achievements.
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-[0.2em]">
                        Upcoming milestones
                      </p>
                      <h3 className="text-white text-lg font-semibold mt-2">
                        Progress to next badges
                      </h3>
                    </div>
                    <span className="text-white/50 text-xs">
                      {upcomingBadges.length} pending
                    </span>
                  </div>
                  <div className="space-y-3">
                    {upcomingBadges.map((achievement) => (
                      <div key={achievement.id} className="rounded-3xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{achievement.icon}</span>
                            <div>
                              <p className="text-white font-semibold text-sm">
                                {achievement.title}
                              </p>
                              <p className="text-white/50 text-[11px]">
                                {achievement.progressText}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-white/60 uppercase tracking-[0.18em]">
                            {achievement.rarity}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88]"
                            style={{ width: `${achievement.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {(lowData || noData) && (
                <LowDataEmptyState
                  transactionsCount={transactions.length}
                  hasReport={hasReport}
                  onAddTransaction={() => navigate("/transactions")}
                  onRunAi={() => handleRunAi()}
                  onViewReport={() => navigate("/weekly-report")}
                />
              )}

              <section>
                <SectionHeader
                  title="AI insight cards"
                  action={analysis ? "Details" : "Generate"}
                  onAction={() => (analysis ? navigate("/insights") : handleRunAi())}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiCards.map((card, index) => {
                    const tone = insightTone[card.type];
                    const Icon =
                      card.type === "strength"
                        ? ShieldCheck
                        : card.type === "weakness"
                          ? AlertTriangle
                          : card.type === "trigger"
                            ? Zap
                            : Lightbulb;
                    return (
                      <DashboardCard
                        key={`${card.type}-${card.title}`}
                        delay={0.18 + index * 0.04}
                        className={`bg-gradient-to-br ${toneClasses[tone]}`}
                        onClick={() => navigate("/insights")}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-black/25 border border-white/10 flex items-center justify-center shrink-0">
                            <Icon className="text-white" size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-semibold leading-snug break-words">
                                {card.title}
                              </p>
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed">
                              {card.description}
                            </p>
                            <p className="text-white/45 text-xs font-semibold mt-3 break-words">
                              {card.metric}
                            </p>
                          </div>
                        </div>
                      </DashboardCard>
                    );
                  })}
                </div>
              </section>

              <section>
                <SectionHeader
                  title="Emotional spending intelligence"
                  action={storedEmotionalInsights ? "Refresh" : "Analyze"}
                  onAction={handleRunEmotional}
                />
                <DashboardCard
                  delay={0.25}
                  className={`bg-gradient-to-br ${toneClasses[riskTone[emotionalInsights?.riskLevel ?? "low"]]} relative`}
                >
                  <div className="flex flex-col min-[390px]:flex-row min-[390px]:items-center justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="text-white/50 text-xs uppercase tracking-wide">
                        Emotional risk score
                      </p>
                      <div className="flex items-end gap-2 mt-1">
                        <span className="text-white text-4xl font-black leading-none">
                          {emotionalInsights?.emotionalRiskScore ?? 0}
                        </span>
                        <span
                          className={`text-sm font-bold capitalize mb-1 ${
                            riskText[emotionalInsights?.riskLevel ?? "low"]
                          }`}
                        >
                          {emotionalInsights?.riskLevel ?? "low"} risk
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRunEmotional}
                      disabled={!canRunEmotional || emotionalGenerating}
                      className="shrink-0 rounded-2xl bg-black/25 border border-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {emotionalGenerating ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Brain size={15} className="text-[#00d9ff]" />
                      )}
                      <span>{storedEmotionalInsights ? "Refresh" : "AI analyze"}</span>
                    </button>
                  </div>
                  <ProgressBar
                    value={emotionalInsights?.emotionalRiskScore ?? 0}
                    tone={riskTone[emotionalInsights?.riskLevel ?? "low"]}
                  />
                  <p className="text-white/70 text-sm leading-relaxed mt-4">
                    {emotionalInsights?.triggerAnalysis.summary ??
                      "Add transactions and complete onboarding to reveal emotional spending triggers."}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(emotionalInsights?.triggerAnalysis.primaryTriggers.length
                      ? emotionalInsights.triggerAnalysis.primaryTriggers
                      : ["Behavior baseline"]
                    ).map((trigger) => (
                      <span
                        key={trigger}
                        className="max-w-full rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 break-words"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </DashboardCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {(emotionalInsights?.alerts.length
                    ? emotionalInsights.alerts
                    : emotionalInsights?.behavioralInsights ?? []
                  )
                    .slice(0, 4)
                    .map((item, index) => (
                      <DashboardCard
                        key={`${item.type}-${item.title}`}
                        delay={0.28 + index * 0.04}
                        className={`bg-gradient-to-br ${toneClasses[riskTone[item.severity]]}`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-black/25 border border-white/10 flex items-center justify-center shrink-0">
                            <AlertTriangle
                              size={20}
                              className={riskText[item.severity]}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="text-white font-semibold leading-snug break-words">
                                {item.title}
                              </p>
                              <span
                                className={`rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold uppercase ${riskText[item.severity]}`}
                              >
                                {patternLabel(item.type)}
                              </span>
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed">
                              {item.summary}
                            </p>
                            <p className="text-white/45 text-xs mt-2 leading-relaxed">
                              {item.evidence}
                            </p>
                            <p className="text-[#00d9ff] text-xs font-semibold mt-3 leading-relaxed">
                              {item.recommendation}
                            </p>
                          </div>
                        </div>
                      </DashboardCard>
                    ))}
                </div>
              </section>

              <DashboardCard delay={0.28}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold">Spending trend</p>
                    <p className="text-white/45 text-xs">Last six months</p>
                  </div>
                  <LineChart className="text-[#00d9ff]" size={22} />
                </div>
                <div className="h-[190px] min-[375px]:h-[220px] min-w-0 overflow-hidden">
                  <MonthlyBarChart data={monthlyChart} />
                </div>
              </DashboardCard>

              <DashboardCard delay={0.32} className="bg-gradient-to-br from-[#ff3366]/15 to-[#ffd60a]/10 border-[#ff3366]/20">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#ff3366]/15 border border-[#ff3366]/25 flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-[#ff3366]" size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold mb-1">
                      Emotional spending warning
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {analysis?.emotionalSpending.patterns ||
                        emotionalInsights?.savingsWarnings[0] ||
                        (topCategory
                          ? `${topCategory.name} is the strongest current pressure point. Pause before repeat purchases in this category.`
                          : "Spendr needs more transactions before it can identify emotional risk patterns.")}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(emotionalInsights?.triggerAnalysis.primaryTriggers.length
                        ? emotionalInsights.triggerAnalysis.primaryTriggers
                        : emotionalTriggers.length
                        ? emotionalTriggers
                        : topCategory
                          ? [topCategory.name, "Impulse check"]
                          : ["Need more data"]
                      ).map((trigger) => (
                        <span
                          key={trigger}
                            className="max-w-full px-3 py-1 rounded-full bg-[#ff3366]/15 border border-[#ff3366]/20 text-[#ff8aa8] text-xs break-words"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>

            <aside className="min-w-0 space-y-4 sm:space-y-5">
              <DashboardCard
                delay={0.12}
                onClick={() => navigate("/personality")}
                className="bg-gradient-to-br from-[#9d4edd]/20 to-[#00d9ff]/10 border-[#9d4edd]/25"
              >
                <div className="flex items-start justify-between gap-3 mb-4 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-white/50 text-xs uppercase tracking-wide">
                      Personality snapshot
                    </p>
                    <h2 className="text-white text-xl font-black mt-1 leading-snug break-words">
                      {personality?.type ?? "Profile building"}
                    </h2>
                  </div>
                  <Brain className="text-[#c77dff]" size={30} />
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {personality?.summary ??
                    "Generate your Money Personality to connect emotional triggers with real spending behavior."}
                </p>
                <ProgressBar value={personality?.score ?? 42} tone="purple" />
                <div className="flex items-center justify-between gap-3 mt-3 text-xs">
                  <span className="text-white/45 min-w-0">Match confidence</span>
                  <span className="text-[#c77dff] font-bold">
                    {personality?.score ?? 42}/100
                  </span>
                </div>
              </DashboardCard>

              <FinancialSetupChecklist items={checklistItems} />

              <DashboardCard delay={0.18}>
                <div className="flex items-center gap-3 mb-4 min-w-0">
                  <CalendarDays className="text-[#ffd60a]" size={22} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold">Weekly summary</p>
                    <p className="text-white/45 text-xs">
                      {analysis?.weeklySummary.periodLabel ?? "This week"}
                    </p>
                  </div>
                </div>
                <p className="text-white/75 text-sm leading-relaxed mb-4">
                  {analysis?.weeklySummary.summary ??
                    `You logged ${weekly.count} transaction${weekly.count === 1 ? "" : "s"} this week with a net flow of ${formatCurrency(weekly.net)}.`}
                </p>
                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                  <div className="min-w-0 rounded-2xl bg-white/5 border border-white/10 p-3">
                    <TrendingUp className="text-[#00ff88] mb-2" size={16} />
                    <p className="text-white/45 text-xs">Income</p>
                    <p className="text-white font-bold truncate">
                      {formatCurrency(weekly.income)}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-2xl bg-white/5 border border-white/10 p-3">
                    <TrendingDown className="text-[#ff3366] mb-2" size={16} />
                    <p className="text-white/45 text-xs">Spent</p>
                    <p className="text-white font-bold truncate">
                      {formatCurrency(weekly.expenses)}
                    </p>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard delay={0.22} className="bg-gradient-to-br from-[#00d9ff]/15 to-[#9d4edd]/10 border-[#00d9ff]/20">
                <div className="flex items-start gap-3 min-w-0">
                  <MessageCircle className="text-[#00d9ff] shrink-0 mt-1" size={24} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold mb-1">
                      {analysis?.coaching.title ?? "AI financial coaching"}
                    </p>
                    <p className="text-white/75 text-sm leading-relaxed mb-3">
                      {analysis?.coaching.message ??
                        "Your best next move is to choose one category to watch today. Awareness compounds faster when it is specific."}
                    </p>
                    <p className="text-[#00d9ff] text-xs font-semibold break-words">
                      Next: {analysis?.coaching.actionStep ?? "Review your top spending category"}
                    </p>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard delay={0.24}>
                <div className="flex items-center gap-3 mb-4 min-w-0">
                  <Clock className="text-[#ffd60a]" size={22} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold">
                      Behavior timeline
                    </p>
                    <p className="text-white/45 text-xs">
                      Emotional pattern sequence
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {(emotionalInsights?.timeline.length
                    ? emotionalInsights.timeline
                    : [
                        {
                          label: "Baseline",
                          description:
                            "Spendr is collecting enough transaction history to build a behavior timeline.",
                          amount: 0,
                          riskLevel: "low" as const,
                        },
                      ]
                  )
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={`${item.label}-${item.description}`}
                        className="flex gap-3 min-w-0"
                      >
                        <div
                          className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                            item.riskLevel === "high"
                              ? "bg-[#ff3366]"
                              : item.riskLevel === "medium"
                                ? "bg-[#ffd60a]"
                                : "bg-[#00ff88]"
                          }`}
                        />
                        <div className="min-w-0 flex-1 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-white text-sm font-semibold break-words">
                              {item.label}
                            </p>
                            <p className="text-white/50 text-xs shrink-0">
                              {item.amount > 0 ? formatCurrency(item.amount) : ""}
                            </p>
                          </div>
                          <p className="text-white/55 text-xs leading-relaxed mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </DashboardCard>

              <DashboardCard delay={0.26} className="bg-gradient-to-br from-[#ffd60a]/10 to-[#ff3366]/10 border-[#ffd60a]/20">
                <div className="flex items-start gap-3 min-w-0">
                  <PiggyBank className="text-[#ffd60a] shrink-0 mt-1" size={22} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold mb-2">
                      Savings warnings
                    </p>
                    <ul className="space-y-2">
                      {(emotionalInsights?.savingsWarnings.length
                        ? emotionalInsights.savingsWarnings
                        : ["Run emotional analysis to uncover savings risks tied to mood and habits."]
                      ).map((warning) => (
                        <li
                          key={warning}
                          className="text-white/70 text-sm leading-relaxed"
                        >
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </DashboardCard>

              <WeeklyReportPreview
                report={latestReport}
                isGenerating={reportGenerating}
                onGenerate={handleGenerateWeeklyReport}
                transactionsCount={transactions.length}
              />

              <section>
                <SectionHeader
                  title="Recent transactions"
                  action="All"
                  onAction={() => navigate("/transactions")}
                />
                <div className="space-y-3">
                  {recent.length === 0 ? (
                    <DashboardCard onClick={() => navigate("/transactions")}>
                      <div className="text-center py-6">
                        <Wallet className="text-[#00d9ff] mx-auto mb-3" size={28} />
                        <p className="text-white font-semibold">No transactions yet</p>
                        <p className="text-white/60 text-sm mt-1 mb-4">
                          Your spending profile is still forming. Add the first few transactions to start seeing meaningful insights.
                        </p>
                        <div className="inline-flex flex-col gap-2 items-center">
                          <span className="rounded-full bg-[#00d9ff]/10 px-3 py-1 text-xs text-white/80">
                            Add 5 transactions to unlock weekly reports
                          </span>
                          <span className="rounded-full bg-[#ffd60a]/10 px-3 py-1 text-xs text-white/80">
                            Track daily purchases to reveal emotional trends
                          </span>
                        </div>
                      </div>
                    </DashboardCard>
                  ) : (
                    recent.map((tx, index) => {
                      const category = getCategoryById(tx.categoryId);
                      const isIncome = tx.type === "income";
                      return (
                        <motion.button
                          type="button"
                          key={tx.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + index * 0.04 }}
                          onClick={() => navigate("/transactions")}
                          className="w-full min-w-0 bg-white/5 border border-white/10 rounded-2xl p-3 min-[375px]:p-4 flex items-center gap-3 text-left overflow-hidden"
                        >
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            {category.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold truncate">
                              {tx.merchant}
                            </p>
                            <p className="text-white/40 text-xs truncate">
                              {category.label} - {formatRelativeTime(tx.date)}
                            </p>
                          </div>
                          <p
                            className={`font-bold shrink-0 text-sm min-[375px]:text-base ${
                              isIncome ? "text-[#00ff88]" : "text-white"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </section>

              <DashboardCard delay={0.3}>
                <div className="flex items-center gap-3 mb-4 min-w-0">
                  <Target className="text-[#00ff88]" size={22} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold">Monthly focus</p>
                    <p className="text-white/45 text-xs">
                      {topCategory ? topCategory.name : "Start with visibility"}
                    </p>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {topCategory
                    ? `Keep ${topCategory.name.toLowerCase()} under control for the rest of the month. It currently accounts for ${formatCurrency(topCategory.value)} of expenses.`
                    : "Add transactions consistently so Spendr can guide your next monthly focus."}
                </p>
              </DashboardCard>
            </aside>
          </div>
        )}
      </main>

      <AchievementUnlockModal achievements={openUnlocks} onClose={onClearUnlocks} />
      <BottomNav />
    </div>
  );
}
