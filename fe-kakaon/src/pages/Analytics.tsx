import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar as CalendarIcon, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { addDays, format, differenceInCalendarDays, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, parse, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { ko } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Helper Functions & Dummy Data ---

const generateDailyData = () => {
  const data = [];
  const endDate = new Date(2025, 9, 23); // Today
  for (let i = 0; i < 365; i++) {
    const date = addDays(endDate, -i);
    const sales = Math.floor(Math.random() * 1500000) + 500000;
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      sales: sales,
      cancellations: Math.floor(Math.random() * (sales / 100000)),
      labor: sales * (Math.random() * 0.1 + 0.2),
      paymentMethods: {
        card: sales * 0.6,
        account: sales * 0.2,
        kakaopay: sales * 0.15,
        cash: sales * 0.05,
      },
      hourly: Array.from({ length: 12 }, (_, j) => ({
        time: `${(j + 9).toString().padStart(2, '0')}:00`,
        sales: Math.floor(Math.random() * (sales / 8)),
      })),
    });
  }
  return data.reverse();
};

const allSalesData = generateDailyData();

const formatYAxis = (tick: number) => {
  if (tick >= 1000000) {
    return `${(tick / 1000000).toFixed(0)}M`;
  }
  return `${(tick / 1000).toFixed(0)}K`;
};

// --- Component ---

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [activePeriod, setActivePeriod] = useState<string>("today");
  const [showCalendar, setShowCalendar] = useState(false);

  // State for processed chart data
  const [periodSales, setPeriodSales] = useState<any[]>([]);
  const [xAxisDataKey, setXAxisDataKey] = useState<string>('date');
  const [paymentDistribution, setPaymentDistribution] = useState<any[]>([]);
  const [hourlySales, setHourlySales] = useState<any[]>([]);
  const [cancellationRate, setCancellationRate] = useState<any[]>([]);
  const [salesVsLabor, setSalesVsLabor] = useState<any[]>([]);

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    const filteredData = allSalesData.filter(d => {
      const date = new Date(d.date);
      return date >= startOfDay(dateRange.from!) && date <= endOfDay(dateRange.to!);
    });

    const daysDiff = differenceInCalendarDays(dateRange.to, dateRange.from);

    if (daysDiff < 1) { // Single day
      setXAxisDataKey('time');
      const hourlyTotals: { [key: string]: number } = {};
      filteredData.forEach(d => {
        d.hourly.forEach(h => {
          hourlyTotals[h.time] = (hourlyTotals[h.time] || 0) + h.sales;
        });
      });
      setPeriodSales(Object.entries(hourlyTotals).map(([time, sales]) => ({ time, sales })).sort((a, b) => a.time.localeCompare(b.time)));
    } else if (daysDiff <= 31) { // Daily
      setXAxisDataKey('date');
      setPeriodSales(filteredData.map(d => ({ date: format(new Date(d.date), 'MM/dd'), sales: d.sales })));
    } else { // Monthly
      setXAxisDataKey('month');
      const monthlySales: { [key: string]: number } = {};
      filteredData.forEach(d => {
        const month = format(new Date(d.date), 'yyyy-MM');
        monthlySales[month] = (monthlySales[month] || 0) + d.sales;
      });
      setPeriodSales(Object.entries(monthlySales).map(([month, sales]) => ({ month: month.slice(5) + '월', sales })));
    }

    // Process other charts (they can aggregate over the whole selected period)
    const totalPayments = { card: 0, account: 0, kakaopay: 0, cash: 0 };
    filteredData.forEach(d => {
      totalPayments.card += d.paymentMethods.card;
      totalPayments.account += d.paymentMethods.account;
      totalPayments.kakaopay += d.paymentMethods.kakaopay;
      totalPayments.cash += d.paymentMethods.cash;
    });
    setPaymentDistribution([
      { name: '카드결제', value: totalPayments.card, color: '#FEE500' },
      { name: '계좌이체', value: totalPayments.account, color: '#FFB800' },
      { name: '카카오페이', value: totalPayments.kakaopay, color: '#3C1E1E' },
      { name: '현금', value: totalPayments.cash, color: '#9e9e9eff' },
    ]);

    const hourlyTotals: { [key: string]: number } = {};
    filteredData.forEach(d => {
      d.hourly.forEach(h => {
        hourlyTotals[h.time] = (hourlyTotals[h.time] || 0) + h.sales;
      });
    });
    setHourlySales(Object.entries(hourlyTotals).map(([time, sales]) => ({ time, sales })).sort((a, b) => a.time.localeCompare(b.time)));

  }, [dateRange]);

  useEffect(() => {
    if (!dateRange?.from) return;

    const year = dateRange.from.getFullYear();
    const yearData = allSalesData.filter(d => new Date(d.date).getFullYear() === year);

    const monthlySalesVsLabor: { [key: string]: { sales: number, labor: number } } = {};
    yearData.forEach(d => {
      const month = format(new Date(d.date), 'yyyy-MM');
      if (!monthlySalesVsLabor[month]) monthlySalesVsLabor[month] = { sales: 0, labor: 0 };
      monthlySalesVsLabor[month].sales += d.sales;
      monthlySalesVsLabor[month].labor += d.labor;
    });
    setSalesVsLabor(Object.entries(monthlySalesVsLabor).map(([month, data]) => ({ month: month.slice(5) + '월', sales: data.sales, labor: data.labor })).sort((a,b) => a.month.localeCompare(b.month)));

    const monthlyCancellations: { [key: string]: { sales: number, cancellations: number } } = {};
    yearData.forEach(d => {
      const month = format(new Date(d.date), 'yyyy-MM');
      if (!monthlyCancellations[month]) monthlyCancellations[month] = { sales: 0, cancellations: 0 };
      monthlyCancellations[month].sales += d.sales;
      monthlyCancellations[month].cancellations += d.cancellations;
    });
    setCancellationRate(Object.entries(monthlyCancellations).map(([month, data]) => ({
      month: month.slice(5) + '월',
      rate: data.sales > 0 ? parseFloat(((data.cancellations / (data.sales / 100000)) * 100).toFixed(1)) : 0,
    })).sort((a,b) => a.month.localeCompare(b.month)));
  }, [dateRange]);

  useEffect(() => {
    handlePeriodChange(activePeriod);
  }, []);

  const handlePeriodChange = (value: string) => {
    if (!value) return;
    setActivePeriod(value);
    const today = new Date();
    let from: Date, to: Date = today;

    switch (value) {
      case 'today':
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      case 'this-week':
        from = startOfWeek(today, { weekStartsOn: 1 }); // Monday as the first day of the week
        to = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'this-month':
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case 'this-year':
        from = startOfYear(today);
        to = endOfYear(today);
        break;
      default:
        from = startOfDay(today);
        to = endOfDay(today);
        break;
    }
    setDateRange({ from, to });
  };

  const segmentWrap = "inline-flex items-center gap-1 rounded-lg bg-[#F5F5F7] px-1 py-1";
  const segmentItem =
    "rounded-lg px-4 h-8 text-sm data-[state=on]:bg-white data-[state=on]:shadow-sm " +
    "data-[state=on]:text-[#111] data-[state=off]:text-[#50505f] hover:bg-white transition";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#333333] mb-1">매출분석</h1>
        <p className="text-sm text-[#717182]">다양한 차트로 매출 데이터를 분석하세요</p>
      </div>

      <Tabs defaultValue="sales-trend" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#F5F5F7] p-1 rounded-lg h-10">
            <TabsTrigger value="sales-trend" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">기간별 매출</TabsTrigger>
            <TabsTrigger value="payment-method" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">결제수단별 비중</TabsTrigger>
            <TabsTrigger value="hourly-sales" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">시간대별 매출</TabsTrigger>
            <TabsTrigger value="cancellation-rate" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">취소율 추이</TabsTrigger>
            <TabsTrigger value="sales-vs-labor" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">인건비 대비 매출</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white mb-6">
          <div className="grid grid-cols-[72px_1fr] items-center gap-3">
            <div className="text-sm font-semibold text-[#333]">조회기간</div>
            <div className="flex items-center gap-2 flex-wrap">
              <ToggleGroup type="single" value={activePeriod} onValueChange={handlePeriodChange} className={`${segmentWrap} flex-1`}>
                <ToggleGroupItem value="today" className={segmentItem}>오늘</ToggleGroupItem>
                <ToggleGroupItem value="this-week" className={segmentItem}>이번주</ToggleGroupItem>
                <ToggleGroupItem value="this-month" className={segmentItem}>이번달</ToggleGroupItem>
                <ToggleGroupItem value="this-year" className={segmentItem}>올해</ToggleGroupItem>
              </ToggleGroup>
              <div className="relative">
                <Button
                  variant={"outline"}
                  className="h-8 text-sm rounded-lg border border-gray-300 bg-white px-4 flex items-center gap-2"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "yyyy.MM.dd")} ~{" "}
                        {format(dateRange.to, "yyyy.MM.dd")}
                      </>
                    ) : (
                      format(dateRange.from, "yyyy.MM.dd")
                    )
                  ) : (
                    <span>날짜를 선택하세요</span>
                  )}
                </Button>
                {showCalendar && (
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white border rounded-md shadow-lg p-3">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        setActivePeriod("");
                        if (range?.from && range?.to) {
                          setShowCalendar(false);
                        }
                      }}
                      numberOfMonths={1}
                      components={{}}
                      locale={ko}
                      formatters={{
                        formatCaption: (date) =>
                          `${format(date, "yyyy년 M월", { locale: ko })}`,
                        formatWeekdayName: (day) =>
                          format(day, "eee", { locale: ko }),
                      }}
                      classNames={{
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "day-outside text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 하단 요약/버튼 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4 flex-wrap gap-3">
            <div className="text-sm text-[#333]">
              {dateRange?.from && dateRange?.to && (
                <>
                  {format(dateRange.from, "yyyy.MM.dd")} ~ {format(dateRange.to, "yyyy.MM.dd")}{" "}
                  <span className="text-[#007AFF] ml-1">
                    ({differenceInCalendarDays(dateRange.to, dateRange.from) + 1}일간)
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-gray-500 hover:bg-gray-100 rounded-lg text-sm">
                <RotateCw className="w-4 h-4 mr-1" />
                초기화
              </Button>
              <Button className="bg-[#333] text-white hover:bg-[#444] rounded-lg px-6 text-sm">
                조회하기
              </Button>
            </div>
          </div>
        </Card>

        <TabsContent value="sales-trend">
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-6">기간별 매출 추이</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={periodSales} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey={xAxisDataKey} stroke="#717182" />
                <YAxis stroke="#717182" tickFormatter={formatYAxis} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }} />
                <Line type="linear" dataKey="sales" stroke="#FEE500" strokeWidth={3} dot={{ fill: '#FEE500', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        <TabsContent value="payment-method">
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-6">결제수단별 비중</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={paymentDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={150} fill="#8884d8" dataKey="value">
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        <TabsContent value="hourly-sales">
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-6">시간대별 매출</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={hourlySales} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey="time" stroke="#717182" />
                <YAxis stroke="#717182" tickFormatter={formatYAxis} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }} />
                <Bar dataKey="sales" fill="#FEE500" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        <TabsContent value="cancellation-rate">
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-6">취소율 추이</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cancellationRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey="month" stroke="#717182" />
                <YAxis stroke="#717182" />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }} />
                <Line type="linear" dataKey="rate" stroke="#FF4D4D" strokeWidth={3} dot={{ fill: '#FF4D4D', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        <TabsContent value="sales-vs-labor">
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-6">인건비 대비 매출 비율</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesVsLabor} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey="month" stroke="#717182" />
                <YAxis stroke="#717182" tickFormatter={formatYAxis} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="sales" fill="#FEE500" name="매출" radius={[8, 8, 0, 0]} />
                <Bar dataKey="labor" fill="#3C1E1E" name="인건비" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
