import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBoundStore } from "@/stores/storeStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const login = useBoundStore((state) => state.login);

  const handleLogin = () => {
    login(); // Zustand 스토어의 login 액션 호출
    navigate("/"); // 로그인 후 대시보드로 이동
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FEE500] via-[#FFD700] to-[#FEE500] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FEE500] mb-4">
              <span className="text-2xl text-[#3C1E1E]">K</span>
            </div>
            <h1 className="text-[#333333] mb-2">KakaoPay Franchise</h1>
            <p className="text-sm text-[#717182]">가맹점 매출관리 플랫폼</p>
          </div>

          {/* Login Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-[#333333] mb-2">카카오계정</label>
              <Input
                type="email"
                placeholder="이메일을 입력하세요"
                className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm text-[#333333] mb-2">비밀번호</label>
              <Input
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] px-4 py-3"
              />
            </div>
          </div>

          {/* Kakao Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg py-6 flex items-center justify-center gap-2 shadow-none"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 3C5.58 3 2 5.91 2 9.5C2 11.68 3.37 13.58 5.47 14.75L4.63 17.63C4.56 17.88 4.83 18.08 5.05 17.95L8.5 15.69C8.99 15.77 9.49 15.81 10 15.81C14.42 15.81 18 12.9 18 9.31C18 5.72 14.42 3 10 3Z"
                fill="#3C1E1E"
              />
            </svg>
            카카오계정으로 로그인
          </Button>

          {/* Additional Links */}
          <div className="mt-6 text-center space-x-4">
            <a href="#" className="text-sm text-[#717182] hover:text-[#333333]">
              회원가입
            </a>
            <span className="text-[#717182]">|</span>
            <a href="#" className="text-sm text-[#717182] hover:text-[#333333]">
              비밀번호 찾기
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-[#3C1E1E]/60">
          가맹점 매출관리 플랫폼 by KakaoPay
        </div>
      </div>
    </div>
  );
}
