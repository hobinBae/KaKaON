import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Member, MemberUpdateRequest } from '@/types/api';

// API 함수들은 나중에 실제 구현으로 대체될 예정
const getMyInfo = async (): Promise<Member> => Promise.reject(new Error("API not implemented"));
const updateMyInfo = async (data: MemberUpdateRequest): Promise<Member> => Promise.reject(new Error("API not implemented"));

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
      // 수정 성공 시, 'me' 쿼리를 무효화하거나 직접 업데이트하여 UI를 갱신
      queryClient.setQueryData(memberKeys.me(), updatedMember);
    },
    onError: (error) => {
      // 에러 처리 로직 (예: toast 메시지 표시)
      console.error("Failed to update member info:", error);
    },
  });
};
