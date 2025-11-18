import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from 'react';
import apiClient from "@/lib/apiClient";
import { DashboardSummary, MonthlySalesResponse, SalesPeriodResponse, SalesHourlyResponse, CancelRateResponse, PaymentMethodRatioResponse, PaymentResponse, MenuSummaryResponse } from "@/types/api";
import { useStoreDetail } from "./useStores";
import { format, subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getWeekOfMonth, getDay, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface SalesPeriodParams {
  periodType: 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'RANGE';
  startDate?: string;
  endDate?: string;
}

export const useSalesByPeriod = (storeId: number, params: SalesPeriodParams, options?: { enabled?: boolean }) => {
  return useQuery<SalesPeriodResponse, Error>({
    queryKey: ["salesByPeriod", storeId, params],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/${storeId}/sales/period`, { params });
      return res.data.data;
    },
    enabled: !!storeId && storeId > 0 && (options?.enabled ?? true),
  });
};

export const useSalesByHourly = (storeId: number, params: SalesPeriodParams, options?: { enabled?: boolean }) => {
  return useQuery<SalesHourlyResponse, Error>({
    queryKey: ["salesByHourly", storeId, params],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/${storeId}/sales/hourly`, { params });
      return res.data.data;
    },
    enabled: !!storeId && storeId > 0 && (options?.enabled ?? true),
  });
};

export const useDashboardSummary = (storeId: number) => {
  return useQuery<DashboardSummary, Error>({
    queryKey: ["dashboardSummary", storeId],
    queryFn: async () => {
      const res = await apiClient.get(`/dashboard/${storeId}/summary`);
      return res.data.data;
    },
    enabled: !!storeId && storeId > 0,
  });
};

export const useMonthlySales = (storeId: number, date: string) => {
  return useQuery<MonthlySalesResponse, Error>({
    queryKey: ["monthlySales", storeId, date],
    queryFn: async () => {
      const res = await apiClient.get(`/dashboard/${storeId}/monthly`, {
        params: { date },
      });
      return res.data.data; // ApiResponse의 data 필드에 실제 데이터가 담겨 있음
    },
    enabled: !!storeId && storeId > 0,
    placeholderData: (previousData) => previousData, // 이전 데이터를 유지하여 깜빡임 방지
  });
};

export const useCancelRateByPeriod = (storeId: number, params: SalesPeriodParams, options?: { enabled?: boolean }) => {
  return useQuery<CancelRateResponse, Error>({
    queryKey: ["cancelRateByPeriod", storeId, params],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/${storeId}/sales/cancel-rate`, { params });
      return res.data.data;
    },
    enabled: !!storeId && storeId > 0 && (options?.enabled ?? true),
  });
};

export const usePaymentMethodRatioByPeriod = (storeId: number, params: SalesPeriodParams, options?: { enabled?: boolean }) => {
  return useQuery<PaymentMethodRatioResponse, Error>({
    queryKey: ["paymentMethodRatioByPeriod", storeId, params],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/${storeId}/sales/payment-method`, { params });
      return res.data.data;
    },
    enabled: !!storeId && storeId > 0 && (options?.enabled ?? true),
  });
};

export const useSalesByStores = (params: SalesPeriodParams, options?: { enabled?: boolean }) => {
  return useQuery<{ storeSalesList: { storeId: number; totalSales: number }[] }, Error>({
    queryKey: ["salesByStores", params],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/sales/stores", { params });
      return res.data.data;
    },
    enabled: options?.enabled ?? true,
  });
};

// --- Report Page Hook ---
export const useReportData = (storeId: number, reportType: 'weekly' | 'monthly') => {
  const { data: storeDetail } = useStoreDetail(storeId);
  const storeName = storeDetail?.name || '';

  const { currentPeriod, previousPeriod, title, period } = useMemo(() => {
    const now = new Date();
    if (reportType === 'weekly') {
      const lastWeek = subWeeks(now, 1);
      const currentStart = startOfWeek(lastWeek, { weekStartsOn: 1 });
      const currentEnd = endOfWeek(lastWeek, { weekStartsOn: 1 });

      const previousWeek = subWeeks(lastWeek, 1);
      const previousStart = startOfWeek(previousWeek, { weekStartsOn: 1 });
      const previousEnd = endOfWeek(previousWeek, { weekStartsOn: 1 });
      
      const month = format(currentStart, 'M월');
      const week = getWeekOfMonth(currentStart, { weekStartsOn: 1 });

      return {
        currentPeriod: {
          startDate: format(currentStart, "yyyy-MM-dd"),
          endDate: format(currentEnd, "yyyy-MM-dd"),
        },
        previousPeriod: {
          startDate: format(previousStart, "yyyy-MM-dd"),
          endDate: format(previousEnd, "yyyy-MM-dd"),
        },
        title: `${month} ${week}주차 매출 분석 리포트`,
        period: `${format(currentStart, "yyyy-MM-dd")} ~ ${format(currentEnd, "yyyy-MM-dd")}`,
      };
    } else { // monthly
      const lastMonth = subMonths(now, 1);
      const currentStart = startOfMonth(lastMonth);
      const currentEnd = endOfMonth(lastMonth);

      const previousMonthDate = subMonths(lastMonth, 1);
      const previousStart = startOfMonth(previousMonthDate);
      const previousEnd = endOfMonth(previousMonthDate);
      
      const month = format(currentStart, 'M월');

      return {
        currentPeriod: {
          startDate: format(currentStart, "yyyy-MM-dd"),
          endDate: format(currentEnd, "yyyy-MM-dd"),
        },
        previousPeriod: {
          startDate: format(previousStart, "yyyy-MM-dd"),
          endDate: format(previousEnd, "yyyy-MM-dd"),
        },
        title: `${month} 매출 분석 리포트`,
        period: `${format(currentStart, "yyyy-MM-dd")} ~ ${format(currentEnd, "yyyy-MM-dd")}`,
      };
    }
  }, [reportType]);

  const results = useQueries({
    queries: [
      // 0: Current Period Sales
      {
        queryKey: ['salesByPeriod', storeId, { ...currentPeriod, periodType: 'RANGE' }],
        queryFn: () => apiClient.get(`/analytics/${storeId}/sales/period`, { params: { ...currentPeriod, periodType: 'RANGE' } }).then(res => res.data.data),
        enabled: !!storeId,
      },
      // 1: Previous Period Sales
      {
        queryKey: ['salesByPeriod', storeId, { ...previousPeriod, periodType: 'RANGE' }],
        queryFn: () => apiClient.get(`/analytics/${storeId}/sales/period`, { params: { ...previousPeriod, periodType: 'RANGE' } }).then(res => res.data.data),
        enabled: !!storeId,
      },
      // 2: Hourly Patterns
      {
        queryKey: ['salesByHourly', storeId, { ...currentPeriod, periodType: 'RANGE' }],
        queryFn: () => apiClient.get(`/analytics/${storeId}/sales/hourly`, { params: { ...currentPeriod, periodType: 'RANGE' } }).then(res => res.data.data),
        enabled: !!storeId,
      },
      // 3: Payment Methods
      {
        queryKey: ['paymentMethodRatioByPeriod', storeId, { ...currentPeriod, periodType: 'RANGE' }],
        queryFn: () => apiClient.get(`/analytics/${storeId}/sales/payment-method`, { params: { ...currentPeriod, periodType: 'RANGE' } }).then(res => res.data.data),
        enabled: !!storeId,
      },
      // 4: All Payments in Period (for menu analysis & order counts)
      {
        queryKey: ['payments', storeId, { ...currentPeriod, size: 10000 }], // Assuming max 10000 transactions
        queryFn: () => apiClient.get(`/payments/stores/${storeId}`, { params: { ...currentPeriod, size: 10000 } }).then(res => res.data.data.content as PaymentResponse[]),
        enabled: !!storeId,
      },
      // 5: Previous Period All Payments (for order count comparison)
      {
        queryKey: ['payments', storeId, { ...previousPeriod, size: 10000 }],
        queryFn: () => apiClient.get(`/payments/stores/${storeId}`, { params: { ...previousPeriod, size: 10000 } }).then(res => res.data.data.content as PaymentResponse[]),
        enabled: !!storeId,
      }
    ],
  });

  const isLoading = results.some(r => r.isLoading);
  const isError = results.some(r => r.isError);

  const data = useMemo(() => {
    if (isLoading || isError || results.some(r => !r.data)) return null;

    const [, , , , allTransactions, prevAllTransactions] = results.map(r => r.data) as [SalesPeriodResponse, SalesPeriodResponse, SalesHourlyResponse, PaymentMethodRatioResponse, PaymentResponse[], PaymentResponse[]];

    // --- Process Data ---
    // Filter for completed transactions only for sales calculations
    const completedTransactions = allTransactions.filter(t => t.status === 'APPROVED');
    const prevCompletedTransactions = prevAllTransactions.filter(t => t.status === 'APPROVED');

    const totalSales = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = completedTransactions.length;
    const aov = totalOrders > 0 ? totalSales / totalOrders : 0;

    const prevTotalSales = prevCompletedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const prevTotalOrders = prevCompletedTransactions.length;

    const salesChange = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : (totalSales > 0 ? 100 : 0);
    const ordersChange = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : (totalOrders > 0 ? 100 : 0);
    
    const dailySalesMap = new Map<string, { sales: number }>();
    completedTransactions.forEach(t => {
        const dateStr = format(new Date(t.approvedAt), 'yyyy-MM-dd');
        const dayData = dailySalesMap.get(dateStr) || { sales: 0 };
        dayData.sales += t.amount;
        dailySalesMap.set(dateStr, dayData);
    });
    const sortedDailySales = [...dailySalesMap.entries()].map(([date, data]) => ({ date, ...data })).sort((a, b) => b.sales - a.sales);
    const highestDay = sortedDailySales[0];
    const lowestDay = sortedDailySales[sortedDailySales.length - 1];

    const cancelledOrders = allTransactions.filter(t => t.status === 'CANCELED');
    const cancelledValue = cancelledOrders.reduce((sum, t) => sum + t.amount, 0);

    const summaryKpis = [
      { label: "총 매출액", value: `${totalSales.toLocaleString()}원`, change: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}% (이전 기간 대비)` },
      { label: "총 주문 수", value: `${totalOrders}건`, change: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}% (이전 기간 대비)` },
      { label: "평균 객단가", value: `${Math.round(aov).toLocaleString()}원`, change: "" },
      { label: "최고 매출일", value: highestDay ? format(new Date(highestDay.date), 'MM-dd (eee)', { locale: ko }) : '-', change: highestDay ? `${highestDay.sales.toLocaleString()}원` : '-' },
      { label: "최저 매출일", value: lowestDay ? format(new Date(lowestDay.date), 'MM-dd (eee)', { locale: ko }) : '-', change: lowestDay ? `${lowestDay.sales.toLocaleString()}원` : '-' },
      { label: "주문 취소", value: `${cancelledOrders.length}건`, change: `${cancelledValue.toLocaleString()}원` },
    ];

    let dailySummary: { date: string; sales: number; orders: number; aov: number }[] = [];
    if (reportType === 'weekly') {
      dailySummary = eachDayOfInterval({ start: new Date(currentPeriod.startDate), end: new Date(currentPeriod.endDate) }).map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const transactionsOnDay = completedTransactions.filter(t => format(new Date(t.approvedAt), 'yyyy-MM-dd') === dateStr);
        const ordersOnDay = transactionsOnDay.length;
        const salesOnDay = transactionsOnDay.reduce((sum, t) => sum + t.amount, 0);
        return {
          date: format(day, 'MM-dd (eee)', { locale: ko }),
          sales: salesOnDay,
          orders: ordersOnDay,
          aov: ordersOnDay > 0 ? Math.round(salesOnDay / ordersOnDay) : 0,
        };
      });
    } else { // monthly
      const weeklySummary: { [week: string]: { sales: number; orders: number } } = {};
      eachDayOfInterval({ start: new Date(currentPeriod.startDate), end: new Date(currentPeriod.endDate) }).forEach(day => {
        const week = getWeekOfMonth(day, { weekStartsOn: 1 }).toString();
        if (!weeklySummary[week]) {
          weeklySummary[week] = { sales: 0, orders: 0 };
        }
        const dateStr = format(day, 'yyyy-MM-dd');
        const transactionsOnDay = completedTransactions.filter(t => format(new Date(t.approvedAt), 'yyyy-MM-dd') === dateStr);
        const ordersOnDay = transactionsOnDay.length;
        const salesOnDay = transactionsOnDay.reduce((sum, t) => sum + t.amount, 0);
        
        weeklySummary[week].sales += salesOnDay;
        weeklySummary[week].orders += ordersOnDay;
      });
      dailySummary = Object.entries(weeklySummary).map(([week, data]) => {
        const weekNum = parseInt(week, 10);
        const weekStartDate = startOfWeek(new Date(currentPeriod.startDate), { weekStartsOn: 1 });
        const dayOffset = (weekNum - 1) * 7;
        const start = format(addDays(weekStartDate, dayOffset), 'MM.dd');
        const end = format(addDays(weekStartDate, dayOffset + 6), 'MM.dd');
        return {
          date: `${week}주차 (${start}~${end})`,
          sales: data.sales,
          orders: data.orders,
          aov: data.orders > 0 ? Math.round(data.sales / data.orders) : 0,
        }
      });
    }

    const openTime = storeDetail?.businessHours.reduce((min, h) => h.openTime ? Math.min(min, parseInt(h.openTime.split(':')[0])) : min, 24) ?? 9;
    const closeTime = storeDetail?.businessHours.reduce((max, h) => h.closeTime ? Math.max(max, parseInt(h.closeTime.split(':')[0])) : max, 0) ?? 21;

    const hourlyPatterns = [
      { label: `오전 (${String(openTime).padStart(2, '0')}-12시)`, sales: 0, orders: 0 },
      { label: "점심 (12-14시)", sales: 0, orders: 0 },
      { label: "오후 (14-18시)", sales: 0, orders: 0 },
      { label: `저녁 (18-${String(closeTime).padStart(2, '0')}시)`, sales: 0, orders: 0 },
    ];
    completedTransactions.forEach(t => {
      const hour = new Date(t.approvedAt).getHours();
      if (hour >= openTime && hour < 12) {
        hourlyPatterns[0].sales += t.amount;
        hourlyPatterns[0].orders++;
      } else if (hour >= 12 && hour < 14) {
        hourlyPatterns[1].sales += t.amount;
        hourlyPatterns[1].orders++;
      } else if (hour >= 14 && hour < 18) {
        hourlyPatterns[2].sales += t.amount;
        hourlyPatterns[2].orders++;
      } else if (hour >= 18 && hour < closeTime) {
        hourlyPatterns[3].sales += t.amount;
        hourlyPatterns[3].orders++;
      }
    });

    const paymentMethodsMap: { [key: string]: number } = { CARD: 0, KAKAOPAY: 0, CASH: 0, TRANSFER: 0 };
    completedTransactions.forEach(t => {
        paymentMethodsMap[t.paymentMethod] = (paymentMethodsMap[t.paymentMethod] || 0) + t.amount;
    });
    const paymentMethods = [
      { name: "카드", sales: paymentMethodsMap.CARD, proportion: totalSales > 0 ? `${(paymentMethodsMap.CARD / totalSales * 100).toFixed(1)}%` : '0.0%' },
      { name: "카카오페이", sales: paymentMethodsMap.KAKAOPAY, proportion: totalSales > 0 ? `${(paymentMethodsMap.KAKAOPAY / totalSales * 100).toFixed(1)}%` : '0.0%' },
      { name: "현금", sales: paymentMethodsMap.CASH, proportion: totalSales > 0 ? `${(paymentMethodsMap.CASH / totalSales * 100).toFixed(1)}%` : '0.0%' },
      { name: "계좌", sales: paymentMethodsMap.TRANSFER, proportion: totalSales > 0 ? `${(paymentMethodsMap.TRANSFER / totalSales * 100).toFixed(1)}%` : '0.0%' },
    ].filter(p => p.sales > 0);

    const storeSales = completedTransactions.filter(t => !t.delivery).reduce((sum, t) => sum + t.amount, 0);
    const deliverySales = completedTransactions.filter(t => t.delivery).reduce((sum, t) => sum + t.amount, 0);
    const storeOrders = completedTransactions.filter(t => !t.delivery).length;
    const deliveryOrders = completedTransactions.filter(t => t.delivery).length;
    const orderTypes = [
      { type: "가게 주문", sales: storeSales, orders: storeOrders, aov: storeOrders > 0 ? Math.round(storeSales / storeOrders) : 0 },
      { type: "배달 주문", sales: deliverySales, orders: deliveryOrders, aov: deliveryOrders > 0 ? Math.round(deliverySales / deliveryOrders) : 0 },
    ];

    const dailyPatterns = [
        { label: "월요일", sales: 0, aov: 0, orders: 0 }, { label: "화요일", sales: 0, aov: 0, orders: 0 },
        { label: "수요일", sales: 0, aov: 0, orders: 0 }, { label: "목요일", sales: 0, aov: 0, orders: 0 },
        { label: "금요일", sales: 0, aov: 0, orders: 0 }, { label: "토요일", sales: 0, aov: 0, orders: 0 },
        { label: "일요일", sales: 0, aov: 0, orders: 0 },
    ];

    completedTransactions.forEach(t => {
        const dayIndex = getDay(new Date(t.approvedAt)); // 일요일=0, 월요일=1, ...
        const dayOfWeek = (dayIndex === 0) ? 6 : dayIndex - 1; // 월요일=0, ... 일요일=6
        dailyPatterns[dayOfWeek].sales += t.amount;
        dailyPatterns[dayOfWeek].orders++;
    });
    dailyPatterns.forEach(p => {
        p.aov = p.orders > 0 ? Math.round(p.sales / p.orders) : 0;
    });


    return {
      storeName,
      title,
      period,
      summaryKpis,
      dailySummary,
      hourlyPatterns,
      paymentMethods,
      orderTypes,
      dailyPatterns,
    };
  }, [isLoading, isError, results, reportType, storeName, title, period]);

  // Menu data processing (Optimized)
  const { data: menuData, isLoading: isLoadingMenu } = useQuery<
    MenuSummaryResponse,
    Error,
    {
      topMenus: { proportion: string; name: string; sales: number; orders: number }[];
      lowMenus: { proportion: string; name: string; sales: number; orders: number }[];
    }
  >({
    queryKey: ['menuSummary', storeId, { ...currentPeriod, periodType: 'RANGE' }],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/${storeId}/menu-summary`, { params: { ...currentPeriod, periodType: 'RANGE' } });
      return res.data.data;
    },
    enabled: !!storeId,
    select: (data) => {
      if (!data || !data.menuSummaries) return { topMenus: [], lowMenus: [] };

      const sortedMenus = data.menuSummaries.map(m => ({
        name: m.menuName,
        sales: m.totalSales,
        orders: m.totalQuantity,
      })).sort((a, b) => b.sales - a.sales);

      const totalMenuSales = sortedMenus.reduce((sum, m) => sum + m.sales, 0);
      if (totalMenuSales === 0) return { topMenus: [], lowMenus: [] };

      const topMenus = sortedMenus.slice(0, 5).map(m => ({ ...m, proportion: `${(m.sales / totalMenuSales * 100).toFixed(1)}%` }));
      const lowMenus = sortedMenus.slice(-5).sort((a,b) => a.sales - b.sales).map(m => ({ ...m, proportion: `${(m.sales / totalMenuSales * 100).toFixed(1)}%` }));

      return { topMenus, lowMenus };
    }
  });

  const finalData = useMemo(() => {
    if (!data || !menuData) return null;
    return {
      ...data,
      topMenus: menuData.topMenus,
      lowMenus: menuData.lowMenus,
    };
  }, [data, menuData]);

  return { data: finalData, isLoading: isLoading || isLoadingMenu, isError };
};
