import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Calendar, BarChart2, ArrowUpRight, Sparkles, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { useTransactionAnalytics, useTransactions } from "../../hooks/useTransactions";
import { CategoryPieChart, CashFlowChart, IncomeTrendChart } from "../components/transactions";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { formatMonthLabel } from "../../lib/transactions/format";
import { getAvailableMonths } from "../../lib/transactions/analytics";
import { PageShell } from "../components/ui/PageShell";
import { BackButton } from "../components/ui/BackButton";
import { EmptyState } from "../components/ui/EmptyState";
import { AnalyticsSkeleton } from "../components/ui/ScreenLoader";
import { useGeminiInsights } from "../../hooks/useGeminiInsights";

export function Analytics() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const months = getAvailableMonths(transactions);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const { convertAndFormat } = useCurrency();
  const { t } = useTranslation();

  const { breakdown, monthly, totals, isLoading } = useTransactionAnalytics(month);
  const { analysis, isLoading: aiLoading, runAnalysis, hasAnalysis } = useGeminiInsights();

  const totalSpending = breakdown.reduce((acc, item) => acc + item.value, 0);
  const hasData = !isLoading && breakdown.length > 0;

  // Auto-run AI analysis if not already run and we have transactions
  useEffect(() => {
    if (transactions.length > 0 && !hasAnalysis && !aiLoading) {
      runAnalysis().catch(console.error);
    }
  }, [transactions.length, hasAnalysis, aiLoading, runAnalysis]);

  return (
    <PageShell orbs={[{ color: "var(--primary)", position: "top-right" }, { color: "var(--accent)", position: "bottom-left" }]}>
      <div className="px-4 sm:px-6 pt-12 pb-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <BackButton onClick={() => navigate("/home")} />
            <h1 className="text-2xl font-bold text-foreground">{t("nav.analytics")}</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Advanced Insights & Trends</p>
            {/* Month selector */}
            <div className="bg-card shadow-sm px-3 py-2 rounded-full border border-border flex items-center gap-2 shrink-0 relative overflow-hidden">
              <Calendar size={14} className="text-muted-foreground relative z-10" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent text-foreground text-sm focus:outline-none cursor-pointer relative z-10 appearance-none pr-2"
                aria-label="Select month"
              >
                {months.map((m) => (
                  <option key={m} value={m} className="bg-card">
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <AnalyticsSkeleton />
        ) : !hasData && transactions.length === 0 ? (
          <EmptyState
            icon={<BarChart2 size={36} />}
            title="No data yet"
            description="Add transactions to start seeing your spending analytics and category breakdown."
            action={{ label: "Add Transaction", onClick: () => navigate("/transactions") }}
            accentColor="var(--accent)"
          />
        ) : (
          <>
            {/* Summary Hero Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="bg-card p-6 rounded-3xl border border-border mb-6 relative overflow-hidden shadow-lg"
            >
              <div className="absolute right-0 top-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-0 bottom-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-3 relative mb-6">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">{t("analytics.totalSpending", "Monthly Spending")}</p>
                  <h2 className="text-4xl font-black text-foreground">
                    {convertAndFormat(totalSpending)}
                  </h2>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-1 text-sm font-bold shadow-inner ${totals.net >= 0 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                    <ArrowUpRight size={14} className={totals.net < 0 ? "rotate-180" : ""} />
                    {convertAndFormat(Math.abs(totals.net))}
                  </div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Net Cash Flow</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm relative z-10">
                <div className="flex flex-col justify-center bg-background/50 p-4 rounded-2xl border border-primary/20 shadow-sm">
                  <span className="text-muted-foreground text-xs font-semibold uppercase mb-1">{t("home.income", "Income")}</span>
                  <span className="text-primary font-bold text-lg">{convertAndFormat(totals.income)}</span>
                </div>
                <div className="flex flex-col justify-center bg-background/50 p-4 rounded-2xl border border-border shadow-sm">
                  <span className="text-muted-foreground text-xs font-semibold uppercase mb-1">{t("home.expenses", "Expenses")}</span>
                  <span className="text-foreground font-bold text-lg">{convertAndFormat(totals.expenses)}</span>
                </div>
              </div>
            </motion.div>

            {/* AI Insights Summary */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-primary/5 to-accent/5 p-5 rounded-3xl border border-primary/20 mb-6 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 relative z-10">
                <h3 className="text-foreground font-bold flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  AI Financial Analysis
                </h3>
                <button 
                  onClick={() => runAnalysis({ force: true })} 
                  disabled={aiLoading}
                  className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={aiLoading ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="relative z-10 text-sm text-muted-foreground leading-relaxed">
                {aiLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                ) : analysis ? (
                  <p>{analysis.financialInsights.summary}</p>
                ) : (
                  <p>Generate your first AI financial analysis to discover spending patterns.</p>
                )}
              </div>
            </motion.div>

            {/* Cash Flow Stacked Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card p-5 rounded-3xl border border-border mb-6 shadow-sm"
            >
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4">Cash Flow Overview</p>
              <CashFlowChart data={monthly} />
            </motion.div>

            {/* Income Trend Area Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-5 rounded-3xl border border-border mb-6 shadow-sm"
            >
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4">Income Trend</p>
              <IncomeTrendChart data={monthly} />
            </motion.div>

            {/* Category Donut Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card p-5 rounded-3xl border border-border mb-6 shadow-sm"
            >
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4">Spending by Category</p>
              <CategoryPieChart data={breakdown} />
            </motion.div>

            {/* Category breakdown list */}
            <div className="space-y-3 mb-8">
              {breakdown.map((item, index) => {
                const percent = totalSpending > 0 ? (item.value / totalSpending) * 100 : 0;
                return (
                  <motion.div
                    key={item.categoryId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.04 }}
                    className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 hover:border-primary/50 transition-colors shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-bold text-sm truncate">{item.name}</p>
                      <p className="text-muted-foreground text-xs font-medium">{item.count} transaction{item.count !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-black text-sm">{convertAndFormat(item.value)}</p>
                      <p className="text-muted-foreground text-xs font-bold">{percent.toFixed(1)}%</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/transactions")}
              className="w-full py-4 rounded-2xl bg-card hover:bg-muted border border-border text-foreground font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} className="text-primary" />
              Manage All Transactions
            </motion.button>
          </>
        )}
      </div>
    </PageShell>
  );
}
