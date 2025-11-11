import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Alert, AlertDetail, AlertSearchRequest, UnreadAlertCount } from '@/types/api';

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
    },
  });
};
