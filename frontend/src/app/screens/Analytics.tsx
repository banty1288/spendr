import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, Calendar, BarChart2, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { useTransactionAnalytics } from "../../hooks/useTransactions";
import { CategoryPieChart, MonthlyBarChart } from "../components/transactions";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { formatMonthLabel } from "../../lib/transactions/format";
import { getAvailableMonths } from "../../lib/transactions/analytics";
import { useTransactions } from "../../hooks/useTransactions";
import { PageShell } from "../components/ui/PageShell";
import { BackButton } from "../components/ui/BackButton";
import { EmptyState } from "../components/ui/EmptyState";
import { AnalyticsSkeleton } from "../components/ui/ScreenLoader";

export function Analytics() {
  const navigate = useNavigate();
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const months = getAvailableMonths(transactions);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const { convertAndFormat } = useCurrency();
  const { t } = useTranslation();

  const { breakdown, monthly, totals, isLoading } = useTransactionAnalytics(month);
  const totalSpending = breakdown.reduce((acc, item) => acc + item.value, 0);
  const hasData = !isLoading && breakdown.length > 0;

  return (
    <PageShell orbs={[{ color: "#00d9ff", position: "top-right" }, { color: "#00ff88", position: "bottom-left" }]}>
      <div className="px-4 sm:px-6 pt-12 pb-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <BackButton onClick={() => navigate("/home")} />
            <h1 className="text-2xl font-bold text-white">{t("nav.analytics")}</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">Track where your money goes</p>
            {/* Month selector */}
            <div className="bg-card shadow-sm  px-3 py-2 rounded-full border border-border flex items-center gap-2 shrink-0">
              <Calendar size={14} className="text-white/50" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                aria-label="Select month"
              >
                {months.map((m) => (
                  <option key={m} value={m} className="bg-zinc-900">
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <AnalyticsSkeleton />
        ) : !hasData ? (
          <EmptyState
            icon={<BarChart2 size={36} />}
            title="No data yet"
            description="Add transactions to start seeing your spending analytics and category breakdown."
            action={{ label: "Add Transaction", onClick: () => navigate("/transactions") }}
            accentColor="#00d9ff"
          />
        ) : (
          <>
            {/* Summary hero card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="bg-gradient-to-br from-card to-card  p-6 rounded-3xl border border-border mb-5 relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 w-40 h-40 bg-card rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between gap-3 relative mb-6">
                <div>
                  <p className="text-white/60 text-sm mb-1">{t("analytics.totalSpending", "Total Spending")}</p>
                  <h2 className="text-4xl font-black text-white">
                    {convertAndFormat(totalSpending)}
                  </h2>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-1 text-sm font-semibold ${totals.net >= 0 ? "bg-card text-[#00ff88]" : "bg-card text-[#ff3366]"}`}>
                    <ArrowUpRight size={14} className={totals.net < 0 ? "rotate-180" : ""} />
                    {convertAndFormat(Math.abs(totals.net))}
                  </div>
                  <p className="text-white/40 text-xs">net this month</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-[#00ff88]/10">
                  <span className="text-white/60">{t("home.income", "Income")}</span>
                  <span className="text-[#00ff88] font-semibold">{convertAndFormat(totals.income)}</span>
                </div>
                <div className="flex justify-between items-center bg-card shadow-sm p-4 rounded-2xl border border-border">
                  <span className="text-white/60">{t("home.expenses", "Expenses")}</span>
                  <span className="text-white font-semibold">{convertAndFormat(totals.expenses)}</span>
                </div>
              </div>
            </motion.div>

            {/* Category chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card shadow-sm  rounded-3xl border border-border p-5 mb-5"
            >
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Spending by Category</p>
              <CategoryPieChart data={breakdown} />
            </motion.div>

            {/* Bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card shadow-sm  rounded-3xl border border-border p-5 mb-5"
            >
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">6-Month Trend</p>
              <MonthlyBarChart data={monthly} />
            </motion.div>

            {/* Category breakdown list */}
            <div className="space-y-2.5 mb-6">
              {breakdown.map((item, index) => {
                const percent = totalSpending > 0 ? (item.value / totalSpending) * 100 : 0;
                return (
                  <motion.div
                    key={item.categoryId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + index * 0.04 }}
                    className="bg-card shadow-sm  p-4 rounded-2xl border border-white/8 flex items-center gap-4 hover:bg-white/8 transition-colors"
                  >
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-white/40 text-xs">{item.count} transaction{item.count !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">{convertAndFormat(item.value)}</p>
                      <p className="text-white/40 text-xs">{percent.toFixed(1)}%</p>
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
              className="w-full py-4 rounded-2xl bg-card shadow-sm hover:bg-white/10 border border-border text-white/70 font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp size={16} />
              Manage Transactions
            </motion.button>
          </>
        )}
      </div>
    </PageShell>
  );
}
