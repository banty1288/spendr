import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { CategorySpending } from "../../../types/weeklyReport";
import { getCategoryById } from "../../../lib/transactions/constants";

interface CategoryBreakdownProps {
  categories: CategorySpending[];
  totalExpenses: number;
  className?: string;
}

export function CategoryBreakdown({
  categories,
  totalExpenses,
  className = "",
}: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-gradient-to-br from-white/5 to-white/[0.02] p-6 text-center">
        <p className="text-white/60">No category data available</p>
      </div>
    );
  }

  const topCategories = categories.slice(0, 5);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-2xl border border-border bg-gradient-to-br from-white/5 to-white/[0.02] p-6 ">
        <h3 className="text-lg font-semibold text-white mb-6">Category Breakdown</h3>

        <div className="space-y-4">
          {topCategories.map((cat, idx) => {
            const categoryInfo = getCategoryById(cat.categoryId);
            const isIncrease = cat.trend === "up";
            const trendIcon = isIncrease ? (
              <TrendingUp size={14} className="text-[#ff3366]" />
            ) : (
              <TrendingDown size={14} className="text-[#00ff88]" />
            );

            return (
              <motion.div
                key={cat.categoryId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{categoryInfo?.icon || "💳"}</span>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {categoryInfo?.label || cat.categoryName}
                      </p>
                      <p className="text-xs text-white/50">
                        ${cat.amount.toFixed(2)} • {cat.percentOfTotal.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {trendIcon}
                    <span
                      className={`text-xs font-medium ${
                        isIncrease ? "text-[#ff3366]" : "text-[#00ff88]"
                      }`}
                    >
                      {Math.abs(cat.trendPercent).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#9d4edd] to-[#c77dff] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.amount / totalExpenses) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {categories.length > 5 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-white/50">
              +{categories.length - 5} more categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
