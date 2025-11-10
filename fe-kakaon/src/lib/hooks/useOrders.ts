import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { CartItem } from "@/types/api";

interface OrderRequest {
  orderMenus: { menuId: number; amount: number; name: string; price: number }[];
  paymentMethod: string;
  orderType: string;
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
