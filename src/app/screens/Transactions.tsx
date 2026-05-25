import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import {
  GradientBackdrop,
  TransactionCard,
  TransactionFormSheet,
  TransactionFiltersBar,
  MonthlySummaryCard,
  CategoryPieChart,
  MonthlyBarChart,
} from "../components/transactions";
import { useTransactions, useFilteredTransactions } from "../../hooks/useTransactions";
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

export function Transactions() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_TRANSACTION_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

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

  const handleDelete = async (tx: Transaction) => {
    if (!confirm(`Delete "${tx.merchant}"?`)) return;
    try {
      await deleteTransaction(tx.id);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      <GradientBackdrop />

      <div className="relative z-10 px-6 pt-12">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-white/60 text-sm">Manage spending & income</p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="bg-gradient-to-r from-[#00d9ff] to-[#00ff88] p-3 rounded-2xl text-black shadow-lg shadow-[#00d9ff]/20"
          >
            <Plus size={22} />
          </motion.button>
        </div>

        <MonthlySummaryCard
          income={totals.income}
          expenses={totals.expenses}
          net={totals.net}
          monthLabel={
            filters.month === "all" ? "This month" : formatMonthLabel(filters.month)
          }
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 mb-6">
          <p className="text-white/60 text-sm mb-3">Spending by category</p>
          <CategoryPieChart data={breakdown} />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 mb-6">
          <p className="text-white/60 text-sm mb-3">Monthly expenses</p>
          <MonthlyBarChart data={monthlyChart} />
        </div>

        <TransactionFiltersBar
          filters={filters}
          availableMonths={availableMonths}
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        />

        {isLoading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-[#00d9ff] animate-spin" />
            <p className="text-white/50 text-sm">Loading transactions…</p>
          </div>
        )}

        {isError && (
          <p className="text-[#ff6b6b] text-sm text-center py-8" role="alert">
            Could not load transactions. Check your connection and Firestore rules.
          </p>
        )}

        {!isLoading && !isError && transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-sm mb-4">No transactions yet</p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="text-[#00d9ff] font-medium"
            >
              Add your first transaction
            </button>
          </div>
        )}

        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onEdit={() => {
                setEditing(tx);
                setFormOpen(true);
              }}
              onDelete={() => handleDelete(tx)}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </div>

      <BottomNav />

      <TransactionFormSheet
        open={formOpen}
        mode={editing ? "edit" : "add"}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={async (input) => {
          try {
            if (editing) {
              await updateTransaction({ id: editing.id, input });
              toast.success("Transaction updated");
            } else {
              await addTransaction(input);
              toast.success("Transaction added");
            }
          } catch {
            toast.error("Failed to save transaction");
            throw new Error("save failed");
          }
        }}
        isSubmitting={isAdding || isUpdating}
      />
    </div>
  );
}
