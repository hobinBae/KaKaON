import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar as CalendarIcon, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInCalendarDays, parse, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear, isValid, addMonths, setYear, setMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { useBoundStore } from "@/stores/storeStore";
import { useAlerts, useReadAlert, useReadAllAlerts, useAlertDetail } from "@/lib/hooks/useAlerts";
import { Alert, AlertSearchRequest, AlertType as ApiAlertType } from "@/types/api";
import { getAlertTypeKorean } from "@/lib/utils";

const transactionDetails = {
  'TX-20251015-003': { id: 'TX-20251015-003', time: '2025-10-15 14:10:05', amount: 15000, method: '카드결제', status: '취소' },
  'TX-20251015-008': { id: 'TX-20251015-008', time: '2025-10-15 12:58:14', amount: 48000, method: '카드결제', status: '취소' },
};

export default function Alerts() {
  const { selectedStoreId } = useBoundStore();
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactionDetails[keyof typeof transactionDetails] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [startInput, setStartInput] = useState<string>("");
  const [endInput, setEndInput] = useState<string>("");
  const [activePeriod, setActivePeriod] = useState<string>("this-month");
  const [showCalendar, setShowCalendar] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ApiAlertType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<boolean | 'all'>('all');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<React.ReactNode>("");
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const searchFilters: AlertSearchRequest = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    alertType: typeFilter === 'all' ? undefined : typeFilter,
    checked: statusFilter === 'all' ? undefined : statusFilter,
  };

  const { data: alertsData, isLoading, isError } = useAlerts(selectedStoreId!, searchFilters, page, pageSize);
  const { data: selectedAlertDetail } = useAlertDetail(selectedStoreId!, selectedAlertId);
  const { mutate: readAlert } = useReadAlert();
  const { mutate: readAllAlerts } = useReadAllAlerts();

  const handleReadAll = () => {
    if (selectedStoreId) {
      readAllAlerts(selectedStoreId);
    }
  };

  const handleRowClick = (alert: Alert) => {
    setSelectedAlertId(alert.id);
    if (!alert.checked) {
      readAlert({ storeId: selectedStoreId!, alertId: alert.id });
    }
  };

  const handleResetFilters = () => {
    setActivePeriod("this-month");
    setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    setTypeFilter('all');
    setStatusFilter('all');
    setPage(0);
  };

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
        from = startOfWeek(today, { weekStartsOn: 1 });
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

  function CustomCaption({ displayMonth, onMonthChange }: { displayMonth: Date; onMonthChange: (date: Date) => void }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    const isCurrentOrFutureMonth = displayMonth.getFullYear() > currentYear ||
      (displayMonth.getFullYear() === currentYear && displayMonth.getMonth() >= currentMonth);

    const isCurrentYear = displayMonth.getFullYear() === currentYear;

    return (
      <div className="flex justify-center items-center gap-2 py-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMonthChange(subMonths(displayMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-1">
          <Select
            value={displayMonth.getFullYear().toString()}
            onValueChange={(value) => {
              onMonthChange(setYear(displayMonth, parseInt(value)));
            }}
          >
            <SelectTrigger className="h-7 w-20 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={displayMonth.getMonth().toString()}
            onValueChange={(value) => {
              onMonthChange(setMonth(displayMonth, parseInt(value)));
            }}
          >
            <SelectTrigger className="h-7 w-16 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem
                  key={month}
                  value={month.toString()}
                  disabled={isCurrentYear && month > currentMonth}
                >
                  {month + 1}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMonthChange(addMonths(displayMonth, 1))}
          disabled={isCurrentOrFutureMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const showAlert = (message: React.ReactNode) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleDateInputChange = (type: 'start' | 'end', value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    const truncated = digitsOnly.slice(0, 8);
    let formatted = truncated;
    if (truncated.length > 4) {
      formatted = truncated.slice(0, 4) + '.' + truncated.slice(4);
    }
    if (truncated.length > 6) {
      formatted = truncated.slice(0, 4) + '.' + truncated.slice(4, 6) + '.' + truncated.slice(6);
    }
    if (type === 'start') {
      setStartInput(formatted);
    } else {
      setEndInput(formatted);
    }
  };

  const handleDateInputBlur = (type: 'start' | 'end') => {
    const value = type === 'start' ? startInput : endInput;
    if (!value) {
      if (type === 'start') setDateRange({ from: undefined, to: dateRange?.to });
      else setDateRange({ from: dateRange?.from, to: undefined });
      return;
    }
    const parsedDate = parse(value, 'yyyy.MM.dd', new Date());
    if (!isValid(parsedDate)) {
      if (type === 'start' && dateRange?.from) setStartInput(format(dateRange.from, "yyyy.MM.dd"));
      else if (type === 'end' && dateRange?.to) setEndInput(format(dateRange.to, "yyyy.MM.dd"));
      else { if (type === 'start') setStartInput(""); else setEndInput(""); }
      return;
    }
    if (parsedDate > new Date()) {
      showAlert('오늘 이후의 날짜는 선택할 수 없습니다.');
      if (type === 'start' && dateRange?.from) setStartInput(format(dateRange.from, "yyyy.MM.dd"));
      else if (type === 'end' && dateRange?.to) setEndInput(format(dateRange.to, "yyyy.MM.dd"));
      else { if (type === 'start') setStartInput(""); else setEndInput(""); }
      return;
    }
    if (type === 'start') {
      if (dateRange?.to && parsedDate > dateRange.to) {
        showAlert('시작일은 종료일보다 이전이어야 합니다.');
        if (dateRange?.from) setStartInput(format(dateRange.from, "yyyy.MM.dd"));
        else setStartInput("");
        return;
      }
      if (dateRange?.to) {
        const maxDate = addDays(parsedDate, 365);
        if (dateRange.to > maxDate) {
          showAlert(<><span className="font-bold">최대 1년</span>까지만 조회 가능합니다.</>);
          if (dateRange?.from) setStartInput(format(dateRange.from, "yyyy.MM.dd"));
          else setStartInput("");
          return;
        }
      }
      setDateRange({ from: parsedDate, to: dateRange?.to });
      setActivePeriod("");
    } else {
      if (dateRange?.from && parsedDate < dateRange.from) {
        showAlert('종료일은 시작일보다 이후여야 합니다.');
        if (dateRange?.to) setEndInput(format(dateRange.to, "yyyy.MM.dd"));
        else setEndInput("");
        return;
      }
      if (dateRange?.from) {
        const maxDate = addDays(dateRange.from, 365);
        if (parsedDate > maxDate) {
          showAlert(<><span className="font-bold">최대 1년</span>까지만 조회 가능합니다.</>);
          if (dateRange?.to) setEndInput(format(dateRange.to, "yyyy.MM.dd"));
          else setEndInput("");
          return;
        }
      }
      setDateRange({ from: dateRange?.from, to: parsedDate });
      setActivePeriod("");
    }
  };

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    if (!dateRange?.from || dateRange.to) {
      setDateRange({ from: day, to: undefined });
      setActivePeriod("");
    } else {
      if (format(day, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd')) {
        setDateRange({ from: day, to: day });
        setShowCalendar(false);
        setActivePeriod("");
      } else if (day > dateRange.from) {
        setDateRange({ from: dateRange.from, to: day });
        setShowCalendar(false);
        setActivePeriod("");
      } else {
        setDateRange({ from: day, to: undefined });
        setActivePeriod("");
      }
    }
  };

  const segmentWrap = "inline-flex items-center gap-1 rounded-lg bg-[#F5F5F7] px-1 py-1";
  const segmentItem =
    "rounded-lg px-4 h-8 text-sm data-[state=on]:bg-white data-[state=on]:shadow-sm " +
    "data-[state=on]:text-[#111] data-[state=off]:text-[#50505f] hover:bg-white transition";

  return (
    <div className="space-y-6">
      <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between">
        <div>
          <h1 className="text-[#333333] mb-1">이상거래 알림</h1>
          <p className="text-sm text-[#717182]">이상거래 및 중요 알림을 확인하세요</p>
        </div>
        <Button onClick={handleReadAll} className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none mt-4 tablet:mt-0">
          모두 읽음으로 표시
        </Button>
      </div>

      <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
        <div className="space-y-4">
        <div className="grid grid-cols-1 tablet:grid-cols-[72px_1fr] items-center gap-3">
          <div className="text-sm font-semibold text-[#333]">조회기간</div>

          <div className="flex items-center gap-2 flex-wrap">
            <ToggleGroup type="single" value={activePeriod} onValueChange={handlePeriodChange} className={`${segmentWrap} flex-1`}>
              <ToggleGroupItem value="today" className={segmentItem}>오늘</ToggleGroupItem>
              <ToggleGroupItem value="this-week" className={segmentItem}>이번주</ToggleGroupItem>
              <ToggleGroupItem value="this-month" className={segmentItem}>이번달</ToggleGroupItem>
              <ToggleGroupItem value="this-year" className={segmentItem}>올해</ToggleGroupItem>
            </ToggleGroup>


            <div className="relative flex items-center gap-2 w-full tablet:w-auto">
              <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1 tablet:flex tablet:gap-1">
                <Input
                  type="text"
                  placeholder="YYYY.MM.DD"
                  value={startInput}
                  onChange={(e) => handleDateInputChange('start', e.target.value)}
                  onBlur={() => handleDateInputBlur('start')}
                  className="h-8 w-full tablet:w-32 text-sm rounded-lg border border-gray-300 bg-white px-3"
                />
                <span className="text-sm text-gray-500 text-center">~</span>
                <Input
                  type="text"
                  placeholder="YYYY.MM.DD"
                  value={endInput}
                  onChange={(e) => handleDateInputChange('end', e.target.value)}
                  onBlur={() => handleDateInputBlur('end')}
                  className="h-8 w-full tablet:w-32 text-sm rounded-lg border border-gray-300 bg-white px-3"
                />
              </div>
              <Button
                variant={"outline"}
                size={"icon"}
                className="h-8 w-8 rounded-lg border border-gray-300 bg-white"
                onClick={() => {
                  if (!showCalendar && dateRange?.from) {
                    setCalendarMonth(dateRange.from);
                  }
                  setShowCalendar(!showCalendar);
                }}
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
              {showCalendar && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-white border rounded-md shadow-lg p-3">
                  <Calendar
                    initialFocus
                    mode="range"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    selected={dateRange}
                    onDayClick={handleDateSelect}
                    numberOfMonths={1}
                    fixedWeeks={false}
                    components={{
                      Caption: ({ displayMonth }) => (
                        <CustomCaption displayMonth={displayMonth} onMonthChange={setCalendarMonth} />
                      ),
                    }}
                    locale={ko}
                    disabled={(date) => {
                      if (date > new Date()) return true;
                      if (dateRange?.from && !dateRange?.to) {
                        const maxDate = addDays(dateRange.from, 365);
                        if (date > maxDate) return true;
                      }
                      return false;
                    }}
                    formatters={{
                      formatWeekdayName: (day) =>
                        format(day, "eee", { locale: ko }),
                    }}
                    classNames={{
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_range_start: "rounded-l-full",
                      day_range_end: "rounded-r-full",
                      day_today: "bg-accent/50 text-accent-foreground ring-2 ring-primary ring-inset",
                      day_outside: "day-outside text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:bg-accent/30 aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-[72px_1fr] items-center gap-3 mt-1">
          <div className="text-sm font-semibold text-[#333]">이상거래</div>
          <div className="flex flex-col tablet:flex-row items-start tablet:items-center justify-between flex-wrap gap-4">
            <div className="w-full tablet:hidden">
              <Select value={typeFilter} onValueChange={(value: ApiAlertType | 'all') => setTypeFilter(value)}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="이상거래 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 유형</SelectItem>
                  <SelectItem value="SAME_PAYMENT_METHOD">동일 결제수단</SelectItem>
                  <SelectItem value="OUT_OF_BUSINESS_HOUR">영업시간 외 거래</SelectItem>
                  <SelectItem value="REPEATED_PAYMENT">반복결제</SelectItem>
                  <SelectItem value="HIGH_AMOUNT_SPIKE">고액결제 급증</SelectItem>
                  <SelectItem value="TRANSACTION_FREQUENCY_SPIKE">거래빈도 급증</SelectItem>
                  <SelectItem value="CANCEL_RATE_SPIKE">취소율 급증</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ToggleGroup type="single" value={typeFilter} onValueChange={(value: ApiAlertType | 'all') => value && setTypeFilter(value)} className={`${segmentWrap} hidden tablet:flex flex-1`}>
              <ToggleGroupItem value="all" className={segmentItem}>전체 유형</ToggleGroupItem>
              <ToggleGroupItem value="SAME_PAYMENT_METHOD" className={segmentItem}>동일 결제수단</ToggleGroupItem>
              <ToggleGroupItem value="OUT_OF_BUSINESS_HOUR" className={segmentItem}>영업시간 외 거래</ToggleGroupItem>
              <ToggleGroupItem value="REPEATED_PAYMENT" className={segmentItem}>반복결제</ToggleGroupItem>
              <ToggleGroupItem value="HIGH_AMOUNT_SPIKE" className={segmentItem}>고액결제 급증</ToggleGroupItem>
              <ToggleGroupItem value="TRANSACTION_FREQUENCY_SPIKE" className={segmentItem}>거래빈도 급증</ToggleGroupItem>
              <ToggleGroupItem value="CANCEL_RATE_SPIKE" className={segmentItem}>취소율 급증</ToggleGroupItem>
            </ToggleGroup>

            <div className="flex items-center gap-4 w-full tablet:w-auto">
              <div className="text-sm font-semibold text-[#333] shrink-0 tablet:ml-4">상태</div>
              <ToggleGroup type="single" value={String(statusFilter)} onValueChange={(value) => value && setStatusFilter(value === 'all' ? 'all' : value === 'true')} className={`${segmentWrap} flex-1 tablet:flex-initial`}>
                <ToggleGroupItem value="all" className={`${segmentItem} flex-1`}>전체</ToggleGroupItem>
                <ToggleGroupItem value="false" className={`${segmentItem} flex-1`}>미확인</ToggleGroupItem>
                <ToggleGroupItem value="true" className={`${segmentItem} flex-1`}>확인됨</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4 flex-wrap gap-3">
          <div className="text-sm text-[#333] flex-1">
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
            <Button onClick={handleResetFilters} variant="ghost" className="text-gray-500 hover:bg-gray-100 rounded-lg text-sm tablet:inline-flex hidden">
              <RotateCw className="w-4 h-4 mr-1" />
              초기화
            </Button>
            <Button onClick={handleResetFilters} variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-lg tablet:hidden">
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        </div>
      </Card>

      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
              <TableHead className="text-[#333333] pl-6 hidden tablet:table-cell">알림ID</TableHead>
              <TableHead className="text-[#333333] pl-6 tablet:pl-3">
                <span className="hidden tablet:inline">발생시간</span>
                <span className="tablet:hidden">시간</span>
              </TableHead>
              <TableHead className="text-[#333333]">유형</TableHead>
              <TableHead className="text-[#333333] pr-6">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4} className="text-center">로딩 중...</TableCell></TableRow>}
            {isError && <TableRow><TableCell colSpan={4} className="text-center">데이터를 불러오는 데 실패했습니다.</TableCell></TableRow>}
            {!isLoading && !isError && alertsData?.content.map((alert) => (
              <TableRow
                key={alert.id}
                className={`hover:bg-[#F5F5F5] cursor-pointer ${
                  !alert.checked ? 'bg-[#FEE500]/5' : ''
                }`}
                onClick={() => handleRowClick(alert)}
              >
                <TableCell className="text-[#333333] pl-6 hidden tablet:table-cell">{alert.alertUuid}</TableCell>
                <TableCell className="text-[#717182] text-xs tablet:text-sm pl-6 tablet:pl-3">
                  <span className="hidden tablet:inline">{format(new Date(alert.detectedAt), 'yyyy.MM.dd (eee) HH:mm', { locale: ko })}</span>
                  <span className="tablet:hidden">{format(new Date(alert.detectedAt), 'MM.dd HH:mm')}</span>
                </TableCell>
                <TableCell className="pr-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                    <span className="text-[#333333] text-xs tablet:text-sm truncate">{getAlertTypeKorean(alert.alertType)}</span>
                  </div>
                </TableCell>
                <TableCell className="pr-6">
                  <Badge
                    variant={!alert.checked ? 'default' : 'secondary'}
                    className="rounded"
                  >
                    {!alert.checked ? '미확인' : '확인됨'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between p-4 border-t border-[rgba(0,0,0,0.08)]">
          <div className="text-sm text-[#717182]">총 {alertsData?.totalElements || 0}건</div>
          <div className="flex gap-2">
            <Button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} size="sm" variant="outline" className="rounded">이전</Button>
            <Button size="sm" className="bg-[#FEE500] text-[#3C1E1E] rounded shadow-none">{page + 1}</Button>
            <Button onClick={() => setPage(p => p + 1)} disabled={page >= (alertsData?.totalPages || 1) - 1} size="sm" variant="outline" className="rounded">다음</Button>
          </div>
        </div>
      </Card>

      <Dialog open={!!selectedAlertId} onOpenChange={() => setSelectedAlertId(null)}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle>알림 상세정보</DialogTitle>
          </DialogHeader>
          {selectedAlertDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#717182] mb-1">알림ID</div>
                  <div className="text-[#333333]">{selectedAlertDetail.alertUuid}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">발생시각</div>
                  <div className="text-[#333333]">{format(new Date(selectedAlertDetail.detectedAt), 'yyyy-MM-dd HH:mm:ss')}</div>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#717182] mb-1">유형</div>
                    <div className="text-[#333333]">{getAlertTypeKorean(selectedAlertDetail.alertType)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#717182] mb-1">상태</div>
                    <Badge
                      variant={!selectedAlertDetail.checked ? 'default' : 'secondary'}
                      className="rounded"
                    >
                      {!selectedAlertDetail.checked ? '미확인' : '확인됨'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedAlertDetail.description && (
                <Card className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">상세 설명</h3>
                  <p className="text-sm text-gray-800">{selectedAlertDetail.description}</p>
                </Card>
              )}

              {selectedAlertDetail.payments && selectedAlertDetail.payments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">관련 거래 내역</h4>
                  <div className="space-y-2">
                    {selectedAlertDetail.payments.map(p => (
                       <div key={p.paymentId} className="p-3 rounded-lg bg-gray-50 text-sm cursor-pointer hover:bg-gray-100" onClick={() => setSelectedTransaction(transactionDetails['TX-20251015-003'])}>
                       <div className="flex justify-between">
                         <span className="font-medium">승인번호: {p.authorizationNo}</span>
                         <span>{p.amount.toLocaleString()}원</span>
                       </div>
                       <div className="text-gray-600">{p.paymentMethod}</div>
                     </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setSelectedAlertId(null)}>닫기</Button>
                {!selectedAlertDetail.checked && (
                  <Button onClick={() => {
                    readAlert({ storeId: selectedStoreId!, alertId: selectedAlertDetail.id });
                    setSelectedAlertId(null);
                  }} className="flex-1 rounded-lg bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FFD700]">
                    확인 완료
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="sm:max-w-[280px] rounded-xl border-0 shadow-xl p-5 gap-3">
          <AlertDialogHeader className="text-center pb-0 gap-2">
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE500]">
              <svg
                className="h-6 w-6 text-[#3C1E1E]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <AlertDialogDescription className="text-sm text-[#333] font-medium text-center">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center pt-1">
            <AlertDialogAction
              className="w-full h-9 bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FFD700] font-semibold rounded-lg border-0 shadow-sm transition-all text-sm"
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
