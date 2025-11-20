import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useRef, useMemo, useEffect } from "react";
import { Home, CreditCard, TrendingUp, Bell, Store, Settings, LogOut, Lock, Menu, User, X, Bookmark } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoundStore } from "@/stores/storeStore";
import { useMyStores, useFavoriteStore } from "@/lib/hooks/useStores";
import { useLogout } from "@/auth/hooks/useAuth";
import { useAllAlerts, useReadAlert, useAlertDetail } from "@/lib/hooks/useAlerts";
import { useOrderDetail } from "@/lib/hooks/useOrders";
import { getAlertTypeKorean } from "@/lib/utils";
import { Alert } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function TransactionDetail({ orderId }: { orderId: number }) {
  const { data: orderDetail, isLoading } = useOrderDetail(orderId);

  return (
    <Card className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-semibold mb-2">주문상세내역</h3>
      {isLoading ? (
        <div>로딩 중...</div>
      ) : orderDetail ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품명</TableHead>
                <TableHead className="text-right">수량</TableHead>
                <TableHead className="text-right">가격</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderDetail.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{(item.price * item.quantity).toLocaleString()}원</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-right font-bold mt-2">
            합계: {orderDetail.total.toLocaleString()}원
          </div>
        </>
      ) : (
        <div>주문 상세 내역을 불러올 수 없습니다.</div>
      )}
    </Card>
  );
}

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAlertPopoverOpen, setIsAlertPopoverOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<{ alertId: number; storeId: number } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: selectedOrderDetail } = useOrderDetail(selectedOrderId);
  const isOpeningModal = useRef(false);

  const profileImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * 10) + 1;
    return `/profile/p${randomIndex}.PNG`;
  }, []);

  const location = useLocation();
  const { selectedStoreId, setSelectedStoreId, member } = useBoundStore();
  const { mutate: logout } = useLogout();

  const { data: stores, isLoading: isLoadingStores, isError: isErrorStores } = useMyStores();
  const { data: favoriteStore } = useFavoriteStore();

  const sortedStores = useMemo(() => {
    if (!stores) return [];
    const favoriteStoreId = favoriteStore?.storeId;
    return [...stores].sort((a, b) => {
      if (a.storeId === favoriteStoreId) return -1;
      if (b.storeId === favoriteStoreId) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [stores, favoriteStore]);

  // 전체 알림을 가져오는 훅으로 변경
  const { alerts, unreadCount } = useAllAlerts();
  const { data: selectedAlertDetail } = useAlertDetail(selectedAlertId ? String(selectedAlertId.storeId) : null, selectedAlertId ? selectedAlertId.alertId : null);
  const { mutate: readAlert } = useReadAlert();

  useEffect(() => {
    if (unreadCount > 0) {
      const interval = setInterval(() => {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 5000); // 5초 후 애니메이션 클래스 제거
      }, 30000); // 30초마다 반복

      return () => clearInterval(interval);
    }
  }, [unreadCount]);

  useEffect(() => {
    // Zustand-persist로 selectedStoreId가 세션 스토리지에서 복원된 후,
    // 만약 선택된 가맹점이 없다면 (예: 최초 로그인 시) 대표 가맹점을 기본으로 선택합니다.
    // 새로고침 시에는 세션 스토리지의 값이 유지되므로 이 로직이 실행되지 않습니다.
    if (!selectedStoreId && sortedStores && sortedStores.length > 0) {
      setSelectedStoreId(String(sortedStores[0].storeId));
    }
  }, [sortedStores, selectedStoreId, setSelectedStoreId]);

  const handleAlertClick = (alert: Alert & { storeId: number }) => {
    isOpeningModal.current = true;
    setSelectedAlertId({ alertId: alert.id, storeId: alert.storeId });
    setIsAlertModalOpen(true);
    if (!alert.checked) {
      readAlert({ storeId: String(alert.storeId), alertId: alert.id });
    }
  };

  const handleReadAlertClick = (e: React.MouseEvent, alert: Alert & { storeId: number }) => {
    e.stopPropagation(); // 부모 요소의 클릭 이벤트(모달 열기) 방지
    if (!alert.checked) {
      readAlert({ storeId: String(alert.storeId), alertId: alert.id });
    }
  };

  // 모달의 열림/닫힘 상태 변경을 처리하는 함수
  const handleModalOpenChange = (open: boolean) => {
    setIsAlertModalOpen(open);
    if (!open) {
      setSelectedAlertId(null);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: '대시보드', path: '/dashboard' },
    { id: 'transactions', icon: CreditCard, label: '거래내역', path: '/transactions' },
    { id: 'analytics', icon: TrendingUp, label: '매출분석', path: '/analytics' },
    { id: 'alerts', icon: Bell, label: '이상거래 관리', path: '/alerts' },
    { id: 'stores', icon: Store, label: '가맹점 관리', path: '/stores' },
    { id: 'business-hours', icon: Lock, label: '영업 시작/마감', path: '/business-hours' },
  ];

  return (
    <div className="flex h-screen w-full bg-white">
      <aside
        className={`fixed top-0 left-0 z-20 h-full w-64 bg-[#FAFAFA] border-r border-[rgba(0,0,0,0.06)] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-18 flex items-center justify-center p-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logoImg} alt="KaKaON Logo" className="h-12" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.id}
                variant="ghost"
                asChild
                className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-colors text-base ${
                  isActive
                    ? 'bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 hover:text-[#3C1E1E]'
                    : 'text-[#333333] hover:bg-[#F5F5F5]'
                }`}
              >
                <Link to={item.path} onClick={() => setIsSidebarOpen(false)}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
        <div className="p-4 px-6 space-y-3">
          <Button
            asChild
            className="w-full h-11 text-base bg-yellow-300 hover:bg-yellow-400 text-gray-700 rounded-3xl"
          >
            <Link to="/kiosk" onClick={() => setIsSidebarOpen(false)}>
              키오스크 화면으로 전환
            </Link>
          </Button>
          <Button
            asChild
            className="w-full h-11 text-base bg-yellow-300 hover:bg-yellow-400 text-gray-700 rounded-3xl"
          >
            <Link to="/pos" onClick={() => setIsSidebarOpen(false)}>
              포스기 화면으로 전환
            </Link>
          </Button>
        </div>
        <div className="p-4 border-t border-[rgba(0,0,0,0.06)]">
          {member && member.name && (
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full ring-[3px] ring-yellow-300"
                />
                <div className="flex-1">
                  <div className="text-base text-[#333333] font-semibold">
                    {member.name.length > 8 ? `${member.name.substring(0, 8)}..` : member.name}님
                  </div>
                </div>
              </div>
              <Button asChild variant="ghost" size="icon" className="rounded-full w-8 h-8 text-gray-500 hover:text-gray-800">
                <Link to="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-[#717182] hover:text-[#333333] hover:bg-[#F5F5F5]"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <header className="h-16 bg-white border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            {location.pathname !== '/stores' && location.pathname !== '/settings' && (
              <Select
                value={selectedStoreId || ""}
                onValueChange={(val) => setSelectedStoreId(val || null)}
              >
                <SelectTrigger className="min-w-[200px] max-w-[400px] rounded-lg bg-[#F5F5F5]">
                  <SelectValue placeholder={isLoadingStores ? "로딩 중..." : "매장 선택"} />
                </SelectTrigger>
                <SelectContent>
                  {isErrorStores && <SelectItem value="error" disabled>매장 목록을 불러올 수 없습니다.</SelectItem>}
                  {sortedStores && sortedStores.length > 0 ? (
                    sortedStores.map((store) => (
                      <SelectItem key={store.storeId} value={String(store.storeId)}>
                        <div className="flex items-center">
                          {store.storeId === favoriteStore?.storeId && (
                            <Bookmark className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                          )}
                          {store.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-stores" disabled>
                      가맹점을 추가해주세요
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Popover open={isAlertPopoverOpen} onOpenChange={setIsAlertPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={`relative rounded-lg ${shouldShake ? 'animate-shake' : ''}`}>
                  <Bell className="w-5 h-5 text-[#717182]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 mr-4"
                onInteractOutside={(e) => {
                  if (isOpeningModal.current || isAlertModalOpen) {
                    e.preventDefault();
                    isOpeningModal.current = false;
                  }
                }}
              >
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {unreadCount > 0 ? `미확인 알림이 ${unreadCount}개 있습니다.` : '새로운 알림이 없습니다.'}
                    </p>
                  </div>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {alerts.map((alert: Alert & { storeId: number; storeName: string }) => (
                      <div key={alert.id} className="flex items-start justify-between gap-2 pb-4 last:pb-0">
                        <div className="flex-1 cursor-pointer group" onClick={() => handleAlertClick(alert)}>
                          <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none group-hover:underline">
                              <span className="font-bold text-blue-500">[{alert.storeName}]</span> {getAlertTypeKorean(alert.alertType)}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">{alert.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true, locale: ko })}
                            </p>
                          </div>
                        </div>
                        {!alert.checked && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full text-gray-400 hover:text-gray-700"
                            onClick={(e) => handleReadAlertClick(e, alert)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="w-full bg-yellow-300 text-black hover:bg-yellow-400 rounded-3xl" asChild>
                    <Link to="/alerts">모든 알림 보기</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-7 h-7 sm:w-10 sm:h-10 transition-transform duration-200 hover:scale-110">
                  <img src={profileImage} alt="Profile" className="w-full h-full rounded-full ring-2 ring-yellow-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    <span>설정</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-white p-8">
          <Outlet />
        </div>
      </main>

      <Dialog open={isAlertModalOpen} onOpenChange={handleModalOpenChange}>
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
                  <div className="text-[#333333]">{new Date(selectedAlertDetail.detectedAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">유형</div>
                  <div className="text-[#333333]">{getAlertTypeKorean(selectedAlertDetail.alertType)}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">상태</div>
                  <Badge variant={selectedAlertDetail.checked ? "default" : "destructive"} className="rounded">
                    {selectedAlertDetail.checked ? "확인" : "미확인"}
                  </Badge>
                </div>
              </div>

              <Card className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">상세 설명</h3>
                <p className="text-sm text-gray-800">{selectedAlertDetail.description}</p>
              </Card>

              {selectedAlertDetail.payments && selectedAlertDetail.payments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">관련 거래 내역</h4>
                  <div className="space-y-2">
                    {selectedAlertDetail.payments.map(p => (
                      <div key={p.paymentId} className="p-3 rounded-lg bg-gray-50 text-sm cursor-pointer hover:bg-gray-100" onClick={() => setSelectedOrderId(p.orderId)}>
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
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => handleModalOpenChange(false)}>닫기</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle>결제 상세정보</DialogTitle>
          </DialogHeader>
          {selectedOrderDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제시간</div>
                  <div className="text-[#333333]">{format(new Date(selectedOrderDetail.date), 'yyyy.MM.dd (eee) HH:mm', { locale: ko })}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">주문 구분</div>
                  <div className="text-[#333333]">{selectedOrderDetail.orderType}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제수단</div>
                  <div className="text-[#333333]">{selectedOrderDetail.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제 상태</div>
                  <Badge variant={selectedOrderDetail.status === 'cancelled' ? 'destructive' : 'secondary'} className="rounded">
                    {selectedOrderDetail.status === 'completed' ? '완료' : '취소'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">승인번호</div>
                  <div className="text-[#333333]">{selectedOrderDetail.id}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">결제금액</div>
                  <div className="text-[#333333]">{selectedOrderDetail.total.toLocaleString()}원</div>
                </div>
              </div>

              <TransactionDetail orderId={selectedOrderDetail.orderId} />

              {selectedOrderDetail.status === 'cancelled' && (
                <Card className="p-4 bg-[#FF4D4D]/5 border-[#FF4D4D]/20 rounded-lg">
                  <div className="text-sm text-[#FF4D4D]">⚠️ 이 거래는 취소되었습니다. 관련 이상거래 알림을 확인하세요.</div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setSelectedOrderId(null)}>닫기</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
