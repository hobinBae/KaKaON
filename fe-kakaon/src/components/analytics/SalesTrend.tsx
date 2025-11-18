import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formatYAxis = (tick: number) => {
  if (tick >= 1000000) {
    return `${(tick / 1000000).toFixed(1)}M`;
  }
  return `${tick / 1000}K`;
};

interface SalesTrendProps {
  data: { time?: string; date?: string; month?: string; sales: number }[];
  xAxisDataKey: string;
}

export default function SalesTrend({ data, xAxisDataKey }: SalesTrendProps) {
  return (
    <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
      <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">기간별 매출 추이</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
          <XAxis dataKey={xAxisDataKey} stroke="#717182" dy={10} />
          <YAxis stroke="#717182" tickFormatter={formatYAxis} />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}
            formatter={(value: number) => [`${value.toLocaleString()}원`, '매출']}
          />
          <Line type="linear" dataKey="sales" stroke="#FEE500" strokeWidth={3} dot={{ fill: '#FEE500', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
