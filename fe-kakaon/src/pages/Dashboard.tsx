import * as React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { DayProps } from "react-day-picker";

// 더미 데이터: 가게, 배달, 총 매출 포함
const monthlySalesData: { [key: string]: { store: number; delivery: number } } = {
  "2025-10-01": { store: 120000, delivery: 80000 },
  "2025-10-02": { store: 150000, delivery: 90000 },
  "2025-10-03": { store: 200000, delivery: 120000 },
  "2025-10-04": { store: 180000, delivery: 110000 },
  "2025-10-07": { store: 220000, delivery: 130000 },
  "2025-10-08": { store: 250000, delivery: 150000 },
  "2025-10-09": { store: 210000, delivery: 140000 },
  "2025-10-10": { store: 300000, delivery: 180000 },
  "2025-10-11": { store: 280000, delivery: 170000 },
  "2025-10-14": { store: 320000, delivery: 190000 },
  "2025-10-15": { store: 350000, delivery: 210000 },
};

const salesData = [
  { date: '10/9', amount: 2450000 },
  { date: '10/10', amount: 2100000 },
  { date: '10/11', amount: 2800000 },
  { date: '10/12', amount: 2200000 },
  { date: '10/13', amount: 3100000 },
  { date: '10/14', amount: 2900000 },
  { date: '10/15', amount: 3350000 },
];

// 날짜를 'YYYY-MM-DD' 형식으로 변환하는 헬퍼 함수
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 각 날짜 셀의 내용을 구성하는 커스텀 컴포넌트
function DayContent({ date, displayMonth }: DayProps) {
  const isOutsideDay = date.getMonth() !== displayMonth.getMonth();
  const dateString = formatDate(date);
  const data = monthlySalesData[dateString];
  const total = data ? data.store + data.delivery : 0;

  return (
    <div className="flex flex-col h-full p-2 text-left text-xs">
      <span
        className={`font-medium self-start text-sm ${
          isOutsideDay ? "text-muted-foreground" : ""
        }`}
      >
        {date.getDate()}
      </span>
      <div className="flex-1 flex flex-col justify-end mt-1 space-y-0.5 text-right">
        {data && !isOutsideDay ? (
          <>
            <div className="text-orange-500 truncate">{data.store.toLocaleString()}</div>
            <div className="text-sky-500 truncate">{data.delivery.toLocaleString()}</div>
            <div className="text-black font-semibold truncate">{total.toLocaleString()}</div>
          </>
        ) : (
          <>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </>
        )}
      </div>
    </div>
  );
}

const formatYAxis = (tick: number) => {
  if (tick >= 1000000) {
    return `${(tick / 1000000).toFixed(1)}M`;
  }
  return `${tick / 1000}K`;
};

export default function Dashboard() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#333333] mb-1">대시보드</h1>
          <p className="text-sm text-[#717182]">오늘의 매출 현황을 확인하세요</p>
        </div>
        <div className="text-sm text-[#717182]">
          2025년 10월 15일 (수)
        </div>
      </div>

      <div className="flex flex-1 space-x-6">
        {/* Left: Calendar */}
        <div className="w-3/4">
          <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none h-full flex flex-col">
            <div className="flex justify-end text-sm space-x-4 pr-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span>가게</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-500 rounded-full" />
                <span>배달</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full" />
                <span>총</span>
              </div>
            </div>
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                components={{
                  Day: DayContent,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Right: Stats Cards */}
        <div className="w-1/4 flex flex-col space-y-4 justify-between">
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#717182]">오늘 매출</span>
              <div className="w-10 h-10 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#3C1E1E]" />
              </div>
            </div>
            <div className="text-2xl text-[#333333] mb-2">3,350,000원</div>
            <div className="flex items-center gap-1 text-sm text-[#4CAF50]">
              <TrendingUp className="w-4 h-4" />
              <span>15.4% 어제 대비</span>
            </div>
          </Card>

          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#717182]">이번주 취소율</span>
              <div className="w-10 h-10 rounded-lg bg-[#FF4D4D]/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#FF4D4D]" />
              </div>
            </div>
            <div className="text-2xl text-[#333333] mb-2">3.2%</div>
            <div className="flex items-center gap-1 text-sm text-[#FF4D4D]">
              <TrendingUp className="w-4 h-4" />
              <span>1.2%p 전주 대비</span>
            </div>
          </Card>

          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#717182]">이상거래</span>
              <div className="w-10 h-10 rounded-lg bg-[#FF4D4D]/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#FF4D4D]" />
              </div>
            </div>
            <div className="text-2xl text-[#333333] mb-2">2건</div>
            <div className="text-sm text-[#FF4D4D]">미확인 알림 있음</div>
          </Card>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <h3 className="text-[#333333] mb-6">최근 7일 매출 추이</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={salesData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
            <XAxis dataKey="date" stroke="#717182" />
            <YAxis stroke="#717182" tickFormatter={formatYAxis} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="linear"
              dataKey="amount"
              stroke="#FEE500"
              strokeWidth={3}
              dot={{ fill: '#FEE500', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
