import * as React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { DayProps } from "react-day-picker";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useDashboardSummary, useMonthlySales } from "@/lib/hooks/useAnalytics";
import { useUnreadAlertCount } from "@/lib/hooks/useAlerts";
import { usePayments } from "@/lib/hooks/usePayments";
import { useMyStores } from "@/lib/hooks/useStores";
import { useBoundStore } from "@/stores/storeStore";
import { DailySale, Transaction } from "@/types/api";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 날짜를 'YYYY-MM-DD' 형식으로 변환하는 헬퍼 함수
const formatDate = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};

// 금액을 K 또는 M 단위로 축약하는 함수
const formatSalesNumber = (num: number) => {
  if (window.innerWidth < 800) {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 10000) {
      return `${Math.floor(num / 10000)}만`;
    }
  }
  return num.toLocaleString();
};

// 각 날짜 셀의 내용을 구성하는 커스텀 컴포넌트
function DayContent({ date, displayMonth, monthlySalesData }: DayProps & { monthlySalesData: Map<string, DailySale> }) {
  const isOutsideDay = date.getMonth() !== displayMonth.getMonth();
  const dateString = formatDate(date);
  const data = monthlySalesData.get(dateString);
  const total = data ? data.totalSales : 0;

  return (
    <div className="flex flex-col h-full p-1 text-left text-[10px] tablet:text-xs">
      <span
        className={`font-medium self-start text-xs tablet:text-sm ${
          isOutsideDay ? "text-muted-foreground" : ""
        }`}
      >
        {date.getDate()}
      </span>
      <div className="flex-1 flex flex-col justify-end mt-1 space-y-0 tablet:space-y-0.5 text-right leading-tight tablet:leading-normal">
        {data && !isOutsideDay ? (
          <>
            <div className="text-orange-500 truncate">{formatSalesNumber(data.storeSales)}</div>
            <div className="text-sky-500 truncate">{formatSalesNumber(data.deliverySales)}</div>
            <div className="text-black font-semibold truncate">{formatSalesNumber(total)}</div>
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

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [month, setMonth] = React.useState<Date>(new Date());
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const { selectedStoreId } = useBoundStore();
  const { data: stores, isLoading: isLoadingStores } = useMyStores();

  const storeId = selectedStoreId ? Number(selectedStoreId) : 0;

  const { data: summaryData, isLoading: isLoadingSummary, isError: isErrorSummary } = useDashboardSummary(storeId);
  const { data: unreadCountData } = useUnreadAlertCount(selectedStoreId || "");
  const { data: monthlyResponse, isLoading: isLoadingMonthly, isFetching: isFetchingMonthly, isError: isErrorMonthly } = useMonthlySales(
    storeId,
    formatDate(month)
  );
  const { data: todayPaymentsData } = usePayments(storeId, {
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    size: 1000,
  });

  const todayRealtimeSale = React.useMemo(() => {
    if (!todayPaymentsData?.transactions) return null;

    const todayStr = formatDate(new Date());
    const dailySale: DailySale = {
      date: todayStr,
      storeSales: 0,
      deliverySales: 0,
      totalSales: 0,
    };

    todayPaymentsData.transactions.forEach((tx: Transaction) => {
      // Defensive check: Ensure the transaction date is actually today.
      const transactionDateStr = format(new Date(tx.date), "yyyy-MM-dd");
      if (tx.status !== 'completed' || transactionDateStr !== todayStr) return;

      if (tx.orderType === '배달 주문') {
        dailySale.deliverySales += tx.total;
      } else {
        dailySale.storeSales += tx.total;
      }
      dailySale.totalSales += tx.total;
    });

    return dailySale;
  }, [todayPaymentsData]);

  const monthlySalesData = React.useMemo(() => {
    const salesMap = new Map<string, DailySale>();
    if (monthlyResponse?.dailySales) {
      monthlyResponse.dailySales.forEach((sale) => {
        salesMap.set(sale.date, sale);
      });
    }
    // 오늘 날짜 데이터를 거래내역 기반의 실시간 데이터로 덮어쓰기 (또는 추가)
    if (todayRealtimeSale) {
      salesMap.set(formatDate(new Date()), todayRealtimeSale);
    }
    return salesMap;
  }, [monthlyResponse, todayRealtimeSale]);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const today = new Date();
  const todayString = format(today, "yyyy년 MM월 dd일 (eee)", { locale: ko });

  const formatWeekdayName = (date: Date) => {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return windowWidth < 800 ? weekdays[date.getDay()] : weekdays[date.getDay()] + '요일';
  };

  const todaySales = summaryData?.todaySales ?? 0;
  const yesterdayChangePercent = summaryData?.yesterdayGrowthRate ?? 0;
  const isYesterdayPositive = yesterdayChangePercent >= 0;

  const lastWeekSales = summaryData?.lastWeekSameDaySales ?? 0;
  const lastWeekChangePercent = summaryData?.lastWeekGrowthRate ?? 0;
  const isLastWeekPositive = lastWeekChangePercent >= 0;

  const currentMonthCumulativeSales = summaryData?.monthlyTotalSales ?? 0;
  const percentageChange = summaryData?.monthlyGrowthRate ?? 0;
  const isPositiveChange = percentageChange >= 0;

  const unreadCount = unreadCountData?.unreadCount ?? 0;

  const salesData = React.useMemo(() => {
    const salesMap = new Map<string, number>();
    if (summaryData?.recent7Days) {
      for (const dailySale of summaryData.recent7Days) {
        salesMap.set(dailySale.date, dailySale.totalSales);
      }
    }

    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dateString = format(date, "yyyy-MM-dd");
      const displayName = format(date, "M/d");

      last7DaysData.push({
        date: displayName,
        amount: salesMap.get(dateString) ?? 0,
      });
    }
    return last7DaysData;
  }, [summaryData]);

  if (isLoadingStores || isLoadingSummary) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
        <p className="text-muted-foreground text-lg">로딩중입니다. 조금만 기다려 주세요.</p>
      </div>
    );
  }

  if (stores && stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-6">

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#333333]">등록된 가맹점이 없습니다</h2>
          <p className="text-[#717182] text-lg">
            서비스 이용을 위해서 가맹점 등록이 필요합니다.<br />
            가맹점을 추가해 주세요.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/stores')}
          className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] font-medium px-6 py-5 text-base rounded-3xl shadow-sm"
        >
          가맹점 관리 가기
        </Button>
      </div>
    );
  }

  if (isErrorSummary || isErrorMonthly) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center text-muted-foreground">데이터를 불러오는 중 오류가 발생했습니다.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row items-start tablet:items-center justify-between">
        <div>
          <h1 className="text-[#333333] mb-1">대시보드</h1>
          <p className="text-sm text-[#717182]">오늘의 매출 현황을 확인하세요</p>
        </div>
        <div className="text-sm text-[#717182] mt-2 tablet:mt-0">
          {todayString}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6">
        {/* Left: Calendar */}
        <div className="w-full lg:w-3/4">
          <Card className="p-2 tablet:p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none h-full flex flex-col">
            <div className="flex justify-end text-xs tablet:text-sm space-x-2 tablet:space-x-4 pr-2 tablet:pr-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 tablet:w-3 tablet:h-3 bg-orange-500 rounded-full" />
                <span>가게</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 tablet:w-3 tablet:h-3 bg-sky-500 rounded-full" />
                <span>배달</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 tablet:w-3 tablet:h-3 bg-black rounded-full" />
                <span>총</span>
              </div>
            </div>
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={setDate}
                components={{
                  Day: (props) => <DayContent {...props} monthlySalesData={monthlySalesData} />,
                }}
                className="w-full"
                formatters={{ 
                  formatCaption: (date) => (
                    <div className="flex justify-center items-baseline">
                      <span className="font-medium">{format(date, "yyyy년")}</span>
                      <span className="text-3xl font-medium ml-2">{format(date, "M월")}</span>
                    </div>
                  ),
                  formatWeekdayName 
                }}
              />
            </div>
          </Card>
        </div>

        {/* Right: Stats Cards */}
        <div className="w-full lg:w-1/4">
          <div className="hidden sm:grid grid-cols-2 lg:flex lg:flex-col gap-4">
            <Card className="p-4 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#717182]">오늘 매출</span>
                <div className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 tablet:w-5 tablet:h-5 text-[#3C1E1E]" />
                </div>
              </div>
              <div className="text-xl tablet:text-2xl text-[#333333] mb-2">{todaySales.toLocaleString()}원</div>
              <div className={`flex items-center gap-1 text-xs tablet:text-sm ${isYesterdayPositive ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
                {isYesterdayPositive ? <TrendingUp className="w-3 h-3 tablet:w-4 tablet:h-4" /> : <TrendingDown className="w-3 h-3 tablet:w-4 tablet:h-4" />}
                <span>{Math.abs(yesterdayChangePercent).toFixed(1)}% 어제 대비</span>
              </div>
            </Card>
            <Card className="p-4 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#717182]">지난주 동일 요일 매출</span>
                <div className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 tablet:w-5 tablet:h-5 text-[#3C1E1E]" />
                </div>
              </div>
              <div className="text-xl tablet:text-2xl text-[#333333] mb-2">{lastWeekSales.toLocaleString()}원</div>
              <div className={`flex items-center gap-1 text-xs tablet:text-sm ${isLastWeekPositive ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
                {isLastWeekPositive ? <TrendingUp className="w-3 h-3 tablet:w-4 tablet:h-4" /> : <TrendingDown className="w-3 h-3 tablet:w-4 tablet:h-4" />}
                <span>{Math.abs(lastWeekChangePercent).toFixed(1)}% 지난주 대비</span>
              </div>
            </Card>
            <Card className="p-4 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#717182]">이번 달 누적 매출</span>
                <div className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 tablet:w-5 tablet:h-5 text-[#3C1E1E]" />
                </div>
              </div>
              <div className="text-xl tablet:text-2xl text-[#333333] mb-2">{currentMonthCumulativeSales.toLocaleString()}원</div>
              <div className={`flex items-center gap-1 text-xs tablet:text-sm ${isPositiveChange ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
                {isPositiveChange ? <TrendingUp className="w-3 h-3 tablet:w-4 tablet:h-4" /> : <TrendingDown className="w-3 h-3 tablet:w-4 tablet:h-4" />}
                <span>{Math.abs(percentageChange).toFixed(1)}% 지난달 대비</span>
              </div>
            </Card>
            <Card className="p-4 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#717182]">이상거래</span>
                <div className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-lg bg-[#FF4D4D]/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 tablet:w-5 tablet:h-5 text-[#FF4D4D]" />
                </div>
              </div>
              <div className="text-xl tablet:text-2xl text-[#333333] mb-2">{unreadCount}건</div>
              {unreadCount > 0 ? (
                <div className="text-xs tablet:text-sm text-[#FF4D4D]">미확인 알림 있음</div>
              ) : (
                <div className="text-xs tablet:text-sm text-gray-500">새로운 알림 없음</div>
              )}
            </Card>
          </div>
          <Carousel className="sm:hidden">
            <CarouselContent>
              <CarouselItem>
                <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#717182]">오늘 매출</span>
                    <div className="w-8 h-8 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-[#3C1E1E]" />
                    </div>
                  </div>
                  <div className="text-xl text-[#333333] mb-2">{todaySales.toLocaleString()}원</div>
                  <div className={`flex items-center gap-1 text-xs ${isYesterdayPositive ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
                    {isYesterdayPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(yesterdayChangePercent).toFixed(1)}% 어제 대비</span>
                  </div>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#717182]">지난주 동일 요일 매출</span>
                    <div className="w-8 h-8 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-[#3C1E1E]" />
                    </div>
                  </div>
                  <div className="text-xl text-[#333333] mb-2">{lastWeekSales.toLocaleString()}원</div>
                  <div className={`flex items-center gap-1 text-xs ${isLastWeekPositive ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
                    {isLastWeekPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(lastWeekChangePercent).toFixed(1)}% 지난주 대비</span>
                  </div>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#717182]">이번 달 누적 매출</span>
                    <div className="w-8 h-8 rounded-lg bg-[#FEE500]/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-[#3C1E1E]" />
                    </div>
                  </div>
                  <div className="text-xl text-[#333333] mb-2">{currentMonthCumulativeSales.toLocaleString()}원</div>
                  <div className={`flex items-center gap-1 text-xs ${isPositiveChange ? "text-[#4CAF50]" : "text-[#FF9800]"}`}>
                    {isPositiveChange ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(percentageChange).toFixed(1)}% 지난달 대비</span>
                  </div>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#717182]">이상거래</span>
                    <div className="w-8 h-8 rounded-lg bg-[#FF4D4D]/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-[#FF4D4D]" />
                    </div>
                  </div>
                  <div className="text-xl text-[#333333] mb-2">{unreadCount}건</div>
                  {unreadCount > 0 ? (
                    <div className="text-xs text-[#FF4D4D]">미확인 알림 있음</div>
                  ) : (
                    <div className="text-xs text-gray-500">새로운 알림 없음</div>
                  )}
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <Card className="p-2 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <h3 className="text-[#333333] mb-4 tablet:mb-6">최근 7일 매출 추이</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
            <XAxis dataKey="date" stroke="#717182" />
            <YAxis stroke="#717182" tickFormatter={formatYAxis} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '8px',
              }}
              itemStyle={{
                color: '#000000',
                fontWeight: 'bold',
              }}
              formatter={(value: number) => `${value.toLocaleString()}원`}
            />
            <Area
              type="linear"
              dataKey="amount"
              name="총액"
              stroke="#FEE500"
              strokeWidth={3}
              fill="#c9c380ff"
              fillOpacity={0.05}
              dot={{ stroke: '#f5ab0bff', fill: '#FFFFFF', strokeWidth: 3, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
