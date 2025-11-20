import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Alert, AlertDetail, AlertSearchRequest, UnreadAlertCount, Store } from '@/types/api';
import { useMyStores } from './useStores';

// ================== API 호출 함수 ==================

// 알림 목록 조회
const fetchAlerts = async (storeId: string, params: AlertSearchRequest, page: number, size: number) => {
  const { data } = await apiClient.get(`/stores/${storeId}/alerts`, {
    params: { ...params, page, size, sort: 'detectedAt,desc' },
  });
  return data.data; // PageResponse<Alert>
};

// 미확인 알림 개수 조회
const fetchUnreadAlertCount = async (storeId: string): Promise<UnreadAlertCount> => {
  const { data } = await apiClient.get(`/stores/${storeId}/alerts/unread-count`);
  return data.data;
};

// 알림 상세 조회
const fetchAlertDetail = async (storeId: string, alertId: number): Promise<AlertDetail> => {
  const { data } = await apiClient.get(`/stores/${storeId}/alerts/${alertId}`);
  return data.data;
};

// 단건 알림 읽음 처리
const readAlert = async ({ storeId, alertId }: { storeId: string; alertId: number }): Promise<Alert> => {
  const { data } = await apiClient.patch(`/stores/${storeId}/alerts/${alertId}/read`);
  return data.data;
};

// 모든 알림 읽음 처리
const readAllAlerts = async (storeId: string) => {
  const { data } = await apiClient.patch(`/stores/${storeId}/alerts/read-all`);
  return data.data;
};

// ================== 커스텀 훅 ==================

// 알림 목록 조회를 위한 훅
export const useAlerts = (storeId: string, params: AlertSearchRequest, page: number, size: number) => {
  return useQuery({
    queryKey: ['alerts', storeId, params, page, size],
    queryFn: () => fetchAlerts(storeId, params, page, size),
    enabled: !!storeId, // storeId가 있을 때만 쿼리 실행
  });
};

// 미확인 알림 개수 조회를 위한 훅
export const useUnreadAlertCount = (storeId: string) => {
  return useQuery({
    queryKey: ['unreadAlertCount', storeId],
    queryFn: () => fetchUnreadAlertCount(storeId),
    enabled: !!storeId,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });
};

// 알림 상세 조회를 위한 훅
export const useAlertDetail = (storeId: string, alertId: number | null) => {
  return useQuery({
    queryKey: ['alertDetail', storeId, alertId],
    queryFn: () => fetchAlertDetail(storeId, alertId!),
    enabled: !!storeId && alertId !== null,
  });
};

// 단건 알림 읽음 처리를 위한 훅
export const useReadAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readAlert,
    onSuccess: (data, variables) => {
      // 성공 시 관련 쿼리들을 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['alerts', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['unreadAlertCount', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['alertDetail', variables.storeId, variables.alertId] });
    },
  });
};

// 모든 알림 읽음 처리를 위한 훅
export const useReadAllAlerts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readAllAlerts,
    onSuccess: (data, storeId) => {
      queryClient.invalidateQueries({ queryKey: ['alerts', storeId] });
      queryClient.invalidateQueries({ queryKey: ['unreadAlertCount', storeId] });
      // 전체 알림 훅도 무효화
      queryClient.invalidateQueries({ queryKey: ['allAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['allUnreadAlertCount'] });
    },
  });
};

// ================== 전체 가맹점 알림 관련 훅 ==================

/**
 * 모든 가맹점의 알림 목록과 읽지 않은 알림 수를 가져오는 훅
 */
export const useAllAlerts = () => {
  const { data: stores, isLoading: isLoadingStores } = useMyStores();

  const alertQueries = useQueries({
    queries: (stores ?? []).map(store => ({
      queryKey: ['alerts', String(store.storeId), { checked: false }, 0, 5],
      queryFn: () => fetchAlerts(String(store.storeId), { checked: false }, 0, 5),
      enabled: !!stores,
    })),
  });

  const unreadCountQueries = useQueries({
    queries: (stores ?? []).map(store => ({
      queryKey: ['unreadAlertCount', String(store.storeId)],
      queryFn: () => fetchUnreadAlertCount(String(store.storeId)),
      enabled: !!stores,
      refetchInterval: 30000,
    })),
  });

  const isLoading = isLoadingStores || alertQueries.some(q => q.isLoading) || unreadCountQueries.some(q => q.isLoading);

  // 모든 알림 데이터를 하나의 배열로 합치고, 가맹점 정보를 추가
  const allAlerts = alertQueries
    .flatMap((query, index) => {
      const store = stores?.[index];
      if (!query.data || !store) return [];
      // PageResponse<Alert> 타입이므로 content를 사용
      return query.data.content.map((alert: Alert) => ({
        ...alert,
        storeId: store.storeId,
        storeName: store.name,
      }));
    })
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()); // 최신순 정렬

  // 모든 읽지 않은 알림 수 합산
  const totalUnreadCount = unreadCountQueries.reduce((total, query) => {
    return total + (query.data?.unreadCount || 0);
  }, 0);

  return {
    alerts: allAlerts,
    unreadCount: totalUnreadCount,
    isLoading,
  };
};
