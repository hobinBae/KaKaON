import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// 카카오 로그인 성공 후 리디렉션되는 콜백 페이지 컴포넌트
// 이 페이지는 팝업으로 열림
export default function LoginCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");

    if (accessToken) {
      // 부모창이 존재하면, 로그인 성공 메시지와 액세스 토큰만 전달
      if (window.opener) {
        window.opener.postMessage({
          type: 'LOGIN_SUCCESS',
          accessToken: accessToken,
        }, window.location.origin);
      }
    } else {
      // 토큰이 없으면 에러 메시지 전달
      if (window.opener) {
        window.opener.postMessage({
          type: 'LOGIN_FAILURE',
        }, window.location.origin);
      }
    }
    // 메시지 전달 후 팝업창을 닫음
    window.close();
  }, [searchParams]);

  // 로딩 중임을 사용자에게 표시
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>로그인 처리 중...</p>
    </div>
  );
}
