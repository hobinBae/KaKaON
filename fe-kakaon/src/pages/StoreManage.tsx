import { useState, Fragment } from "react";
import {
  Plus,
  Search,
  Star,
  X,
  ChevronDown,
  Pencil, // 수정 아이콘 import
  RotateCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoundStore } from "@/stores/storeStore";
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
  useUpdateStore,
  useRegisterAlertRecipient,
  useDeleteAlertRecipient,
  useUpdateAlertRecipient,
  useFavoriteStore, // 즐겨찾기 훅 추가
  useToggleFavoriteStore, // 즐겨찾기 훅 추가
} from "@/lib/hooks/useStores";
import type { Store, StoreDetailResponse, StoreCreateRequest, StoreUpdateRequest, BusinessHour, AlertRecipient, BusinessType } from "@/types/api";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

// 전역 window 객체에 daum과 kakao 타입 선언했음
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    daum: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}


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

const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

const defaultBusinessHours: BusinessHoursState = daysOfWeek.reduce((acc, day) => {
  acc[day] = {
    isClosed: false,
    timeSlots: [{ start: '09:00', end: '18:00' }],
  };
  return acc;
}, {} as BusinessHoursState);

// BusinessHour[] 배열을 화면 표시용 객체로 변환
const convertBusinessHours = (businessHours: StoreDetailResponse['businessHours']) => {
  const converted: BusinessHoursState = daysOfWeek.reduce((acc, day) => {
    acc[day] = { isClosed: true, timeSlots: [{ start: '09:00', end: '18:00' }] };
    return acc;
  }, {} as BusinessHoursState);

  businessHours?.forEach((hour) => {
    const koreanDay = dayOfWeekToKorean[hour.dayOfWeek];
    if (koreanDay) {
      converted[koreanDay] = {
        isClosed: hour.closed,
        timeSlots: [{ start: hour.openTime || '00:00', end: hour.closeTime || '00:00' }],
      };
    }
  });

  return converted;
};

type SalesPeriod = "일별" | "주별" | "월별";

export default function StoreManage() {
  const navigate = useNavigate();
  const { setSelectedStoreId: setGlobalSelectedStoreId } = useBoundStore();
  const queryClient = useQueryClient();
  // API에서 매장 목록 가져오기
  const { data: stores, isLoading, isError } = useMyStores();
  const { mutate: createStore, isPending: isCreatingStore } = useCreateStore();
  const { mutate: deleteStore } = useDeleteStore();
  const { mutate: updateStore } = useUpdateStore();
  const { mutate: registerAlertRecipient } = useRegisterAlertRecipient();
  const { mutate: deleteAlertRecipient } = useDeleteAlertRecipient();
  const { mutate: updateAlertRecipient } = useUpdateAlertRecipient();
  const { data: favoriteStore } = useFavoriteStore(); // 즐겨찾기 데이터 조회
  const { mutate: toggleFavorite } = useToggleFavoriteStore(); // 즐겨찾기 토글 뮤테이션

  // 대표 가맹점 우선, 나머지는 이름순으로 정렬된 목록 생성
  const sortedStores = useMemo(() => {
    if (!stores) return [];
    const favoriteStoreId = favoriteStore?.storeId;
    return [...stores].sort((a, b) => {
      if (a.storeId === favoriteStoreId) return -1;
      if (b.storeId === favoriteStoreId) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [stores, favoriteStore]);

  const [selectedPeriod, setSelectedPeriod] = useState<SalesPeriod>("일별");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  const filteredStores = useMemo(() => {
    if (!sortedStores) return [];
    if (!appliedSearchTerm) return sortedStores;

    return sortedStores.filter(store =>
      store.name.toLowerCase().includes(appliedSearchTerm.toLowerCase())
    );
  }, [sortedStores, appliedSearchTerm]);

  // 기간별 매출 계산 함수 (API에서 todaySales, weeklySales, monthlySales가 제공되면 사용)
  const getSalesData = (store: Store, period: SalesPeriod) => {
    switch (period) {
      case "일별":
        return store.todaySales ?? 0;
      case "주별":
        return store.weeklySales ?? 0;
      case "월별":
        return store.monthlySales ?? 0;
      default:
        return 0;
    }
  };

  const maxSales = stores ? Math.max(...stores.map(s => getSalesData(s, selectedPeriod))) : 0;

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // 선택된 ID를 기반으로 상세 정보를 가져오는 쿼리
  const { data: selectedStore, isLoading: isStoreDetailLoading } = useStoreById(selectedStoreId!);

  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [alertRecipients, setAlertRecipients] = useState<AlertRecipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({ name: "", position: "", email: "" });

  // 알림 수신자 수정을 위한 상태 추가 (ID 기반으로 변경)
  const [editingRecipientId, setEditingRecipientId] = useState<number | null>(null);
  const [editingRecipientData, setEditingRecipientData] = useState<{ name: string; position: string; email: string } | null>(null);

  // selectedStore 데이터가 변경될 때 알림 수신자 목록 상태를 API 응답값으로 업데이트했음
  useEffect(() => {
    if (selectedStore) {
      setAlertRecipients(selectedStore.alertRecipientResponse || []);
    } else {
      // 상세 뷰가 닫히면 목록을 초기화했음
      setAlertRecipients([]);
    }
  }, [selectedStore]);
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
  const [newStoreBusinessHours, setNewStoreBusinessHours] = useState<BusinessHoursState>(defaultBusinessHours);

  // 가맹점 정보 수정을 위한 상태
  const [editingStoreName, setEditingStoreName] = useState("");
  const [editingStorePhone, setEditingStorePhone] = useState("");
  const [editingStoreType, setEditingStoreType] = useState<BusinessType>('RESTAURANT');
  const [editingBusinessHours, setEditingBusinessHours] = useState<BusinessHoursState | null>(null);

  useEffect(() => {
    if (selectedStore) {
      setEditingStoreName(selectedStore.name);
      setEditingStorePhone(selectedStore.phone);
      setEditingStoreType(selectedStore.businessType);
      setEditingBusinessHours(convertBusinessHours(selectedStore.businessHours));
    }
  }, [selectedStore]);

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


  const handleStoreClick = (store: Store | StoreDetailResponse) => {
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
      .map(([day, val]) => ({
        dayOfWeek: koreanToDayOfWeek[day],
        openTime: val.isClosed ? null : (val.timeSlots[0] as { start: string; end: string }).start,
        closeTime: val.isClosed ? null : (val.timeSlots[0] as { start: string; end: string }).end,
        closed: val.isClosed,
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

  const handleUpdateStore = () => {
    if (!selectedStore || !editingBusinessHours) return;
  
    const businessHours: BusinessHour[] = Object.entries(editingBusinessHours)
      .map(([day, val]) => ({
        dayOfWeek: koreanToDayOfWeek[day],
        openTime: val.isClosed ? null : (val.timeSlots[0] as { start: string; end: string }).start,
        closeTime: val.isClosed ? null : (val.timeSlots[0] as { start: string; end: string }).end,
        closed: val.isClosed,
      }));
  
    const updatedData: StoreUpdateRequest = {
      name: editingStoreName,
      phone: editingStorePhone,
      businessType: editingStoreType,
      businessHours: businessHours,
    };
  
    updateStore({ storeId: selectedStore.storeId, data: updatedData }, {
      onSuccess: () => {
        toast.success("가맹점 정보가 수정되었습니다.");
      },
      onError: (error) => {
        toast.error("가맹점 정보 수정에 실패했습니다.", { description: error.message });
      }
    });
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

  const handleToggleFavorite = (storeId: number) => {
    const currentFavoriteId = favoriteStore?.storeId;
    toggleFavorite(storeId, {
      onSuccess: () => {
        // favoriteStore 쿼리를 무효화하여 최신 상태를 다시 불러옵니다.
        queryClient.invalidateQueries({ queryKey: ['favoriteStore'] });
        // 새로운 가맹점이 대표로 설정된 경우에만 토스트를 표시합니다.
        if (currentFavoriteId !== storeId) {
          toast.success("대표 가맹점으로 설정되었습니다.");
        }
      },
      onError: (error) => {
        toast.error("대표 가맹점 설정에 실패했습니다.", { description: error.message });
      }
    });
  };

  // 알림 수신자 정보 수정을 처리하는 함수 추가
  const handleUpdateRecipient = () => {
    if (!selectedStoreId || !editingRecipientId || !editingRecipientData) {
      toast.error("수정할 수신자 정보가 없습니다.");
      return;
    }

    updateAlertRecipient({ storeId: selectedStoreId, alertId: editingRecipientId, data: editingRecipientData }, {
      onSuccess: (updatedRecipient) => {
        toast.success("알림 수신자 정보가 수정되었습니다.");
        setAlertRecipients(prev => prev.map(r => r.id === updatedRecipient.id ? updatedRecipient : r));
        setEditingRecipientId(null);
        setEditingRecipientData(null);
      },
      onError: (error) => {
        toast.error("알림 수신자 수정에 실패했습니다.", { description: error.message });
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
                <Select
                  value={newStoreType}
                  onValueChange={(value) => setNewStoreType(value as StoreCreateRequest['businessType'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="업종을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESTAURANT">음식점</SelectItem>
                    <SelectItem value="CAFE">카페</SelectItem>
                    <SelectItem value="ETC">기타</SelectItem>
                  </SelectContent>
                </Select>
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
                  <DialogContent>
                    <DialogHeader className="text-left">
                      <DialogTitle>영업시간 상세 설정</DialogTitle>
                      <DialogDescription>
                        요일별 영업시간과 휴무일을 설정하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <BusinessHoursForm
                      initialState={newStoreBusinessHours}
                      onStateChange={setNewStoreBusinessHours}
                    />
                    <DialogFooter className="sm:justify-center">
                      <Button onClick={() => setIsBusinessHoursModalOpen(false)} className="w-full sm:w-auto">확인</Button>
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
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]" />
            <Input
              placeholder="가맹점명 검색"
              className="pl-9 rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAppliedSearchTerm(searchTerm);
                }
              }}
            />
          </div>
          <Button className="bg-[#333] text-white hover:bg-[#444] rounded-lg px-4 text-sm h-8" onClick={() => setAppliedSearchTerm(searchTerm)}>검색</Button>
          <Button variant="ghost" className="text-gray-500 hover:bg-gray-100 rounded-lg text-sm h-8" onClick={() => {
            setSearchTerm("");
            setAppliedSearchTerm("");
          }}>
            <RotateCw className="w-4 h-4 mr-1" />
            초기화
          </Button>
        </div>
      </Card>

      {/* Store Table */}
      <Card className="rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#717182]">로딩 중...</div>
        ) : isError ? (
          <div className="p-8 text-center text-[#FF4D4D]">매장 목록을 불러올 수 없습니다.</div>
        ) : !filteredStores || filteredStores.length === 0 ? (
          <div className="p-8 text-center text-[#717182]">
            {appliedSearchTerm ? "검색 결과가 없습니다." : "등록된 매장이 없습니다."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
                <TableHead className="text-[#333333] pl-6 md:pl-6">가맹점명</TableHead>
                <TableHead className="text-[#333333] text-center">오늘매출</TableHead>
                <TableHead className="text-[#333333] text-center">취소율</TableHead>
                <TableHead className="text-[#333333] text-center">알림</TableHead>
                <TableHead className="text-[#333333] text-center">상태</TableHead>
                <TableHead className="text-[#333333] text-center hidden md:table-cell">
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
              {filteredStores.map((store) => (
                <Fragment key={store.storeId}>
                  <TableRow
                    key={store.storeId}
                    className={`border-b border-[rgba(0,0,0,0.08)] hover:bg-[#F5F5F5] cursor-pointer ${
                      selectedStoreId === store.storeId ? 'bg-[#FFFAE6]' : ''
                    }`}
                    onClick={() => handleStoreClick(store)}
                  >
                    <TableCell className="pl-2 md:pl-1.5">
                      <div className="flex items-center gap-1">
                        {/* 별 아이콘을 위한 고정 너비 컨테이너 추가 */}
                        <div className="w-4 h-4 flex-shrink-0">
                          {favoriteStore?.storeId === store.storeId && (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                        <span className="text-sm text-[#333333] truncate">{store.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>
                        <p className="text-sm text-[#333333]">
                          ₩{(store.todaySales ?? 0).toLocaleString()}
                        </p>
                        {/* 상세 정보가 아니므로 변동률 데이터 없음 */}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {store.todayCancelRate !== undefined ? (
                        <Badge
                          variant="outline"
                          className={`rounded ${
                            store.todayCancelRate > 3.5
                              ? "border-[#FF4D4D] text-[#FF4D4D]"
                              : "border-[#717182] text-[#717182]"
                          }`}
                        >
                          {store.todayCancelRate}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-[#717182]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {/* 목록 조회 시에는 unreadCount를 사용 */}
                      {(store.unreadCount ?? 0) > 0 ? (
                        <Badge
                          variant="destructive"
                          className="rounded"
                        >
                          {store.unreadCount}건
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
                        {store.status === 'OPEN' ? '영업중' : '마감'}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[200px] hidden md:table-cell">
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
                    <TableCell className="text-right hidden md:table-cell">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg h-8 px-3 text-xs border-gray-300 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation(); // 행 클릭 이벤트 전파 방지
                            setGlobalSelectedStoreId(String(store.storeId));
                            navigate('/transactions');
                          }}
                        >
                          거래내역
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg h-8 px-3 text-xs border-gray-300 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation(); // 행 클릭 이벤트 전파 방지
                            setGlobalSelectedStoreId(String(store.storeId));
                            navigate('/analytics');
                          }}
                        >
                          매출분석
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
                            <Tabs defaultValue="basic" className="w-full">
                            <div className="flex items-center justify-between">
                              <TabsList className="bg-[#F5F5F5] rounded-lg p-1">
                                <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                                  기본정보
                                </TabsTrigger>
                                <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E]">
                                  알림설정
                                </TabsTrigger>
                              </TabsList>
                              {/* 대표 가맹점 설정 토글 스위치 추가 */}
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="favorite-toggle"
                                  checked={favoriteStore?.storeId === selectedStore.storeId}
                                  onCheckedChange={() => handleToggleFavorite(selectedStore.storeId)}
                                />
                                <label htmlFor="favorite-toggle" className="text-sm font-medium text-gray-700">
                                  대표 가맹점으로 설정
                                </label>
                              </div>
                            </div>

                            <TabsContent value="basic" className="mt-6">
                              <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                                  <Input value={editingStoreName} onChange={(e) => setEditingStoreName(e.target.value)} className="rounded-lg" />
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
                                    <Select value={editingStoreType} onValueChange={(v) => setEditingStoreType(v as BusinessType)}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="RESTAURANT">음식점</SelectItem>
                                        <SelectItem value="CAFE">카페</SelectItem>
                                        <SelectItem value="ETC">기타</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                                    <Input value={editingStorePhone} onChange={(e) => setEditingStorePhone(e.target.value)} className="rounded-lg" />
                                  </div>
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">주소</label>
                                    <Input value={selectedStore.address} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
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
                                          <BusinessHoursForm 
                                            initialState={convertBusinessHours(selectedStore.businessHours)}
                                            onStateChange={setEditingBusinessHours}
                                          />
                                          <DialogFooter>
                                            <Button onClick={() => setIsBusinessHoursModalOpen(false)}>확인</Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  <div className="border rounded-lg p-4 space-y-2 bg-white">
                                    {editingBusinessHours && Object.entries(editingBusinessHours).map(([day, hours]) => (
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
                                <Button onClick={handleUpdateStore}>수정 완료</Button>
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
                                  <Fragment key={recipient.id}>
                                    {editingRecipientId === recipient.id ? (
                                      // 수정 모드 폼
                                      <div className="p-4 bg-white rounded-lg border border-[rgba(0,0,0,0.08)] space-y-4">
                                        <Input
                                          placeholder="이름"
                                          className="rounded-lg"
                                          value={editingRecipientData?.name || ''}
                                          onChange={(e) => setEditingRecipientData({ ...editingRecipientData!, name: e.target.value })}
                                        />
                                        <Input
                                          placeholder="직위"
                                          className="rounded-lg"
                                          value={editingRecipientData?.position || ''}
                                          onChange={(e) => setEditingRecipientData({ ...editingRecipientData!, position: e.target.value })}
                                        />
                                        <Input
                                          type="email"
                                          placeholder="이메일 주소"
                                          className="rounded-lg"
                                          value={editingRecipientData?.email || ''}
                                          onChange={(e) => setEditingRecipientData({ ...editingRecipientData!, email: e.target.value })}
                                        />
                                        <div className="flex justify-end gap-2">
                                          <Button variant="ghost" onClick={() => setEditingRecipientId(null)}>취소</Button>
                                          <Button
                                            className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none"
                                            onClick={handleUpdateRecipient}
                                          >
                                            저장
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      // 일반 표시 모드
                                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[rgba(0,0,0,0.08)]">
                                        <div>
                                          <p className="text-sm text-[#333333]">{recipient.name} ({recipient.position})</p>
                                          <p className="text-xs text-[#717182]">{recipient.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Switch
                                            checked={recipient.active}
                                            onCheckedChange={() => handleToggleAlertRecipient(recipient)}
                                          />
                                          <Button variant="ghost" size="icon" onClick={() => {
                                            setEditingRecipientId(recipient.id);
                                            setEditingRecipientData({ name: recipient.name, position: recipient.position, email: recipient.email });
                                          }}>
                                            <Pencil className="w-4 h-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRecipient(recipient.id)}>
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </Fragment>
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
