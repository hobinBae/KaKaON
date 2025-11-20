import { useEffect, useState } from "react";
import apiClient, { setToken } from "@/lib/apiClient";
import { useBoundStore } from "@/stores/storeStore";
import type { Member } from "@/types/api";

// 사용자 정보를 가져오는 함수를 apiClient를 사용하여 정의
const getMyInfo = async (): Promise<Member> => {
  const response = await apiClient.get('/members/me');
  return response.data.data;
};

// 앱 로드 시 자동 로그인을 처리하고, 완료될 때까지 자식 컴포넌트 렌더링을 보류하는 컴포넌트
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { login } = useBoundStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const attemptSilentRefresh = async () => {
      try {
        const { data } = await apiClient.post('/auth/refresh');
        const newAccessToken = data.data.accessToken;
        
        if (newAccessToken) {
          setToken(newAccessToken);
          // 토큰 설정 후 사용자 정보 가져오기
          const memberInfo = await getMyInfo();
          login(memberInfo); // 스토어에 사용자 정보와 함께 로그인 상태 업데이트
        }
      } catch (error) {
        console.log("Silent refresh failed. User is not logged in.");
      } finally {
        setIsAuthChecked(true);
      }
    };

    attemptSilentRefresh();
  }, [login]);

  // 인증 확인이 완료될 때까지 아무것도 렌더링하지 않음 (또는 로딩 스피너를 표시)
  if (!isAuthChecked) {
    return null; 
  }

  return <>{children}</>;
};

export default AuthProvider;
