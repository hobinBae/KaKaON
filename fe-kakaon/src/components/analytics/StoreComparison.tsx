import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const formatYAxis = (tick: number) => {
  if (tick >= 1000000) {
    return `${(tick / 1000000).toFixed(1)}M`;
  }
  return `${tick / 1000}K`;
};

const StoreComparisonTick = ({ x, y, payload }: { x: number, y: number, payload: { value: string } }) => {
  const parts = payload.value.split('. ');
  const index = parts[0];
  const name = parts.slice(1).join('. ');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666" className="text-xs">
        <tspan x="-5" className="tablet:hidden">{index}</tspan>
        <tspan x="-5" className="hidden tablet:inline">{name}</tspan>
      </text>
    </g>
  );
};

interface StoreComparisonProps {
  data: { index: number; displayName: string; name: string; sales: number }[];
}

export default function StoreComparison({ data }: StoreComparisonProps) {
  return (
    <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
      <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">가맹점별 매출</h3>
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 50)}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
          <XAxis
            type="number"
            stroke="#717182"
            tickFormatter={formatYAxis}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="#717182"
            tick={StoreComparisonTick}
            width={90}
          />
          <Bar
            dataKey="sales"
            fill="#FEE500"
            radius={[0, 8, 8, 0]}
            maxBarSize={30}
            label={{ position: 'right', formatter: (value: number) => `${value.toLocaleString()}원` }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
