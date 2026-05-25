import { Search } from "lucide-react";
import type { TransactionFilters } from "../../../types/transaction";
import { TRANSACTION_CATEGORIES } from "../../../lib/transactions/constants";
import { formatMonthLabel } from "../../../lib/transactions/format";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  availableMonths: string[];
  onChange: (patch: Partial<TransactionFilters>) => void;
}

export function TransactionFiltersBar({
  filters,
  availableMonths,
  onChange,
}: TransactionFiltersBarProps) {
  return (
    <div className="space-y-3 mb-4">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          placeholder="Search merchant or notes…"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-white/40 focus:border-[#00d9ff] focus:outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(["all", "expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ type: t })}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium capitalize ${
              filters.type === t
                ? "bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/40"
                : "bg-white/5 text-white/50 border border-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onChange({ categoryId: "all" })}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${
            filters.categoryId === "all"
              ? "bg-white/15 text-white border border-white/20"
              : "bg-white/5 text-white/50 border border-white/10"
          }`}
        >
          All categories
        </button>
        {TRANSACTION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange({ categoryId: cat.id })}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${
              filters.categoryId === cat.id
                ? "bg-white/15 text-white border border-white/20"
                : "bg-white/5 text-white/50 border border-white/10"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <select
        value={filters.month}
        onChange={(e) => onChange({ month: e.target.value })}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm focus:border-[#00d9ff] focus:outline-none"
      >
        <option value="all" className="bg-[#0a0a14]">
          All months
        </option>
        {availableMonths.map((m) => (
          <option key={m} value={m} className="bg-[#0a0a14]">
            {formatMonthLabel(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
