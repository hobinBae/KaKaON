import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Switch } from "@/components/ui/switch";

const storeComparisonData = [
  { name: '강남점', sales: 6200000 },
  { name: '홍대점', sales: 5800000 },
  { name: '잠실점', sales: 4200000 },
  { name: '신촌점', sales: 3800000 },
];

const initialStoreData = [
  {
    id: "ST001",
    name: "강남점",
    code: "KN001",
    address: "서울 강남구 테헤란로 123",
    todaySales: 6200000,
    salesChange: 12.5,
    cancellationRate: 3.2,
    alertCount: 2,
    staffCount: 8,
    status: "운영중",
  },
  {
    id: "ST002",
    name: "홍대점",
    code: "HD001",
    address: "서울 마포구 홍익로 45",
    todaySales: 5800000,
    salesChange: 8.3,
    cancellationRate: 2.8,
    alertCount: 1,
    staffCount: 6,
    status: "운영중",
  },
  {
    id: "ST003",
    name: "잠실점",
    code: "JS001",
    address: "서울 송파구 올림픽로 234",
    todaySales: 4200000,
    salesChange: -5.2,
    cancellationRate: 4.1,
    alertCount: 3,
    staffCount: 7,
    status: "운영중",
  },
  {
    id: "ST004",
    name: "신촌점",
    code: "SC001",
    address: "서울 서대문구 신촌역로 78",
    todaySales: 3800000,
    salesChange: 3.1,
    cancellationRate: 2.5,
    alertCount: 0,
    staffCount: 5,
    status: "운영중",
  },
];

const initialAlertRecipients = [
  { id: 1, name: "김사장", position: "대표", email: "owner@kakaopay.com" },
  { id: 2, name: "김직원", position: "점장", email: "manager@kakaopay.com" },
];

// const staffData = [
//   {
//     id: 1,
//     name: "김직원",
//     role: "점장",
//     hourlyWage: 15000,
//     status: "근무중",
//     lastCheckIn: "09:00",
//   },
//   {
//     id: 2,
//     name: "이사원",
//     role: "스태프",
//     hourlyWage: 12000,
//     status: "근무중",
//     lastCheckIn: "09:30",
//   },
//   {
//     id: 3,
//     name: "박알바",
//     role: "스태프",
//     hourlyWage: 11000,
//     status: "퇴근",
//     lastCheckIn: "18:00",
//   },
// ];

export default function StoreManage() {
  const [stores, setStores] = useState(initialStoreData);
  const [selectedStore, setSelectedStore] = useState<typeof initialStoreData[0] | null>(null);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [alertRecipients, setAlertRecipients] = useState(initialAlertRecipients);
  const [newRecipient, setNewRecipient] = useState({ name: "", position: "", email: "" });
  const [date, setDate] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    businessNumber: "",
    owner: "",
    type: "",
    address: "",
    phone: "",
    hours: "",
  });

  const handleStoreClick = (store: typeof initialStoreData[0]) => {
    setSelectedStore(store);
  };

  const handleDeleteRecipient = (id: number) => {
    setAlertRecipients(alertRecipients.filter((recipient) => recipient.id !== id));
  };

  const handleAddRecipient = () => {
    if (newRecipient.name && newRecipient.position && newRecipient.email) {
      setAlertRecipients([
        ...alertRecipients,
        { id: Date.now(), ...newRecipient },
      ]);
      setNewRecipient({ name: "", position: "", email: "" });
      setIsAddingAlert(false);
    }
  };

  const handleAddStore = () => {
    if (newStore.name && newStore.businessNumber && newStore.owner && newStore.type && newStore.address && newStore.phone && newStore.hours) {
      const newStoreData = {
        ...newStore,
        id: `ST${String(stores.length + 1).padStart(3, '0')}`,
        code: `CODE${String(stores.length + 1).padStart(3, '0')}`, // 임시 코드 자동 생성
        todaySales: 0,
        salesChange: 0,
        cancellationRate: 0,
        alertCount: 0,
        staffCount: 0,
        status: "운영중",
      };
      setStores([...stores, newStoreData]);
      setNewStore({ name: "", businessNumber: "", owner: "", type: "", address: "", phone: "", hours: "" });
      setIsAddingStore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#333333] mb-1">가맹점 관리</h1>
          <p className="text-sm text-[#717182]">
            여러 매장의 종합 분석 및 정보 관리
          </p>
        </div>
        <Dialog open={isAddingStore} onOpenChange={setIsAddingStore}>
          <DialogTrigger asChild>
            <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
              <Plus className="w-4 h-4 mr-2" />
              가맹점 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 가맹점 추가</DialogTitle>
              <DialogDescription>추가할 가맹점의 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                <Input value={newStore.name} onChange={(e) => setNewStore({...newStore, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">사업자등록번호</label>
                <Input value={newStore.businessNumber} onChange={(e) => setNewStore({...newStore, businessNumber: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">대표자명</label>
                <Input value={newStore.owner} onChange={(e) => setNewStore({...newStore, owner: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">업종</label>
                <Input value={newStore.type} onChange={(e) => setNewStore({...newStore, type: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-[#717182] mb-2 block">주소</label>
                <Input value={newStore.address} onChange={(e) => setNewStore({...newStore, address: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                <Input value={newStore.phone} onChange={(e) => setNewStore({...newStore, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">영업시간</label>
                <Input value={newStore.hours} onChange={(e) => setNewStore({...newStore, hours: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddingStore(false)}>취소</Button>
              <Button onClick={handleAddStore}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]" />
            <Input
              placeholder="가맹점명 / 사업자번호 검색"
              className="pl-9 rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
            />
          </div>
          <Button variant="outline" className="rounded-lg">
            <Filter className="w-4 h-4 mr-2" />
            필터
          </Button>
        </div>
      </Card>

      {/* Store Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
              <TableHead className="text-[#333333]">가맹점명</TableHead>
              <TableHead className="text-[#333333]">오늘 매출</TableHead>
              <TableHead className="text-[#333333]">취소율</TableHead>
              <TableHead className="text-[#333333]">알림</TableHead>
              <TableHead className="text-[#333333]">상태</TableHead>
              <TableHead className="text-[#333333]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow
                key={store.id}
                className="border-b border-[rgba(0,0,0,0.08)] hover:bg-[#F5F5F5] cursor-pointer"
                onClick={() => handleStoreClick(store)}
              >
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#717182]" />
                      <span className="text-sm text-[#333333]">{store.name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-[#333333]">
                      ₩{(store.todaySales / 1000000).toFixed(1)}M
                    </p>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        store.salesChange > 0
                          ? "text-[#4CAF50]"
                          : "text-[#FF4D4D]"
                      }`}
                    >
                      {store.salesChange > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{Math.abs(store.salesChange)}%</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`rounded ${
                      store.cancellationRate > 3.5
                        ? "border-[#FF4D4D] text-[#FF4D4D]"
                        : "border-[#717182] text-[#717182]"
                    }`}
                  >
                    {store.cancellationRate}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {store.alertCount > 0 ? (
                    <Badge
                      variant="destructive"
                      className="rounded"
                    >
                      {store.alertCount}건
                    </Badge>
                  ) : (
                    <span className="text-xs text-[#717182]">없음</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className="rounded bg-[#4CAF50] text-white"
                  >
                    {store.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button asChild variant="ghost" size="sm" className="rounded-lg h-8 px-3 text-xs">
                      <Link to="/transactions">거래내역</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="rounded-lg h-8 px-3 text-xs">
                      <Link to="/analytics">매출분석</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Store Comparison Chart */}
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#333333]">가맹점별 매출 비교</h3>
          <div className="relative">
            <Button
              variant={"outline"}
              className="w-[280px] justify-start text-left font-normal rounded-lg"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "yyyy.MM.dd")} ~{" "}
                    {format(date.to, "yyyy.MM.dd")}
                  </>
                ) : (
                  format(date.from, "yyyy.MM.dd")
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
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(range) => {
                    setDate(range);
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={storeComparisonData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
            <XAxis type="number" stroke="#717182" />
            <YAxis dataKey="name" type="category" stroke="#717182" width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="sales" fill="#FFB800" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Store Detail Tabs */}
      {selectedStore && (
        <>
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-4">
              {selectedStore.name} 상세 관리
            </h3>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="bg-[#F5F5F5] rounded-lg p-1">
                <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                  기본정보
                </TabsTrigger>
                {/* <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                  직원관리
                </TabsTrigger> */}
                <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                  알림설정
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                    <Input
                      value={selectedStore.name}
                      className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#717182] mb-2 block">
                      사업자등록번호
                    </label>
                    <Input
                      value="123-45-67890"
                      className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#717182] mb-2 block">대표자명</label>
                    <Input
                      value="김사장"
                      className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#717182] mb-2 block">업종</label>
                    <Input
                      value="음식점업"
                      className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-[#717182] mb-2 block">주소</label>
                    <Input
                      value={selectedStore.address}
                      className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                    <Input
                      value="02-1234-5678"
                      className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#717182] mb-2 block">영업시간</label>
                    <Input
                      value="09:00 - 22:00"
                      className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
                    수정하기
                  </Button>
                </div>

                {/* Danger Zone */}
                <Card className="p-6 mt-6 rounded-xl border border-[#FF4D4D]/20 shadow-none bg-[#FF4D4D]/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#FF4D4D] mb-1">가맹점 삭제</h3>
                      <p className="text-sm text-[#717182]">가맹점을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
                    </div>
                    <Button variant="destructive" className="rounded-lg">
                      가맹점 삭제
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* <TabsContent value="staff" className="mt-6">
                <div className="space-y-4">
                  {staffData.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#FEE500] rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#3C1E1E]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#333333]">{staff.name}</p>
                          <p className="text-xs text-[#717182]">
                            {staff.role} · 시급 ₩{staff.hourlyWage.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={`rounded ${
                            staff.status === "근무중"
                              ? "bg-[#4CAF50] text-white"
                              : "bg-[#F5F5F5] text-[#717182]"
                          }`}
                        >
                          {staff.status}
                        </Badge>
                        <span className="text-xs text-[#717182]">
                          최근 출근: {staff.lastCheckIn}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-6">
                  <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none">
                    <Plus className="w-4 h-4 mr-2" />
                    직원 추가
                  </Button>
                </div>
              </TabsContent> */}

              <TabsContent value="alerts" className="mt-6">
                <div className="space-y-4">
                  {alertRecipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg">
                      <div>
                        <p className="text-sm text-[#333333]">{recipient.name} ({recipient.position})</p>
                        <p className="text-xs text-[#717182]">{recipient.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked />
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRecipient(recipient.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {isAddingAlert && (
                  <div className="p-4 bg-[#F5F5F5] rounded-lg space-y-4 mt-4">
                    <Input
                      placeholder="이름"
                      className="rounded-lg"
                      value={newRecipient.name}
                      onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                    />
                    <Input
                      placeholder="직위"
                      className="rounded-lg"
                      value={newRecipient.position}
                      onChange={(e) => setNewRecipient({ ...newRecipient, position: e.target.value })}
                    />
                    <Input
                      type="email"
                      placeholder="이메일 주소"
                      className="rounded-lg"
                      value={newRecipient.email}
                      onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setIsAddingAlert(false)}>취소</Button>
                      <Button
                        className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none"
                        onClick={handleAddRecipient}
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-6">
                  <Button
                    className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none"
                    onClick={() => setIsAddingAlert(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    추가
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
}
