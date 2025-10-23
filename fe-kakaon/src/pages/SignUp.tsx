import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export default function SignUp() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FEE500] via-[#FFD700] to-[#FEE500] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <img src={logoImg} alt="KaKaON Logo" className="h-12 mx-auto mb-4" />
            <p className="text-sm text-[#717182]">가맹점 매출관리 플랫폼</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-[#333333] mb-2">이름</label>
              <Input
                placeholder="이름을 입력하세요"
                className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm text-[#333333] mb-2">이메일</label>
              <Input
                type="email"
                placeholder="이메일을 입력하세요"
                className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm text-[#333333] mb-2">전화번호</label>
              <Input
                placeholder="전화번호를 입력하세요"
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
            <div>
              <label className="block text-sm text-[#333333] mb-2">비밀번호 확인</label>
              <Input
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] px-4 py-3"
              />
            </div>
          </div>

          <Button className="w-full bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg py-3 flex items-center justify-center gap-2 shadow-none">
            회원가입
          </Button>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#717182] hover:text-[#333333]">
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
