import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState, useEffect } from "react";

interface MenuSalesOverviewProps {
  data: { name: string; quantity: number }[];
  title: string;
}

const BROWN_ORANGE_COLORS = ['#e69900ff', '#fec430ff', '#ffe284ff', '#ffebc4ff', '#8c8c8cff', '#b1b1b1ff', '#e6e6e6ff',];

export default function MenuSalesOverview({ data, title }: MenuSalesOverviewProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 데이터 가공: 상위 6개 + 기타 (총 7개)
  const processedData = (() => {
    if (data.length <= 7) {
      return [...data].sort((a, b) => b.quantity - a.quantity);
    }

    const sortedData = [...data].sort((a, b) => b.quantity - a.quantity);
    const top6 = sortedData.slice(0, 6);
    const others = sortedData.slice(6);
    const othersQuantity = others.reduce((acc, curr) => acc + curr.quantity, 0);

    return [
      ...top6,
      { name: '기타', quantity: othersQuantity }
    ];
  })();

  const totalQuantity = processedData.reduce((acc, entry) => acc + entry.quantity, 0);
  const maxQuantity = Math.max(...processedData.map(d => d.quantity), 0);
  const tickInterval = 5;
  const ticks = Array.from({ length: Math.ceil(maxQuantity / tickInterval) + 1 }, (_, i) => i * tickInterval);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">{`${title}`}</h3>
        <ResponsiveContainer width="100%" height={300}>
          {totalQuantity > 0 ? (
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                  if (percent === 0) return null;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

                  // 메뉴명 길이 제한
                  const maxLength = isMobile ? 3 : 5;
                  const truncatedName = name.length > maxLength ? `${name.slice(0, maxLength)}..` : name;

                  // 비중에 따라 표시 내용 결정
                  const percentText = `${(percent * 100).toFixed(0)}%`;

                  if (percent < 0.08) {
                    // 8% 미만: 퍼센트만 표시
                    return (
                      <text x={x} y={y} fill="#2f2f2fff" textAnchor="middle" dominantBaseline="central" fontSize={isMobile ? 11 : 13} fontWeight="600">
                        {percentText}
                      </text>
                    );
                  } else {
                    // 8% 이상: 메뉴명과 퍼센트를 두 줄로 표시
                    return (
                      <g>
                        <text x={x} y={y - (isMobile ? 4 : 6)} fill="#2f2f2fff" textAnchor="middle" dominantBaseline="central" fontSize={isMobile ? 11 : 13} fontWeight="500">
                          {truncatedName}
                        </text>
                        <text x={x} y={y + (isMobile ? 4 : 6)} fill="#2f2f2fff" textAnchor="middle" dominantBaseline="central" fontSize={isMobile ? 11 : 13} fontWeight="600">
                          {percentText}
                        </text>
                      </g>
                    );
                  }
                }}
                outerRadius={isMobile ? 100 : 150}
                fill="#8884d8"
                dataKey="quantity"
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BROWN_ORANGE_COLORS[index % BROWN_ORANGE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}
                formatter={(value: number, name: string, props: any) => {
                  const menuName = props.payload.name;
                  return [`${value}건`, menuName];
                }}
              />
            </PieChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">데이터가 없습니다.</div>
          )}
        </ResponsiveContainer>
      </Card>
      <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">{`${title}`}</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, processedData.length * 40)}>
          {totalQuantity > 0 ? (
            <BarChart data={processedData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis type="number" allowDecimals={false} ticks={ticks} domain={[0, 'dataMax + 4']} />
              <YAxis
                type="category"
                dataKey="name"
                width={60}
                tickFormatter={(value) => value.length > 3 ? `${value.slice(0, 3)}..` : value}
              />
              <Tooltip formatter={(value: number) => [`${value}건`, "판매량"]} />
              <Bar dataKey="quantity" maxBarSize={45} radius={[0, 8, 8, 0]} label={{ position: 'right' }}>
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BROWN_ORANGE_COLORS[index % BROWN_ORANGE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">데이터가 없습니다.</div>
          )}
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
