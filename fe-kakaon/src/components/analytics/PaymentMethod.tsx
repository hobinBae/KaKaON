import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PaymentMethodProps {
  paymentDistribution: { name: string; value: number; color: string }[];
  salesTypeDistribution: { name: string; value: number; color: string }[];
  windowWidth: number;
}

export default function PaymentMethod({ paymentDistribution, salesTypeDistribution, windowWidth }: PaymentMethodProps) {
  const noPaymentData = paymentDistribution.every(item => item.value === 0);
  const noSalesTypeData = salesTypeDistribution.every(item => item.value === 0);

  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
      <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">결제수단별 비중</h3>
        <ResponsiveContainer width="100%" height={300}>
          {noPaymentData ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <p>매출 분석 내역이 없습니다.</p>
              <p className="text-xs mt-1">오늘 매출은 영업 종료 후에 확인해 주세요.</p>
            </div>
          ) : (
            <PieChart>
              <Pie
                data={paymentDistribution}
                animationDuration={300}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent, x, y, cx, cy, midAngle, innerRadius, outerRadius }) => {
                if (percent === 0) return null;
                if (windowWidth < 768) {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const xPos = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const yPos = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text x={xPos} y={yPos} fill="black" textAnchor="middle" dominantBaseline="central">
                      {name}
                    </text>
                  );
                }
                return (
                  <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {paymentDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          )}
        </ResponsiveContainer>
      </Card>
      <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">가게/배달 매출 비중</h3>
        <ResponsiveContainer width="100%" height={300}>
          {noSalesTypeData ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <p>매출 분석 내역이 없습니다.</p>
              <p className="text-xs mt-1">오늘 매출은 영업 종료 후에 확인해 주세요.</p>
            </div>
          ) : (
            <PieChart>
              <Pie
                data={salesTypeDistribution}
                animationDuration={300}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent, x, y, cx, cy, midAngle, innerRadius, outerRadius }) => {
                if (percent === 0) return null;
                if (windowWidth < 768) {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const xPos = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const yPos = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text x={xPos} y={yPos} fill="black" textAnchor="middle" dominantBaseline="central">
                      {name}
                    </text>
                  );
                }
                return (
                  <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              startAngle={270}
              endAngle={-90}
            >
              {salesTypeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          )}
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
