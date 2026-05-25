import { motion } from "motion/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../../lib/userDisplay";

interface MonthlySummaryCardProps {
  income: number;
  expenses: number;
  net: number;
  monthLabel?: string;
}

export function MonthlySummaryCard({
  income,
  expenses,
  net,
  monthLabel = "This month",
}: MonthlySummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-[#00d9ff]/10 to-[#00ff88]/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6"
    >
      <p className="text-white/60 text-sm mb-4">{monthLabel}</p>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-[#00ff88]" />
            <span className="text-white/40 text-xs">Income</span>
          </div>
          <p className="text-[#00ff88] font-bold">{formatCurrency(income)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={14} className="text-[#ff3366]" />
            <span className="text-white/40 text-xs">Spent</span>
          </div>
          <p className="text-white font-bold">{formatCurrency(expenses)}</p>
        </div>
        <div>
          <span className="text-white/40 text-xs">Net</span>
          <p
            className={`font-bold ${
              net >= 0 ? "text-[#00d9ff]" : "text-[#ff3366]"
            }`}
          >
            {formatCurrency(net)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
