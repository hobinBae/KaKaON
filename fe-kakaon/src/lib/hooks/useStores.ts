import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Store, StoreCreateRequest } from '@/types/api';

// API 함수들은 나중에 실제 구현으로 대체될 예정
const getMyStores = async (): Promise<Store[]> => Promise.reject(new Error("API not implemented"));
const getStoreById = async (storeId: number): Promise<Store> => Promise.reject(new Error(`API not implemented for storeId: ${storeId}`));
const createStore = async (data: StoreCreateRequest): Promise<Store> => Promise.reject(new Error("API not implemented"));
const deleteStore = async (storeId: number): Promise<void> => Promise.reject(new Error(`API not implemented for storeId: ${storeId}`));


const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: number) => [...storeKeys.details(), id] as const,
};

/**
 * 내 가맹점 목록을 조회하는 커스텀 훅
 */
export const useMyStores = () => {
  return useQuery({
    queryKey: storeKeys.lists(),
    queryFn: getMyStores,
  });
};

/**
 * 특정 가맹점 정보를 조회하는 커스텀 훅
 */
export const useStoreById = (storeId: number) => {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => getStoreById(storeId),
    enabled: !!storeId, // storeId가 있을 때만 쿼리 실행
  });
};

/**
 * 새 가맹점을 등록하는 커스텀 훅
 */
export const useCreateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      // 가맹점 목록 쿼리를 무효화하여 목록을 새로고침
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
    },
  });
};

/**
 * 가맹점을 삭제하는 커스텀 훅
 */
export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStore,
    onSuccess: (_, storeId) => {
      // 가맹점 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      // 상세 정보 쿼리 캐시도 제거
      queryClient.removeQueries({ queryKey: storeKeys.detail(storeId) });
    },
  });
};
