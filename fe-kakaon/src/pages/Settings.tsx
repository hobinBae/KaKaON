import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#333333] mb-1">설정</h1>
        <p className="text-sm text-[#717182]">계정 정보를 관리하세요</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <h3 className="text-[#333333] mb-6">프로필 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#333333] mb-2">이름</label>
              <Input
                defaultValue="김사장"
                className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#333333] mb-2">전화번호</label>
              <Input
                defaultValue="010-1234-5678"
                className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#333333] mb-2">이메일</label>
              <Input
                defaultValue="admin@example.com"
                className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
              />
            </div>
          </div>

        </Card>

        {/* Password Change */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <h3 className="text-[#333333] mb-6">비밀번호 변경</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#333333] mb-2">현재 비밀번호</label>
              <Input
                type="password"
                placeholder="현재 비밀번호를 입력하세요"
                className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#333333] mb-2">새 비밀번호</label>
              <Input
                type="password"
                placeholder="새 비밀번호를 입력하세요"
                className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#333333] mb-2">새 비밀번호 확인</label>
              <Input
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요"
                className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
              />
            </div>
          </div>

        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none w-full max-w-xs">
          정보 수정
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="p-6 rounded-xl border border-[#FF4D4D]/20 shadow-none bg-[#FF4D4D]/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#FF4D4D] mb-1">계정 삭제</h3>
            <p className="text-sm text-[#717182]">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
          </div>
          <Button variant="destructive" className="rounded-lg">
            계정 삭제
          </Button>
        </div>
      </Card>
    </div>
  );
}
