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
  "2025-10-05": { store: 190000, delivery: 115000 },
  "2025-10-07": { store: 220000, delivery: 130000 },
  "2025-10-08": { store: 250000, delivery: 150000 },
  "2025-10-09": { store: 210000, delivery: 140000 },
  "2025-10-10": { store: 300000, delivery: 180000 },
  "2025-10-11": { store: 280000, delivery: 170000 },
  "2025-10-14": { store: 320000, delivery: 190000 },
  "2025-10-15": { store: 350000, delivery: 210000 },
  "2025-11-01": { store: 130000, delivery: 70000 },
  "2025-11-02": { store: 160000, delivery: 85000 },
  "2025-11-03": { store: 210000, delivery: 125000 },
  "2025-11-04": { store: 190000, delivery: 115000 },
  "2025-11-05": { store: 230000, delivery: 140000 },
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

  // 오늘 날짜를 "YYYY년 MM월 DD일 (요일)" 형식으로 생성
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
  const todayString = `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;

  // 오늘 매출 계산
  const todayDateString = formatDate(today);
  const todaySales = monthlySalesData[todayDateString]
    ? monthlySalesData[todayDateString].store + monthlySalesData[todayDateString].delivery
    : 0;

  // 어제 매출 계산
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDateString = formatDate(yesterday);
  const yesterdaySales = monthlySalesData[yesterdayDateString]
    ? monthlySalesData[yesterdayDateString].store + monthlySalesData[yesterdayDateString].delivery
    : 0;

  // 어제 대비 계산
  let yesterdayChangePercent = 0;
  if (yesterdaySales > 0) {
    yesterdayChangePercent = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
  }
  const isYesterdayPositive = yesterdayChangePercent >= 0;

  // 지난주 동일 요일 매출 계산
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekDateString = formatDate(lastWeek);
  const lastWeekSales = monthlySalesData[lastWeekDateString]
    ? monthlySalesData[lastWeekDateString].store + monthlySalesData[lastWeekDateString].delivery
    : 0;

  // 지난주 대비 계산
  let lastWeekChangePercent = 0;
  if (lastWeekSales > 0) {
    lastWeekChangePercent = ((todaySales - lastWeekSales) / lastWeekSales) * 100;
  }
  const isLastWeekPositive = lastWeekChangePercent >= 0;

  // 이번 달 누적 매출 및 지난달 동일 일 수 대비 계산
  const currentDayOfMonth = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let currentMonthCumulativeSales = 0;
  for (let i = 1; i <= currentDayOfMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const dateString = formatDate(date);
    if (monthlySalesData[dateString]) {
      currentMonthCumulativeSales += monthlySalesData[dateString].store + monthlySalesData[dateString].delivery;
    }
  }

  const prevMonthDate = new Date(today);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevMonthYear = prevMonthDate.getFullYear();

  let prevMonthCumulativeSales = 0;
  for (let i = 1; i <= currentDayOfMonth; i++) {
    const date = new Date(prevMonthYear, prevMonth, i);
    const dateString = formatDate(date);
    if (monthlySalesData[dateString]) {
      prevMonthCumulativeSales += monthlySalesData[dateString].store + monthlySalesData[dateString].delivery;
    }
  }

  let percentageChange = 0;
  if (prevMonthCumulativeSales > 0) {
    percentageChange = ((currentMonthCumulativeSales - prevMonthCumulativeSales) / prevMonthCumulativeSales) * 100;
  }
  const isPositiveChange = percentageChange >= 0;

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#333333] mb-1">대시보드</h1>
          <p className="text-sm text-[#717182]">오늘의 매출 현황을 확인하세요</p>
        </div>
        <div className="text-sm text-[#717182]">
          {todayString}
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
            <div className="text-2xl text-[#333333] mb-2">{todaySales.toLocaleString()}원</div>
            <div className={`flex items-center gap-1 text-sm ${isYesterdayPositive ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
              {isYesterdayPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(yesterdayChangePercent).toFixed(1)}% 어제 대비</span>
            </div>
          </Card>

          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#717182]">지난주 동일 요일 매출</span>
              <div className="w-10 h-10 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#3C1E1E]" />
              </div>
            </div>
            <div className="text-2xl text-[#333333] mb-2">{lastWeekSales.toLocaleString()}원</div>
            <div className={`flex items-center gap-1 text-sm ${isLastWeekPositive ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
              {isLastWeekPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(lastWeekChangePercent).toFixed(1)}% 지난주 대비</span>
            </div>
          </Card>

          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#717182]">이번 달 누적 매출</span>
              <div className="w-10 h-10 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#3C1E1E]" />
              </div>
            </div>
            <div className="text-2xl text-[#333333] mb-2">{currentMonthCumulativeSales.toLocaleString()}원</div>
            <div className={`flex items-center gap-1 text-sm ${isPositiveChange ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
              {isPositiveChange ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(percentageChange).toFixed(1)}% 지난달 동일 일 수 대비</span>
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
