import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Store,
  StoreDetailResponse,
  StoreCreateRequest,
  StoreUpdateRequest,
  OperationStatusUpdateRequest,
  OperationStatusUpdateResponse,
  AlertRecipient,
  AlertRecipientCreateRequest,
  AlertRecipientUpdateRequest,
} from '@/types/api';
import apiClient from '@/lib/apiClient';

// ================== 가맹점 API 함수들 ==================

// 내 매장 목록을 가져오는 API 호출 함수
const getMyStores = async (): Promise<Store[]> => {
  const response = await apiClient.get('/stores');
  // PageResponse 객체에서 실제 매장 목록인 content 배열을 반환하도록 수정했음
  return response.data.data.content;
};

// 특정 매장 정보를 가져오는 API 호출 함수
const getStoreById = async (storeId: number): Promise<StoreDetailResponse> => {
  const response = await apiClient.get(`/stores/${storeId}`);
  return response.data.data;
};

// 신규 매장을 생성하는 API 호출 함수
const createStore = async (data: StoreCreateRequest): Promise<Store> => {
  const response = await apiClient.post('/stores', data);
  return response.data.data;
};

// 매장을 수정하는 API 호출 함수
const updateStore = async ({ storeId, data }: { storeId: number; data: StoreUpdateRequest }): Promise<StoreDetailResponse> => {
  const response = await apiClient.patch(`/stores/${storeId}`, data);
  return response.data.data;
};

// 매장을 삭제하는 API 호출 함수
const deleteStore = async (storeId: number): Promise<void> => {
  await apiClient.delete(`/stores/${storeId}`);
};

// ================== 영업 상태 API 함수들 ==================

// 가맹점 영업 상태를 조회하는 API 함수
const getOperationStatus = async (storeId: number): Promise<OperationStatusUpdateResponse> => {
  const response = await apiClient.get(`/stores/${storeId}/operation-status`);
  return response.data.data;
};

// 가맹점 영업 상태를 변경하는 API 함수
const updateOperationStatus = async ({ storeId, data }: { storeId: number; data: OperationStatusUpdateRequest }): Promise<OperationStatusUpdateResponse> => {
  const endpoint = data.status === 'OPEN' ? `/stores/${storeId}/open` : `/stores/${storeId}/close`;
  const response = await apiClient.post(endpoint, data);
  return response.data.data;
};

// ================== 알림 수신자 API 함수들 ==================

// 알림 수신자를 등록하는 API 함수
const registerAlertRecipient = async ({ storeId, data }: { storeId: number; data: AlertRecipientCreateRequest }): Promise<AlertRecipient> => {
  const response = await apiClient.post(`/stores/${storeId}/alert-recipient`, data);
  return response.data.data;
};

// 알림 수신자를 수정하는 API 함수
const updateAlertRecipient = async ({ storeId, alertId, data }: { storeId: number; alertId: number; data: AlertRecipientUpdateRequest }): Promise<AlertRecipient> => {
  const response = await apiClient.patch(`/stores/${storeId}/alert-recipient/${alertId}`, data);
  return response.data.data;
};

// 알림 수신자를 삭제하는 API 함수
const deleteAlertRecipient = async ({ storeId, alertId }: { storeId: number; alertId: number }): Promise<void> => {
  await apiClient.delete(`/stores/${storeId}/alert-recipient/${alertId}`);
};


const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: number) => [...storeKeys.details(), id] as const,
  operationStatus: (id: number) => [...storeKeys.all, 'operation-status', id] as const,
  alertRecipients: (id: number) => [...storeKeys.all, 'alert-recipients', id] as const,
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
  return useQuery<StoreDetailResponse, Error>({
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

/**
 * 가맹점 정보를 수정하는 커스텀 훅
 */
export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStore,
    onSuccess: (updatedStore) => {
      // 가맹점 목록 쿼리를 무효화하여 목록을 새로고침
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      // 수정된 가맹점의 상세 정보 캐시를 직접 업데이트
      queryClient.setQueryData(storeKeys.detail(updatedStore.storeId), updatedStore);
    },
  });
};

// ================== 영업 상태 관련 훅 ==================

/**
 * 특정 가맹점의 영업 상태를 조회하는 커스텀 훅
 */
export const useOperationStatus = (storeId: number) => {
  return useQuery({
    queryKey: storeKeys.operationStatus(storeId),
    queryFn: () => getOperationStatus(storeId),
    enabled: !!storeId,
  });
};

/**
 * 가맹점의 영업 상태를 변경하는 커스텀 훅 (낙관적 업데이트 적용)
 */
export const useUpdateOperationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOperationStatus,
    onMutate: async ({ storeId, data }) => {
      // 쿼리 취소
      await queryClient.cancelQueries({ queryKey: storeKeys.operationStatus(storeId) });

      // 이전 상태 스냅샷
      const previousStatus = queryClient.getQueryData<OperationStatusUpdateResponse>(storeKeys.operationStatus(storeId));

      // 낙관적으로 새 값으로 업데이트
      queryClient.setQueryData(storeKeys.operationStatus(storeId), {
        status: data.status,
        updatedAt: new Date().toISOString(), // 임시로 현재 시간 설정
      });

      // 컨텍스트에 스냅샷 반환
      return { previousStatus, storeId };
    },
    onError: (err, variables, context) => {
      // 에러 발생 시 스냅샷으로 롤백
      if (context?.previousStatus) {
        queryClient.setQueryData(storeKeys.operationStatus(context.storeId), context.previousStatus);
      }
      toast.error("영업 상태 변경에 실패했습니다.");
    },
    onSuccess: (data, variables) => {
      // 성공 시 서버 데이터로 캐시를 다시 설정
      queryClient.setQueryData(storeKeys.operationStatus(variables.storeId), data);
    },
    onSettled: (data, error, variables) => {
      // 성공/실패 여부와 관계없이 관련 쿼리를 무효화하여 최신 상태 보장
      queryClient.invalidateQueries({ queryKey: storeKeys.operationStatus(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() }); // 목록의 상태도 변경
    },
  });
};

// ================== 알림 수신자 관련 훅 ==================

/**
 * 알림 수신자를 등록하는 커스텀 훅
 */
export const useRegisterAlertRecipient = () => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerAlertRecipient,
    onSuccess: () => {
      // 알림 수신자 목록 조회 API가 없으므로, 성공 시 별도 처리 없음.
      // 필요 시, queryClient.invalidateQueries({ queryKey: storeKeys.alertRecipients(storeId) });
    },
  });
};

/**
 * 알림 수신자를 수정하는 커스텀 훅
 */
export const useUpdateAlertRecipient = () => {
  // const queryClient = useQueryClient(); // 현재 사용하지 않으므로 주석 처리했음
  return useMutation({
    mutationFn: updateAlertRecipient,
    onSuccess: () => {
      // 알림 수신자 목록 API가 있다면 아래 코드로 캐시를 무효화해야 합니다.
      // queryClient.invalidateQueries({ queryKey: storeKeys.alertRecipients(variables.storeId) });
    },
  });
};

/**
 * 알림 수신자를 삭제하는 커스텀 훅
 */
export const useDeleteAlertRecipient = () => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlertRecipient,
    onSuccess: () => {
      // 성공 시 별도 처리 없음.
    },
  });
};
