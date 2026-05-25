import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { useTransactionAnalytics } from "../../hooks/useTransactions";
import { CategoryPieChart, MonthlyBarChart } from "../components/transactions";
import { formatCurrency } from "../../lib/userDisplay";
import { formatMonthLabel } from "../../lib/transactions/format";
import { getAvailableMonths } from "../../lib/transactions/analytics";
import { useTransactions } from "../../hooks/useTransactions";

export function Analytics() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const months = getAvailableMonths(transactions);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));

  const { breakdown, monthly, totals, isLoading } = useTransactionAnalytics(month);
  const totalSpending = breakdown.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d9ff]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00ff88]/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-white/60 text-sm">Your spending breakdown</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <Calendar size={16} className="text-white/60" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none"
            >
              {months.map((m) => (
                <option key={m} value={m} className="bg-[#0a0a14]">
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#00d9ff]/10 to-[#00ff88]/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/60 text-sm mb-1">Monthly Spending</p>
              <h2 className="text-4xl font-black text-white">
                {isLoading ? "—" : formatCurrency(totalSpending)}
              </h2>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 bg-[#00ff88]/20 px-3 py-2 rounded-full mb-1">
                <TrendingUp size={16} className="text-[#00ff88]" />
                <span className="text-[#00ff88] font-semibold text-sm">
                  {formatCurrency(totals.net)}
                </span>
              </div>
              <p className="text-white/50 text-xs">net this month</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-[#00ff88]">
              Income {formatCurrency(totals.income)}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-white">
              Expenses {formatCurrency(totals.expenses)}
            </span>
          </div>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 mb-6">
          <CategoryPieChart data={breakdown} />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 mb-6">
          <p className="text-white/60 text-sm mb-3">6-month trend</p>
          <MonthlyBarChart data={monthly} />
        </div>

        <div className="space-y-3">
          {breakdown.map((item, index) => (
            <motion.div
              key={item.categoryId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center gap-4"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{item.name}</p>
                <p className="text-white/40 text-xs">{item.count} transactions</p>
              </div>
              <p className="text-white font-bold">{formatCurrency(item.value)}</p>
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("/transactions")}
          className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-[#00d9ff]/20 to-[#00ff88]/20 border border-white/10 text-[#00d9ff] font-medium"
        >
          Manage transactions
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
