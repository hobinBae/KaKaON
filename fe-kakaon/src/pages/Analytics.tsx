import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from "recharts";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, ReactNode, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { addDays, addMonths, format, differenceInCalendarDays, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, parse, startOfWeek, endOfWeek, startOfYear, endOfYear, subYears, isValid, setMonth, setYear } from "date-fns";
import { ko } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalesByPeriod, useSalesByHourly, SalesPeriodParams } from "@/lib/hooks/useAnalytics";
import { useBoundStore } from "@/stores/storeStore";
import { useMyStores } from "@/lib/hooks/useStores";

// --- Helper Functions & Dummy Data ---

// 가맹점별 매출 그래프 Y축 커스텀 틱 (가로 그래프용)
const StoreComparisonTick = ({ x, y, payload }: { x: number, y: number, payload: { value: string } }) => {
  const parts = payload.value.split('. ');
  const index = parts[0];
  const name = parts.slice(1).join('. ');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666" className="text-xs">
        <tspan x="-5" className="tablet:hidden">{index}</tspan>
        <tspan x="-5" className="hidden tablet:inline">{name}</tspan>
      </text>
    </g>
  );
};

// 커스텀 달력 캡션 컴포넌트
function CustomCaption({ displayMonth, onMonthChange }: { displayMonth: Date; onMonthChange: (date: Date) => void }) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  // 현재 표시된 월이 오늘의 월과 같거나 이후인지 확인
  const isCurrentOrFutureMonth = displayMonth.getFullYear() > currentYear ||
    (displayMonth.getFullYear() === currentYear && displayMonth.getMonth() >= currentMonth);

  // 선택된 년도가 현재 년도인지 확인
  const isCurrentYear = displayMonth.getFullYear() === currentYear;

  return (
    <div className="flex justify-center items-center gap-2 py-2">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={() => onMonthChange(subMonths(displayMonth, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-1">
        <Select
          value={displayMonth.getFullYear().toString()}
          onValueChange={(value) => {
            onMonthChange(setYear(displayMonth, parseInt(value)));
          }}
        >
          <SelectTrigger className="h-7 w-20 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}년
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={displayMonth.getMonth().toString()}
          onValueChange={(value) => {
            onMonthChange(setMonth(displayMonth, parseInt(value)));
          }}
        >
          <SelectTrigger className="h-7 w-16 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem
                key={month}
                value={month.toString()}
                disabled={isCurrentYear && month > currentMonth}
              >
                {month + 1}월
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={() => onMonthChange(addMonths(displayMonth, 1))}
        disabled={isCurrentOrFutureMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

const formatYAxis = (tick: number) => {
  if (tick >= 100000) {
    return `${(tick / 1000000).toFixed(1)}M`;
  }
  return `${(tick / 1000).toFixed(0)}K`;
};

// --- Component ---

export default function Analytics() {
  const { selectedStoreId, setSelectedStoreId } = useBoundStore();
  const { data: stores } = useMyStores();

  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) {
      setSelectedStoreId(String(stores[0].storeId));
    }
  }, [stores, selectedStoreId, setSelectedStoreId]);

  const [apiParams, setApiParams] = useState<SalesPeriodParams>({ periodType: 'MONTH' });

  const storeId = selectedStoreId ? parseInt(selectedStoreId, 10) : 0;

  const { data: salesData, isLoading: isSalesLoading } = useSalesByPeriod(
    storeId,
    apiParams,
    { enabled: storeId > 0 }
  );

  const { data: hourlySalesData, isLoading: isHourlySalesLoading } = useSalesByHourly(
    storeId,
    apiParams,
    { enabled: storeId > 0 }
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfDay(addDays(new Date(), -1)),
  });
  const [activePeriod, setActivePeriod] = useState<string>("this-month");
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("sales-trend");
  const [startDateInput, setStartDateInput] = useState<string>("");
  const [endDateInput, setEndDateInput] = useState<string>("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<ReactNode>("");
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // State for processed chart data
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
  const [periodSales, setPeriodSales] = useState<{time?: string; date?: string; month?: string; sales: number}[]>([]);
  const [xAxisDataKey, setXAxisDataKey] = useState<string>('date');
  const [xAxisDataKeyCancellation, setXAxisDataKeyCancellation] = useState<string>('date');
  const [paymentDistribution, setPaymentDistribution] = useState<{name: string; value: number; color: string}[]>([]);
  const [salesTypeDistribution, setSalesTypeDistribution] = useState<{name: string; value: number; color: string}[]>([]);
  const [hourlySales, setHourlySales] = useState<{time: string; sales: number}[]>([]);
  const [cancellationRate, setCancellationRate] = useState<{time?: string; date?: string; month?: string; rate: number}[]>([]);
  const [salesVsLabor, setSalesVsLabor] = useState<{month: string; sales: number; labor: number; laborRatio: number}[]>([]);

  useEffect(() => {
    if (salesData && salesData.saleList) {
      const salesMap = new Map(salesData.saleList.map(d => [d.date, d.sales]));
      const today = new Date();

      if (activePeriod === 'this-week') {
        setXAxisDataKey('date');
        const weekData = Array.from({ length: 7 }).map((_, i) => {
          const currentDate = addDays(today, -6 + i); // 오늘 포함 과거 7일
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          return {
            date: format(currentDate, 'MM/dd'),
            sales: salesMap.get(dateKey) || 0,
          };
        });
        setPeriodSales(weekData);
      } else if (activePeriod === 'this-month') {
        setXAxisDataKey('date');
        const monthStart = startOfMonth(today);
        const daysInMonth = differenceInCalendarDays(endOfMonth(today), monthStart) + 1;
        const monthData = Array.from({ length: daysInMonth }).map((_, i) => {
          const currentDate = addDays(monthStart, i);
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          return {
            date: format(currentDate, 'MM/dd'),
            sales: salesMap.get(dateKey) || 0,
          };
        });
        setPeriodSales(monthData);
      } else if (activePeriod === 'this-year') {
        setXAxisDataKey('month');
        const sumOfPastMonths = salesData.saleList.reduce((acc, curr) => acc + curr.sales, 0);
        const currentMonthSales = salesData.totalSales - sumOfPastMonths;
        const currentMonthKey = format(today, 'yyyy-MM');

        const yearStart = startOfYear(today);
        const yearData = Array.from({ length: 12 }).map((_, i) => {
          const monthDate = addMonths(yearStart, i);
          const monthKey = format(monthDate, 'yyyy-MM');
          
          let sales = salesMap.get(monthKey) || 0;
          
          if (monthKey === currentMonthKey) {
            sales = currentMonthSales > 0 ? currentMonthSales : 0;
          }

          const validDateString = `${monthKey}-01`;
          return {
            month: format(new Date(validDateString), 'MM월'),
            sales: sales,
          };
        });
        setPeriodSales(yearData);
      } else if (dateRange?.from && dateRange?.to) { // RANGE
        setXAxisDataKey('date');
        const diff = differenceInCalendarDays(dateRange.to, dateRange.from);
        const rangeData = Array.from({ length: diff + 1 }).map((_, i) => {
          const currentDate = addDays(dateRange.from!, i);
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          return {
            date: format(currentDate, 'MM/dd'),
            sales: salesMap.get(dateKey) || 0,
          };
        });
        setPeriodSales(rangeData);
      }
    } else {
      setPeriodSales([]);
    }

    if (hourlySalesData && hourlySalesData.hourlySales) {
      const hourlyMap = new Map(hourlySalesData.hourlySales.map(d => [d.hour, d.avgSales]));
      const fullDayData = Array.from({ length: 24 }).map((_, i) => {
        return {
          time: `${i.toString().padStart(2, '0')}시`,
          sales: hourlyMap.get(i) || 0,
        };
      });
      setHourlySales(fullDayData);
    } else {
      setHourlySales([]);
    }
  }, [salesData, hourlySalesData, activePeriod]);

  useEffect(() => {
    const params: SalesPeriodParams = { periodType: 'RANGE' };
    if (activePeriod) {
      switch (activePeriod) {
        case 'today':
          params.periodType = 'TODAY';
          break;
        case 'this-week':
          params.periodType = 'WEEK';
          break;
        case 'this-month':
          params.periodType = 'MONTH';
          break;
        case 'this-year':
          params.periodType = 'YEAR';
          break;
      }
    } else if (dateRange?.from && dateRange?.to) {
      params.periodType = 'RANGE';
      params.startDate = format(dateRange.from, 'yyyy-MM-dd');
      params.endDate = format(dateRange.to, 'yyyy-MM-dd');
    }
    setApiParams(params);
  }, [dateRange, activePeriod]);

  // Dummy data for other charts - will be replaced later
  // useEffect(() => {
  //   const totalPayments = { card: 1200000, account: 400000, kakaopay: 300000, cash: 100000 };
  //   setPaymentDistribution([
  //     { name: '카드결제', value: totalPayments.card, color: '#FEE500' },
  //     { name: '계좌이체', value: totalPayments.account, color: '#FFB800' },
  //     { name: '카카오페이', value: totalPayments.kakaopay, color: '#3C1E1E' },
  //     { name: '현금', value: totalPayments.cash, color: '#9e9e9eff' },
  //   ]);
  //
  //   // Process sales type distribution (delivery vs store)
  //   const totalSalesType = { delivery: 0, store: 0 };
  //   filteredData.forEach(d => {
  //     totalSalesType.delivery += d.deliverySales;
  //     totalSalesType.store += d.storeSales;
  //   });
  //   setSalesTypeDistribution([
  //     { name: '배달', value: totalSalesType.delivery, color: '#FEE500' },
  //     { name: '가게', value: totalSalesType.store, color: '#3C1E1E' },
  //   ]);
  //
  //   // Process hourly sales - average for period, actual for today
  //   const hourlyTotals: { [key: string]: number } = {};
  //   filteredData.forEach(d => {
  //     d.hourly.forEach(h => {
  //       hourlyTotals[h.time] = (hourlyTotals[h.time] || 0) + h.sales;
  //     });
  //   });
  //
  //   // Calculate average if period is more than 1 day
  //   const daysInPeriod = filteredData.length;
  //   const isToday = daysDiff < 1 || activePeriod === 'today';
  //
  //   // Find first and last hour with sales (operating hours)
  //   const sortedHours = Object.entries(hourlyTotals)
  //     .sort((a, b) => a[0].localeCompare(b[0]))
  //     .filter(([, sales]) => sales > 0);
  //
  //   if (sortedHours.length > 0) {
  //     const firstHour = parseInt(sortedHours[0][0].split(':')[0]);
  //     const lastHour = parseInt(sortedHours[sortedHours.length - 1][0].split(':')[0]);
  //
  //     // Generate all hours between first and last hour
  //     const operatingHours = [];
  //     for (let hour = firstHour; hour <= lastHour; hour++) {
  //       const time = `${hour.toString().padStart(2, '0')}:00`;
  //       const sales = hourlyTotals[time] || 0;
  //
  //       if (isToday) {
  //         // For today, show actual hourly sales
  //         operatingHours.push({ time, sales });
  //       } else {
  //         // For other periods, show average hourly sales
  //         operatingHours.push({
  //           time,
  //           sales: daysInPeriod > 0 ? Math.round(sales / daysInPeriod) : sales
  //         });
  //       }
  //     }
  //     setHourlySales(operatingHours);
  //   } else {
  //     setHourlySales([]);
  //   }
  //
  //   // Process cancellation rate based on period
  //   if (daysDiff < 1) { // Single day - hourly
  //     setXAxisDataKeyCancellation('time');
  //     const hourlyCancellations: { [key: string]: { sales: number, cancellations: number } } = {};
  //     filteredData.forEach(d => {
  //       d.hourly.forEach(h => {
  //         if (!hourlyCancellations[h.time]) hourlyCancellations[h.time] = { sales: 0, cancellations: 0 };
  //         hourlyCancellations[h.time].sales += h.sales;
  //         hourlyCancellations[h.time].cancellations += Math.floor(Math.random() * (h.sales / 100000)); // Using random for demo
  //       });
  //     });
  //     setCancellationRate(Object.entries(hourlyCancellations).map(([time, data]) => ({
  //       time,
  //       rate: data.sales > 0 ? parseFloat(((data.cancellations / (data.sales / 100000)) * 100).toFixed(1)) : 0,
  //     })).sort((a, b) => a.time.localeCompare(b.time)));
  //   } else if (daysDiff <= 31) { // Daily
  //     setXAxisDataKeyCancellation('date');
  //     setCancellationRate(filteredData.map(d => ({
  //       date: format(new Date(d.date), 'MM/dd'),
  //       rate: d.sales > 0 ? parseFloat(((d.cancellations / (d.sales / 100000)) * 100).toFixed(1)) : 0,
  //     })));
  //   } else { // Monthly
  //     setXAxisDataKeyCancellation('month');
  //     const monthlyCancellations: { [key: string]: { sales: number, cancellations: number } } = {};
  //     filteredData.forEach(d => {
  //       const month = format(new Date(d.date), 'yyyy-MM');
  //       if (!monthlyCancellations[month]) monthlyCancellations[month] = { sales: 0, cancellations: 0 };
  //       monthlyCancellations[month].sales += d.sales;
  //       monthlyCancellations[month].cancellations += d.cancellations;
  //     });
  //     setCancellationRate(Object.entries(monthlyCancellations).map(([month, data]) => ({
  //       month: month.slice(5) + '월',
  //       rate: data.sales > 0 ? parseFloat(((data.cancellations / (data.sales / 100000)) * 100).toFixed(1)) : 0,
  //     })).sort((a, b) => a.month.localeCompare(b.month)));
  //   }
  //
  // }, [dateRange, activePeriod]);

  // 가맹점별 매출 비교 데이터 처리 로직을 useMemo로 분리하여 불필요한 재실행을 방지했음
  const storeComparisonData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !stores) return [];

    // const filteredData = allSalesData.filter(d => {
    //   const date = new Date(d.date);
    //   return date >= startOfDay(dateRange.from!) && date <= endOfDay(dateRange.to!);
    // });

    const selectedStores = stores.filter(store => selectedStoreIds.includes(store.storeId));
    // const totalPeriodSales = filteredData.reduce((acc, cur) => acc + cur.sales, 0);
    const averageSales = selectedStores.length > 0 ? (salesData?.totalSales || 0) / selectedStores.length : 0;

    // storeId를 기반으로 일관된 랜덤 값을 생성하여 데이터가 변하지 않도록 수정했음
    const result = [];
    for (let i = 0; i < selectedStores.length; i++) {
      const store = selectedStores[i];
      const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      const salesValue = Math.floor(averageSales * (0.8 + pseudoRandom(store.storeId) * 0.4));
      result.push({
        index: i,
        displayName: `${i + 1}. ${store.name}`,
        name: store.name,
        sales: salesValue
      });
    }
    return result;
  }, [dateRange, selectedStoreIds, stores, salesData]);

  // useEffect(() => {
  //   if (!dateRange?.from) return;
  //
  //   const year = dateRange.from.getFullYear();
  //   const today = new Date();
  //   const yearData = allSalesData.filter(d => {
  //     const date = new Date(d.date);
  //     return date.getFullYear() === year && date < startOfDay(today);
  //   });
  //
  //   const monthlySalesVsLabor: { [key: string]: { sales: number, labor: number } } = {};
  //   yearData.forEach(d => {
  //     const month = format(new Date(d.date), 'yyyy-MM');
  //     if (!monthlySalesVsLabor[month]) monthlySalesVsLabor[month] = { sales: 0, labor: 0 };
  //     monthlySalesVsLabor[month].sales += d.sales;
  //     monthlySalesVsLabor[month].labor += d.labor;
  //   });
  //   setSalesVsLabor(Object.entries(monthlySalesVsLabor).map(([month, data]) => ({
  //     month: month.slice(5) + '월',
  //     sales: data.sales,
  //     labor: data.labor,
  //     laborRatio: data.sales > 0 ? parseFloat(((data.labor / data.sales) * 100).toFixed(1)) : 0
  //   })).sort((a,b) => a.month.localeCompare(b.month)));
  // }, [dateRange]);

  useEffect(() => {
    handlePeriodChange(activePeriod);
  }, []);

  // stores 데이터 로드 시 모든 가맹점을 기본으로 선택
  useEffect(() => {
    if (stores) {
      setSelectedStoreIds(stores.map(s => s.storeId));
    }
  }, []);

  // 인건비 대비 매출 탭 선택 시 기본값으로 올해 선택
  useEffect(() => {
    if (activeTab === "sales-vs-labor") {
      handlePeriodChange("this-year");
    }
  }, [activeTab]);

  // dateRange가 변경될 때 input 필드도 업데이트 (activePeriod가 없을 때만)
  useEffect(() => {
    // 기간 버튼(이번주, 이번달 등)을 클릭한 경우에는 input 필드 비우기
    if (activePeriod) {
      setStartDateInput("");
      setEndDateInput("");
      return;
    }

    // 직접 입력이나 달력 선택의 경우에만 input 필드 업데이트
    if (dateRange?.from) {
      setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
    } else {
      setStartDateInput("");
    }
    if (dateRange?.to) {
      setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
    } else {
      setEndDateInput("");
    }
  }, [dateRange, activePeriod]);

  const showAlert = (message: React.ReactNode) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleDateInputChange = (type: 'start' | 'end', value: string) => {
    // 숫자만 추출
    const digitsOnly = value.replace(/[^\d]/g, '');

    // 최대 8자리까지만 허용
    const truncated = digitsOnly.slice(0, 8);

    // 자동으로 점 추가 (yyyy.MM.dd 형식)
    let formatted = truncated;
    if (truncated.length > 4) {
      formatted = truncated.slice(0, 4) + '.' + truncated.slice(4);
    }
    if (truncated.length > 6) {
      formatted = truncated.slice(0, 4) + '.' + truncated.slice(4, 6) + '.' + truncated.slice(6);
    }

    if (type === 'start') {
      setStartDateInput(formatted);
    } else {
      setEndDateInput(formatted);
    }
  };

  const handleDateInputBlur = (type: 'start' | 'end') => {
    const value = type === 'start' ? startDateInput : endDateInput;

    // 빈 값이면 초기화
    if (!value) {
      if (type === 'start') {
        setDateRange({ from: undefined, to: dateRange?.to });
      } else {
        setDateRange({ from: dateRange?.from, to: undefined });
      }
      return;
    }

    // 날짜 파싱 시도 (yyyy.MM.dd 형식)
    const parsedDate = parse(value, 'yyyy.MM.dd', new Date());

    if (!isValid(parsedDate)) {
      // 유효하지 않은 날짜면 이전 값으로 복원
      if (type === 'start' && dateRange?.from) {
        setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
      } else if (type === 'end' && dateRange?.to) {
        setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
      } else {
        if (type === 'start') setStartDateInput("");
        else setEndDateInput("");
      }
      return;
    }

    // 오늘 이후 날짜 체크
    if (parsedDate > new Date()) {
      showAlert('오늘 이후의 날짜는 선택할 수 없습니다.');
      if (type === 'start' && dateRange?.from) {
        setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
      } else if (type === 'end' && dateRange?.to) {
        setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
      } else {
        if (type === 'start') setStartDateInput("");
        else setEndDateInput("");
      }
      return;
    }

    if (type === 'start') {
      // 시작일 설정
      if (dateRange?.to && parsedDate > dateRange.to) {
        showAlert('시작일은 종료일보다 이전이어야 합니다.');
        if (dateRange?.from) {
          setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
        } else {
          setStartDateInput("");
        }
        return;
      }

      // 시작일 변경 시에도 종료일과의 6개월 제한 체크
      if (dateRange?.to) {
        const maxDate = addDays(parsedDate, 180);
        if (dateRange.to > maxDate) {
          showAlert(<><span className="font-bold">최대 6개월</span>까지만 조회 가능합니다.</>);
          if (dateRange?.from) {
            setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
          } else {
            setStartDateInput("");
          }
          return;
        }
      }

      setDateRange({ from: parsedDate, to: dateRange?.to });
      setActivePeriod("");
    } else {
      // 종료일 설정
      if (dateRange?.from && parsedDate < dateRange.from) {
        showAlert('종료일은 시작일보다 이후여야 합니다.');
        if (dateRange?.to) {
          setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
        } else {
          setEndDateInput("");
        }
        return;
      }

      // 6개월 제한 체크
      if (dateRange?.from) {
        const maxDate = addDays(dateRange.from, 180);
        if (parsedDate > maxDate) {
          showAlert(<><span className="font-bold">최대 6개월</span>까지만 조회 가능합니다.</>);
          if (dateRange?.to) {
            setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
          } else {
            setEndDateInput("");
          }
          return;
        }
      }

      setDateRange({ from: dateRange?.from, to: parsedDate });
      setActivePeriod("");
    }
  };

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;

    if (!dateRange?.from || dateRange.to) {
      // Start new selection
      setDateRange({ from: day, to: undefined });
      setActivePeriod("");
    } else {
      // End of selection
      // 같은 날짜를 두 번 클릭한 경우 (당일 조회)
      if (format(day, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd')) {
        setDateRange({ from: day, to: day });
        setShowCalendar(false);
        setActivePeriod("");
      } else if (day > dateRange.from) {
        setDateRange({ from: dateRange.from, to: day });
        setShowCalendar(false); // Close on valid range selection
        setActivePeriod("");
      } else {
        // Clicked date is before start date, so reset and start new selection
        setDateRange({ from: day, to: undefined });
        setActivePeriod("");
      }
    }
  };

  const handlePeriodChange = (value: string) => {
    if (!value) return;
    setActivePeriod(value);
    const today = new Date();
    let from: Date, to: Date = today;

    switch (value) {
      case 'yesterday': {
        const yesterday = addDays(today, -1);
        from = startOfDay(yesterday);
        to = endOfDay(yesterday);
        break;
      }
      case 'today': {
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      }
      case 'this-week': {
        from = startOfWeek(today, { weekStartsOn: 1 }); // Monday as the first day of the week
        to = endOfWeek(today, { weekStartsOn: 1 }); // Sunday (display full week)
        break;
      }
      case 'this-month': {
        from = startOfMonth(today);
        to = endOfDay(addDays(today, -1)); // Exclude today, only up to yesterday
        break;
      }
      case 'this-year': {
        from = startOfYear(today);
        to = endOfDay(addDays(today, -1)); // Exclude today, only up to yesterday
        break;
      }
      case 'last-year': {
        from = startOfYear(subYears(today, 1));
        to = endOfYear(subYears(today, 1));
        break;
      }
      default: {
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      }
    }
    setDateRange({ from, to });
  };

  const segmentWrap = "inline-flex items-center gap-1 rounded-lg bg-[#F5F5F7] px-1 py-1 w-full";
  const segmentItem =
    "rounded-lg px-4 h-8 text-sm data-[state=on]:bg-white data-[state=on]:shadow-sm " +
    "data-[state=on]:text-[#111] data-[state=off]:text-[#50505f] hover:bg-white transition flex-1 justify-center";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#333333] mb-1">매출분석</h1>
        <p className="text-sm text-[#717182]">다양한 차트로 매출 데이터를 분석하세요</p>
      </div>

      <Tabs defaultValue="sales-trend" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        {/* Mobile Dropdown */}
        <div className="tablet:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="차트 종류 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales-trend">기간별 매출</SelectItem>
              <SelectItem value="hourly-sales">시간대별 매출</SelectItem>
              <SelectItem value="sales-vs-labor">인건비 대비 매출</SelectItem>
              <SelectItem value="store-comparison">가맹점별 매출</SelectItem>
              <SelectItem value="cancellation-rate">취소율 추이</SelectItem>
              <SelectItem value="payment-method">결제수단별 비중</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Desktop Tabs */}
        <TabsList className="hidden tablet:grid w-full grid-cols-6 bg-[#F5F5F7] p-1 rounded-lg h-10">
            <TabsTrigger value="sales-trend" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">기간별 매출</TabsTrigger>
            <TabsTrigger value="hourly-sales" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">시간대별 매출</TabsTrigger>
            <TabsTrigger value="sales-vs-labor" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">인건비 대비 매출</TabsTrigger>
            <TabsTrigger value="store-comparison" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">가맹점별 매출</TabsTrigger>
            <TabsTrigger value="cancellation-rate" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">취소율 추이</TabsTrigger>
            <TabsTrigger value="payment-method" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">결제수단별 비중</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="p-4 tablet:p-6 rounded-2xl border border-gray-200 shadow-sm bg-white mb-4">
          <div className="grid grid-cols-1 tablet:grid-cols-[auto_1fr] items-center gap-4">
            <div className="text-sm font-semibold text-[#333]">조회기간</div>
            <div className="flex flex-col tablet:flex-row items-center gap-2">
              <ToggleGroup type="single" value={activePeriod} onValueChange={handlePeriodChange} className={`${segmentWrap} tablet:flex-1`}>
                {activeTab === "sales-vs-labor" ? (
                  <>
                    <ToggleGroupItem value="this-year" className={segmentItem}>올해</ToggleGroupItem>
                    <ToggleGroupItem value="last-year" className={segmentItem}>작년</ToggleGroupItem>
                  </>
                ) : (
                  <>
                    {activeTab === "payment-method" && <ToggleGroupItem value="yesterday" className={segmentItem}>어제</ToggleGroupItem>}
                    {activeTab === "hourly-sales" && <ToggleGroupItem value="today" className={segmentItem}>오늘</ToggleGroupItem>}
                    <ToggleGroupItem value="this-week" className={segmentItem}>이번주</ToggleGroupItem>
                    <ToggleGroupItem value="this-month" className={segmentItem}>이번달</ToggleGroupItem>
                    <ToggleGroupItem value="this-year" className={segmentItem}>올해</ToggleGroupItem>
                  </>
                )}
              </ToggleGroup>
              <div className="relative flex items-center gap-2 w-full tablet:w-auto">
                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1 tablet:flex tablet:gap-1">
                  <Input
                    type="text"
                    placeholder="YYYY.MM.DD"
                    value={startDateInput}
                    onChange={(e) => handleDateInputChange('start', e.target.value)}
                    onBlur={() => handleDateInputBlur('start')}
                    className="h-8 w-full tablet:w-32 text-sm rounded-lg border border-gray-300 bg-white px-3"
                  />
                  <span className="text-sm text-gray-500 text-center">~</span>
                  <Input
                    type="text"
                    placeholder="YYYY.MM.DD"
                    value={endDateInput}
                    onChange={(e) => handleDateInputChange('end', e.target.value)}
                    onBlur={() => handleDateInputBlur('end')}
                    className="h-8 w-full tablet:w-32 text-sm rounded-lg border border-gray-300 bg-white px-3"
                  />
                </div>
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="h-8 w-8 rounded-lg border border-gray-300 bg-white"
                  onClick={() => {
                    if (!showCalendar && dateRange?.from) {
                      setCalendarMonth(dateRange.from);
                    }
                    setShowCalendar(!showCalendar);
                  }}
                >
                  <CalendarIcon className="w-4 h-4" />
                </Button>
                {showCalendar && (
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white border rounded-md shadow-lg p-3">
                    <Calendar
                      initialFocus
                      mode="range"
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      selected={dateRange}
                      onDayClick={handleDateSelect}
                      numberOfMonths={1}
                      fixedWeeks={false}
                      components={{
                        Caption: ({ displayMonth }) => (
                          <CustomCaption displayMonth={displayMonth} onMonthChange={setCalendarMonth} />
                        ),
                      }}
                      locale={ko}
                      modifiers={{
                        sunday: (date) => date.getDay() === 0, // 일요일
                        saturday: (date) => date.getDay() === 6, // 토요일
                      }}
                      modifiersClassNames={{
                        sunday: "rounded-l-full",
                        saturday: "rounded-r-full",
                      }}
                      disabled={(date) => {
                        // 오늘 이후 날짜는 선택 불가
                        if (date > new Date()) return true;

                        // 시작일이 선택되고 종료일이 선택되지 않은 경우
                        if (dateRange?.from && !dateRange?.to) {
                          // 시작일로부터 180일(6개월) 이후 날짜는 선택 불가
                          const maxDate = addDays(dateRange.from, 180);
                          if (date > maxDate) return true;
                        }

                        return false;
                      }}
                      formatters={{
                        formatWeekdayName: (day) =>
                          format(day, "eee", { locale: ko }),
                      }}
                      classNames={{
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_range_start: "rounded-l-full",
                        day_range_end: "rounded-r-full",
                        day_today: "bg-accent/50 text-accent-foreground ring-2 ring-primary ring-inset",
                        day_outside: "day-outside text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent/30 aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 가맹점 선택 필터 (가맹점별 매출 탭에서만 보임) */}
          {activeTab === 'store-comparison' && stores && stores.length > 1 && (
            <div className="grid grid-cols-1 tablet:grid-cols-[auto_1fr] items-center gap-4 mt-4">
              <div className="text-sm font-semibold text-[#333]">가맹점 선택</div>
              <div className="flex items-center gap-2 flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full tablet:w-[200px] justify-between"
                    >
                      가맹점 선택
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="가맹점 검색..." className="focus:ring-0 focus:ring-offset-0" />
                    <CommandList>
                      <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            if (selectedStoreIds.length === stores.length) {
                              setSelectedStoreIds([]);
                            } else {
                              setSelectedStoreIds(stores.map(s => s.storeId));
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStoreIds.length === stores.length ? "opacity-100" : "opacity-0"
                            )}
                          />
                          전체 선택
                        </CommandItem>
                        {stores.map((store) => (
                          <CommandItem
                            key={store.storeId}
                              value={store.name}
                              onSelect={() => {
                                setSelectedStoreIds(prev => 
                                  prev.includes(store.storeId)
                                    ? prev.filter(id => id !== store.storeId)
                                    : [...prev, store.storeId]
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedStoreIds.includes(store.storeId) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {store.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex gap-1 flex-wrap items-center">
                  {stores?.filter(store => selectedStoreIds.includes(store.storeId)).map((store, index) => (
                    <Badge
                      variant="secondary"
                      key={store.storeId}
                      className="text-sm"
                    >
                      {index + 1}. {store.name}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={() => {
                          setSelectedStoreIds(prev => prev.filter(id => id !== store.storeId));
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 하단 요약/버튼 */}
          <div className="flex flex-col tablet:flex-row justify-between items-start tablet:items-center pt-4 border-t border-gray-200 mt-4 gap-3">
            <div className="w-full tablet:w-auto">
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
              {activeTab !== 'sales-trend' && !(activeTab === "hourly-sales" && activePeriod === "today") && (
                <div className="text-xs text-red-500 mt-1">
                  * 오늘 매출은 영업 종료 후 반영됩니다.
                </div>
              )}
            </div>
            {activeTab === "sales-trend" && (
              <div className="w-full tablet:w-auto border-2 border-gray-200 rounded-xl px-6 py-3 flex items-center justify-between gap-3">
                <div className="text-xs font-medium text-[#717182]">기간 누적 매출</div>
                <div className="text-2xl font-bold text-[#333333] text-right">
                  {(salesData?.totalSales || 0).toLocaleString()}
                  <span className="text-base ml-1">원</span>
                </div>
              </div>
            )}
            {/* <div className="flex gap-2">
              <Button variant="ghost" className="text-gray-500 hover:bg-gray-100 rounded-lg text-sm">
                <RotateCw className="w-4 h-4 mr-1" />
                초기화
              </Button>
              <Button className="bg-[#333] text-white hover:bg-[#444] rounded-lg px-6 text-sm">
                조회하기
              </Button>
            </div> */}
          </div>
        </Card>

        <TabsContent value="sales-trend">
          <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">기간별 매출 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={periodSales} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey={xAxisDataKey} stroke="#717182" dy={10} />
                <YAxis stroke="#717182" tickFormatter={formatYAxis} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }} />
                <Line type="linear" dataKey="sales" stroke="#FEE500" strokeWidth={3} dot={{ fill: '#FEE500', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        <TabsContent value="hourly-sales">
          <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">
              {activePeriod === 'today' ? '시간대별 매출' : '시간대별 평균 매출'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlySales} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
        </TabsContent>
        <TabsContent value="sales-vs-labor">
          <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">인건비 대비 매출 비율</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={salesVsLabor} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey="month" stroke="#717182" />
                <YAxis yAxisId="left" stroke="#717182" tickFormatter={formatYAxis} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF4D4D" unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => {
                    if (name === '인건비 비율') return [`${value}%`, name];
                    return [`${value.toLocaleString()}원`, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" fill="#FEE500" name="매출" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="left" dataKey="labor" fill="#3C1E1E" name="인건비" radius={[8, 8, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="laborRatio" stroke="#FF4D4D" strokeWidth={2} name="인건비 비율" dot={{ fill: '#FF4D4D', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        <TabsContent value="store-comparison">
          <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">가맹점별 매출</h3>
            <ResponsiveContainer width="100%" height={Math.max(300, storeComparisonData.length * 50)}>
              <BarChart
                data={storeComparisonData}
                layout="horizontal"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis
                  type="number"
                  stroke="#717182"
                  tickFormatter={formatYAxis}
                />
                <YAxis
                  type="category"
                  dataKey="displayName"
                  stroke="#717182"
                  tick={<StoreComparisonTick x={0} y={0} payload={{value: ''}} />}
                  width={90}
                />
                <Bar
                  dataKey="sales"
                  fill="#FEE500"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        <TabsContent value="cancellation-rate">
          <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">취소율 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cancellationRate} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey={xAxisDataKeyCancellation} stroke="#717182" />
                <YAxis stroke="#717182" />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }} />
                <Line type="linear" dataKey="rate" stroke="#FF4D4D" strokeWidth={3} dot={{ fill: '#FF4D4D', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        <TabsContent value="payment-method">
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
            <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
              <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">결제수단별 비중</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={paymentDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-1 tablet:p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
              <h3 className="text-[#333333] mb-4 tablet:mb-6 text-center tablet:text-left">배달/가게 매출 비중</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={salesTypeDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {salesTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 카카오 스타일 경고 다이얼로그 */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="sm:max-w-[280px] rounded-xl border-0 shadow-xl p-5 gap-3">
          <AlertDialogHeader className="text-center pb-0 gap-2">
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE500]">
              <svg
                className="h-6 w-6 text-[#3C1E1E]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <AlertDialogDescription className="text-sm text-[#333] font-medium text-center">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center pt-1">
            <AlertDialogAction
              className="w-full h-9 bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FFD700] font-semibold rounded-lg border-0 shadow-sm transition-all text-sm"
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
