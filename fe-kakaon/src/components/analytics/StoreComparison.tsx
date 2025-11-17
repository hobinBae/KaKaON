import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { useState, useEffect } from "react";

const formatXAxis = (tick: number) => {
  if (tick >= 100000000) {
    return `${(tick / 100000000).toFixed(1)}억`;
  }
  if (tick >= 10000) {
    return `${(tick / 10000).toFixed(0)}만`;
  }
  if (tick >= 1000) {
    return `${(tick / 1000).toFixed(1)}천`;
  }
  return String(tick);
};

const StoreComparisonTick = ({ x, y, payload }: { x: number, y: number, payload: { value: string } }) => {
  const parts = payload.value.split('. ');
  const index = parts[0];
  const name = parts.slice(1).join('. ');
  const truncatedName = name.length > 5 ? `${name.slice(0, 5)}...` : name;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666" className="text-xs">
        <tspan x="-5" className="tablet:hidden">{index}</tspan>
        <tspan x="-5" className="hidden tablet:inline">{truncatedName}</tspan>
      </text>
    </g>
  );
};

interface StoreComparisonProps {
  data: { index: number; displayName: string; name: string; sales: number }[];
}

export default function StoreComparison({ data }: StoreComparisonProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
      <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">가맹점별 매출</h3>
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 50)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 80, left: isMobile ? -20 : 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
          <XAxis
            type="number"
            stroke="#717182"
            tickFormatter={formatXAxis}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="#717182"
            tick={StoreComparisonTick}
            width={isMobile ? 60 : 80}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}
            labelFormatter={(label) => {
              const parts = label.split('. ');
              return parts.slice(1).join('. ');
            }}
            formatter={(value: number) => [`${value.toLocaleString()}원`, "매출"]}
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
