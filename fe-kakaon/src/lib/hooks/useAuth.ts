import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient, { removeToken } from "@/lib/apiClient";
import { useBoundStore } from "@/stores/storeStore";

// 로그아웃 API 호출 함수
const logout = async () => {
  // 백엔드에 로그아웃 요청을 보내 토큰을 블랙리스트 처리하도록 함
  await apiClient.post("/auth/logout");
};

// 로그아웃 처리를 위한 커스텀 훅
export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: logoutFromStore } = useBoundStore();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // API 호출 성공 시 클라이언트 상태 처리
      // 1. 메모리에 저장된 토큰 삭제
      removeToken();
      // 2. Zustand 스토어의 상태 초기화
      logoutFromStore();
      // 3. 인트로 페이지로 이동
      navigate("/");
    },
    onError: (error) => {
      // API 호출 실패 시에도 클라이언트 측에서는 로그아웃 처리를 해주는 것이 좋음
      console.error("Logout failed", error);
      removeToken();
      logoutFromStore();
      navigate("/");
    },
  });
};
