import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CancellationRateProps {
  data: { date?: string; month?: string; cancelRate: number }[];
  activePeriod: string;
  totalCancellations: number;
  isLoading: boolean;
}

export default function CancellationRate({ data, activePeriod, totalCancellations, isLoading }: CancellationRateProps) {
  return (
    <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#333333] text-center tablet:text-left">취소율 추이</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">총 취소 건수: {totalCancellations}건</p>
        </div>
      </div>
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">로딩중...</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
            <XAxis dataKey={activePeriod === 'this-year' ? 'month' : 'date'} stroke="#717182" dy={10} />
            <YAxis stroke="#717182" tickFormatter={(tick) => `${Math.round(tick)}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, '취소율']}
            />
            <Line type="linear" dataKey="cancelRate" stroke="#FF4D4D" strokeWidth={3} dot={{ fill: '#FF4D4D', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
