import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { useBoundStore } from "@/stores/storeStore";

export default function Settings() {
  const logout = useBoundStore((state) => state.logout);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#333333] mb-1">설정</h1>
        <p className="text-sm text-[#717182]">계정 정보를 관리하세요</p>
      </div>

      {/* Profile */}
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <h3 className="text-[#333333] mb-6">프로필 정보</h3>
        <div className="flex items-start gap-6 mb-6">
          <Avatar className="w-20 h-20 bg-[#FEE500]">
            <AvatarFallback className="text-2xl text-[#3C1E1E]">김</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-[#333333] mb-1">김사장님</div>
            <div className="text-sm text-[#717182] mb-3">admin@example.com</div>
            <Button variant="outline" className="rounded-lg">
              프로필 사진 변경
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm text-[#333333] mb-2">이메일</label>
            <Input
              defaultValue="admin@example.com"
              className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
            저장
          </Button>
          <Button variant="outline" className="rounded-lg">
            취소
          </Button>
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

        <Button className="mt-6 bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
          비밀번호 변경
        </Button>
      </Card>

      {/* OAuth Connections */}
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <h3 className="text-[#333333] mb-6">계정 연결</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#F5F5F5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FEE500] flex items-center justify-center">
                <span className="text-[#3C1E1E]">K</span>
              </div>
              <div>
                <div className="text-[#333333]">카카오 계정</div>
                <div className="text-sm text-[#717182]">연결됨</div>
              </div>
            </div>
            <Badge className="rounded bg-[#4CAF50] text-white">연결됨</Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[#F5F5F5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#333333] flex items-center justify-center">
                <span className="text-white">N</span>
              </div>
              <div>
                <div className="text-[#333333]">네이버 계정</div>
                <div className="text-sm text-[#717182]">연결되지 않음</div>
              </div>
            </div>
            <Button variant="outline" className="rounded-lg">
              연결하기
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[#F5F5F5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4285F4] flex items-center justify-center">
                <span className="text-white">G</span>
              </div>
              <div>
                <div className="text-[#333333]">구글 계정</div>
                <div className="text-sm text-[#717182]">연결되지 않음</div>
              </div>
            </div>
            <Button variant="outline" className="rounded-lg">
              연결하기
            </Button>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#333333] mb-1">로그아웃</h3>
            <p className="text-sm text-[#717182]">계정에서 로그아웃합니다</p>
          </div>
          <Button
            variant="outline"
            className="rounded-lg border-[#FF4D4D] text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-white"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </Card>

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
