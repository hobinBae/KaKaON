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
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BusinessHoursForm } from "@/components/BusinessHoursForm";
import { useMyStores } from "@/lib/hooks/useStores";
import type { Store } from "@/types/api";

const initialAlertRecipients = [
  { id: 1, name: "김사장", position: "대표", email: "owner@kakaopay.com" },
  { id: 2, name: "김직원", position: "점장", email: "manager@kakaopay.com" },
];

// 요일 변환 헬퍼 함수
const dayOfWeekToKorean: Record<string, string> = {
  'MONDAY': '월',
  'TUESDAY': '화',
  'WEDNESDAY': '수',
  'THURSDAY': '목',
  'FRIDAY': '금',
  'SATURDAY': '토',
  'SUNDAY': '일',
};

// BusinessHour[] 배열을 화면 표시용 객체로 변환
const convertBusinessHours = (businessHours: Store['businessHours']) => {
  const converted: Record<string, { isClosed: boolean; timeSlots: { start: string; end: string }[] }> = {
    '월': { isClosed: true, timeSlots: [] },
    '화': { isClosed: true, timeSlots: [] },
    '수': { isClosed: true, timeSlots: [] },
    '목': { isClosed: true, timeSlots: [] },
    '금': { isClosed: true, timeSlots: [] },
    '토': { isClosed: true, timeSlots: [] },
    '일': { isClosed: true, timeSlots: [] },
  };

  businessHours?.forEach((hour) => {
    const koreanDay = dayOfWeekToKorean[hour.dayOfWeek];
    if (koreanDay) {
      converted[koreanDay] = {
        isClosed: false,
        timeSlots: [{ start: hour.openTime, end: hour.closeTime }],
      };
    }
  });

  return converted;
};

type SalesPeriod = "일별" | "주별" | "월별";

export default function StoreManage() {
  // API에서 매장 목록 가져오기
  const { data: stores, isLoading, isError } = useMyStores();

  const [selectedPeriod, setSelectedPeriod] = useState<SalesPeriod>("일별");

  // 기간별 매출 계산 함수 (API에서 todaySales, weeklySales, monthlySales가 제공되면 사용)
  const getSalesData = (store: Store, period: SalesPeriod) => {
    const totalSales = store.totalSales ?? 0;
    switch (period) {
      case "일별":
        return Math.round(totalSales * 0.03); // 임시: 전체 매출의 3%를 오늘 매출로 가정
      case "주별":
        return Math.round(totalSales * 0.2); // 임시: 전체 매출의 20%를 이번주 매출로 가정
      case "월별":
        return totalSales; // 전체 매출을 이번달 매출로 사용
      default:
        return 0;
    }
  };

  const maxSales = stores ? Math.max(...stores.map(s => getSalesData(s, selectedPeriod))) : 0;

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [alertRecipients, setAlertRecipients] = useState(initialAlertRecipients);
  const [newRecipient, setNewRecipient] = useState({ name: "", position: "", email: "" });
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [isBusinessHoursModalOpen, setIsBusinessHoursModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    businessNumber: "",
    owner: "",
    type: "",
    address: "",
    phone: "",
    hours: "",
  });

  const handleStoreClick = (store: Store) => {
    // 같은 가맹점을 클릭하면 닫기, 다른 가맹점을 클릭하면 열기
    if (selectedStore?.storeId === store.storeId) {
      setSelectedStore(null);
    } else {
      setSelectedStore(store);
    }
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
    // TODO: API 연동 필요 (useCreateStore 훅 사용)
    console.log('가맹점 추가 기능은 API 연동 후 사용 가능합니다.');
    setIsAddingStore(false);
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
              <div className="col-span-2">
                <label className="text-sm text-[#717182] mb-2 block">영업시간</label>
                <Dialog open={isBusinessHoursModalOpen} onOpenChange={setIsBusinessHoursModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      영업시간 설정
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader className="text-left">
                      <DialogTitle>영업시간 상세 설정</DialogTitle>
                      <DialogDescription>
                        요일별 영업시간과 휴무일을 설정하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <BusinessHoursForm />
                    <DialogFooter className="justify-center sm:justify-end">
                      <Button className="w-full sm:w-auto" onClick={() => setIsBusinessHoursModalOpen(false)}>확인</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
        </div>
      </Card>

      {/* Store Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
              <TableHead className="text-[#333333] pl-6">가맹점명</TableHead>
              <TableHead className="text-[#333333] text-center hidden tablet:table-cell">오늘 매출</TableHead>
              <TableHead className="text-[#333333] text-center hidden tablet:table-cell">취소율</TableHead>
              <TableHead className="text-[#333333] text-center">알림</TableHead>
              <TableHead className="text-[#333333] text-center">상태</TableHead>
              <TableHead className="text-[#333333] text-center hidden tablet:table-cell">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2 -ml-2">
                      {selectedPeriod} 매출 현황
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedPeriod("일별")}>일별 매출 현황</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPeriod("주별")}>주별 매출 현황</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPeriod("월별")}>월별 매출 현황</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
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
                <TableCell className="pl-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#717182]" />
                      <span className="text-sm text-[#333333]">{store.name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center hidden tablet:table-cell">
                  <div>
                    <p className="text-sm text-[#333333]">
                      ₩{(store.todaySales / 1000000).toFixed(1)}M
                    </p>
                    <div
                      className={`flex items-center gap-1 text-xs justify-center ${
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
                <TableCell className="text-center hidden tablet:table-cell">
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
                <TableCell className="text-center">
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
                <TableCell className="text-center">
                  <Badge
                    className="rounded bg-[#4CAF50] text-white"
                  >
                    {store.status}
                  </Badge>
                </TableCell>
                <TableCell className="w-[200px] hidden tablet:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2.5 relative">
                      <div
                        className="bg-[#FFB800] h-2.5"
                        style={{ width: `${(getSalesData(store, selectedPeriod) / maxSales) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {(getSalesData(store, selectedPeriod) / 10000).toFixed(0)}만원
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button asChild variant="secondary" size="sm" className="rounded-lg h-8 px-3 text-xs">
                      <Link to="/transactions">거래내역</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="rounded-lg h-8 px-3 text-xs">
                      <Link to="/analytics">매출분석</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                  알림설정
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                      <Input value={selectedStore.name} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                    </div>
                    <div>
                      <label className="text-sm text-[#717182] mb-2 block">사업자등록번호</label>
                      <Input value="123-45-67890" className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm text-[#717182] mb-2 block">대표자명</label>
                        <Input value="김사장" className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                      </div>
                      <div>
                        <label className="text-sm text-[#717182] mb-2 block">업종</label>
                        <Input value="음식점업" className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                      </div>
                      <div>
                        <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                        <Input defaultValue="02-1234-5678" className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]" />
                      </div>
                      <div>
                        <label className="text-sm text-[#717182] mb-2 block">주소</label>
                        <Input defaultValue={selectedStore.address} className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]" />
                      </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-[#717182]">영업시간</label>
                            <Dialog open={isBusinessHoursModalOpen} onOpenChange={setIsBusinessHoursModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">수정</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader className="text-left">
                                    <DialogTitle>영업시간 상세 설정</DialogTitle>
                                    <DialogDescription>
                                        요일별 영업시간과 휴무일을 설정하세요.
                                    </DialogDescription>
                                    </DialogHeader>
                                    <BusinessHoursForm />
                                    <DialogFooter className="justify-center sm:justify-end">
                                    <Button className="w-full sm:w-auto" onClick={() => setIsBusinessHoursModalOpen(false)}>확인</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                    <Button>수정 완료</Button>
                </div>

                {/* Danger Zone */}
                <Card className="p-6 mt-6">
                  <div className="flex flex-col tablet:flex-row items-start tablet:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-[#FF4D4D] mb-1">가맹점 삭제</h3>
                      <p className="text-sm text-[#717182]">가맹점을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
                    </div>
                    <Button variant="destructive" className="rounded-lg w-full tablet:w-auto">
                      가맹점 삭제
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="mt-6">
                <div className="space-y-4">
                  {alertRecipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg">
                      <div>
                        <p className="text-sm text-[#333333]">
                          ₩{((store.totalSales ?? 0) / 1000000).toFixed(1)}M
                        </p>
                        {store.changeRate !== undefined && (
                          <div
                            className={`flex items-center gap-1 text-xs justify-center ${
                              store.changeRate > 0
                                ? "text-[#4CAF50]"
                                : "text-[#FF4D4D]"
                            }`}
                          >
                            {store.changeRate > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{Math.abs(store.changeRate)}%</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {store.cancelRate !== undefined ? (
                        <Badge
                          variant="outline"
                          className={`rounded ${
                            store.cancelRate > 3.5
                              ? "border-[#FF4D4D] text-[#FF4D4D]"
                              : "border-[#717182] text-[#717182]"
                          }`}
                        >
                          {store.cancelRate}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-[#717182]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {(store.alertCount ?? 0) > 0 ? (
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
                    <TableCell className="text-center">
                      <Badge
                        className={`rounded ${
                          store.status === 'OPEN'
                            ? 'bg-[#4CAF50] text-white'
                            : 'bg-[#717182] text-white'
                        }`}
                      >
                        {store.status === 'OPEN' ? '운영중' : '마감'}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2.5 relative">
                          <div
                            className="bg-[#FFB800] h-2.5"
                            style={{ width: `${maxSales > 0 ? (getSalesData(store, selectedPeriod) / maxSales) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right">
                          {(getSalesData(store, selectedPeriod) / 10000).toFixed(0)}만원
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button asChild variant="secondary" size="sm" className="rounded-lg h-8 px-3 text-xs">
                          <Link to="/transactions">거래내역</Link>
                        </Button>
                        <Button asChild variant="secondary" size="sm" className="rounded-lg h-8 px-3 text-xs">
                          <Link to="/analytics">매출분석</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail Row */}
                  {selectedStore?.storeId === store.storeId && (
                    <TableRow key={`${store.storeId}-detail`}>
                      <TableCell colSpan={7} className="bg-[#FAFAFA] p-6">
                        <div className="space-y-6">
                          <h4 className="text-[#333333] font-semibold">{selectedStore.name} 상세 관리</h4>

                          <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="bg-[#F5F5F5] rounded-lg p-1">
                              <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                                기본정보
                              </TabsTrigger>
                              <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                                알림설정
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="mt-6">
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                                    <Input value={selectedStore.name} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                  </div>
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">사업자등록번호</label>
                                    <Input value={selectedStore.businessNumber} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-6">
                                    <div>
                                      <label className="text-sm text-[#717182] mb-2 block">대표자명</label>
                                      <Input value={selectedStore.ownerName} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                    </div>
                                    <div>
                                      <label className="text-sm text-[#717182] mb-2 block">업종</label>
                                      <Input
                                        value={
                                          selectedStore.businessType === 'RESTAURANT' ? '음식점업' :
                                          selectedStore.businessType === 'CAFE' ? '카페' :
                                          '기타'
                                        }
                                        className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                                        readOnly
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                                      <Input defaultValue={selectedStore.phone} className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]" />
                                    </div>
                                    <div>
                                      <label className="text-sm text-[#717182] mb-2 block">주소</label>
                                      <Input defaultValue={selectedStore.address} className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="text-sm text-[#717182]">영업시간</label>
                                      <Dialog open={isBusinessHoursModalOpen} onOpenChange={setIsBusinessHoursModalOpen}>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" size="sm">수정</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>영업시간 상세 설정</DialogTitle>
                                            <DialogDescription>
                                              요일별 영업시간과 휴무일을 설정하세요.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <BusinessHoursForm />
                                          <DialogFooter>
                                            <Button onClick={() => setIsBusinessHoursModalOpen(false)}>확인</Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                    <div className="border rounded-lg p-4 space-y-2 bg-white">
                                      {Object.entries(convertBusinessHours(selectedStore.businessHours)).map(([day, hours]) => (
                                        <div key={day} className="grid grid-cols-[3rem_1fr] items-center">
                                          <span className="font-semibold">{day}</span>
                                          {hours.isClosed ? (
                                            <span className="text-gray-500">휴무일</span>
                                          ) : (
                                            <div>
                                              {hours.timeSlots.map((slot, index) => (
                                                <span key={index} className="text-sm">{slot.start} - {slot.end}</span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end mt-6">
                                <Button>수정 완료</Button>
                              </div>

                              {/* Danger Zone */}
                              <Card className="p-6 mt-6 border-[#FF4D4D] border">
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

                            <TabsContent value="alerts" className="mt-6">
                              <div className="space-y-4">
                                {alertRecipients.map((recipient) => (
                                  <div key={recipient.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-[rgba(0,0,0,0.08)]">
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
                                <div className="p-4 bg-white rounded-lg border border-[rgba(0,0,0,0.08)] space-y-4 mt-4">
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
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
