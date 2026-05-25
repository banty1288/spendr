import { motion, useMotionValue, useTransform } from "motion/react";
import { Sparkles, TrendingUp, TrendingDown, Zap, ArrowRight, Flame, Brain, Target, Eye } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { useAuthStore } from "../../store/authStore";
import { useUserData } from "../../hooks/useUserData";
import { useTransactions } from "../../hooks/useTransactions";
import {
  computeBalanceFromTransactions,
  getMonthTotals,
} from "../../lib/transactions/analytics";
import { getCategoryById } from "../../lib/transactions/constants";
import { formatRelativeTime } from "../../lib/transactions/format";
import { formatCurrency, getGreeting } from "../../lib/userDisplay";

export function Home() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const { data: userData, isLoading: isProfileLoading } = useUserData();
  const { transactions: allTx, isLoading: txLoading } = useTransactions();

  const displayName =
    userData?.displayName ?? authUser?.displayName ?? "there";
  const balance =
    allTx.length > 0
      ? computeBalanceFromTransactions(allTx)
      : (userData?.balance ?? 0);

  const monthKey = format(new Date(), "yyyy-MM");
  const { income, expenses } = getMonthTotals(allTx, monthKey);
  const recent = allTx.slice(0, 4);

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-80 h-80 bg-[#00d9ff]/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-0 w-80 h-80 bg-[#00ff88]/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9d4edd]/20 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 px-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-white/60 text-sm mb-1">{getGreeting()} 👋</p>
            <h1 className="text-2xl font-bold text-white">
              {isProfileLoading ? "…" : displayName}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#ff6b35]/20 to-[#f7931e]/20 px-3 py-2 rounded-full border border-[#ff6b35]/30 cursor-pointer"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Flame size={16} className="text-[#ff6b35]" />
              </motion.div>
              <span className="text-[#ff6b35] font-bold text-sm">12</span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
            >
              <Sparkles size={20} className="text-[#00d9ff]" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#00d9ff]/10 to-[#00ff88]/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6 relative overflow-hidden cursor-pointer group"
          onClick={() => navigate("/transactions")}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#00d9ff]/5 to-[#00ff88]/5"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d9ff]/20 rounded-full blur-3xl group-hover:bg-[#00d9ff]/30 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm">Total Balance</p>
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
              {isProfileLoading || txLoading ? "—" : formatCurrency(balance)}
            </motion.h2>
            <p className="text-white/50 text-xs mb-4">Live balance from your transactions</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="bg-[#00ff88]/20 p-2 rounded-xl">
                  <TrendingUp size={16} className="text-[#00ff88]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Income</p>
                  <p className="text-white font-bold">{formatCurrency(income)}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="bg-[#ff3366]/20 p-2 rounded-xl">
                  <TrendingDown size={16} className="text-[#ff3366]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Expenses</p>
                  <p className="text-white font-bold">{formatCurrency(expenses)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/insights")}
          className="bg-gradient-to-br from-[#9d4edd]/20 to-[#c77dff]/20 backdrop-blur-sm p-5 rounded-3xl border border-[#9d4edd]/30 mb-6 relative overflow-hidden cursor-pointer group"
        >
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-[#9d4edd]/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <div className="relative flex items-start gap-4">
            <motion.div
              className="bg-gradient-to-br from-[#9d4edd] to-[#c77dff] p-3 rounded-2xl shrink-0"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              <Brain size={24} className="text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">AI Detected Pattern</h3>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-[#00ff88] rounded-full"
                />
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-2">
                Your <span className="text-[#ff3366] font-semibold">weekend spending</span> is 2.3x higher than weekdays.
                <span className="text-[#00ff88] font-semibold"> Meal prep Sundays</span> could save you <span className="text-[#ffd60a] font-bold">$480/month</span>.
              </p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Sparkles size={12} className="text-[#9d4edd]" />
                <span>Based on 90 days of behavioral analysis</span>
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight size={20} className="text-[#9d4edd] shrink-0 mt-1" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/personality")}
          className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/10 mb-6 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00ff88]/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">Financial Wellness</h3>
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sparkles size={16} className="text-[#00ff88]" />
                </motion.div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00ff88] text-3xl font-black">78</span>
                <div className="text-xs text-white/60">
                  <div className="text-[#00ff88]">+5</div>
                  <div>vs last week</div>
                </div>
              </div>
            </div>
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "78%" }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00d9ff] via-[#00ff88] to-[#00d9a5] rounded-full"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-end pr-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 }}
                  className="w-2 h-2 bg-white rounded-full shadow-lg"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-xs">You're in the top <span className="text-[#00ff88] font-bold">22%</span> of savers</p>
              <p className="text-white/50 text-xs">220 XP to level 5</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Activity</h3>
            <motion.button
              onClick={() => navigate("/transactions")}
              className="text-[#00d9ff] text-sm flex items-center gap-1 group"
              whileHover={{ x: 2 }}
            >
              <span>View All</span>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={16} />
              </motion.div>
            </motion.button>
          </div>
          <div className="space-y-3">
            {txLoading && (
              <p className="text-white/40 text-sm text-center py-4">Loading activity…</p>
            )}
            {!txLoading && recent.length === 0 && (
              <button
                type="button"
                onClick={() => navigate("/transactions")}
                className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl py-8 text-[#00d9ff] text-sm font-medium"
              >
                + Add your first transaction
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
                  className={`w-full bg-white/5 backdrop-blur-sm p-4 rounded-2xl border ${
                    isIncome ? "border-[#00ff88]/20" : "border-white/10"
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
                    {formatCurrency(tx.amount)}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
