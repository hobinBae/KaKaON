import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RotateCw, Calendar as CalendarIcon, Upload, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { addDays, format, differenceInCalendarDays, parse, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";
import { ko } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const transactions = [
  { id: 'TX-20251015-001', time: '2025-10-15 14:35:22', amount: 45000, method: '카드결제', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-002', time: '2025-10-15 14:22:11', amount: 28000, method: '간편결제', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-003', time: '2025-10-15 14:10:05', amount: 15000, method: '카드결제', status: '취소', store: '사장님 카페' },
  { id: 'TX-20251015-004', time: '2025-10-15 13:55:33', amount: 52000, method: '계좌이체', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-005', time: '2025-10-15 13:42:18', amount: 33000, method: '카드결제', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-006', time: '2025-10-15 13:28:47', amount: 67000, method: '카드결제', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-007', time: '2025-10-15 13:15:29', amount: 22000, method: '현금', status: '완료', store: '사장님 카페' },
  { id: 'TX-20251015-008', time: '2025-10-15 12:58:14', amount: 48000, method: '카드결제', status: '취소', store: '사장님 카페' },
];

export default function Transactions() {
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [activePeriod, setActivePeriod] = useState<string>("this-month");
  const [startInput, setStartInput] = useState<string>("");
  const [endInput, setEndInput] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState(false);

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
      case 'yesterday':
        from = startOfDay(addDays(today, -1));
        to = endOfDay(addDays(today, -1));
        break;
      case 'last-month':
        const prevMonth = subMonths(today, 1);
        from = startOfMonth(prevMonth);
        to = endOfMonth(prevMonth);
        break;
      case 'this-month':
      default:
        from = startOfMonth(today);
        to = endOfMonth(today);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[#333333] mb-1">거래내역</h1>
          <p className="text-sm text-[#717182]">결제내역을 조회하고 관리하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 rounded-lg flex items-center gap-2 text-sm px-4">
            <Upload className="w-4 h-4" />
            CSV 업로드
          </Button>
          <Button variant="outline" className="h-9 rounded-lg flex items-center gap-2 text-sm px-4">
            <Download className="w-4 h-4" />
            CSV 다운로드
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
        {/* ====== 조회기간 : 한 줄 전체 폭 사용 ====== */}
        <div className="grid grid-cols-[72px_1fr] items-center gap-3">
          <div className="text-sm font-semibold text-[#333]">조회기간</div>

          <div className="flex items-center gap-2 flex-wrap">
            <ToggleGroup type="single" value={activePeriod} onValueChange={handlePeriodChange} className={`${segmentWrap} flex-1`}>
              <ToggleGroupItem value="yesterday" className={segmentItem}>어제</ToggleGroupItem>
              <ToggleGroupItem value="today" className={segmentItem}>오늘</ToggleGroupItem>
              <ToggleGroupItem value="last-month" className={segmentItem}>지난달</ToggleGroupItem>
              <ToggleGroupItem value="this-month" className={segmentItem}>이번달</ToggleGroupItem>
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

        {/* ====== 결제수단 + 상태 : 같은 줄 ====== */}
        <div className="grid grid-cols-[72px_1fr] items-center gap-3">
          <div className="text-sm font-semibold text-[#333]">결제수단</div>

          <div className="flex items-center gap-10 flex-wrap">
            {/* 결제수단 칩 */}
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#F5F5F7] px-2 py-1">
              {[
                { id: "all-methods", label: "전체", defaultChecked: true },
                { id: "card", label: "카드" },
                { id: "account", label: "계좌" },
                { id: "kakaopay", label: "카카오페이" },
                { id: "cash", label: "현금" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  htmlFor={opt.id}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 h-8 text-sm text-[#50505f] hover:shadow-sm cursor-pointer"
                >
                  <Checkbox id={opt.id} defaultChecked={opt.defaultChecked} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {/* 상태 세그먼트 */}
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-[#333] shrink-0">상태</div>
              <ToggleGroup type="single" defaultValue="all" className={segmentWrap}>
                <ToggleGroupItem value="all" className={segmentItem}>전체</ToggleGroupItem>
                <ToggleGroupItem value="completed" className={segmentItem}>완료</ToggleGroupItem>
                <ToggleGroupItem value="cancelled" className={segmentItem}>취소</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>

        {/* 하단 요약/버튼 */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2 flex-wrap gap-3">
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

      {/* 아래 표/모달은 기존과 동일 */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
                <TableHead className="text-[#333333]">승인번호</TableHead>
                <TableHead className="text-[#333333]">결제시간</TableHead>
                <TableHead className="text-[#333333]">금액</TableHead>
                <TableHead className="text-[#333333]">결제수단</TableHead>
                <TableHead className="text-[#333333]">상태</TableHead>
                <TableHead className="text-[#333333]">상세내역</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className={`hover:bg-[#F5F5F5] cursor-pointer ${tx.status === '취소' ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <TableCell className="text-[#333333]">{tx.id}</TableCell>
                  <TableCell className="text-[#717182]">{tx.time}</TableCell>
                  <TableCell className="text-[#333333]">{tx.amount.toLocaleString()}원</TableCell>
                  <TableCell className="text-[#717182]">{tx.method}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.status === '취소' ? 'destructive' : 'secondary'}
                      className="rounded bg-[#F5F5F5] text-[#333333]"
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="text-[#717182]">
                      보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[rgba(0,0,0,0.08)]">
          <div className="text-sm text-[#717182]">총 8건</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded">이전</Button>
            <Button size="sm" className="bg-[#FEE500] text-[#3C1E1E] rounded shadow-none">1</Button>
            <Button size="sm" variant="outline" className="rounded">다음</Button>
          </div>
        </div>
      </Card>

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
                  <Badge variant={selectedTransaction.status === '취소' ? 'destructive' : 'secondary'} className="rounded">
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              {selectedTransaction.status === '취소' && (
                <Card className="p-4 bg-[#FF4D4D]/5 border-[#FF4D4D]/20 rounded-lg">
                  <div className="text-sm text-[#FF4D4D]">⚠️ 이 거래는 취소되었습니다. 관련 이상거래 알림을 확인하세요.</div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">영수증 출력</Button>
                <Button variant="outline" className="flex-1 rounded-lg">닫기</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
