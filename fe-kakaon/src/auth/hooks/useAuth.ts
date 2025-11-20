import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient, { removeToken } from "@/lib/apiClient";
import { useBoundStore } from "@/stores/storeStore";
import { setToken } from "@/lib/apiClient";

// 로그아웃 API 호출 함수
const logout = async () => {
  // 백엔드에 로그아웃 요청을 보내 토큰을 블랙리스트 처리하도록 함
  await apiClient.post("/auth/logout");
};

// 테스트 로그인 API 호출 함수
const testLogin = async (data: { testId: string; testPassword: string }) => {
  const response = await apiClient.post("/auth/test-login", data);
  return response.data;
};

// 로그아웃 처리를 위한 커스텀 훅
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout: logoutFromStore } = useBoundStore();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // API 호출 성공 시 클라이언트 상태 처리
      // 1. 메모리에 저장된 토큰 삭제
      removeToken();
      // 2. Zustand 스토어의 상태 초기화
      logoutFromStore();
      // 3. 쿼리 캐시 초기화 (이전 사용자의 데이터가 남지 않도록 함)
      queryClient.clear();
      // 4. 인트로 페이지로 이동
      navigate("/");
    },
    onError: (error) => {
      // API 호출 실패 시에도 클라이언트 측에서는 로그아웃 처리를 해주는 것이 좋음
      console.error("Logout failed", error);
      removeToken();
      logoutFromStore();
      queryClient.clear();
      navigate("/");
    },
  });
};

// 테스트 로그인 처리를 위한 커스텀 훅
export const useTestLogin = () => {
  const navigate = useNavigate();
  const { login } = useBoundStore();

  return useMutation({
    mutationFn: testLogin,
    onSuccess: async (response) => {
      const { accessToken } = response.data;
      setToken(accessToken);
      
      try {
        // 사용자 정보 가져오기
        const memberResponse = await apiClient.get("/members/me");
        const memberData = memberResponse.data.data;
        login(memberData);
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to fetch member info", error);
        alert("회원 정보를 가져오는데 실패했습니다.");
      }
    },
    onError: (error) => {
      console.error("Test login failed", error);
      alert("테스트 로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    },
  });
};
