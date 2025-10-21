import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar } from "lucide-react";

const periodSalesData = [
  { month: '4월', sales: 18500000 },
  { month: '5월', sales: 22300000 },
  { month: '6월', sales: 25100000 },
  { month: '7월', sales: 23800000 },
  { month: '8월', sales: 27600000 },
  { month: '9월', sales: 29200000 },
  { month: '10월', sales: 31500000 },
];

const paymentDistribution = [
  { name: '카드결제', value: 65, color: '#FEE500' },
  { name: '계좌이체', value: 20, color: '#FFB800' },
  { name: '간편결제', value: 10, color: '#3C1E1E' },
  { name: '현금', value: 5, color: '#F5F5F5' },
];

const hourlyData = [
  { time: '09:00', sales: 450000 },
  { time: '10:00', sales: 680000 },
  { time: '11:00', sales: 920000 },
  { time: '12:00', sales: 1450000 },
  { time: '13:00', sales: 1280000 },
  { time: '14:00', sales: 890000 },
  { time: '15:00', sales: 720000 },
  { time: '16:00', sales: 650000 },
  { time: '17:00', sales: 780000 },
  { time: '18:00', sales: 1120000 },
];

const storeComparison = [
  { store: '사장님 카페', sales: 31500000 },
  { store: '2호점', sales: 28200000 },
  { store: '3호점', sales: 24800000 },
];

const cancellationRate = [
  { month: '4월', rate: 2.1 },
  { month: '5월', rate: 1.8 },
  { month: '6월', rate: 2.3 },
  { month: '7월', rate: 2.5 },
  { month: '8월', rate: 2.0 },
  { month: '9월', rate: 2.8 },
  { month: '10월', rate: 3.2 },
];

const salesVsLabor = [
  { month: '4월', sales: 18500000, labor: 4200000 },
  { month: '5월', sales: 22300000, labor: 4500000 },
  { month: '6월', sales: 25100000, labor: 4800000 },
  { month: '7월', sales: 23800000, labor: 4600000 },
  { month: '8월', sales: 27600000, labor: 5200000 },
  { month: '9월', sales: 29200000, labor: 5400000 },
  { month: '10월', sales: 31500000, labor: 5600000 },
];

export default function Analytics() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#333333] mb-1">매출분석</h1>
        <p className="text-sm text-[#717182]">다양한 차트로 매출 데이터를 분석하세요</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Period Sales Trend */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#333333]">기간별 매출 추이</h3>
            <button className="p-2 hover:bg-[#F5F5F5] rounded-lg">
              <Calendar className="w-4 h-4 text-[#717182]" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={periodSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="month" stroke="#717182" />
              <YAxis stroke="#717182" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#FEE500"
                strokeWidth={3}
                dot={{ fill: '#FEE500', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#333333]">결제수단별 비중</h3>
            <button className="p-2 hover:bg-[#F5F5F5] rounded-lg">
              <Calendar className="w-4 h-4 text-[#717182]" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={paymentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Hourly Sales */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#333333]">시간대별 매출</h3>
            <button className="p-2 hover:bg-[#F5F5F5] rounded-lg">
              <Calendar className="w-4 h-4 text-[#717182]" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="time" stroke="#717182" />
              <YAxis stroke="#717182" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="sales" fill="#FEE500" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Store Comparison */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#333333]">가맹점별 매출 비교</h3>
            <button className="p-2 hover:bg-[#F5F5F5] rounded-lg">
              <Calendar className="w-4 h-4 text-[#717182]" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={storeComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis type="number" stroke="#717182" />
              <YAxis dataKey="store" type="category" stroke="#717182" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="sales" fill="#FFB800" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cancellation Rate */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#333333]">취소율 추이</h3>
            <button className="p-2 hover:bg-[#F5F5F5] rounded-lg">
              <Calendar className="w-4 h-4 text-[#717182]" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={cancellationRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="month" stroke="#717182" />
              <YAxis stroke="#717182" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#FF4D4D"
                strokeWidth={3}
                dot={{ fill: '#FF4D4D', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales vs Labor Cost */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#333333]">인건비 대비 매출 비율</h3>
            <button className="p-2 hover:bg-[#F5F5F5] rounded-lg">
              <Calendar className="w-4 h-4 text-[#717182]" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesVsLabor}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="month" stroke="#717182" />
              <YAxis stroke="#717182" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#FEE500" name="매출" radius={[8, 8, 0, 0]} />
              <Bar dataKey="labor" fill="#3C1E1E" name="인건비" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
