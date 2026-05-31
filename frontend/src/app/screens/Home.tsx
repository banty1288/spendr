import { useEffect, useState, Suspense, lazy } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Plus, Users, ScanLine, MoreHorizontal, Bell } from "lucide-react";
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

import { computeBalanceFromTransactions, getMonthTotals } from "../../lib/transactions/analytics";
import { getCategoryById } from "../../lib/transactions/constants";
import { formatRelativeTime } from "../../lib/transactions/format";
import { useCurrency } from "../../hooks/useCurrency";
import { trackDashboardOpened } from "../../services/analytics";

import { SplitCreationFlow } from "../components/smartsplit/SplitCreationFlow";
import { useBillSplits } from "../../hooks/useBillSplits";

export function Home() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const uid = authUser?.uid;
  const { data: userData, isLoading: isProfileLoading } = useUserData();
  const { transactions: allTx, isLoading: txLoading } = useTransactions();
  const { t } = useTranslation();
  const { convertAndFormat } = useCurrency();
  const { createSplit } = useBillSplits();
  
  const [isCreateSplitOpen, setIsCreateSplitOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const monthKey = format(new Date(), "yyyy-MM");
  const { income, expenses } = getMonthTotals(allTx, monthKey);
  
  const { statuses: achievements } = useAchievements(allTx, userData ?? null);
  const { financialLevel } = useFinancialLevels(allTx, achievements, userData ?? null);

  useEffect(() => {
    trackDashboardOpened();
  }, []);

  const displayName = userData?.displayName ?? authUser?.displayName ?? "User";
  const balance = allTx.length > 0 ? computeBalanceFromTransactions(allTx) : (userData?.balance ?? 0);
  const recent = allTx.slice(0, 4);

  return (
    <div className="min-h-[100dvh] pb-safe-nav bg-background px-4 md:px-8 lg:px-12 pt-12">
      
      {/* 1. Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/profile")} className="w-12 h-12 rounded-full overflow-hidden border-2 border-border p-0.5">
            {userData?.photoURL || authUser?.photoURL ? (
              <img src={userData?.photoURL || authUser?.photoURL || undefined} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </button>
          <div>
            <p className="text-muted-foreground text-xs font-medium flex items-center gap-1">
              Hello 👋
            </p>
            <h1 className="text-xl font-bold text-foreground leading-tight">{displayName}</h1>
          </div>
        </div>
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border shadow-sm">
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border border-card"></span>
        </button>
      </motion.div>

      {/* 2. Hero Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
        className="relative w-full rounded-[24px] bg-card border border-border p-6 shadow-2xl mb-8 overflow-hidden group"
      >
        {/* Soft Glass Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-primary/10" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground text-sm font-medium">Total Balance</p>
            <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground hover:text-foreground transition-colors">
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          
          <h2 className="text-[40px] font-black text-foreground mb-1 tracking-tight">
            {isProfileLoading ? "..." : (showBalance ? convertAndFormat(balance) : "••••••••")}
          </h2>
          <p className="text-muted-foreground text-xs mb-6">Live balance from your transactions</p>

          {/* Mini Graph SVG */}
          <div className="w-full h-12 mb-6">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,30 L0,20 C20,20 30,5 50,15 C70,25 80,10 100,5 L100,30 Z" fill="url(#lineGlow)" />
              <path d="M0,20 C20,20 30,5 50,15 C70,25 80,10 100,5" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Income & Expenses */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <ArrowRight size={18} className="text-accent -rotate-45" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Income</p>
                <p className="text-foreground font-bold text-sm">{showBalance ? convertAndFormat(income) : "••••"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <ArrowRight size={18} className="text-destructive rotate-45" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Expenses</p>
                <p className="text-foreground font-bold text-sm">{showBalance ? convertAndFormat(expenses) : "••••"}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center gap-4 mb-8"
      >
        {[
          { id: 'add', icon: Plus, label: 'Add Expense', color: 'text-primary', bg: 'bg-primary/10', action: () => navigate("/transactions") },
          { id: 'split', icon: Users, label: 'Split Bill', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', action: () => setIsCreateSplitOpen(true) },
          { id: 'scan', icon: ScanLine, label: 'Scan & Pay', color: 'text-accent', bg: 'bg-accent/10', action: () => navigate("/transactions") },
          { id: 'more', icon: MoreHorizontal, label: 'More', color: 'text-muted-foreground', bg: 'bg-muted', action: () => navigate("/financial-wellness") },
        ].map((action) => (
          <button 
            key={action.id} 
            onClick={action.action}
            className="flex flex-col items-center gap-2 group outline-none"
          >
            <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center transition-transform active:scale-95 group-hover:-translate-y-1`}>
              <action.icon size={24} className={action.color} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* 4. Financial Wellness Hero */}
      <motion.button
        onClick={() => navigate("/financial-wellness")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-card border border-border rounded-3xl p-5 mb-8 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.98] outline-none text-left relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 border border-border flex items-center justify-center">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">Financial Wellness</h3>
            <p className="text-xs text-muted-foreground">Rewards, Streaks & Gamification</p>
          </div>
        </div>
        <ArrowRight size={20} className="text-muted-foreground relative z-10" />
      </motion.button>

      {/* 5. Progress Area (Reference implementation) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-foreground text-sm">Your Progress</h3>
          <button onClick={() => navigate("/financial-wellness")} className="text-xs font-semibold text-accent">View all</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Financial Wellness</p>
            <h4 className="text-xl font-bold text-accent mb-3">Level {financialLevel?.currentLevel ?? 1}</h4>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
              <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, ((financialLevel?.totalXp ?? 0) % 100))}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">{financialLevel?.totalXp ?? 0} XP Total</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">💎</div>
              <div className="text-right">
                <p className="text-xs font-bold text-foreground">65/100</p>
                <p className="text-[10px] text-muted-foreground">Match</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-0.5">Future Builder</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Keep going! You're building a strong future.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-foreground text-sm">Recent Transactions</h3>
          <button onClick={() => navigate("/transactions")} className="text-xs font-semibold text-primary">View all</button>
        </div>

        <div className="space-y-3">
          {txLoading ? (
            <p className="text-muted-foreground text-sm text-center py-4">Loading activity…</p>
          ) : recent.length === 0 ? (
            <button
              onClick={() => navigate("/transactions")}
              className="w-full bg-card shadow-sm border border-dashed border-border rounded-2xl py-8 text-primary text-sm font-medium"
            >
              + {t("home.addTransaction")}
            </button>
          ) : (
            recent.map((tx, index) => {
              const cat = getCategoryById(tx.categoryId);
              const isIncome = tx.type === "income";
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl shadow-inner">
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{tx.merchant}</h4>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.date)}</p>
                    </div>
                  </div>
                  <div className={`font-black text-sm ${isIncome ? "text-accent" : "text-foreground"}`}>
                    {isIncome ? "+" : "-"}{convertAndFormat(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      <SplitCreationFlow 
        isOpen={isCreateSplitOpen}
        onClose={() => setIsCreateSplitOpen(false)}
        onSubmit={createSplit}
      />
    </div>
  );
}

