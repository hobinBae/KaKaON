import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RotateCw, Calendar as CalendarIcon, Upload, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { addDays, format, differenceInCalendarDays, startOfMonth, endOfMonth, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear, parse, isValid, subMonths, addMonths, setYear, setMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Transactions() {
  // 더미 데이터 정의
  const dummyTransactions = [
    { id: 'T123456805', storeId: '1', date: '2025-11-03 09:15:00', total: 5500, paymentMethod: '카드', status: '완료', time: '09:15:00', amount: 5500, method: '카드', orderType: '가게 주문', items: [{ name: '카페라떼', quantity: 1, price: 5500 }] },
    { id: 'T123456806', storeId: '2', date: '2025-11-02 18:30:00', total: 18000, paymentMethod: '카카오페이', status: '완료', time: '18:30:00', amount: 18000, method: '카카오페이', orderType: '배달 주문', items: [{ name: '아메리카노', quantity: 2, price: 5000 }, { name: '치즈케이크', quantity: 1, price: 8000 }] },
    { id: 'T123456807', storeId: '1', date: '2025-11-01 12:00:00', total: 7000, paymentMethod: '현금', status: '완료', time: '12:00:00', amount: 7000, method: '현금', orderType: '가게 주문', items: [{ name: '카푸치노', quantity: 1, price: 7000 }] },
    { id: 'T123456789', storeId: '1', date: '2025-10-31 10:30:00', total: 5000, paymentMethod: '카드', status: '완료', time: '10:30:00', amount: 5000, method: '카드', orderType: '가게 주문', items: [{ name: '아메리카노', quantity: 1, price: 5000 }] },
    { id: 'T123456790', storeId: '1', date: '2025-10-31 11:05:00', total: 12000, paymentMethod: '카카오페이', status: '완료', time: '11:05:00', amount: 12000, method: '카카오페이', orderType: '배달 주문', items: [{ name: '카페라떼', quantity: 2, price: 6000 }] },
    { id: 'T123456791', storeId: '1', date: '2025-10-31 12:15:00', total: 7500, paymentMethod: '현금', status: '취소', time: '12:15:00', amount: 7500, method: '현금', orderType: '가게 주문', items: [{ name: '카푸치노', quantity: 1, price: 7500 }] },
    { id: 'T123456792', storeId: '2', date: '2025-10-31 14:00:00', total: 25000, paymentMethod: '카드', status: '완료', time: '14:00:00', amount: 25000, method: '카드', orderType: '배달 주문', items: [{ name: '아메리카노', quantity: 5, price: 5000 }] },
    { id: 'T123456793', storeId: '1', date: '2025-10-30 18:45:00', total: 8800, paymentMethod: '계좌', status: '완료', time: '18:45:00', amount: 8800, method: '계좌', orderType: '가게 주문', items: [{ name: '아메리카노', quantity: 2, price: 4400 }] },
    { id: 'T123456794', storeId: '1', date: '2025-10-30 20:10:00', total: 15000, paymentMethod: '카드', status: '완료', time: '20:10:00', amount: 15000, method: '카드', orderType: '배달 주문', items: [{ name: '카페라떼', quantity: 3, price: 5000 }] },
    { id: 'T123456795', storeId: '2', date: '2025-10-29 09:20:00', total: 3200, paymentMethod: '현금', status: '완료', time: '09:20:00', amount: 3200, method: '현금', orderType: '가게 주문', items: [{ name: '에스프레소', quantity: 1, price: 3200 }] },
    { id: 'T123456796', storeId: '1', date: '2025-10-29 13:00:00', total: 18000, paymentMethod: '카카오페이', status: '취소', time: '13:00:00', amount: 18000, method: '카카오페이', orderType: '배달 주문', items: [{ name: '카페라떼', quantity: 3, price: 6000 }] },
    { id: 'T123456797', storeId: '1', date: '2025-10-15 09:00:00', total: 3500, paymentMethod: '카드', status: '완료', time: '09:00:00', amount: 3500, method: '카드', orderType: '가게 주문', items: [{ name: '아메리카노', quantity: 1, price: 3500 }] },
    { id: 'T123456798', storeId: '2', date: '2025-10-15 10:30:00', total: 22000, paymentMethod: '카카오페이', status: '완료', time: '10:30:00', amount: 22000, method: '카카오페이', orderType: '배달 주문', items: [{ name: '카페라떼', quantity: 4, price: 5500 }] },
    { id: 'T123456799', storeId: '1', date: '2025-10-14 19:20:00', total: 9500, paymentMethod: '현금', status: '완료', time: '19:20:00', amount: 9500, method: '현금', orderType: '가게 주문', items: [{ name: '카푸치노', quantity: 1, price: 9500 }] },
    { id: 'T123456800', storeId: '1', date: '2025-10-12 11:45:00', total: 12500, paymentMethod: '카드', status: '취소', time: '11:45:00', amount: 12500, method: '카드', orderType: '배달 주문', items: [{ name: '아메리카노', quantity: 2, price: 6250 }] },
    { id: 'T123456801', storeId: '2', date: '2025-10-10 08:10:00', total: 5500, paymentMethod: '계좌', status: '완료', time: '08:10:00', amount: 5500, method: '계좌', orderType: '가게 주문', items: [{ name: '카페라떼', quantity: 1, price: 5500 }] },
    { id: 'T123456802', storeId: '1', date: '2025-10-05 14:50:00', total: 16000, paymentMethod: '카드', status: '완료', time: '14:50:00', amount: 16000, method: '카드', orderType: '배달 주문', items: [{ name: '아메리카노', quantity: 4, price: 4000 }] },
    { id: 'T123456803', storeId: '1', date: '2025-10-03 16:00:00', total: 7000, paymentMethod: '카카오페이', status: '완료', time: '16:00:00', amount: 7000, method: '카카오페이', orderType: '가게 주문', items: [{ name: '카푸치노', quantity: 1, price: 7000 }] },
    { id: 'T123456804', storeId: '2', date: '2025-10-01 12:00:00', total: 30000, paymentMethod: '카드', status: '완료', time: '12:00:00', amount: 30000, method: '카드', orderType: '배달 주문', items: [{ name: '아메리카노', quantity: 6, price: 5000 }] },
  ];

  const [filteredTransactions, setFilteredTransactions] = useState(dummyTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof dummyTransactions)[0] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [activePeriod, setActivePeriod] = useState<string>("today");
  const [showCalendar, setShowCalendar] = useState(false);
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['all']);
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDateInput, setStartDateInput] = useState<string>("");
  const [endDateInput, setEndDateInput] = useState<string>("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<React.ReactNode>("");
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const paymentMethodOptions = ['카드', '계좌', '카카오페이', '현금'];

  useEffect(() => {
    let data = dummyTransactions;

    if (searchTerm) {
      data = data.filter(tx => tx.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (dateRange?.from && dateRange?.to) {
      data = data.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= (dateRange.from as Date) && txDate <= (dateRange.to as Date);
      });
    }

    if (orderTypeFilter !== 'all') {
      data = data.filter(tx => tx.orderType === (orderTypeFilter === 'delivery' ? '배달 주문' : '가게 주문'));
    }

    if (statusFilter !== 'all') {
      data = data.filter(tx => tx.status === (statusFilter === 'completed' ? '완료' : '취소'));
    }

    if (!selectedMethods.includes('all')) {
      data = data.filter(tx => selectedMethods.includes(tx.paymentMethod));
    }

    setFilteredTransactions(data);
  }, [dateRange, orderTypeFilter, searchTerm, selectedMethods, statusFilter]);

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

  // --- Helper Functions & State from Analytics.tsx ---

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

  useEffect(() => {
    if (activePeriod) {
      setStartDateInput("");
      setEndDateInput("");
      return;
    }
    if (dateRange?.from) {
      setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
    } else {
      setStartDateInput("");
    }
    if (dateRange?.to) {
      setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
    } else {
      setEndDateInput("");
    }
  }, [dateRange, activePeriod]);

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
      setStartDateInput(formatted);
    } else {
      setEndDateInput(formatted);
    }
  };

  const handleDateInputBlur = (type: 'start' | 'end') => {
    const value = type === 'start' ? startDateInput : endDateInput;
    if (!value) {
      if (type === 'start') setDateRange({ from: undefined, to: dateRange?.to });
      else setDateRange({ from: dateRange?.from, to: undefined });
      return;
    }
    const parsedDate = parse(value, 'yyyy.MM.dd', new Date());
    if (!isValid(parsedDate)) {
      if (type === 'start' && dateRange?.from) setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
      else if (type === 'end' && dateRange?.to) setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
      else { if (type === 'start') setStartDateInput(""); else setEndDateInput(""); }
      return;
    }
    if (parsedDate > new Date()) {
      showAlert('오늘 이후의 날짜는 선택할 수 없습니다.');
      if (type === 'start' && dateRange?.from) setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
      else if (type === 'end' && dateRange?.to) setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
      else { if (type === 'start') setStartDateInput(""); else setEndDateInput(""); }
      return;
    }
    if (type === 'start') {
      if (dateRange?.to && parsedDate > dateRange.to) {
        showAlert('시작일은 종료일보다 이전이어야 합니다.');
        if (dateRange?.from) setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
        else setStartDateInput("");
        return;
      }
      if (dateRange?.to) {
        const maxDate = addDays(parsedDate, 365);
        if (dateRange.to > maxDate) {
          showAlert(<><span className="font-bold">최대 1년</span>까지만 조회 가능합니다.</>);
          if (dateRange?.from) setStartDateInput(format(dateRange.from, "yyyy.MM.dd"));
          else setStartDateInput("");
          return;
        }
      }
      setDateRange({ from: parsedDate, to: dateRange?.to });
      setActivePeriod("");
    } else {
      if (dateRange?.from && parsedDate < dateRange.from) {
        showAlert('종료일은 시작일보다 이후여야 합니다.');
        if (dateRange?.to) setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
        else setEndDateInput("");
        return;
      }
      if (dateRange?.from) {
        const maxDate = addDays(dateRange.from, 365);
        if (parsedDate > maxDate) {
          showAlert(<><span className="font-bold">최대 1년</span>까지만 조회 가능합니다.</>);
          if (dateRange?.to) setEndDateInput(format(dateRange.to, "yyyy.MM.dd"));
          else setEndDateInput("");
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

  // 스샷 톤의 세그먼트 공통 클래스
  const segmentWrap = "inline-flex items-center gap-1 rounded-lg bg-[#F5F5F7] px-1 py-1";
  const segmentItem =
    "rounded-lg px-4 h-8 text-sm data-[state=on]:bg-white data-[state=on]:shadow-sm " +
    "data-[state=on]:text-[#111] data-[state=off]:text-[#50505f] hover:bg-white transition";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:justify-between tablet:items-center gap-4">
        <div>
          <h1 className="text-[#333333] mb-1">거래내역</h1>
          <p className="text-sm text-[#717182]">결제내역을 조회하고 관리하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-8 rounded-lg flex items-center gap-2 text-sm px-4 flex-1 tablet:flex-none">
            <Upload className="w-4 h-4" />
            CSV 업로드
          </Button>
          <Button variant="outline" className="h-8 rounded-lg flex items-center gap-2 text-sm px-4 flex-1 tablet:flex-none">
            <Download className="w-4 h-4" />
            CSV 다운로드
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 tablet:p-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
        {/* Desktop View */}
        <div className="hidden tablet:block">
          <div className="space-y-4">
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
                <div className="relative flex items-center gap-2 w-full tablet:w-auto">
                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1 tablet:flex tablet:gap-1">
                    <Input
                      type="text"
                      placeholder="YYYY.MM.DD"
                      value={startDateInput}
                      onChange={(e) => handleDateInputChange('start', e.target.value)}
                      onBlur={() => handleDateInputBlur('start')}
                      className="h-8 w-full tablet:w-32 text-sm rounded-lg border border-gray-300 bg-white px-3"
                    />
                    <span className="text-sm text-gray-500 text-center">~</span>
                    <Input
                      type="text"
                      placeholder="YYYY.MM.DD"
                      value={endDateInput}
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

            {/* ====== 결제수단 + 상태 : 같은 줄 ====== */}
            <div className="grid grid-cols-[72px_1fr] items-center gap-3">
              <div className="text-sm font-semibold text-[#333]">결제수단</div>
              <div className="flex items-center gap-10 flex-wrap">
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#F5F5F7] px-2 py-1">
                  <label htmlFor="all-methods-desktop" className="flex items-center gap-2 rounded-lg bg-white px-4 h-8 text-sm text-[#50505f] hover:shadow-sm cursor-pointer">
                    <Checkbox id="all-methods-desktop" checked={selectedMethods.includes('all')} onCheckedChange={(checked) => { setSelectedMethods(checked ? ['all'] : []); }} />
                    <span>전체</span>
                  </label>
                  {paymentMethodOptions.map((method) => (
                    <label key={method} htmlFor={`${method}-desktop`} className="flex items-center gap-2 rounded-lg bg-white px-4 h-8 text-sm text-[#50505f] hover:shadow-sm cursor-pointer">
                      <Checkbox id={`${method}-desktop`} checked={selectedMethods.includes('all') || selectedMethods.includes(method)} onCheckedChange={(checked) => { let newMethods = selectedMethods.filter((m) => m !== 'all'); if (checked) { newMethods.push(method); } else { newMethods = newMethods.filter((m) => m !== method); } if (newMethods.length === paymentMethodOptions.length) { setSelectedMethods(['all']); } else { setSelectedMethods(newMethods); } }} />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-[#333] shrink-0">결제상태</div>
                  <ToggleGroup type="single" value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')} className={segmentWrap}>
                    <ToggleGroupItem value="all" className={segmentItem}>전체</ToggleGroupItem>
                    <ToggleGroupItem value="completed" className={segmentItem}>완료</ToggleGroupItem>
                    <ToggleGroupItem value="cancelled" className={segmentItem}>취소</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-[#333] shrink-0">주문구분</div>
                  <ToggleGroup type="single" defaultValue="all" className={segmentWrap} onValueChange={(value) => setOrderTypeFilter(value || 'all')}>
                    <ToggleGroupItem value="all" className={segmentItem}>전체</ToggleGroupItem>
                    <ToggleGroupItem value="delivery" className={segmentItem}>배달 주문</ToggleGroupItem>
                    <ToggleGroupItem value="store" className={segmentItem}>가게 주문</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>

            {/* 하단 요약/버튼 */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2 flex-wrap gap-3">
              <div className="text-sm text-[#333]">
                {dateRange?.from && dateRange?.to && (<>{format(dateRange.from, "yyyy.MM.dd")} ~ {format(dateRange.to, "yyyy.MM.dd")} <span className="text-[#007AFF] ml-1">({differenceInCalendarDays(addDays(dateRange.to, 1), dateRange.from)}일간)</span></>)}
              </div>
              <div className="flex gap-2 items-center">
                <Input type="text" placeholder="승인번호 검색" className="h-8 rounded-lg text-sm px-4 w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Button className="bg-[#333] text-white hover:bg-[#444] rounded-lg px-4 text-sm h-8">검색</Button>
                <Button variant="ghost" className="text-gray-500 hover:bg-gray-100 rounded-lg text-sm h-8"><RotateCw className="w-4 h-4 mr-1" />초기화</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="tablet:hidden">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-[#333] mb-2">조회기간</div>
              <ToggleGroup type="single" value={activePeriod} onValueChange={handlePeriodChange} className={`${segmentWrap} w-full`}>
                <ToggleGroupItem value="today" className={`${segmentItem} flex-1`}>오늘</ToggleGroupItem>
                <ToggleGroupItem value="this-week" className={`${segmentItem} flex-1`}>이번주</ToggleGroupItem>
                <ToggleGroupItem value="this-month" className={`${segmentItem} flex-1`}>이번달</ToggleGroupItem>
              </ToggleGroup>
              <div className="relative flex items-center gap-2 w-full tablet:w-auto mt-2">
                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1 tablet:flex tablet:gap-1">
                  <Input
                    type="text"
                    placeholder="YYYY.MM.DD"
                    value={startDateInput}
                    onChange={(e) => handleDateInputChange('start', e.target.value)}
                    onBlur={() => handleDateInputBlur('start')}
                    className="h-8 w-full tablet:w-32 text-sm rounded-lg border border-gray-300 bg-white px-3"
                  />
                  <span className="text-sm text-gray-500 text-center">~</span>
                  <Input
                    type="text"
                    placeholder="YYYY.MM.DD"
                    value={endDateInput}
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
            <div>
              <div className="text-sm font-semibold text-[#333] mb-2">필터</div>
              <div className="space-y-2">
                <ToggleGroup type="multiple" value={selectedMethods} onValueChange={setSelectedMethods} className={`${segmentWrap} w-full`}>
                  <ToggleGroupItem value="all" className={`${segmentItem} flex-1`}>전체</ToggleGroupItem>
                  {paymentMethodOptions.map(m => (
                    <ToggleGroupItem key={m} value={m} className={`${segmentItem} flex-1`}>
                      {m === '카카오페이' ? '페이' : m}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <ToggleGroup type="single" value={orderTypeFilter} onValueChange={(v) => setOrderTypeFilter(v || 'all')} className={`${segmentWrap} w-full`}>
                  <ToggleGroupItem value="all" className={`${segmentItem} flex-1`}>전체</ToggleGroupItem>
                  <ToggleGroupItem value="store" className={`${segmentItem} flex-1`}>가게</ToggleGroupItem>
                  <ToggleGroupItem value="delivery" className={`${segmentItem} flex-1`}>배달</ToggleGroupItem>
                </ToggleGroup>
                <ToggleGroup type="single" value={statusFilter} onValueChange={(v) => setStatusFilter(v || 'all')} className={`${segmentWrap} w-full`}>
                  <ToggleGroupItem value="all" className={`${segmentItem} flex-1`}>전체</ToggleGroupItem>
                  <ToggleGroupItem value="completed" className={`${segmentItem} flex-1`}>완료</ToggleGroupItem>
                  <ToggleGroupItem value="cancelled" className={`${segmentItem} flex-1`}>취소</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2 flex-wrap gap-3">
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
                <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-lg">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 items-center w-full">
              <Input type="text" placeholder="승인번호 검색" className="h-8 rounded-lg text-sm px-4 flex-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Button className="bg-[#333] text-white hover:bg-[#444] rounded-lg px-6 text-sm h-8">검색</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Transaction Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
                <TableHead className="text-[#333333] pl-6">
                  <span className="hidden tablet:inline">결제</span>시간
                </TableHead>
                <TableHead className="text-[#333333]">
                  <span className="hidden tablet:inline">주문</span>구분
                </TableHead>
                <TableHead className="text-[#333333]">
                  <span className="hidden tablet:inline">결제</span>수단
                </TableHead>
                <TableHead className="text-[#333333]">
                  <span className="hidden tablet:inline">결제</span>상태
                </TableHead>
                <TableHead className="text-[#333333] hidden tablet:table-cell">승인번호</TableHead>
                <TableHead className="text-[#333333]">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className={`hover:bg-[#F5F5F5] cursor-pointer ${tx.status === '취소' ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <TableCell className="text-[#717182] pl-6">
                    <span className="hidden tablet:inline">{format(new Date(tx.date), 'yyyy.MM.dd (eee) HH:mm', { locale: ko })}</span>
                    <span className="tablet:hidden">{format(new Date(tx.date), 'MM.dd', { locale: ko })}</span>
                  </TableCell>
                  <TableCell className="text-[#717182]">
                    <span className="hidden tablet:inline">{tx.orderType}</span>
                    <span className="tablet:hidden">{tx.orderType.replace(' 주문', '')}</span>
                  </TableCell>
                  <TableCell className="text-[#717182]">
                    <span className="hidden tablet:inline">{tx.paymentMethod}</span>
                    <span className="tablet:hidden">{tx.paymentMethod === '카카오페이' ? '페이' : tx.paymentMethod}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.status === '취소' ? 'destructive' : 'secondary'}
                      className="rounded bg-[#F5F5F5] text-[#333333]"
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#333333] hidden tablet:table-cell">{tx.id}</TableCell>
                  <TableCell className="text-[#333333]">{tx.total.toLocaleString()}원</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[rgba(0,0,0,0.08)]">
          <div className="text-sm text-[#717182]">총 {filteredTransactions.length}건</div>
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
                  <div className="text-sm text-[#717182] mb-1">결제시간</div>
                  <div className="text-[#333333]">{format(new Date(selectedTransaction.date), 'yyyy.MM.dd (eee) HH:mm', { locale: ko })}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">주문 구분</div>
                  <div className="text-[#333333]">{selectedTransaction.orderType}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제수단</div>
                  <div className="text-[#333333]">{selectedTransaction.method}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제 상태</div>
                  <Badge variant={selectedTransaction.status === '취소' ? 'destructive' : 'secondary'} className="rounded">
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">승인번호</div>
                  <div className="text-[#333333]">{selectedTransaction.id}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제금액</div>
                  <div className="text-[#333333]">{selectedTransaction.amount.toLocaleString()}원</div>
                </div>
              </div>

              <Card className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">주문상세내역</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상품명</TableHead>
                      <TableHead className="text-right">수량</TableHead>
                      <TableHead className="text-right">가격</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransaction.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{(item.price * item.quantity).toLocaleString()}원</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="text-right font-bold mt-2">
                  합계: {selectedTransaction.total.toLocaleString()}원
                </div>
              </Card>

              {selectedTransaction.status === '취소' && (
                <Card className="p-4 bg-[#FF4D4D]/5 border-[#FF4D4D]/20 rounded-lg">
                  <div className="text-sm text-[#FF4D4D]">⚠️ 이 거래는 취소되었습니다. 관련 이상거래 알림을 확인하세요.</div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setSelectedTransaction(null)}>닫기</Button>
              </div>
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
