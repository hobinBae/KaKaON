import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

const transactionDetails = {
  'TX-20251015-003': { id: 'TX-20251015-003', time: '2025-10-15 14:10:05', amount: 15000, method: '카드결제', status: '취소' },
  'TX-20251015-008': { id: 'TX-20251015-008', time: '2025-10-15 12:58:14', amount: 48000, method: '카드결제', status: '취소' },
};

const alerts = [
  {
    id: 'AL-20251015-001',
    type: '전주 대비 취소율 20% 이상 증가',
    time: '2025-10-15 12:30:00',
    status: 'unread',
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
    status: 'unread',
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
    status: 'read',
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
    status: 'read',
    details: {
      amount: '500,000원',
      method: '카드결제',
      unusual: '평균 거래액 대비 10배 이상',
    },
  },
];

export default function Alerts() {
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactionDetails[keyof typeof transactionDetails] | null>(null);
  const [date, setDate] = useState<DateRange | undefined>();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const alertDate = new Date(alert.time);
      const fromDate = date?.from;
      const toDate = date?.to;

      if (fromDate && alertDate < fromDate) return false;
      if (toDate && alertDate > toDate) return false;
      if (typeFilter !== 'all' && !alert.type.includes(typeFilter)) return false;
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;

      return true;
    });
  }, [date, typeFilter, statusFilter]);

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

      {/* Filters */}
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-[#333333] mb-2">기간 선택</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal rounded-lg"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "yyyy-MM-dd")} ~ {format(date.to, "yyyy-MM-dd")}
                      </>
                    ) : (
                      format(date.from, "yyyy-MM-dd")
                    )
                  ) : (
                    <span>기간을 선택하세요</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm text-[#333333] mb-2">유형</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="rounded-lg bg-[#F5F5F5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="취소율">취소율</SelectItem>
                <SelectItem value="다중결제">다중결제</SelectItem>
                <SelectItem value="정산">정산</SelectItem>
                <SelectItem value="고액">고액</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-[#333333] mb-2">상태</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-lg bg-[#F5F5F5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="unread">미확인</SelectItem>
                <SelectItem value="read">확인됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Alerts Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
              <TableHead className="text-[#333333]">알림ID</TableHead>
              <TableHead className="text-[#333333]">발생시각</TableHead>
              <TableHead className="text-[#333333]">유형</TableHead>
              <TableHead className="text-[#333333]">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow
                key={alert.id}
                className={`hover:bg-[#F5F5F5] cursor-pointer ${
                  alert.status === 'unread' ? 'bg-[#FEE500]/5' : ''
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <TableCell className="text-[#333333]">{alert.id}</TableCell>
                <TableCell className="text-[#717182]">{alert.time}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF4D4D]" />
                    <span className="text-[#333333]">{alert.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={alert.status === 'unread' ? 'default' : 'secondary'}
                    className="rounded"
                  >
                    {alert.status === 'unread' ? '미확인' : '확인됨'}
                  </Badge>
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
              {selectedAlert.type !== '정산 완료' && (
                <div>
                  <h4 className="text-[#333333] mb-4">관련 거래 내역</h4>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[#F5F5F5] text-sm cursor-pointer hover:bg-gray-200" onClick={() => setSelectedTransaction(transactionDetails['TX-20251015-003'])}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#717182]">TX-20251015-003</span>
                        <span className="text-[#FF4D4D]">취소</span>
                      </div>
                      <div className="text-[#333333]">15,000원 · 카드결제</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F5F5F5] text-sm cursor-pointer hover:bg-gray-200" onClick={() => setSelectedTransaction(transactionDetails['TX-20251015-008'])}>
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
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle>결제 상세정보</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제ID</div>
                  <div className="text-[#333333]">{selectedTransaction.id}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제시간</div>
                  <div className="text-[#333333]">{selectedTransaction.time}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제금액</div>
                  <div className="text-[#333333]">{selectedTransaction.amount.toLocaleString()}원</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제수단</div>
                  <div className="text-[#333333]">{selectedTransaction.method}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제상태</div>
                  <Badge
                    variant={selectedTransaction.status === '취소' ? 'destructive' : 'secondary'}
                    className="rounded"
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-lg" onClick={() => setSelectedTransaction(null)}>
                닫기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
