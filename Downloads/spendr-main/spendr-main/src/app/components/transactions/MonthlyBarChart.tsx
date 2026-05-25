import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlySummary } from "../../../lib/transactions/analytics";
import { formatCurrency } from "../../../lib/userDisplay";

interface MonthlyBarChartProps {
  data: MonthlySummary[];
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  return (
    <div className="h-full min-h-[180px] w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <XAxis
          dataKey="label"
          stroke="#ffffff40"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          stroke="#ffffff40"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          width={42}
        />
        <Tooltip
          contentStyle={{
            background: "#0a0a14",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#fff",
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Bar dataKey="expenses" fill="#00d9ff" radius={[6, 6, 0, 0]} maxBarSize={34} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
