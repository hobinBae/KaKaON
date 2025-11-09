import { useState, Fragment } from "react";
import {
  Plus,
  Search,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  X,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { BusinessHoursForm, type BusinessHoursState } from "@/components/BusinessHoursForm";
import { 
  useMyStores, 
  useCreateStore, 
  useDeleteStore,
  useStoreById, // 상세 조회를 위해 추가
  // useUpdateStore, // TODO: 백엔드 API 구현 후 주석 해제
  useRegisterAlertRecipient,
  useDeleteAlertRecipient,
  useUpdateAlertRecipient,
} from "@/lib/hooks/useStores";
import type { Store, StoreCreateRequest, BusinessHour, AlertRecipient } from "@/types/api";
import { toast } from "sonner";
// import { useEffect } from "react"; // 수정 기능 비활성화로 미사용

// 전역 window 객체에 daum과 kakao 타입 선언했음
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    daum: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

// TODO: 알림 수신자 목록 API 연동 후 이 더미 데이터는 제거해야 합니다.
const initialAlertRecipients: AlertRecipient[] = [
  { id: 1, name: "김사장", position: "대표", email: "owner@kakaopay.com", active: true },
  { id: 2, name: "김직원", position: "점장", email: "manager@kakaopay.com", active: true },
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

const koreanToDayOfWeek: Record<string, BusinessHour['dayOfWeek']> = {
  '월': 'MONDAY',
  '화': 'TUESDAY',
  '수': 'WEDNESDAY',
  '목': 'THURSDAY',
  '금': 'FRIDAY',
  '토': 'SATURDAY',
  '일': 'SUNDAY',
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
  const { mutate: createStore, isPending: isCreatingStore } = useCreateStore();
  const { mutate: deleteStore } = useDeleteStore();
  // const { mutate: updateStore } = useUpdateStore(); // TODO: 백엔드 API 구현 후 주석 해제
  const { mutate: registerAlertRecipient } = useRegisterAlertRecipient();
  const { mutate: deleteAlertRecipient } = useDeleteAlertRecipient();
  const { mutate: updateAlertRecipient } = useUpdateAlertRecipient();

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

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // 선택된 ID를 기반으로 상세 정보를 가져오는 쿼리
  const { data: selectedStore, isLoading: isStoreDetailLoading } = useStoreById(selectedStoreId!);

  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [alertRecipients, setAlertRecipients] = useState<AlertRecipient[]>(initialAlertRecipients);
  const [newRecipient, setNewRecipient] = useState({ name: "", position: "", email: "" });
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [isBusinessHoursModalOpen, setIsBusinessHoursModalOpen] = useState(false);
  
  // 새 가맹점 추가를 위한 상태
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreBusinessNumber, setNewStoreBusinessNumber] = useState("");
  const [newStoreType, setNewStoreType] = useState<StoreCreateRequest['businessType']>('RESTAURANT');
  const [newStoreBaseAddress, setNewStoreBaseAddress] = useState(""); // 검색된 기본 주소
  const [newStoreDetailAddress, setNewStoreDetailAddress] = useState(""); // 직접 입력한 상세 주소
  const [newStorePhone, setNewStorePhone] = useState("");
  const [newStoreCity, setNewStoreCity] = useState("");
  const [newStoreState, setNewStoreState] = useState("");
  const [newStorePostalCode, setNewStorePostalCode] = useState("");
  const [newStoreLatitude, setNewStoreLatitude] = useState(0);
  const [newStoreLongitude, setNewStoreLongitude] = useState(0);
  const [newStoreBusinessHours, setNewStoreBusinessHours] = useState<BusinessHoursState | null>(null);

  // // 가맹점 정보 수정을 위한 상태 (TODO: 백엔드 API 구현 후 주석 해제)
  // const [editingStorePhone, setEditingStorePhone] = useState("");
  // const [editingStoreAddress, setEditingStoreAddress] = useState("");
  // const [editingBusinessHours, setEditingBusinessHours] = useState<BusinessHoursState | null>(null);

  // useEffect(() => {
  //   if (selectedStore) {
  //     setEditingStorePhone(selectedStore.phone);
  //     setEditingStoreAddress(selectedStore.address);
  //     setEditingBusinessHours(convertBusinessHours(selectedStore.businessHours));
  //   }
  // }, [selectedStore]);

  // Daum 우편번호 검색 및 Kakao 좌표 변환을 처리하는 함수를 작성했음
  const handleAddressSearch = () => {
    if (!window.daum || !window.kakao || !window.kakao.maps) {
      toast.error("주소 검색 서비스 로딩에 실패했습니다. 페이지를 새로고침 해주세요.");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    new window.daum.Postcode({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oncomplete: function(data: any) {
        const roadAddr = data.roadAddress; // 도로명 주소 변수
        
        setNewStorePostalCode(data.zonecode);
        setNewStoreBaseAddress(roadAddr);
        setNewStoreCity(data.sido);
        setNewStoreState(data.sigungu);

        // 주소로 좌표를 검색했음
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geocoder.addressSearch(data.address, function(result: any, status: any) {
             if (status === window.kakao.maps.services.Status.OK) {
                setNewStoreLatitude(parseFloat(result[0].y));
                setNewStoreLongitude(parseFloat(result[0].x));
                toast.success("주소가 좌표로 변환되었습니다.");
             } else {
                toast.error("좌표 변환에 실패했습니다. 위도/경도를 직접 입력해주세요.");
             }
        });
      }
    }).open();
  };


  const handleStoreClick = (store: Store) => {
    // 같은 가맹점을 클릭하면 닫기, 다른 가맹점을 클릭하면 열기
    if (selectedStoreId === store.storeId) {
      setSelectedStoreId(null);
    } else {
      setSelectedStoreId(store.storeId);
    }
  };

  const handleDeleteRecipient = (alertId: number) => {
    if (!selectedStoreId) return;
    
    deleteAlertRecipient({ storeId: selectedStoreId, alertId }, {
      onSuccess: () => {
        toast.success("알림 수신자가 삭제되었습니다.");
        // TODO: 목록 API가 없으므로 임시로 로컬 상태를 업데이트합니다.
        setAlertRecipients(prev => prev.filter(r => r.id !== alertId));
      },
      onError: (error) => {
        toast.error("알림 수신자 삭제에 실패했습니다.", { description: error.message });
      }
    });
  };

  const handleAddRecipient = () => {
    if (!selectedStoreId || !newRecipient.name || !newRecipient.position || !newRecipient.email) {
      toast.error("이름, 직위, 이메일을 모두 입력해주세요.");
      return;
    }

    registerAlertRecipient({ storeId: selectedStoreId, data: newRecipient }, {
      onSuccess: (addedRecipient) => {
        toast.success("알림 수신자가 추가되었습니다.");
        // TODO: 목록 API가 없으므로 임시로 로컬 상태를 업데이트합니다.
        setAlertRecipients(prev => [...prev, addedRecipient]);
        setNewRecipient({ name: "", position: "", email: "" });
        setIsAddingAlert(false);
      },
      onError: (error) => {
        toast.error("알림 수신자 추가에 실패했습니다.", { description: error.message });
      }
    });
  };

  const handleAddStore = () => {
    if (!newStoreBusinessHours) {
      toast.error("영업시간을 설정해주세요.");
      return;
    }

    const businessHours: BusinessHour[] = Object.entries(newStoreBusinessHours)
      .filter(([, val]) => !val.isClosed && val.timeSlots.length > 0)
      .map(([day, val]) => ({
        dayOfWeek: koreanToDayOfWeek[day],
        openTime: (val.timeSlots[0] as { start: string; end: string }).start,
        closeTime: (val.timeSlots[0] as { start: string; end: string }).end,
      }));

    // 기본 주소와 상세 주소를 조합하여 최종 주소를 생성했음
    const fullAddress = `${newStoreBaseAddress} ${newStoreDetailAddress}`.trim();

    const newStoreData: StoreCreateRequest = {
      name: newStoreName,
      businessNumber: newStoreBusinessNumber,
      businessType: newStoreType,
      address: fullAddress, // 조합된 전체 주소를 사용함
      phone: newStorePhone,
      city: newStoreCity,
      state: newStoreState,
      postalCode: newStorePostalCode,
      latitude: newStoreLatitude,
      longitude: newStoreLongitude,
      businessHours: businessHours,
    };

    createStore(newStoreData, {
      onSuccess: () => {
        toast.success("새 가맹점이 성공적으로 등록되었습니다.");
        setIsAddingStore(false);
        // 상태 초기화
        setNewStoreName("");
        setNewStoreBusinessNumber("");
        setNewStoreType("RESTAURANT");
        setNewStoreBaseAddress("");
        setNewStoreDetailAddress("");
        setNewStorePhone("");
        setNewStoreCity("");
        setNewStoreState("");
        setNewStorePostalCode("");
        setNewStoreLatitude(0);
        setNewStoreLongitude(0);
        setNewStoreBusinessHours(null);
      },
      onError: (error) => {
        toast.error("가맹점 등록에 실패했습니다.", { description: error.message });
      }
    });
  };

  const handleDeleteStore = (storeId: number) => {
    if (window.confirm("정말로 이 가맹점을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      deleteStore(storeId, {
        onSuccess: () => {
          toast.success("가맹점이 삭제되었습니다.");
          setSelectedStoreId(null); // 상세 정보 뷰 닫기
        },
        onError: (error) => {
          toast.error("가맹점 삭제에 실패했습니다.", { description: error.message });
        }
      });
    }
  };

  const handleToggleAlertRecipient = (recipient: AlertRecipient) => {
    if (!selectedStoreId) return;

    const updatedData = { active: !recipient.active };

    updateAlertRecipient({ storeId: selectedStoreId, alertId: recipient.id, data: updatedData }, {
      onSuccess: (updatedRecipient) => {
        toast.success(`알림 수신자 상태가 변경되었습니다: ${updatedRecipient.active ? '활성' : '비활성'}`);
        // 로컬 상태 업데이트
        setAlertRecipients(prev => prev.map(r => r.id === updatedRecipient.id ? updatedRecipient : r));
      },
      onError: (error) => {
        toast.error("상태 변경에 실패했습니다.", { description: error.message });
      }
    });
  };

  // const handleUpdateStore = () => {
  //   if (!selectedStore || !editingBusinessHours) return;
  //
  //   const businessHours: BusinessHour[] = Object.entries(editingBusinessHours)
  //     .filter(([, val]) => !val.isClosed && val.timeSlots.length > 0)
  //     .map(([day, val]) => ({
  //       dayOfWeek: koreanToDayOfWeek[day],
  //       openTime: (val.timeSlots[0] as { start: string; end: string }).start,
  //       closeTime: (val.timeSlots[0] as { start: string; end: string }).end,
  //     }));
  //
  //   const updatedData = {
  //     phone: editingStorePhone,
  //     address: editingStoreAddress,
  //     businessHours: businessHours,
  //   };
  //
  //   updateStore({ storeId: selectedStore.storeId, data: updatedData }, {
  //     onSuccess: () => {
  //       toast.success("가맹점 정보가 수정되었습니다.");
  //     },
  //     onError: (error) => {
  //       toast.error("가맹점 정보 수정에 실패했습니다.", { description: error.message });
  //     }
  //   });
  // };

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
                <Input value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">사업자등록번호</label>
                <Input value={newStoreBusinessNumber} onChange={(e) => setNewStoreBusinessNumber(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">업종</label>
                <select
                  value={newStoreType}
                  onChange={(e) => setNewStoreType(e.target.value as StoreCreateRequest['businessType'])}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="RESTAURANT">음식점</option>
                  <option value="CAFE">카페</option>
                  <option value="ETC">기타</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                <Input value={newStorePhone} onChange={(e) => setNewStorePhone(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-[#717182] mb-2 block">주소</label>
                <div className="flex gap-2">
                  <Input value={newStorePostalCode} placeholder="우편번호" readOnly />
                  <Button type="button" variant="outline" onClick={handleAddressSearch}>
                    우편번호 찾기
                  </Button>
                </div>
              </div>
              <div className="col-span-2">
                <Input value={newStoreBaseAddress} placeholder="주소" readOnly />
              </div>
              <div className="col-span-2">
                <Input 
                  value={newStoreDetailAddress}
                  onChange={(e) => setNewStoreDetailAddress(e.target.value)} 
                  placeholder="상세주소 입력" 
                />
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
                    <DialogHeader>
                      <DialogTitle>영업시간 상세 설정</DialogTitle>
                      <DialogDescription>
                        요일별 영업시간과 휴무일을 설정하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <BusinessHoursForm
                      initialState={null}
                      onStateChange={setNewStoreBusinessHours}
                    />
                    <DialogFooter>
                      <Button onClick={() => setIsBusinessHoursModalOpen(false)}>확인</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddingStore(false)}>취소</Button>
              <Button onClick={handleAddStore} disabled={isCreatingStore}>
                {isCreatingStore ? "저장 중..." : "저장"}
              </Button>
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
        {isLoading ? (
          <div className="p-8 text-center text-[#717182]">로딩 중...</div>
        ) : isError ? (
          <div className="p-8 text-center text-[#FF4D4D]">매장 목록을 불러올 수 없습니다.</div>
        ) : !stores || stores.length === 0 ? (
          <div className="p-8 text-center text-[#717182]">등록된 매장이 없습니다.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
                <TableHead className="text-[#333333] pl-6">가맹점명</TableHead>
                <TableHead className="text-[#333333] text-center">매출</TableHead>
                <TableHead className="text-[#333333] text-center">취소율</TableHead>
                <TableHead className="text-[#333333] text-center">알림</TableHead>
                <TableHead className="text-[#333333] text-center">상태</TableHead>
                <TableHead className="text-[#333333] text-center">
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
                <Fragment key={store.storeId}>
                  <TableRow
                    key={store.storeId}
                    className={`border-b border-[rgba(0,0,0,0.08)] hover:bg-[#F5F5F5] cursor-pointer ${
                      selectedStoreId === store.storeId ? 'bg-[#FFFAE6]' : ''
                    }`}
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
                    <TableCell className="text-center">
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
                  {selectedStoreId === store.storeId && (
                    <TableRow key={`${store.storeId}-detail`}>
                      <TableCell colSpan={7} className="bg-[#FAFAFA] p-6">
                        {isStoreDetailLoading ? (
                          <div className="text-center p-8">상세 정보를 불러오는 중...</div>
                        ) : selectedStore ? (
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
                                    <Input defaultValue={selectedStore.phone} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                  </div>
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">주소</label>
                                    <Input defaultValue={selectedStore.address} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                  </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="text-sm text-[#717182]">영업시간</label>
                                      <Dialog open={isBusinessHoursModalOpen} onOpenChange={setIsBusinessHoursModalOpen}>
                                        <DialogTrigger asChild>
                                          {/* 수정 기능 비활성화를 위해 disabled 추가 */}
                                          <Button variant="outline" size="sm" disabled>수정</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>영업시간 상세 설정</DialogTitle>
                                            <DialogDescription>
                                              요일별 영업시간과 휴무일을 설정하세요. (현재는 보기만 가능)
                                            </DialogDescription>
                                          </DialogHeader>
                                          <BusinessHoursForm 
                                            initialState={convertBusinessHours(selectedStore.businessHours)}
                                            onStateChange={() => {}} // 수정 기능 없으므로 빈 함수 전달
                                          />
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
                                <Button disabled>수정 완료</Button>
                              </div>

                              {/* Danger Zone */}
                              <Card className="p-6 mt-6 border-[#FF4D4D] border">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-[#FF4D4D] mb-1">가맹점 삭제</h3>
                                    <p className="text-sm text-[#717182]">가맹점을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
                                  </div>
                                  <Button variant="destructive" className="rounded-lg" onClick={() => handleDeleteStore(selectedStore.storeId)}>
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
                                      <Switch 
                                        checked={recipient.active} 
                                        onCheckedChange={() => handleToggleAlertRecipient(recipient)}
                                      />
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
                        ) : (
                          <div className="text-center p-8 text-red-500">상세 정보를 불러오는 데 실패했습니다.</div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
