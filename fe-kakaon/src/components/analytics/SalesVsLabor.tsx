import { Card } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const formatYAxis = (tick: number) => {
  if (tick >= 1000000) {
    return `${(tick / 1000000).toFixed(1)}M`;
  }
  return `${tick / 1000}K`;
};

interface SalesVsLaborProps {
  data: { month: string; sales: number; labor: number; laborRatio: number }[];
}

export default function SalesVsLabor({ data }: SalesVsLaborProps) {
  return (
    <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
      <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">인건비 대비 매출 비율</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
          <XAxis dataKey="month" stroke="#717182" />
          <YAxis yAxisId="left" stroke="#717182" tickFormatter={formatYAxis} />
          <YAxis yAxisId="right" orientation="right" stroke="#FF4D4D" unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}
            formatter={(value: number, name: string) => {
              if (name === '인건비 비율') return [`${value}%`, name];
              return [`${value.toLocaleString()}원`, name];
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="sales" fill="#FEE500" name="매출" radius={[8, 8, 0, 0]} />
          <Bar yAxisId="left" dataKey="labor" fill="#3C1E1E" name="인건비" radius={[8, 8, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="laborRatio" stroke="#FF4D4D" strokeWidth={2} name="인건비 비율" dot={{ fill: '#FF4D4D', r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
