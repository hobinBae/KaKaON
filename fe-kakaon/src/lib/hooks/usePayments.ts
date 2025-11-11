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

  const response = await apiClient.get(`/payments/stores/${storeId}`, { params });
  const { content, totalPages, totalElements, number, size } = response.data.data;
  
  const paymentMethodMapToKorean: { [key: string]: string } = {
    'CARD': '카드',
    'TRANSFER': '계좌',
    'KAKAOPAY': '카카오페이',
    'CASH': '현금',
  };

  const transactions: Transaction[] = content.map((payment: any) => ({
    id: payment.authorizationCode || payment.paymentId,
    items: [], // 결제 내역 API는 주문 아이템 정보를 포함하지 않음
    total: payment.amount,
    date: payment.approvedAt,
    storeId: String(payment.storeId),
    orderType: payment.delivery ? '배달 주문' : '가게 주문',
    paymentMethod: paymentMethodMapToKorean[payment.paymentMethod] || payment.paymentMethod,
    status: payment.status === 'APPROVED' ? 'completed' : 'cancelled',
  }));

  return {
    transactions,
    totalPages,
    totalElements,
    page: number,
    size,
  };
};

export const usePayments = (storeId: number | null, filters: PaymentFilters) => {
  return useQuery({
    queryKey: ["payments", storeId, filters],
    queryFn: () => getPayments(storeId!, filters),
    enabled: !!storeId,
  });
};
