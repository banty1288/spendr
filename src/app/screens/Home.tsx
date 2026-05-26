import { useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, TrendingDown, ArrowRight, Flame, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "../../store/authStore";
import { useUserData } from "../../hooks/useUserData";
import { useTransactions, useTransactionAnalytics } from "../../hooks/useTransactions";
import { usePersonalityStore } from "../../store/personalityStore";
import { useGeminiInsights } from "../../hooks/useGeminiInsights";
import { useEmotionalInsights } from "../../hooks/useEmotionalInsights";
import { useWeeklyReport } from "../../hooks/useWeeklyReport";
import { useFinancialLevels } from "../../hooks/useFinancialLevels";
import { useAchievements } from "../../hooks/useAchievements";

import { HealthScoreCard } from "../components/home/HealthScoreCard";
import { PersonalitySnapshotCard } from "../components/home/PersonalitySnapshotCard";
import { AIInsightsCarousel } from "../components/home/AIInsightsCarousel";
import { WeeklySummaryCard } from "../components/home/WeeklySummaryCard";
import { SpendingTrendWidget } from "../components/home/SpendingTrendWidget";

import { computeBalanceFromTransactions, getMonthTotals } from "../../lib/transactions/analytics";
import { getCategoryById } from "../../lib/transactions/constants";
import { formatRelativeTime } from "../../lib/transactions/format";
import { getGreeting } from "../../lib/userDisplay";
import { useCurrency } from "../../hooks/useCurrency";
import { trackDashboardOpened } from "../../services/analytics";

export function Home() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const uid = authUser?.uid;
  const { data: userData, isLoading: isProfileLoading } = useUserData();
  const { transactions: allTx, isLoading: txLoading } = useTransactions();
  const { t } = useTranslation();
  const { convertAndFormat } = useCurrency();

  const monthKey = format(new Date(), "yyyy-MM");
  const { income, expenses } = getMonthTotals(allTx, monthKey);
  
  const { breakdown, monthly: monthlyTrendData, isLoading: isTrendLoading } = useTransactionAnalytics(monthKey);
  const totalSpending = breakdown.reduce((acc, item) => acc + item.value, 0);

  // Gamification & Health Score
  const { statuses: achievements } = useAchievements(allTx, userData ?? null);
  const { financialLevel, isLoading: isLevelLoading } = useFinancialLevels(allTx, achievements, userData ?? null);

  // Personality Store
  const { personality, fetchPersonality, loading: isPersonalityLoading, initialized: isPersonalityInitialized } = usePersonalityStore();
  
  // Insights
  const { analysis, isLoading: isAnalysisLoading } = useGeminiInsights();
  const { insights: emotionalInsights, isLoading: isEmotionalLoading } = useEmotionalInsights();
  
  // Weekly Report
  const { latestReport, isLoading: isWeeklyLoading } = useWeeklyReport();

  // Fetch initial personality data if not cached
  useEffect(() => {
    if (uid && !isPersonalityInitialized && !isPersonalityLoading) {
      fetchPersonality(uid);
    }
  }, [uid, fetchPersonality, isPersonalityInitialized, isPersonalityLoading]);

  // Track dashboard view once on mount
  useEffect(() => {
    trackDashboardOpened();
  }, []);

  const displayName = userData?.displayName ?? authUser?.displayName ?? "there";
  const balance = allTx.length > 0 ? computeBalanceFromTransactions(allTx) : (userData?.balance ?? 0);
  const recent = allTx.slice(0, 4);

  return (
    <div className="min-h-[100dvh] pb-safe-nav relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-80 h-80 bg-card rounded-full hidden"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-0 w-80 h-80 bg-card rounded-full hidden"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-card rounded-full hidden"
        />
      </div>

      <div className="relative z-10 px-4 md:px-8 lg:px-12 pt-12 pb-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-white/60 text-sm mb-1">{t("home.greeting")} 👋</p>
            <h1 className="text-2xl font-bold text-white">
              {isProfileLoading ? "…" : displayName}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/gamification")}
              className="flex items-center gap-1.5 bg-gradient-to-r from-card to-card px-3 py-2 rounded-full border border-[#ff6b35]/30 cursor-pointer"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Flame size={16} className="text-[#ff6b35]" />
              </motion.div>
              <span className="text-[#ff6b35] font-bold text-sm">
                {userData?.streakDays ?? 0}
              </span>
            </motion.div>

          </div>
        </motion.div>

        {/* Hero Section: Total Balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-card to-card  p-6 rounded-3xl border border-border mb-6 relative overflow-hidden cursor-pointer group"
          onClick={() => navigate("/transactions")}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-card to-card"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="absolute top-0 right-0 w-40 h-40 bg-card rounded-full blur-3xl group-hover:bg-card transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 mb-2">{t("home.totalBalance")}</p>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Eye size={16} className="text-white/40" />
              </motion.div>
            </div>
            <motion.h2
              className="text-5xl font-black bg-gradient-to-r from-white via-[#00d9ff] to-[#00ff88] bg-clip-text text-transparent mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isProfileLoading || txLoading ? "—" : convertAndFormat(balance)}
            </motion.h2>
            <p className="text-white/50 text-xs mb-4">{t("home.liveBalance", "Live balance from your transactions")}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="bg-card p-2 rounded-xl">
                  <TrendingUp size={16} className="text-[#00ff88]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">{t("home.income", "Income")}</p>
                  <p className="text-white font-bold">{convertAndFormat(income)}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="bg-card p-2 rounded-xl">
                  <TrendingDown size={16} className="text-[#ff3366]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">{t("home.expenses", "Expenses")}</p>
                  <p className="text-white font-bold">{convertAndFormat(expenses)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Adaptive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <HealthScoreCard financialLevel={financialLevel} isLoading={isLevelLoading || txLoading} />
          
          <PersonalitySnapshotCard personality={personality} isLoading={isPersonalityLoading} />
          
          <div className="md:col-span-2 xl:col-span-3">
            <AIInsightsCarousel analysis={analysis} emotionalInsights={emotionalInsights} isLoading={isAnalysisLoading || isEmotionalLoading} />
          </div>
          
          <WeeklySummaryCard report={latestReport} isLoading={isWeeklyLoading} />
          
          <div className="xl:col-span-2">
            <SpendingTrendWidget monthlyData={monthlyTrendData} totalSpending={totalSpending} isLoading={isTrendLoading} />
          </div>
        </div>

        {/* Section 6: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex-1">{t("home.recentTransactions", "Recent Transactions")}</h3>
            <button 
              onClick={() => navigate("/transactions")}
              className="text-[#00d9ff] text-sm hover:text-white transition-colors flex items-center gap-1"
            >
              {t("home.viewAll", "View all")} <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {txLoading && (
              <p className="text-white/40 text-sm text-center py-4">Loading activity…</p>
            )}
            {!txLoading && recent.length === 0 && (
              <button
                type="button"
                onClick={() => navigate("/transactions")}
                className="w-full bg-card shadow-sm border border-dashed border-white/20 rounded-2xl py-8 text-[#00d9ff] text-sm font-medium"
              >
                + {t("home.addTransaction")}
              </button>
            )}
            {recent.map((tx, index) => {
              const cat = getCategoryById(tx.categoryId);
              const isIncome = tx.type === "income";
              return (
                <motion.button
                  type="button"
                  key={tx.id}
                  onClick={() => navigate("/transactions")}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`w-full bg-card shadow-sm  p-4 rounded-2xl border ${
                    isIncome ? "border-[#00ff88]/20" : "border-border"
                  } flex items-center gap-4 text-left group relative overflow-hidden`}
                >
                  <div className="text-3xl">{cat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{tx.merchant}</p>
                    <p className="text-white/40 text-xs">
                      {cat.label} · {formatRelativeTime(tx.date)}
                    </p>
                  </div>
                  <p
                    className={`font-bold text-lg shrink-0 ${
                      isIncome ? "text-[#00ff88]" : "text-white"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {convertAndFormat(tx.amount)}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

