import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { DashboardSummary, MonthlySalesResponse } from "@/types/api";

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
