import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { DashboardSummary, MonthlySalesResponse, SalesPeriodResponse, SalesHourlyResponse, CancelRateResponse, PaymentMethodRatioResponse } from "@/types/api";

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
  return useQuery<any, Error>({
    queryKey: ["salesByStores", params],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/sales/stores", { params });
      return res.data.data;
    },
    enabled: options?.enabled ?? true,
  });
};
