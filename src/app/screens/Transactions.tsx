import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Plus, Receipt } from "lucide-react";
import { toast } from "sonner";
import {
  GradientBackdrop,
  TransactionCard,
  TransactionFormSheet,
  TransactionFiltersBar,
  MonthlySummaryCard,
} from "../components/transactions";
import { lazy, Suspense } from "react";

const CategoryPieChart = lazy(() => import("../components/transactions/CategoryPieChart").then(m => ({ default: m.CategoryPieChart })));
const MonthlyBarChart = lazy(() => import("../components/transactions/MonthlyBarChart").then(m => ({ default: m.MonthlyBarChart })));
import { useTransactions, useFilteredTransactions } from "../../hooks/useTransactions";
import { useCurrency } from "../../hooks/useCurrency";
import {
  DEFAULT_TRANSACTION_FILTERS,
  type Transaction,
  type TransactionFilters,
} from "../../types/transaction";
import {
  getMonthTotals,
  getCategoryBreakdown,
  getMonthlySummaries,
} from "../../lib/transactions/analytics";
import { formatMonthLabel } from "../../lib/transactions/format";
import { format } from "date-fns";
import { PageShell } from "../components/ui/PageShell";
import { BackButton } from "../components/ui/BackButton";
import { EmptyState } from "../components/ui/EmptyState";
import { TransactionListSkeleton } from "../components/ui/ScreenLoader";

export function Transactions() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { convertAndFormat } = useCurrency();
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_TRANSACTION_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isAdding,
    isUpdating,
    isDeleting,
  } = useTransactions();

  const { transactions, all, isLoading, isError, availableMonths } =
    useFilteredTransactions(filters);

  const monthKey =
    filters.month === "all" ? format(new Date(), "yyyy-MM") : filters.month;
  const totals = getMonthTotals(all, monthKey);
  const breakdown = getCategoryBreakdown(all, monthKey);
  const monthlyChart = getMonthlySummaries(all, 6);

  const handleEdit = useCallback((tx: Transaction) => {
    setEditing(tx);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(async (tx: Transaction) => {
    if (!confirm(`Delete "${tx.merchant}"?`)) return;
    try {
      await deleteTransaction(tx.id);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    }
  }, [deleteTransaction]);

  return (
    <PageShell orbs={[{ color: "#9d4edd", position: "top-right" }, { color: "#00d9ff", position: "bottom-left" }]}>
      {/* Keep existing gradient for chart compat */}
      <GradientBackdrop />

      <div className="relative px-4 sm:px-6 pt-12 pb-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <BackButton onClick={() => navigate("/home")} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{t("transactions.title", "Transactions")}</h1>
            <p className="text-white/50 text-sm">{t("transactions.subtitle", "Manage spending & income")}</p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => { setEditing(null); setFormOpen(true); }}
            aria-label="Add transaction"
            className="bg-gradient-to-r from-[#00d9ff] to-[#00ff88] p-3 rounded-2xl text-black shadow-lg shadow-[#00d9ff]/20 shrink-0"
          >
            <Plus size={22} />
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MonthlySummaryCard
            income={totals.income}
            expenses={totals.expenses}
            net={totals.net}
            monthLabel={filters.month === "all" ? "This month" : formatMonthLabel(filters.month)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-card shadow-sm  rounded-3xl border border-border p-5 mb-5"
        >
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">{t("transactions.spendingByCategory", "Spending by Category")}</p>
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><p className="text-white/40">Loading chart...</p></div>}>
            <CategoryPieChart data={breakdown} />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
          className="bg-card shadow-sm  rounded-3xl border border-border p-5 mb-5"
        >
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Monthly Expenses</p>
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><p className="text-white/40">Loading chart...</p></div>}>
            <MonthlyBarChart data={monthlyChart} />
          </Suspense>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
          <TransactionFiltersBar
            filters={filters}
            availableMonths={availableMonths}
            onChange={(patch) => {
              setFilters((f) => ({ ...f, ...patch }));
              setVisibleCount(20);
            }}
          />
        </motion.div>

        {isLoading && <TransactionListSkeleton count={5} />}

        {isError && (
          <div className="text-center py-10 px-4">
            <p className="text-[#ff6b6b] text-sm" role="alert">
              {t("common.error", "Could not load transactions.")}
            </p>
          </div>
        )}

        {!isLoading && !isError && transactions.length === 0 && (
          <EmptyState
            icon={<Receipt size={36} />}
            title={all.length > 0 ? t("transactions.noMatches", "No matches") : t("transactions.noTransactions", "No transactions yet")}
            description={
              all.length > 0
                ? t("transactions.tryAdjusting", "Try adjusting your filters to find what you're looking for.")
                : t("transactions.startTracking", "Start tracking your spending and income by adding your first transaction.")
            }
            action={
              all.length === 0
                ? { label: t("home.addTransaction", "Add Transaction"), onClick: () => setFormOpen(true) }
                : undefined
            }
            secondaryAction={
              all.length > 0
                ? { label: t("transactions.clearFilters", "Clear filters"), onClick: () => setFilters(DEFAULT_TRANSACTION_FILTERS) }
                : undefined
            }
            accentColor="#00d9ff"
          />
        )}

        <div className="space-y-2.5 pb-4">
          {transactions.slice(0, visibleCount).map((tx, i) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
        
        {visibleCount < transactions.length && (
          <div className="flex justify-center pb-8 pt-4">
            <button
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="bg-card border border-white/10 hover:bg-white/5 text-white/70 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      <TransactionFormSheet
        open={formOpen}
        mode={editing ? "edit" : "add"}
        initial={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={async (input) => {
          const enrichedInput = { ...input };
          if (editing) {
            updateTransaction({ id: editing.id, input: enrichedInput })
              .then(() => toast.success("Transaction updated successfully"))
              .catch(() => toast.error("Failed to save transaction"));
          } else {
            addTransaction(enrichedInput)
              .then(() => toast.success("Transaction added successfully"))
              .catch(() => toast.error("Failed to save transaction"));
          }
          setFormOpen(false);
          setEditing(null);
        }}
        isSubmitting={isAdding || isUpdating}
      />
    </PageShell>
  );
}
