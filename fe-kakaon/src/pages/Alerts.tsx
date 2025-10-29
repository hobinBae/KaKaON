import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar as CalendarIcon, RotateCw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInCalendarDays, parse, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { ko } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 9, 1),
    to: new Date(2025, 9, 15),
  });
  const [startInput, setStartInput] = useState<string>("");
  const [endInput, setEndInput] = useState<string>("");
  const [activePeriod, setActivePeriod] = useState<string>("today");
  const [showCalendar, setShowCalendar] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    handlePeriodChange(activePeriod);
  }, []);

  useEffect(() => {
    if (dateRange?.from) {
      setStartInput(format(dateRange.from, 'yyyy.MM.dd'));
    } else {
      setStartInput("");
    }
    if (dateRange?.to) {
      setEndInput(format(dateRange.to, 'yyyy.MM.dd'));
    } else {
      setEndInput("");
    }
  }, [dateRange]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const alertDate = new Date(alert.time);
      const fromDate = dateRange?.from;
      const toDate = dateRange?.to;

      if (fromDate && alertDate < fromDate) return false;
      if (toDate && alertDate > toDate) return false;
      if (typeFilter !== 'all' && !alert.type.includes(typeFilter)) return false;
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;

      return true;
    });
  }, [dateRange, typeFilter, statusFilter]);

  const handlePeriodChange = (value: string) => {
    if (!value) return;
    setActivePeriod(value);
    const today = new Date();
    let from: Date, to: Date = today;

    switch (value) {
      case 'today':
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      case 'this-week':
        from = startOfWeek(today, { weekStartsOn: 1 }); // Monday as the first day of the week
        to = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'this-month':
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case 'this-year':
        from = startOfYear(today);
        to = endOfYear(today);
        break;
      default:
        from = startOfDay(today);
        to = endOfDay(today);
        break;
    }
    setDateRange({ from, to });
  };

  // 스샷 톤의 세그먼트 공통 클래스
  const segmentWrap = "inline-flex items-center gap-1 rounded-lg bg-[#F5F5F7] px-1 py-1";
  const segmentItem =
    "rounded-lg px-4 h-8 text-sm data-[state=on]:bg-white data-[state=on]:shadow-sm " +
    "data-[state=on]:text-[#111] data-[state=off]:text-[#50505f] hover:bg-white transition";

  return (
    <div className="space-y-6">
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
      <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
        {/* ====== 조회기간 : 한 줄 전체 폭 사용 ====== */}
        <div className="grid grid-cols-[72px_1fr] items-center gap-3">
          <div className="text-sm font-semibold text-[#333]">조회기간</div>

          <div className="flex items-center gap-2 flex-wrap">
            <ToggleGroup type="single" value={activePeriod} onValueChange={handlePeriodChange} className={`${segmentWrap} flex-1`}>
              <ToggleGroupItem value="today" className={segmentItem}>오늘</ToggleGroupItem>
              <ToggleGroupItem value="this-week" className={segmentItem}>이번주</ToggleGroupItem>
              <ToggleGroupItem value="this-month" className={segmentItem}>이번달</ToggleGroupItem>
              <ToggleGroupItem value="this-year" className={segmentItem}>올해</ToggleGroupItem>
            </ToggleGroup>


            <div className="relative">
              <Button
                variant={"outline"}
                className="h-8 text-sm rounded-lg border border-gray-300 bg-white px-4 flex items-center gap-2"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className="w-4 h-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "yyyy.MM.dd")} ~{" "}
                      {format(dateRange.to, "yyyy.MM.dd")}
                    </>
                  ) : (
                    format(dateRange.from, "yyyy.MM.dd")
                  )
                ) : (
                  <span>날짜를 선택하세요</span>
                )}
              </Button>
              {showCalendar && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-white border rounded-md shadow-lg p-3">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setActivePeriod("");
                      if (range?.from && range?.to) {
                        setShowCalendar(false);
                      }
                    }}
                    numberOfMonths={1}
                    components={{}}
                    locale={ko}
                    formatters={{
                      formatCaption: (date) =>
                        `${format(date, "yyyy년 M월", { locale: ko })}`,
                      formatWeekdayName: (day) =>
                        format(day, "eee", { locale: ko }),
                    }}
                    classNames={{
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "day-outside text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====== 유형 + 상태 : 같은 줄 ====== */}
        <div className="grid grid-cols-[72px_1fr] items-center gap-3 mt-4">
          <div className="text-sm font-semibold text-[#333]">필터</div>
          <div className="flex items-center gap-10 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-[#333] shrink-0">유형</div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="rounded-lg bg-[#F5F5F5] w-[180px]">
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
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-[#333] shrink-0">상태</div>
              <ToggleGroup type="single" value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)} className={segmentWrap}>
                <ToggleGroupItem value="all" className={segmentItem}>전체</ToggleGroupItem>
                <ToggleGroupItem value="unread" className={segmentItem}>미확인</ToggleGroupItem>
                <ToggleGroupItem value="read" className={segmentItem}>확인됨</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>

        {/* 하단 요약/버튼 */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4 flex-wrap gap-3">
          <div className="text-sm text-[#333]">
            {dateRange?.from && dateRange?.to && (
              <>
                {format(dateRange.from, "yyyy.MM.dd")} ~ {format(dateRange.to, "yyyy.MM.dd")}{" "}
                <span className="text-[#007AFF] ml-1">
                  ({differenceInCalendarDays(addDays(dateRange.to, 1), dateRange.from)}일간)
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-gray-500 hover:bg-gray-100 rounded-lg text-sm">
              <RotateCw className="w-4 h-4 mr-1" />
              초기화
            </Button>
            <Button className="bg-[#333] text-white hover:bg-[#444] rounded-lg px-6 text-sm">
              조회하기
            </Button>
          </div>
        </div>
      </Card>

      {/* Alerts Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
              <TableHead className="text-[#333333] pl-6">알림ID</TableHead>
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
                <TableCell className="text-[#333333] pl-6">{alert.id}</TableCell>
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
        <SheetContent className="w-[500px] sm:w-[540px] p-0">
          <SheetHeader>
            <SheetTitle>알림 상세정보</SheetTitle>
          </SheetHeader>
          {selectedAlert && (
            <div className="p-4 space-y-8 text-sm overflow-y-auto">
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
