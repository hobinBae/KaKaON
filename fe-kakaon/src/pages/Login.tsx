import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBoundStore } from "@/stores/storeStore";
import { useNavigate, Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const login = useBoundStore((state) => state.login);

  const handleLogin = () => {
    // TODO: 실제 카카오 로그인 API 연동 필요
    // 최초 사용자인지 여부를 API 응답으로 받아온다고 가정
    const isNewUser = true; // 임시로 최초 사용자라고 가정

    login(); // Zustand 스토어의 login 액션 호출

    if (isNewUser) {
      navigate("/additional-info"); // 최초 사용자는 추가 정보 입력 페이지로 이동
    } else {
      navigate("/"); // 기존 사용자는 대시보드로 이동
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FEE500] via-[#FFD700] to-[#FEE500] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logoImg} alt="KaKaON Logo" className="h-12 mx-auto mb-4" />
            <p className="text-sm text-[#717182]">가맹점 매출관리 플랫폼</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 !mt-8">
            {/* Kakao Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] rounded-lg py-3 flex items-center justify-center gap-2 shadow-none"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 3C5.58 3 2 5.91 2 9.5C2 11.68 3.37 13.58 5.47 14.75L4.63 17.63C4.56 17.88 4.83 18.08 5.05 17.95L8.5 15.69C8.99 15.77 9.49 15.81 10 15.81C14.42 15.81 18 12.9 18 9.31C18 5.72 14.42 3 10 3Z"
                  fill="#3C1E1E"
                />
              </svg>
              카카오로 시작하기
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-[#3C1E1E]/60">
          KaKaON © 2025
        </div>
      </div>
    </div>
  );
}
