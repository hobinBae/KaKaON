import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Menu } from "@/types/api";

// 특정 매장의 메뉴 목록을 가져오는 API 호출 함수
const getMenusByStore = async (storeId: number): Promise<Menu[]> => {
  const response = await apiClient.get(`/menus?storeId=${storeId}`);
  // PageResponse 객체에서 실제 메뉴 목록인 content 배열을 반환하도록 수정했음
  // 백엔드에서는 'menu' 필드로 이름을 반환하므로 'name'으로, 'menuId'는 'id'로, 'imgUrl'은 'imageUrl'로 매핑해줌
  return response.data.data.content.map((item: any) => ({
    ...item,
    id: item.menuId,
    name: item.menu,
    imageUrl: item.imgUrl,
  }));
};

// 메뉴 목록 조회를 위한 커스텀 훅
export const useMenus = (storeId: number | null) => {
  return useQuery({
    queryKey: ["menus", storeId],
    queryFn: () => getMenusByStore(storeId!),
    enabled: !!storeId, // storeId가 있을 때만 쿼리를 실행함
  });
};

interface MenuRequest {
  menu: string;
  price: number;
  image?: File | null;
}

// 메뉴 생성을 위한 API 호출 함수
const createMenu = async ({ storeId, menuData }: { storeId: number; menuData: MenuRequest }) => {
  const formData = new FormData();
  const menuInfo = {
    menu: menuData.menu,
    price: menuData.price,
  };
  formData.append("data", JSON.stringify(menuInfo));

  if (menuData.image) {
    formData.append("image", menuData.image);
  }

  const response = await apiClient.post(`/menus/v2?storeId=${storeId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 메뉴 생성을 위한 커스텀 훅
export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMenu,
    onSuccess: (data, variables) => {
      // 메뉴 생성 성공 시, 해당 매장의 메뉴 목록 쿼리를 무효화하여 다시 불러오도록 함
      queryClient.invalidateQueries({ queryKey: ["menus", variables.storeId] });
    },
  });
};

// 메뉴 수정을 위한 API 호출 함수
const updateMenu = async ({ storeId, menuId, menuData }: { storeId: number; menuId: number; menuData: Partial<MenuRequest> }) => {
  const formData = new FormData();
  const menuInfo = {
    menu: menuData.menu,
    price: menuData.price,
  };
  formData.append("data", JSON.stringify(menuInfo));

  if (menuData.image) {
    formData.append("image", menuData.image);
  }

  const response = await apiClient.patch(`/menus/v2/${menuId}?storeId=${storeId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 메뉴 수정을 위한 커스텀 훅
export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMenu,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menus", variables.storeId] });
    },
  });
};

// 메뉴 삭제를 위한 API 호출 함수
const deleteMenu = async ({ storeId, menuId }: { storeId: number; menuId: number }) => {
  const response = await apiClient.delete(`/menus/${menuId}?storeId=${storeId}`);
  return response.data;
};

// 메뉴 삭제를 위한 커스텀 훅
export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMenu,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menus", variables.storeId] });
    },
  });
};
