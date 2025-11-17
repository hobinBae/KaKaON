import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Transaction } from "@/types/api";

interface PaymentFilters {
  page?: number;
  size?: number;
  status?: string;
  paymentMethod?: string[];
  orderType?: string;
  startDate?: string;
  endDate?: string;
  authorizationNo?: string;
  activePeriod?: string;
}

const getPayments = async (storeId: number, filters: PaymentFilters) => {
  const params = new URLSearchParams();
  params.append('page', (filters.page || 0).toString());
  params.append('size', (filters.size || 10).toString());

  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters.authorizationNo) {
    params.append('authorizationNo', filters.authorizationNo);
  }
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status === 'completed' ? 'APPROVED' : 'CANCELLED');
  }
  if (filters.paymentMethod && !filters.paymentMethod.includes('all')) {
    const paymentMethodMapToEnglish: { [key: string]: string } = {
      '카드': 'CARD',
      '계좌': 'TRANSFER',
      '카카오페이': 'KAKAOPAY',
      '현금': 'CASH',
    };
    const englishMethods = filters.paymentMethod.map(method => paymentMethodMapToEnglish[method] || method);
    params.append('paymentMethod', englishMethods.join(','));
  }
  if (filters.orderType && filters.orderType !== 'all') {
    params.append('isDelivery', filters.orderType);
  }


  const response = await apiClient.get(`/payments/stores/${storeId}`, { params });
  return response.data;
};

export const usePayments = (storeId: number | null, filters: PaymentFilters) => {
  return useQuery({
    queryKey: [
      "payments",
      storeId,
      filters.page,
      filters.size,
      filters.status,
      filters.paymentMethod,
      filters.orderType,
      filters.startDate,
      filters.endDate,
      filters.authorizationNo,
      filters.activePeriod,
    ],
    queryFn: () => getPayments(storeId!, filters),
    enabled: !!storeId,
  });
};
