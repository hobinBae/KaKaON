import { Card } from "@/components/ui/card";
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
import { useSalesByPeriod, useSalesByHourly, SalesPeriodParams, useCancelRateByPeriod, usePaymentMethodRatioByPeriod, useSalesByStores } from "@/lib/hooks/useAnalytics";
import { useBoundStore } from "@/stores/storeStore";
import { useMyStores } from "@/lib/hooks/useStores";
import SalesTrend from "@/components/analytics/SalesTrend";
import HourlySales from "@/components/analytics/HourlySales";
import SalesVsLabor from "@/components/analytics/SalesVsLabor";
import StoreComparison from "@/components/analytics/StoreComparison";
import CancellationRate from "@/components/analytics/CancellationRate";
import PaymentMethod from "@/components/analytics/PaymentMethod";
import MenuSalesOverview from "@/components/analytics/MenuSalesOverview";
import { usePayments } from "@/lib/hooks/usePayments";
import apiClient from "@/lib/apiClient";
import { Link } from "react-router-dom";

// 커스텀 달력 캡션 컴포넌트
function CustomCaption({ displayMonth, onMonthChange }: { displayMonth: Date; onMonthChange: (date: Date) => void }) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const isCurrentOrFutureMonth = displayMonth.getFullYear() > currentYear ||
    (displayMonth.getFullYear() === currentYear && displayMonth.getMonth() >= currentMonth);

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

  const { data: salesData } = useSalesByPeriod(
    storeId,
    apiParams,
    { enabled: storeId > 0 && apiParams.periodType !== 'YESTERDAY' && apiParams.periodType !== 'TODAY' }
  );

  const { data: hourlySalesData } = useSalesByHourly(
    storeId,
    apiParams,
    { enabled: storeId > 0 && apiParams.periodType !== 'YESTERDAY' }
  );

  const { data: cancelRateData, isLoading: isCancelRateLoading } = useCancelRateByPeriod(
    storeId,
    apiParams,
    { enabled: storeId > 0 && apiParams.periodType !== 'YESTERDAY' && apiParams.periodType !== 'TODAY' }
  );

  useEffect(() => {
    console.log("Raw cancelRateData:", cancelRateData);
  }, [cancelRateData]);

  const { data: paymentMethodRatioData } = usePaymentMethodRatioByPeriod(
    storeId,
    apiParams,
    { enabled: storeId > 0 && apiParams.periodType !== 'TODAY' }
  );
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfDay(addDays(new Date(), -1)),
  });
  const [activePeriod, setActivePeriod] = useState<string>("this-month");
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("sales-trend");

  const { data: salesByStoresData } = useSalesByStores(
    apiParams,
    { enabled: activeTab === 'store-comparison' }
  );
  const [startDateInput, setStartDateInput] = useState<string>("");
  const [endDateInput, setEndDateInput] = useState<string>("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<ReactNode>("");
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [menuSalesPeriod, setMenuSalesPeriod] = useState<'today' | 'yesterday'>('today');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
  const [periodSales, setPeriodSales] = useState<{time?: string; date?: string; month?: string; sales: number}[]>([]);
  const [xAxisDataKey, setXAxisDataKey] = useState<string>('date');
  const [paymentDistribution, setPaymentDistribution] = useState<{name: string; value: number; color: string}[]>([]);
  const [salesTypeDistribution, setSalesTypeDistribution] = useState<{name: string; value: number; color: string}[]>([]);
  const [hourlySales, setHourlySales] = useState<{time: string; sales: number}[]>([]);
  const [salesVsLabor, setSalesVsLabor] = useState<{month: string; sales: number; labor: number; laborRatio: number}[]>([]);
  const [menuSalesData, setMenuSalesData] = useState<{ name: string; quantity: number }[]>([]);

  const menuSalesDate = useMemo(() => {
    const date = new Date();
    if (menuSalesPeriod === 'yesterday') {
      date.setDate(date.getDate() - 1);
    }
    return format(date, 'yyyy-MM-dd');
  }, [menuSalesPeriod]);

  const { data: menuSalesPayments } = usePayments(storeId, { startDate: menuSalesDate, endDate: menuSalesDate, size: 1000 });

  useEffect(() => {
    const fetchMenuSales = async () => {
      if (!menuSalesPayments || !menuSalesPayments.data || !menuSalesPayments.data.content) {
        setMenuSalesData([]);
        return;
      }

      const menuSales: { [menuName: string]: number } = {};

      for (const payment of menuSalesPayments.data.content) {
        try {
          const response = await apiClient.get(`/orders/${payment.orderId}`);
          const orderDetail = response.data.data;

          orderDetail.items.forEach((item: any) => {
            if (item.menuName) {
              menuSales[item.menuName] = (menuSales[item.menuName] || 0) + item.quantity;
            }
          });
        } catch (error) {
          console.error(`Failed to fetch order detail for orderId: ${payment.orderId}`, error);
        }
      }

      const chartData = Object.entries(menuSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity);

      setMenuSalesData(chartData);
    };

    fetchMenuSales();
  }, [menuSalesPayments]);

  useEffect(() => {
    if (salesData && salesData.saleList) {
      const salesMap = new Map(salesData.saleList.map(d => [d.date, d.sales]));
      const today = new Date();

      if (activePeriod === 'this-week') {
        setXAxisDataKey('date');
        const weekData = Array.from({ length: 7 }).map((_, i) => {
          const currentDate = addDays(today, -6 + i);
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
      } else if (dateRange?.from && dateRange?.to) {
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

    if (paymentMethodRatioData) {
      setPaymentDistribution([
        { name: '카드', value: paymentMethodRatioData.cardTotal, color: '#f7c851ff' },
        { name: '계좌이체', value: paymentMethodRatioData.transferTotal, color: '#aa704aff' },
        { name: '카카오페이', value: paymentMethodRatioData.kakaopayTotal, color: '#faae4aff' },
        { name: '현금', value: paymentMethodRatioData.cashTotal, color: '#99c271ff' },
      ]);
      setSalesTypeDistribution([
        { name: '가게', value: paymentMethodRatioData.storeTotal, color: '#fea769ff' },
        { name: '배달', value: paymentMethodRatioData.deliveryTotal, color: '#4dafdcff' },
      ]);
    }
  }, [salesData, hourlySalesData, activePeriod, paymentMethodRatioData]);

  useEffect(() => {
    const params: SalesPeriodParams = { periodType: 'RANGE' };
    if (activePeriod) {
      switch (activePeriod) {
        case 'today':
          params.periodType = 'TODAY';
          break;
        case 'yesterday':
          params.periodType = 'YESTERDAY';
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

  const cancelChartData = useMemo(() => {
    if (!cancelRateData) return [];

    const rateMap = new Map(cancelRateData.cancelRateList.map(d => [d.date, d.cancelRate]));
    const today = new Date();

    if (activePeriod === 'this-week') {
      return Array.from({ length: 7 }).map((_, i) => {
        const currentDate = addDays(today, -6 + i);
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        const cancelRate = rateMap.get(dateKey) || 0;
        return {
          date: format(currentDate, 'MM/dd'),
          cancelRate: cancelRate > 1 ? cancelRate : cancelRate * 100,
        };
      });
    } else if (activePeriod === 'this-month') {
      const monthStart = startOfMonth(today);
      const daysInMonth = differenceInCalendarDays(endOfMonth(today), monthStart) + 1;
      return Array.from({ length: daysInMonth }).map((_, i) => {
        const currentDate = addDays(monthStart, i);
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        if (currentDate > today) {
          return {
            date: format(currentDate, 'MM/dd'),
            cancelRate: 0,
          };
        }
        const cancelRate = rateMap.get(dateKey) || 0;
        return {
          date: format(currentDate, 'MM/dd'),
          cancelRate: cancelRate > 1 ? cancelRate : cancelRate * 100,
        };
      });
    } else if (activePeriod === 'this-year') {
      const yearStart = startOfYear(today);
      const monthMap = new Map<string, { total: number, count: number }>();

      cancelRateData.cancelRateList.forEach(item => {
        const monthKey = format(new Date(item.date), 'yyyy-MM');
        const monthData = monthMap.get(monthKey) || { total: 0, count: 0 };
        monthData.total += item.cancelRate;
        monthData.count++;
        monthMap.set(monthKey, monthData);
      });

      return Array.from({ length: 12 }).map((_, i) => {
        const monthDate = addMonths(yearStart, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        if (monthDate > today) {
		  return {
			month: format(monthDate, 'MM월'),
			cancelRate: 0,
		  };
		}
        const monthData = monthMap.get(monthKey);
        const cancelRate = monthData ? monthData.total / monthData.count : 0;
        return {
          month: format(monthDate, 'MM월'),
          cancelRate: cancelRate > 1 ? cancelRate : cancelRate * 100,
        };
      });
    } else if (dateRange?.from && dateRange?.to) {
      const diff = differenceInCalendarDays(dateRange.to, dateRange.from);
      return Array.from({ length: diff + 1 }).map((_, i) => {
        const currentDate = addDays(dateRange.from!, i);
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        const cancelRate = rateMap.get(dateKey) || 0;
        return {
          date: format(currentDate, 'MM/dd'),
          cancelRate: cancelRate > 1 ? cancelRate : cancelRate * 100,
        };
      });
    }
    return [];
  }, [cancelRateData, activePeriod, dateRange]);

  const totalCancellations = cancelRateData?.cancelRateList.reduce((acc, item) => acc + item.cancelSales, 0) || 0;
  
  const storeComparisonData = useMemo(() => {
    if (!salesByStoresData || !stores) return [];

    const selectedStoresData = salesByStoresData.storeSalesList
      .filter((d: any) => selectedStoreIds.includes(d.storeId))
      .map((d: any, index: number) => {
        const store = stores.find(s => s.storeId === d.storeId);
        return {
          index,
          displayName: `${index + 1}. ${store?.name || d.storeId}`,
          name: store?.name || d.storeId,
          sales: d.totalSales,
        };
      });

    return selectedStoresData;
  }, [salesByStoresData, selectedStoreIds, stores]);

  useEffect(() => {
    handlePeriodChange(activePeriod);
  }, []);

  useEffect(() => {
    if (stores) {
      setSelectedStoreIds(stores.map(s => s.storeId));
    }
  }, [stores]);

  useEffect(() => {
    if (activeTab === "sales-vs-labor") {
      handlePeriodChange("this-year");
    }
  }, [activeTab]);

  useEffect(() => {
    if (activePeriod) {
      setStartDateInput("");
      setEndDateInput("");
      return;
    }

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
    const digitsOnly = value.replace(/[^\d]/g, '');
    const truncated = digitsOnly.slice(0, 8);
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

    if (!value) {
      if (type === 'start') {
        setDateRange({ from: undefined, to: dateRange?.to });
      } else {
        setDateRange({ from: dateRange?.from, to: undefined });
      }
      return;
    }

    const parsedDate = parse(value, 'yyyy.MM.dd', new Date());

    if (!isValid(parsedDate)) {
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
      if (dateRange?.to && parsedDate > dateRange.to) {
        showAlert('시작일은 종료일보다 이전이어야 합니다.');
        if (dateRange?.from) {
          setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
        } else {
          setStartDateInput("");
        }
        return;
      }

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
      if (dateRange?.from && parsedDate < dateRange.from) {
        showAlert('종료일은 시작일보다 이후여야 합니다.');
        if (dateRange?.to) {
          setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
        } else {
          setEndDateInput("");
        }
        return;
      }

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
      setDateRange({ from: day, to: undefined });
      setActivePeriod("");
    } else {
      if (format(day, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd')) {
        setDateRange({ from: day, to: day });
        setShowCalendar(false);
        setActivePeriod("");
      } else if (day > dateRange.from) {
        setDateRange({ from: dateRange.from, to: day });
        setShowCalendar(false);
        setActivePeriod("");
      } else {
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
        from = addDays(today, -6);
        to = today;
        break;
      }
      case 'this-month': {
        from = startOfMonth(today);
        to = endOfDay(addDays(today, -1));
        break;
      }
      case 'this-year': {
        from = startOfYear(today);
        to = endOfDay(addDays(today, -1));
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
      <div className="flex flex-col tablet:flex-row justify-between items-start tablet:items-center gap-4">
        <div>
          <h1 className="text-[#333333] mb-1">매출분석</h1>
          <p className="text-sm text-[#717182]">다양한 차트로 매출 데이터를 분석하세요</p>
        </div>
        <Link to="/report" className="w-full tablet:w-auto">
          <Button className="w-full tablet:w-auto rounded-3xl">매출 분석 리포트</Button>
        </Link>
      </div>

      <Tabs defaultValue="sales-trend" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <div className="tablet:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="차트 종류 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales-trend">기간별 매출</SelectItem>
              <SelectItem value="hourly-sales">시간대별 매출</SelectItem>
              <SelectItem value="menu-sales">메뉴별 판매량</SelectItem>
              <SelectItem value="cancellation-rate">취소율 추이</SelectItem>
              <SelectItem value="payment-method">결제수단별 비중</SelectItem>
              <SelectItem value="store-comparison">가맹점별 매출</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TabsList className="hidden tablet:grid w-full grid-cols-6 bg-[#F5F5F7] p-1 rounded-lg h-10">
            <TabsTrigger value="sales-trend" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">기간별 매출</TabsTrigger>
            <TabsTrigger value="hourly-sales" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">시간대별 매출</TabsTrigger>
            <TabsTrigger value="menu-sales" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">메뉴별 판매량</TabsTrigger>
            <TabsTrigger value="cancellation-rate" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">취소율 추이</TabsTrigger>
            <TabsTrigger value="payment-method" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">결제수단별 비중</TabsTrigger>
            <TabsTrigger value="store-comparison" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">가맹점별 매출</TabsTrigger>
        </TabsList>

        <Card className="p-4 tablet:p-6 rounded-2xl border border-gray-200 shadow-sm bg-white mb-4">
          {activeTab === 'menu-sales' ? (
            <div className="grid grid-cols-1 tablet:grid-cols-[auto_1fr] items-center gap-4">
              <div className="text-sm font-semibold text-[#333]">조회기간</div>
              <ToggleGroup type="single" value={menuSalesPeriod} onValueChange={(value: 'today' | 'yesterday') => value && setMenuSalesPeriod(value)} className={`${segmentWrap} w-full tablet:w-auto`}>
                <ToggleGroupItem value="yesterday" className={`${segmentItem} flex-1`}>어제</ToggleGroupItem>
                <ToggleGroupItem value="today" className={`${segmentItem} flex-1`}>오늘</ToggleGroupItem>
              </ToggleGroup>
            </div>
          ) : (
            <>
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
                        <ToggleGroupItem value="this-week" className={segmentItem}>최근 7일</ToggleGroupItem>
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
                        sunday: (date) => date.getDay() === 0,
                        saturday: (date) => date.getDay() === 6,
                      }}
                      modifiersClassNames={{
                        sunday: "rounded-l-full",
                        saturday: "rounded-r-full",
                      }}
                      disabled={(date) => {
                        if (date > new Date()) return true;
                        if (dateRange?.from && !dateRange?.to) {
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
            </>
          )}

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

          <div className="flex flex-col tablet:flex-row justify-between items-start tablet:items-center pt-4 border-t border-gray-200 mt-4 gap-3">
            <div className="w-full tablet:w-auto">
              <div className="text-md text-[#333]">
                {activeTab === 'menu-sales' ? (
                  <>
                    {format(new Date(menuSalesDate), "yyyy.MM.dd")} (1일간)
                  </>
                ) : (
                  dateRange?.from && dateRange?.to && (
                    <>
                      {format(dateRange.from, "yyyy.MM.dd")} ~ {format(dateRange.to, "yyyy.MM.dd")}{" "}
                      <span className="text-[#007AFF] ml-1">
                        ({differenceInCalendarDays(dateRange.to, dateRange.from) + 1}일간)
                      </span>
                    </>
                  )
                )}
              </div>
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
          </div>
        </Card>

        <TabsContent value="sales-trend">
          <SalesTrend data={periodSales} xAxisDataKey={xAxisDataKey} />
        </TabsContent>
        <TabsContent value="hourly-sales">
          <HourlySales data={hourlySales} activePeriod={activePeriod} />
        </TabsContent>
        {/* <TabsContent value="sales-vs-labor">
          <SalesVsLabor data={salesVsLabor} />
        </TabsContent> */}
        <TabsContent value="store-comparison">
          <StoreComparison data={storeComparisonData} />
        </TabsContent>
        <TabsContent value="cancellation-rate">
          <CancellationRate data={cancelChartData} activePeriod={activePeriod} totalCancellations={totalCancellations} isLoading={isCancelRateLoading} />
        </TabsContent>
        <TabsContent value="menu-sales">
          <MenuSalesOverview data={menuSalesData} title={`${menuSalesPeriod === 'today' ? '오늘' : '전일'} 메뉴별 판매량`} />
        </TabsContent>
        <TabsContent value="payment-method">
          <PaymentMethod paymentDistribution={paymentDistribution} salesTypeDistribution={salesTypeDistribution} windowWidth={windowWidth} />
        </TabsContent>
      </Tabs>

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
