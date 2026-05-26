import { motion } from "motion/react";
import { Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "../../../types/transaction";
import { getCategoryById } from "../../../lib/transactions/constants";
import { useCurrency } from "../../../hooks/useCurrency";
import { formatRelativeTime } from "../../../lib/transactions/format";


interface TransactionCardProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  isDeleting,
}: TransactionCardProps) {
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === "income";
  const { convertAndFormat } = useCurrency();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card shadow-sm  rounded-2xl border border-border p-4 flex items-center gap-3"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {category.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">{transaction.merchant}</p>
        <p className="text-white/50 text-xs truncate">
          {category.label}
          {transaction.notes ? ` · ${transaction.notes}` : ""}
        </p>
        <p className="text-white/40 text-[10px] mt-0.5">
          {formatRelativeTime(transaction.date)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`font-bold ${
            isIncome ? "text-[#00ff88]" : "text-white"
          }`}
        >
          {isIncome ? "+" : "-"}
          {convertAndFormat(transaction.amount)}
        </p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-xl bg-card shadow-sm border border-border hover:bg-white/10 transition-colors"
          aria-label="Edit transaction"
        >
          <Pencil size={14} className="text-white/70" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 rounded-xl bg-card border border-[#ff3366]/20 hover:bg-card transition-colors disabled:opacity-50"
          aria-label="Delete transaction"
        >
          <Trash2 size={14} className="text-[#ff3366]" />
        </button>
      </div>
    </motion.div>
  );
}
