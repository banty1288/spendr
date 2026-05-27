import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryBreakdownItem } from "../../../lib/transactions/analytics";
import { useCurrency } from "../../../hooks/useCurrency";

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { convertAndFormat } = useCurrency();
  if (!data || data.length === 0) {
    return (
      <div className="h-[190px] min-[375px]:h-[200px] min-w-0 flex items-center justify-center text-white/40 text-sm text-center px-4">
        No expense data for this period
      </div>
    );
  }

  return (
    <div className="h-[190px] min-[375px]:h-[200px] w-full min-w-0 overflow-hidden">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          activeShape={false}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            background: "#181825",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
          itemStyle={{ color: "#fff", fontWeight: 600 }}
          formatter={(value: number) => [convertAndFormat(value), ""]}
          separator=""
        />
      </PieChart>
    </ResponsiveContainer>
    </div>
  );
}
