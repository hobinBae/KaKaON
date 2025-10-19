import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const alerts = [
  {
    id: 'AL-20251015-001',
    type: '전주 대비 취소율 20% 이상 증가',
    time: '2025-10-15 12:30:00',
    store: '사장님 카페',
    status: 'unread',
    severity: 'urgent',
    description: '취소율이 전주 대비 60% 증가했습니다. 고객 불만이나 제품 문제를 확인해주세요.',
    details: {
      '현재 취소율': '3.2%',
      '이전 취소율': '2.0%',
      '증감': '+60%',
      '영향 받은 거래': 12,
    },
  },
  {
    id: 'AL-20251015-002',
    type: '10분 내 동일결제수단 다중결제 감지',
    time: '2025-10-15 10:45:00',
    store: '사장님 카페',
    status: 'unread',
    severity: 'urgent',
    details: {
      cardNumber: '**** **** **** 1234',
      transactionCount: 3,
      totalAmount: '145,000원',
      timeWindow: '8분',
    },
  },
  {
    id: 'AL-20251015-003',
    type: '정산 완료',
    time: '2025-10-15 06:00:00',
    store: '사장님 카페',
    status: 'read',
    severity: 'info',
    details: {
      settlementDate: '2025-10-14',
      amount: '2,900,000원',
      account: '카카오뱅크 **** 1234',
    },
  },
  {
    id: 'AL-20251014-001',
    type: '고액 거래 발생',
    time: '2025-10-14 15:22:00',
    store: '사장님 카페',
    status: 'read',
    severity: 'warning',
    details: {
      amount: '500,000원',
      method: '카드결제',
      unusual: '평균 거래액 대비 10배 이상',
    },
  },
];

export default function Alerts() {
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-[#FF4D4D] text-white';
      case 'warning':
        return 'bg-[#FFB800] text-[#3C1E1E]';
      case 'info':
        return 'bg-[#4CAF50] text-white';
      default:
        return 'bg-[#F5F5F5] text-[#333333]';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return '긴급';
      case 'warning':
        return '주의';
      case 'info':
        return '알림';
      default:
        return '일반';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#333333] mb-1">이상거래 알림</h1>
          <p className="text-sm text-[#717182]">이상거래 및 중요 알림을 확인하세요</p>
        </div>
        <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
          모두 읽음으로 표시
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="text-sm text-[#717182] mb-2">전체 알림</div>
          <div className="text-2xl text-[#333333]">4건</div>
        </Card>
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="text-sm text-[#717182] mb-2">미확인</div>
          <div className="text-2xl text-[#FF4D4D]">2건</div>
        </Card>
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="text-sm text-[#717182] mb-2">긴급</div>
          <div className="text-2xl text-[#FF4D4D]">2건</div>
        </Card>
        <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
          <div className="text-sm text-[#717182] mb-2">오늘 발생</div>
          <div className="text-2xl text-[#333333]">3건</div>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
              <TableHead className="text-[#333333]">알림ID</TableHead>
              <TableHead className="text-[#333333]">유형</TableHead>
              <TableHead className="text-[#333333]">발생시각</TableHead>
              <TableHead className="text-[#333333]">가맹점명</TableHead>
              <TableHead className="text-[#333333]">심각도</TableHead>
              <TableHead className="text-[#333333]">상태</TableHead>
              <TableHead className="text-[#333333]">확인</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow
                key={alert.id}
                className={`hover:bg-[#F5F5F5] cursor-pointer ${
                  alert.status === 'unread' ? 'bg-[#FEE500]/5' : ''
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <TableCell className="text-[#333333]">{alert.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        alert.severity === 'urgent'
                          ? 'text-[#FF4D4D]'
                          : alert.severity === 'warning'
                          ? 'text-[#FFB800]'
                          : 'text-[#4CAF50]'
                      }`}
                    />
                    <span className="text-[#333333]">{alert.type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#717182]">{alert.time}</TableCell>
                <TableCell className="text-[#717182]">{alert.store}</TableCell>
                <TableCell>
                  <Badge className={`rounded ${getSeverityColor(alert.severity)}`}>
                    {getSeverityLabel(alert.severity)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={alert.status === 'unread' ? 'default' : 'secondary'}
                    className="rounded"
                  >
                    {alert.status === 'unread' ? '미확인' : '확인됨'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlert(alert);
                    }}
                  >
                    상세보기
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Alert Detail Sheet */}
      <Sheet open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <SheetContent className="w-[500px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>알림 상세정보</SheetTitle>
          </SheetHeader>
          {selectedAlert && (
            <div className="mt-6 space-y-8 text-sm">
              <div className="space-y-4 border-b pb-6">
                <div className="flex">
                  <span className="w-24 font-medium text-gray-500">알림ID</span>
                  <span className="text-gray-800">{selectedAlert.id}</span>
                </div>
                <div className="flex">
                  <span className="w-24 font-medium text-gray-500">알림 유형</span>
                  <span className="text-gray-800">{selectedAlert.type}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b pb-6">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 mb-1">발생시각</span>
                  <span className="text-gray-800">{selectedAlert.time}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 mb-1">가맹점</span>
                  <span className="text-gray-800">{selectedAlert.store}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 mb-1">심각도</span>
                  <Badge className={`rounded w-fit ${getSeverityColor(selectedAlert.severity)}`}>
                    {getSeverityLabel(selectedAlert.severity)}
                  </Badge>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 mb-1">상태</span>
                  <Badge
                    variant={selectedAlert.status === 'unread' ? 'destructive' : 'secondary'}
                    className="rounded w-fit"
                  >
                    {selectedAlert.status === 'unread' ? '미확인' : '확인됨'}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-500 mb-2">상세 설명</h4>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-md">{selectedAlert.description}</p>
              </div>

              {/* Related Transactions */}
              {selectedAlert.severity === 'urgent' && (
                <div>
                  <h4 className="text-[#333333] mb-4">관련 거래 내역</h4>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[#F5F5F5] text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-[#717182]">TX-20251015-003</span>
                        <span className="text-[#FF4D4D]">취소</span>
                      </div>
                      <div className="text-[#333333]">15,000원 · 카드결제</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F5F5F5] text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-[#717182]">TX-20251015-008</span>
                        <span className="text-[#FF4D4D]">취소</span>
                      </div>
                      <div className="text-[#333333]">48,000원 · 카드결제</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Notification */}
              <div className="p-4 rounded-lg bg-[#4CAF50]/5 border border-[#4CAF50]/20">
                <div className="text-sm text-[#4CAF50]">
                  ✓ 이메일 발송 완료 (admin@example.com)
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button className="w-full bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
                  확인 완료
                </Button>
                <Button asChild variant="outline" className="w-full rounded-lg">
                  <Link to="/transactions">관련 거래 상세보기</Link>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
