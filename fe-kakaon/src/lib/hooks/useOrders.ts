import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { CartItem, Transaction } from "@/types/api";

interface OrderRequest {
  items: { menuId: number; price: number; quantity: number }[];
  orderType: string;
  paymentMethod: string;
}

const createOrder = async ({ storeId, orderData }: { storeId: number; orderData: OrderRequest }) => {
  const response = await apiClient.post(`/orders/${storeId}`, orderData);
  return response.data;
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data, variables) => {
      // 주문 생성 성공 시 관련 쿼리 무효화 (예: 주문 내역)
      queryClient.invalidateQueries({ queryKey: ["orders", variables.storeId] });
    },
  });
};

const cancelOrder = async ({ storeId, orderId }: { storeId: number; orderId: number }) => {
  const response = await apiClient.post(`/orders/${orderId}/cancel?storeId=${storeId}`);
  return response.data;
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", variables.storeId] });
    },
  });
};

const getOrders = async (storeId: number, size: number = 1000): Promise<Transaction[]> => {
  const response = await apiClient.get(`/orders?storeId=${storeId}&size=${size}`);
  const orders = response.data.data.content;
  return orders.map((order: any) => ({
    id: order.orderId,
    orderId: order.orderId,
    items: order.items.map((item: any) => ({
      name: item.menuName,
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.totalAmount,
    date: order.createdAt,
    storeId: String(order.storeId),
    orderType: order.orderType,
    paymentMethod: order.paymentMethod,
    status: order.status === 'PAID' ? 'completed' : 'cancelled',
  }));
};

export const useOrders = (storeId: number | null, size?: number) => {
  return useQuery({
    queryKey: ["orders", storeId, size],
    queryFn: () => getOrders(storeId!, size),
    enabled: !!storeId,
  });
};

interface OrderFilters {
  page?: number;
  size?: number;
  status?: string;
  paymentMethod?: string[];
  orderType?: string;
  startDate?: string;
  endDate?: string;
}

const getFilteredOrders = async (storeId: number, filters: OrderFilters) => {
  const params = new URLSearchParams();
  params.append('page', (filters.page || 0).toString());
  params.append('size', (filters.size || 10).toString());

  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status === 'completed' ? 'PAID' : 'CANCELLED');
  }
  if (filters.paymentMethod && !filters.paymentMethod.includes('all')) {
    filters.paymentMethod.forEach(method => {
      const paymentMethodMap: { [key: string]: string } = {
        '카드': 'CARD',
        '계좌': 'TRANSFER',
        '카카오페이': 'KAKAOPAY',
        '현금': 'CASH',
      };
      if (paymentMethodMap[method]) {
        params.append('paymentMethod', paymentMethodMap[method]);
      }
    });
  }
  if (filters.orderType && filters.orderType !== 'all') {
    params.append('orderType', filters.orderType === 'delivery' ? 'DELIVERY' : 'TAKE_OUT');
  }
  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }

  const response = await apiClient.get(`/orders?storeId=${storeId}`, { params });
  const { content, totalPages, totalElements, number, size } = response.data.data;
  
  const transactions: Transaction[] = content.map((order: any) => ({
    id: order.orderId,
    orderId: order.orderId,
    items: order.items.map((item: any) => ({
      name: item.menuName,
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.totalAmount,
    date: order.createdAt,
    storeId: String(order.storeId),
    orderType: order.orderType === 'DELIVERY' ? '배달 주문' : '가게 주문',
    paymentMethod: order.paymentMethod,
    status: order.status === 'PAID' ? 'completed' : 'cancelled',
  }));

  return {
    transactions,
    totalPages,
    totalElements,
    page: number,
    size,
  };
};

export const useFilteredOrders = (storeId: number | null, filters: OrderFilters) => {
  return useQuery({
    queryKey: ["orders", storeId, filters],
    queryFn: () => getFilteredOrders(storeId!, filters),
    enabled: !!storeId,
  });
};

const getOrderDetail = async (orderId: number): Promise<Transaction> => {
  const response = await apiClient.get(`/orders/${orderId}`);
  const orderDetail = response.data.data;
  return {
    id: orderDetail.orderId,
    orderId: orderDetail.orderId,
    items: orderDetail.items.map((item: any) => ({
      name: item.menuName,
      quantity: item.quantity,
      price: item.price,
    })),
    total: orderDetail.totalAmount,
    date: orderDetail.createdAt,
    storeId: String(orderDetail.storeId),
    orderType: orderDetail.orderType,
    paymentMethod: orderDetail.paymentMethod,
    status: orderDetail.status === 'PAID' ? 'completed' : 'cancelled',
  };
};

export const useOrderDetail = (orderId: number | null) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderDetail(orderId!),
    enabled: !!orderId,
  });
};
