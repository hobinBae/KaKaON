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

const getOrders = async (storeId: number): Promise<Transaction[]> => {
  const response = await apiClient.get(`/orders?storeId=${storeId}`);
  const orders = response.data.data.content;
  return orders.map((order: any) => ({
    id: order.orderId,
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

export const useOrders = (storeId: number | null) => {
  return useQuery({
    queryKey: ["orders", storeId],
    queryFn: () => getOrders(storeId!),
    enabled: !!storeId,
  });
};

const getOrderDetail = async (orderId: number): Promise<Transaction> => {
  const response = await apiClient.get(`/orders/${orderId}`);
  const orderDetail = response.data.data;
  return {
    id: orderDetail.orderId,
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
