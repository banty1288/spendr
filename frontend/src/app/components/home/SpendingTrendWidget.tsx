import { motion } from "motion/react";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { MonthlyBarChart } from "../transactions/MonthlyBarChart";
import { useCurrency } from "../../../hooks/useCurrency";

interface SpendingTrendWidgetProps {
  monthlyData: any[]; // From useTransactionAnalytics
  totalSpending: number;
  isLoading?: boolean;
}

export function SpendingTrendWidget({ monthlyData, totalSpending, isLoading }: SpendingTrendWidgetProps) {
  const { convertAndFormat } = useCurrency();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-card shadow-sm  p-5 rounded-3xl border border-border mb-6 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-24 bg-white/10 rounded-full" />
          <div className="h-4 w-12 bg-white/10 rounded-full" />
        </div>
        <div className="h-32 w-full bg-white/10 rounded-xl" />
      </div>
    );
  }

  if (!monthlyData || monthlyData.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card shadow-sm  p-5 rounded-3xl border border-border mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-[#00d9ff]" />
            <p className="text-white font-medium text-sm">Monthly Trend</p>
          </h3>
          <p className="text-white/50 text-xs mt-1">This month: {convertAndFormat(totalSpending)}</p>
        </div>
        <button 
          onClick={() => navigate("/analytics")}
          className="bg-card shadow-sm hover:bg-white/10 text-white/70 p-2 rounded-full transition-colors"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="h-32 -ml-2">
        <MonthlyBarChart data={monthlyData} />
      </div>
    </motion.div>
  );
}
