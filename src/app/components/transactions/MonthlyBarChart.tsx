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
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="label" stroke="#ffffff40" fontSize={12} tickLine={false} />
        <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "#0a0a14",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#fff",
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Bar dataKey="expenses" fill="#00d9ff" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
