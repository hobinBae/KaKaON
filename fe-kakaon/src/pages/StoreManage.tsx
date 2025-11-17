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

// 업종 변환 헬퍼 함수
const businessTypeToKorean: Record<string, string> = {
  'RESTAURANT': '음식업',
  'RETAIL': '소매업',
  'LIFE_SERVICE': '생활서비스업',
  'ENTERTAINMENT_SPORTS': '오락/스포츠업',
  'LODGING': '숙박업',
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
    timeSlots: [{ start: '10:00', end: '22:00' }],
  };
  return acc;
}, {} as BusinessHoursState);

// BusinessHour[] 배열을 화면 표시용 객체로 변환
const convertBusinessHours = (businessHours: StoreDetailResponse['businessHours']) => {
  const converted: BusinessHoursState = daysOfWeek.reduce((acc, day) => {
    acc[day] = { isClosed: true, timeSlots: [{ start: '10:00', end: '22:00' }] };
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
  const getSalesData = (store: Store | StoreDetailResponse, period: SalesPeriod) => {
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
  const [alertRecipients, setAlertRecipients] = useState<AlertRecipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({ name: "", position: "", email: "" });

  // 알림 수신자 수정을 위한 상태 추가 (ID 기반으로 변경)
  const [editingRecipientId, setEditingRecipientId] = useState<number | null>(null);
  const [editingRecipientData, setEditingRecipientData] = useState<{ name: string; position: string; email: string } | null>(null);

  // 알림 수신자 삭제 확인 모달을 위한 상태
  const [isDeleteRecipientModalOpen, setIsDeleteRecipientModalOpen] = useState(false);
  const [recipientToDelete, setRecipientToDelete] = useState<number | null>(null);

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
  const [isBusinessNumberErrorModalOpen, setIsBusinessNumberErrorModalOpen] = useState(false);
  const [isRequiredFieldErrorModalOpen, setIsRequiredFieldErrorModalOpen] = useState(false);
  const [isPhoneNumberErrorModalOpen, setIsPhoneNumberErrorModalOpen] = useState(false);
  
  // 새 가맹점 추가를 위한 상태
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreBusinessNumber, setNewStoreBusinessNumber] = useState("");
  const [newStoreType, setNewStoreType] = useState<StoreCreateRequest['businessType']>('RESTAURANT');

  // 사업자번호 포맷팅 함수
  const formatBusinessNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    // 10자리까지만 허용
    const limitedNumbers = numbers.slice(0, 10);

    // XXX-XX-XXXXX 형식으로 포맷팅
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 5) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 5)}-${limitedNumbers.slice(5)}`;
    }
  };

  // 사업자번호 입력 핸들러
  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBusinessNumber(e.target.value);
    setNewStoreBusinessNumber(formatted);
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    // 10~12자리까지만 허용
    const limitedNumbers = numbers.slice(0, 12);

    // 글자 수에 따라 포맷팅
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else if (limitedNumbers.length === 10) {
      // 10자리: XXX-XXX-XXXX
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`;
    } else if (limitedNumbers.length === 11) {
      // 11자리: XXX-XXXX-XXXX
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
    } else if (limitedNumbers.length === 12) {
      // 12자리: XXXX-XXXX-XXXX
      return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4, 8)}-${limitedNumbers.slice(8)}`;
    } else {
      // 7~9자리일 경우 일단 XXX-XXXX- 형식으로
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    }
  };

  // 전화번호 입력 핸들러
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNewStorePhone(formatted);
  };
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
      setEditingStorePhone(formatPhoneNumber(selectedStore.phone));
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

  const openDeleteRecipientModal = (alertId: number) => {
    setRecipientToDelete(alertId);
    setIsDeleteRecipientModalOpen(true);
  };

  const handleDeleteRecipient = () => {
    if (!selectedStoreId || !recipientToDelete) return;

    deleteAlertRecipient({ storeId: selectedStoreId, alertId: recipientToDelete }, {
      onSuccess: () => {
        toast.success("알림 수신자가 삭제되었습니다.");
        // TODO: 목록 API가 없으므로 임시로 로컬 상태를 업데이트합니다.
        setAlertRecipients(prev => prev.filter(r => r.id !== recipientToDelete));
        setIsDeleteRecipientModalOpen(false);
        setRecipientToDelete(null);
      },
      onError: (error) => {
        toast.error("알림 수신자 삭제에 실패했습니다.", { description: error.message });
        setIsDeleteRecipientModalOpen(false);
        setRecipientToDelete(null);
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
    // 필수 입력 항목 검사
    if (!newStoreName || !newStoreBusinessNumber || !newStorePhone || !newStoreBaseAddress || !newStoreDetailAddress || !newStoreBusinessHours) {
      setIsRequiredFieldErrorModalOpen(true);
      return;
    }

    // 사업자번호 유효성 검사
    const businessNumberDigits = newStoreBusinessNumber.replace(/[^\d]/g, '');
    if (businessNumberDigits.length !== 10) {
      setIsBusinessNumberErrorModalOpen(true);
      return;
    }

    // 전화번호 유효성 검사
    const phoneNumberDigits = newStorePhone.replace(/[^\d]/g, '');
    if (phoneNumberDigits.length < 10 || phoneNumberDigits.length > 12) {
      setIsPhoneNumberErrorModalOpen(true);
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
      businessNumber: newStoreBusinessNumber.replace(/[^\d]/g, ''), // 하이픈 제거하고 숫자만 전송
      businessType: newStoreType,
      address: fullAddress, // 조합된 전체 주소를 사용함
      phone: newStorePhone.replace(/[^\d]/g, ''), // 하이픈 제거하고 숫자만 전송
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
      phone: editingStorePhone.replace(/[^\d]/g, ''), // 하이픈 제거하고 숫자만 전송
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
    <div className="space-y-4 md:space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[#333333] mb-1 text-xl md:text-2xl">가맹점 관리</h1>
          <p className="text-sm text-[#717182]">
            여러 매장의 종합 분석 및 정보 관리
          </p>
        </div>
        <Dialog open={isAddingStore} onOpenChange={setIsAddingStore}>
          <DialogTrigger asChild>
            <Button className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              가맹점 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 가맹점 추가</DialogTitle>
              <DialogDescription>추가할 가맹점의 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                <Input value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">사업자등록번호</label>
                <Input
                  value={newStoreBusinessNumber}
                  onChange={handleBusinessNumberChange}
                  placeholder="000-00-00000"
                  maxLength={12}
                />
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
                    <SelectItem value="RESTAURANT">음식업</SelectItem>
                    <SelectItem value="RETAIL">소매업</SelectItem>
                    <SelectItem value="LIFE_SERVICE">생활서비스업</SelectItem>
                    <SelectItem value="ENTERTAINMENT_SPORTS">오락/스포츠업</SelectItem>
                    <SelectItem value="LODGING">숙박업</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                <Input
                  value={newStorePhone}
                  onChange={handlePhoneNumberChange}
                  // placeholder="000-0000-0000"
                  maxLength={14}
                />
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
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
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
      <Card className="p-3 md:p-4 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
          <div className="flex gap-2">
            <Button className="bg-[#333] text-white hover:bg-[#444] rounded-lg px-4 text-sm h-9 sm:h-8 flex-1 sm:flex-initial" onClick={() => setAppliedSearchTerm(searchTerm)}>검색</Button>
            <Button variant="ghost" className="text-gray-500 hover:bg-gray-100 rounded-lg text-sm h-9 sm:h-8 flex-1 sm:flex-initial" onClick={() => {
              setSearchTerm("");
              setAppliedSearchTerm("");
            }}>
              <RotateCw className="w-4 h-4 mr-1" />
              초기화
            </Button>
          </div>
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
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[rgba(0,0,0,0.08)]">
              {filteredStores.map((store) => (
                <div key={store.storeId} className="p-4 space-y-3">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => handleStoreClick(store)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {favoriteStore?.storeId === store.storeId && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        )}
                        <h3 className="font-medium text-[#333333]">{store.name}</h3>
                        <Badge
                          className={`rounded text-xs ${
                            store.status === 'OPEN'
                              ? 'bg-[#4CAF50] text-white'
                              : 'bg-[#717182] text-white'
                          }`}
                        >
                          {store.status === 'OPEN' ? '영업중' : '마감'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-[#717182]">매출: </span>
                          <span className="text-[#333333] font-medium">₩{((store.totalSales ?? 0) / 1000000).toFixed(1)}M</span>
                        </div>
                        <div>
                          <span className="text-[#717182]">취소율: </span>
                          {store.cancelRate !== undefined ? (
                            <Badge
                              variant="outline"
                              className={`rounded text-xs ${
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
                        </div>
                        <div>
                          <span className="text-[#717182]">알림: </span>
                          {(store.unreadCount ?? 0) > 0 ? (
                            <Badge variant="destructive" className="rounded text-xs">
                              {store.unreadCount}건
                            </Badge>
                          ) : (
                            <span className="text-xs text-[#717182]">없음</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGlobalSelectedStoreId(String(store.storeId));
                        navigate('/transactions');
                      }}
                    >
                      거래내역
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGlobalSelectedStoreId(String(store.storeId));
                        navigate('/analytics');
                      }}
                    >
                      매출분석
                    </Button>
                  </div>

                  {/* Mobile Expanded Detail */}
                  {selectedStoreId === store.storeId && (
                    <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                      {isStoreDetailLoading ? (
                        <div className="text-center p-8">상세 정보를 불러오는 중...</div>
                      ) : selectedStore ? (
                        <div className="space-y-4">
                          <Tabs defaultValue="basic" className="w-full">
                            <div className="flex flex-col gap-3">
                              <TabsList className="bg-[#F5F5F5] rounded-lg p-1 w-full">
                                <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E] flex-1">
                                  기본정보
                                </TabsTrigger>
                                <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E] flex-1">
                                  알림설정
                                </TabsTrigger>
                              </TabsList>
                              <div className="flex items-center justify-between">
                                <label htmlFor="favorite-toggle-mobile" className="text-sm font-medium text-gray-700">
                                  대표 가맹점으로 설정
                                </label>
                                <Switch
                                  id="favorite-toggle-mobile"
                                  checked={favoriteStore?.storeId === selectedStore.storeId}
                                  onCheckedChange={() => handleToggleFavorite(selectedStore.storeId)}
                                />
                              </div>
                            </div>

                            <TabsContent value="basic" className="mt-4">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                                  <Input value={editingStoreName} onChange={(e) => setEditingStoreName(e.target.value)} className="rounded-lg" />
                                </div>
                                <div>
                                  <label className="text-sm text-[#717182] mb-2 block">사업자등록번호</label>
                                  <Input value={formatBusinessNumber(selectedStore.businessNumber)} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                </div>
                                <div>
                                  <label className="text-sm text-[#717182] mb-2 block">대표자명</label>
                                  <Input value={selectedStore.ownerName} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                </div>
                                <div>
                                  <label className="text-sm text-[#717182] mb-2 block">업종</label>
                                  <Input value={businessTypeToKorean[selectedStore.businessType]} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                </div>
                                <div>
                                  <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                                  <Input value={editingStorePhone} onChange={(e) => setEditingStorePhone(formatPhoneNumber(e.target.value))} className="rounded-lg" maxLength={14} />
                                </div>
                                <div>
                                  <label className="text-sm text-[#717182] mb-2 block">주소</label>
                                  <Input value={selectedStore.address} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-[#717182]">영업시간</label>
                                    <Dialog open={isBusinessHoursModalOpen} onOpenChange={setIsBusinessHoursModalOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">수정</Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
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
                                          <Button onClick={() => setIsBusinessHoursModalOpen(false)} className="w-full sm:w-auto">확인</Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                  <div className="border rounded-lg p-3 space-y-2 bg-white">
                                    {editingBusinessHours && Object.entries(editingBusinessHours).map(([day, hours]) => (
                                      <div key={day} className="flex items-center text-sm gap-[30px]">
                                        <span className="font-semibold">{day}</span>
                                        {hours.isClosed ? (
                                          <span className="text-gray-500">휴무일</span>
                                        ) : (
                                          <div>
                                            {hours.timeSlots.map((slot, index) => (
                                              <span key={index}>{slot.start} - {slot.end}</span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  <Button onClick={handleUpdateStore} className="w-full">수정 완료</Button>
                                </div>

                                <Card className="p-4 border-[#FF4D4D] border">
                                  <div className="space-y-3">
                                    <div>
                                      <h3 className="text-[#FF4D4D] text-sm font-medium mb-1">가맹점 삭제</h3>
                                      <p className="text-xs text-[#717182]">가맹점을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
                                    </div>
                                    <Button variant="destructive" className="rounded-lg w-full" onClick={() => handleDeleteStore(selectedStore.storeId)}>
                                      가맹점 삭제
                                    </Button>
                                  </div>
                                </Card>
                              </div>
                            </TabsContent>

                            <TabsContent value="alerts" className="mt-4">
                              <div className="space-y-4">
                                {alertRecipients.map((recipient) => (
                                  <Fragment key={recipient.id}>
                                    {editingRecipientId === recipient.id ? (
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
                                        <div className="flex gap-2">
                                          <Button variant="ghost" onClick={() => setEditingRecipientId(null)} className="flex-1">취소</Button>
                                          <Button
                                            className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none flex-1"
                                            onClick={handleUpdateRecipient}
                                          >
                                            저장
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[rgba(0,0,0,0.08)]">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-[#333333] truncate">{recipient.name} ({recipient.position})</p>
                                          <p className="text-xs text-[#717182] truncate">{recipient.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
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
                                          <Button variant="ghost" size="icon" onClick={() => openDeleteRecipientModal(recipient.id)}>
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
                                  <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setIsAddingAlert(false)} className="flex-1">취소</Button>
                                    <Button
                                      className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none flex-1"
                                      onClick={handleAddRecipient}
                                    >
                                      저장
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-center mt-6">
                                <Button
                                  className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none w-full"
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
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
                <TableHead className="text-[#333333] pl-6 md:pl-6">가맹점명</TableHead>
                <TableHead className="text-[#333333] text-center">매출</TableHead>
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
                <TableHead className="text-[#333333] hidden md:table-cell"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <Fragment key={store.storeId}>
                  <TableRow
                    key={store.storeId}
                    className="border-b border-[rgba(0,0,0,0.08)] hover:bg-[#F5F5F5] cursor-pointer"
                    style={{ backgroundColor: selectedStoreId === store.storeId ? '#FFFAE6' : 'transparent' }}
                    onClick={() => handleStoreClick(store)}
                  >
                    <TableCell className="pl-2 md:pl-1.5" style={{ backgroundColor: 'transparent' }}>
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
                    <TableCell className="text-center" style={{ backgroundColor: 'transparent' }}>
                      <div>
                        <p className="text-sm text-[#333333]">
                          ₩{((store.totalSales ?? 0) / 1000000).toFixed(1)}M
                        </p>
                        {/* 상세 정보가 아니므로 변동률 데이터 없음 */}
                      </div>
                    </TableCell>
                    <TableCell className="text-center" style={{ backgroundColor: 'transparent' }}>
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
                    <TableCell className="text-center" style={{ backgroundColor: 'transparent' }}>
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
                    <TableCell className="text-center" style={{ backgroundColor: 'transparent' }}>
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
                    <TableCell className="w-[200px] hidden md:table-cell" style={{ backgroundColor: 'transparent' }}>
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
                    <TableCell className="text-right hidden md:table-cell" style={{ backgroundColor: 'transparent' }}>
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
                      <TableCell colSpan={7} className="bg-[#FAFAFA] p-4 md:p-6">
                        {isStoreDetailLoading ? (
                          <div className="text-center p-8">상세 정보를 불러오는 중...</div>
                        ) : selectedStore ? (
                          <div className="space-y-4 md:space-y-6">
                            <Tabs defaultValue="basic" className="w-full">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                              <TabsList className="bg-[#F5F5F5] rounded-lg p-1 w-full md:w-auto">
                                <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E] flex-1 md:flex-initial">
                                  기본정보
                                </TabsTrigger>
                                <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-[#FEE500] data-[state=active]:text-[#3C1E1E] flex-1 md:flex-initial">
                                  알림설정
                                </TabsTrigger>
                              </TabsList>
                              {/* 대표 가맹점 설정 토글 스위치 추가 */}
                              <div className="flex items-center justify-between md:space-x-2">
                                <label htmlFor="favorite-toggle" className="text-sm font-medium text-gray-700">
                                  대표 가맹점으로 설정
                                </label>
                                <Switch
                                  id="favorite-toggle"
                                  checked={favoriteStore?.storeId === selectedStore.storeId}
                                  onCheckedChange={() => handleToggleFavorite(selectedStore.storeId)}
                                />
                              </div>
                            </div>

                            <TabsContent value="basic" className="mt-4 md:mt-6">
                              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                {/* 왼쪽: 기본 정보 */}
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">상호명</label>
                                    <Input value={editingStoreName} onChange={(e) => setEditingStoreName(e.target.value)} className="rounded-lg" />
                                  </div>
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">대표자명</label>
                                    <Input value={selectedStore.ownerName} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                  </div>
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">전화번호</label>
                                    <Input value={editingStorePhone} onChange={(e) => setEditingStorePhone(formatPhoneNumber(e.target.value))} className="rounded-lg" maxLength={14} />
                                  </div>
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">업종</label>
                                    <Input value={businessTypeToKorean[selectedStore.businessType]} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                  </div>
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">주소</label>
                                    <Input value={selectedStore.address} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                  </div>
                                </div>

                                {/* 오른쪽: 사업자등록번호 & 영업시간 */}
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <label className="text-sm text-[#717182] mb-2 block">사업자등록번호</label>
                                    <Input value={formatBusinessNumber(selectedStore.businessNumber)} className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]" readOnly />
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="text-sm text-[#717182]">영업시간</label>
                                      <Dialog open={isBusinessHoursModalOpen} onOpenChange={setIsBusinessHoursModalOpen}>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" size="sm">수정</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
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
                                            <Button onClick={() => setIsBusinessHoursModalOpen(false)} className="w-full sm:w-auto">확인</Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                    <div className="border rounded-lg p-3 md:p-4 space-y-2 bg-white">
                                      {editingBusinessHours && Object.entries(editingBusinessHours).map(([day, hours]) => (
                                        <div key={day} className="flex items-center text-sm gap-[30px]">
                                          <span className="font-semibold">{day}</span>
                                          {hours.isClosed ? (
                                            <span className="text-gray-500">휴무일</span>
                                          ) : (
                                            <div>
                                              {hours.timeSlots.map((slot, index) => (
                                                <span key={index}>{slot.start} - {slot.end}</span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end mt-4 md:mt-6">
                                <Button onClick={handleUpdateStore} className="w-full md:w-auto">수정 완료</Button>
                              </div>

                              {/* Danger Zone */}
                              <Card className="p-4 md:p-6 border-[#FF4D4D] border mt-4 md:mt-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                  <div>
                                    <h3 className="text-[#FF4D4D] mb-1 text-sm md:text-base">가맹점 삭제</h3>
                                    <p className="text-xs md:text-sm text-[#717182]">가맹점을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
                                  </div>
                                  <Button variant="destructive" className="rounded-lg w-full md:w-auto" onClick={() => handleDeleteStore(selectedStore.storeId)}>
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
                                          <Button variant="ghost" size="icon" onClick={() => openDeleteRecipientModal(recipient.id)}>
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
          </>
        )}
      </Card>

      {/* 필수 입력 항목 오류 모달 */}
      <Dialog open={isRequiredFieldErrorModalOpen} onOpenChange={setIsRequiredFieldErrorModalOpen}>
        <DialogContent className="w-[90vw] max-w-xs">
          <DialogHeader>
            <DialogTitle>입력 오류</DialogTitle>
            <DialogDescription>
              모든 필수 항목을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsRequiredFieldErrorModalOpen(false)} className="w-full">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 사업자번호 오류 모달 */}
      <Dialog open={isBusinessNumberErrorModalOpen} onOpenChange={setIsBusinessNumberErrorModalOpen}>
        <DialogContent className="w-[90vw] max-w-xs">
          <DialogHeader>
            <DialogTitle>사업자번호 오류</DialogTitle>
            <DialogDescription>
              사업자번호는 10자리 숫자여야 합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsBusinessNumberErrorModalOpen(false)} className="w-full">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 전화번호 오류 모달 */}
      <Dialog open={isPhoneNumberErrorModalOpen} onOpenChange={setIsPhoneNumberErrorModalOpen}>
        <DialogContent className="w-[90vw] max-w-xs">
          <DialogHeader>
            <DialogTitle>전화번호 오류</DialogTitle>
            <DialogDescription>
              전화번호는 10~12자리 숫자여야 합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsPhoneNumberErrorModalOpen(false)} className="w-full">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 알림 수신자 삭제 확인 모달 */}
      <Dialog open={isDeleteRecipientModalOpen} onOpenChange={setIsDeleteRecipientModalOpen}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle>알림 수신자 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 알림 수신자를 삭제하시겠습니까?
              <br />
              삭제된 수신자는 더 이상 알림을 받을 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteRecipientModalOpen(false)}
              className="w-full sm:w-auto"
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecipient}
              className="w-full sm:w-auto"
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}