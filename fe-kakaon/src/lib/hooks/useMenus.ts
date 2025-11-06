import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Menu } from "@/types/api";

// 특정 매장의 메뉴 목록을 가져오는 API 호출 함수
const getMenusByStore = async (storeId: number): Promise<Menu[]> => {
  const response = await apiClient.get(`/menus?storeId=${storeId}`);
  return response.data.data;
};

// 메뉴 목록 조회를 위한 커스텀 훅
export const useMenus = (storeId: number | null) => {
  return useQuery({
    queryKey: ["menus", storeId],
    queryFn: () => getMenusByStore(storeId!),
    enabled: !!storeId, // storeId가 있을 때만 쿼리를 실행함
  });
};
