import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export default function AdditionalInfo() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // TODO: 이름, 전화번호 정보 서버로 전송
    navigate("/"); // 정보 제출 후 대시보드로 이동
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FEE500] via-[#FFD700] to-[#FEE500] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <img src={logoImg} alt="KaKaON Logo" className="h-12 mx-auto mb-4" />
            <p className="text-sm text-[#717182]">추가 정보 입력</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-[#333333] mb-2">이름</label>
              <Input
                placeholder="이름을 입력하세요"
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
            <Button
              type="submit"
              className="w-full bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg py-3 flex items-center justify-center gap-2 shadow-none !mt-6"
            >
              가입 완료
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
