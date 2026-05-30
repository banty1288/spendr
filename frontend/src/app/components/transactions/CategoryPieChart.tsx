import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import type { CategoryBreakdownItem } from "../../../lib/transactions/analytics";
import { useCurrency } from "../../../hooks/useCurrency";

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, convertAndFormat } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill={fill} fontSize={16} fontWeight="bold">
        {convertAndFormat(value)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { convertAndFormat } = useCurrency();
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || data.length === 0) {
    return (
      <div className="h-[190px] min-[375px]:h-[220px] min-w-0 flex items-center justify-center text-white/40 text-sm text-center px-4">
        No expense data for this period
      </div>
    );
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="h-[190px] min-[375px]:h-[220px] w-full min-w-0 overflow-hidden">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={(props: any) => renderActiveShape({ ...props, convertAndFormat })}
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={85}
          paddingAngle={4}
          onMouseEnter={onPieEnter}
          stroke="none"
          cornerRadius={4}
        >
          {data.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "rgba(10, 10, 20, 0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            color: "#fff",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
          }}
          itemStyle={{ color: "#fff", fontWeight: "bold" }}
          formatter={(value: number) => convertAndFormat(value)}
        />
      </PieChart>
    </ResponsiveContainer>
    </div>
  );
}
