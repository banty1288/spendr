import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlySummary } from "../../../lib/transactions/analytics";
import { useCurrency } from "../../../hooks/useCurrency";

interface IncomeTrendChartProps {
  data: MonthlySummary[];
}

export function IncomeTrendChart({ data }: IncomeTrendChartProps) {
  const { convertAndFormat } = useCurrency();

  return (
    <div className="h-[200px] w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Area type="monotone" dataKey="income" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
