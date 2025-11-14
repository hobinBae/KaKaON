import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formatYAxis = (tick: number) => {
  if (tick >= 1000000) {
    return `${(tick / 1000000).toFixed(1)}M`;
  }
  return `${tick / 1000}K`;
};

interface HourlySalesProps {
  data: { time: string; sales: number }[];
  activePeriod: string;
}

export default function HourlySales({ data, activePeriod }: HourlySalesProps) {
  return (
    <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
      <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">
        {activePeriod === 'today' ? '시간대별 매출' : '시간대별 평균 매출'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
          <XAxis dataKey="time" stroke="#717182" dy={10} />
          <YAxis stroke="#717182" tickFormatter={formatYAxis} />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}
            formatter={(value: number) => [`${value.toLocaleString()}원`, '매출']}
          />
          <Bar dataKey="sales" fill="#FEE500" radius={[8, 8, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
