import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBoundStore } from "@/stores/storeStore";
import { useNavigate, Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

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
            <img src={logoImg} alt="KaKaON Logo" className="h-12 mx-auto mb-4" />
            <p className="text-sm text-[#717182]">가맹점 매출관리 플랫폼</p>
          </div>

          {/* Login Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-[#333333] mb-2">이메일</label>
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
            <Button
              type="submit"
              className="w-full bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg py-3 flex items-center justify-center gap-2 shadow-none !mt-6"
            >
              로그인
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-sm text-gray-400">또는</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
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

            {/* Google Login Button */}
            <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-[#333333] rounded-lg py-3 flex items-center justify-center gap-2 shadow-none"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.5 10.2273C19.5 9.54545 19.4545 8.86364 19.3182 8.22727H10V11.9545H15.3636C15.1364 13.0909 14.5 14.0909 13.5455 14.7273V17.0909H16.1818C18.2273 15.2273 19.5 12.9091 19.5 10.2273Z" fill="#4285F4"/>
                <path d="M10 20C12.7273 20 15.0455 19.0909 16.7273 17.6364L14.0909 15.2727C13.1818 15.8636 11.7273 16.3636 10 16.3636C7.36364 16.3636 5.18182 14.6818 4.36364 12.3636H1.63636V14.8182C3.22727 17.9545 6.36364 20 10 20Z" fill="#34A853"/>
                <path d="M4.36364 12.3636C4.18182 11.8182 4.09091 11.2273 4.09091 10.6364C4.09091 10.0455 4.18182 9.45455 4.36364 8.90909V6.45455H1.63636C0.818182 7.81818 0.363636 9.36364 0.363636 10.6364C0.363636 11.9091 0.818182 13.4545 1.63636 14.8182L4.36364 12.3636Z" fill="#FBBC05"/>
                <path d="M10 4.90909C11.5 4.90909 12.8182 5.45455 13.8182 6.36364L16.7727 3.40909C15.0455 1.77273 12.7273 0.909091 10 0.909091C6.36364 0.909091 3.22727 3.27273 1.63636 6.40909L4.36364 8.86364C5.18182 6.54545 7.36364 4.90909 10 4.90909Z" fill="#EA4335"/>
              </svg>
              구글로 시작하기
            </Button>

            {/* Naver Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white rounded-lg py-3 flex items-center justify-center gap-2 shadow-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12V4H12V12H10Z" fill="white"/>
                <path d="M6 4L6 12H4V4H6Z" fill="white"/>
                <path d="M6 4L10 12" stroke="white" strokeWidth="2"/>
              </svg>
              네이버로 시작하기
            </Button>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center space-x-4">
            <Link to="/signup" className="text-sm text-[#717182] hover:text-[#333333]">
              회원가입
            </Link>
            <span className="text-[#717182]">|</span>
            <a href="#" className="text-sm text-[#717182] hover:text-[#333333]">
              비밀번호 찾기
            </a>
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
