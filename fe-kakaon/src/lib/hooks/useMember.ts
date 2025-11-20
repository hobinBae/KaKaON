import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient, { removeToken } from '@/lib/apiClient';
import { useBoundStore } from '@/stores/storeStore';
import type { Member, MemberUpdateRequest } from '@/types/api';

// --- API 함수 정의 ---

/**
 * 내 정보를 조회하는 API 함수
 */
const getMyInfo = async (): Promise<Member> => {
  const response = await apiClient.get('/members/me');
  return response.data.data;
};

/**
 * 내 정보를 수정하는 API 함수
 */
const updateMyInfo = async (data: MemberUpdateRequest): Promise<Member> => {
  const response = await apiClient.patch('/members/me', data);
  return response.data.data;
};

/**
 * 회원 탈퇴를 처리하는 API 함수
 */
const deleteMyAccount = async (): Promise<void> => {
  await apiClient.delete('/members/me');
};


// --- TanStack Query 키 ---

const memberKeys = {
  all: ['members'] as const,
  me: () => [...memberKeys.all, 'me'] as const,
};

/**
 * 내 정보를 조회하는 커스텀 훅
 */
export const useMyInfo = () => {
  return useQuery({
    queryKey: memberKeys.me(),
    queryFn: getMyInfo,
    // 다른 옵션들 (staleTime, gcTime 등)을 여기에 추가할 수 있음
  });
};

/**
 * 내 정보를 수정하는 커스텀 훅
 */
export const useUpdateMyInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyInfo,
    onSuccess: (updatedMember) => {
      // 수정 성공 시, 'me' 쿼리의 캐시를 직접 업데이트하여 UI를 즉시 갱신
      queryClient.setQueryData(memberKeys.me(), updatedMember);
      // 필요하다면 여기에 toast 성공 메시지를 표시할 수 있음
    },
    onError: (error) => {
      // 에러 처리 로직 (예: toast 메시지 표시)
      console.error("Failed to update member info:", error);
    },
  });
};

/**
 * 회원 탈퇴를 처리하는 커스텀 훅
 */
export const useDeleteMyAccount = () => {
  const navigate = useNavigate();
  const { logout: logoutFromStore } = useBoundStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      // 1. 클라이언트의 모든 인증 정보 제거
      removeToken();
      logoutFromStore();
      
      // 2. TanStack Query 캐시 초기화
      queryClient.clear();

      // 3. 인트로 페이지로 이동
      navigate('/');
    },
    onError: (error) => {
      console.error("Failed to delete account:", error);
      // 실패하더라도 로그아웃 처리를 시도해볼 수 있음
      removeToken();
      logoutFromStore();
      queryClient.clear();
      navigate('/');
    },
  });
};
