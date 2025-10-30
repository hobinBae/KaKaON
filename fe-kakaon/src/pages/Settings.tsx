import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#333333] mb-1">설정</h1>
        <p className="text-sm text-[#717182]">계정 및 알림 설정을 관리하세요</p>
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
                className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#333333] mb-2">전화번호</label>
              <Input
                defaultValue="010-1234-5678"
                className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#333333] mb-2">이메일 (카카오 계정)</label>
              <Input
                defaultValue="admin@example.com"
                className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                readOnly
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <h3 className="text-[#333333] mb-6">알림 설정</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg">
              <div>
                <Label htmlFor="all-notifications" className="text-sm text-[#333333]">전체 알림</Label>
                <p className="text-xs text-[#717182]">모든 종류의 알림을 받습니다.</p>
              </div>
              <Switch id="all-notifications" defaultChecked />
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
      <Card className="p-6" variant="default">
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
