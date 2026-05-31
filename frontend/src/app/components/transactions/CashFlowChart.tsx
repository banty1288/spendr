import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import type { MonthlySummary } from "../../../lib/transactions/analytics";
import { useCurrency } from "../../../hooks/useCurrency";

interface CashFlowChartProps {
  data: MonthlySummary[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const { convertAndFormat } = useCurrency();

  return (
    <div className="h-[250px] w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="label"
          stroke="#ffffff40"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#ffffff40"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          width={60}
          tickFormatter={(val) => convertAndFormat(val)}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            color: "#fff",
            backdropFilter: "blur(10px)",
          }}
          formatter={(value: number) => convertAndFormat(value)}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
        <Bar dataKey="income" name="Income" stackId="a" fill="var(--primary)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="expenses" name="Expenses" stackId="a" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
