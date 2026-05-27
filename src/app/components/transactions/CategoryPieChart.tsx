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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0].payload;
      return (
        <div className="bg-[#181825] border border-white/10 rounded-xl px-3 py-2 shadow-xl outline-none">
          <p className="text-white/80 font-medium text-xs m-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </p>
          <p className="text-white font-bold text-sm m-0 mt-0.5 pl-4">
            {convertAndFormat(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[190px] min-[375px]:h-[200px] w-full min-w-0 overflow-visible" style={{ WebkitTapHighlightColor: "transparent", outline: "none" }}>
    <ResponsiveContainer width="100%" height="100%" className="outline-none" style={{ overflow: "visible" }}>
      <PieChart style={{ outline: "none", overflow: "visible" }}>
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
          isAnimationActive={false}
          stroke="none"
          style={{ outline: "none" }}
        >
          {data.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} stroke="none" style={{ outline: "none" }} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} cursor={false} />
      </PieChart>
    </ResponsiveContainer>
    </div>
  );
}
