import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Home, CreditCard, TrendingUp, Bell, Store, Settings, LogOut, Lock, Menu, User, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
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
import { useMyStores } from "@/lib/hooks/useStores";
import { useLogout } from "@/auth/hooks/useAuth";

// 목업 알림 데이터 (상세 정보 포함)
const initialAlerts = [
    { id: 'AL-20251015-001', type: '취소율 급증', time: '2025-10-15 12:30:00', description: '취소율이 전주 대비 60% 증가했습니다. 고객 불만이나 제품 문제를 확인해주세요.', details: { '현재 취소율': '3.2%', '이전 취소율': '2.0%', '증감': '+60%', '영향 받은 거래': 12 } },
    { id: 'AL-20251015-002', type: '동일 결제수단', time: '2025-10-15 10:45:00', description: '동일 결제수단으로 8분 내 3회 결제가 발생했습니다.', details: { cardNumber: '**** **** **** 1234', transactionCount: 3, totalAmount: '145,000원', timeWindow: '8분' } },
];

// figma_mockup의 레이아웃을 기반으로 새로운 AppLayout을 정의합니다.
export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<(typeof initialAlerts)[0] | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedStoreId, setSelectedStoreId } = useBoundStore();
  const { mutate: logout } = useLogout();

  // useMyStores 훅을 사용하여 API로부터 매장 목록을 가져옴
  const { data: stores, isLoading, isError } = useMyStores();

  const removeAlert = (idToRemove: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== idToRemove));
  };

  const handleAlertClick = (alert: (typeof initialAlerts)[0]) => {
    setSelectedAlert(alert);
    // 클릭 시 목록에서 즉시 제거
    removeAlert(alert.id);
  };

  const handleModalClose = () => {
    setSelectedAlert(null);
  };

  // 메뉴 아이템 배열: 아이디, 아이콘, 라벨, 경로를 포함합니다.
  const menuItems = [
    { id: 'dashboard', icon: Home, label: '대시보드', path: '/dashboard' },
    { id: 'transactions', icon: CreditCard, label: '거래내역', path: '/transactions' },
    { id: 'analytics', icon: TrendingUp, label: '매출분석', path: '/analytics' },
    { id: 'alerts', icon: Bell, label: '이상거래 관리', path: '/alerts' },
    { id: 'stores', icon: Store, label: '가맹점 관리', path: '/stores' },
    { id: 'business-hours', icon: Lock, label: '영업 시작/마감', path: '/business-hours' },
    { id: 'settings', icon: Settings, label: '설정', path: '/settings' },
  ];

  return (
    <div className="flex h-screen w-full bg-white">
      {/* --- Sidebar --- */}
      <aside
        className={`fixed top-0 left-0 z-20 h-full w-64 bg-[#FAFAFA] border-r border-[rgba(0,0,0,0.06)] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 로고 */}
        <div className="h-18 flex items-center justify-center p-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="KaKaON Logo" className="h-12" />
          </Link>
        </div>

        {/* 메뉴 네비게이션 */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // useLocation 훅을 사용하여 현재 경로와 메뉴 아이템의 경로를 비교합니다.
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.id}
                variant="ghost"
                asChild // Button 스타일에 Link 컴포넌트의 라우팅 기능을 결합합니다.
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

        {/* 포스기/키오스크 화면 전환 버튼 */}
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

        {/* 사용자 프로필 및 로그아웃 */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FEE500] flex items-center justify-center">
              <span className="text-[#3C1E1E] font-bold">김</span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-[#333333] font-medium">김사장님</div>
              <div className="text-xs text-[#717182]">사장님 카페</div>
            </div>
          </div>
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

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* 헤더 */}
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
            {/* 가맹점 관리 및 설정 페이지를 제외하고 항상 필터를 보여주도록 수정했음 */}
            {location.pathname !== '/stores' && location.pathname !== '/settings' && (
              <Select
                value={selectedStoreId || ""}
                onValueChange={(val) => setSelectedStoreId(val || null)}
              >
                <SelectTrigger className="w-[200px] rounded-lg bg-[#F5F5F5]">
                  <SelectValue placeholder={isLoading ? "로딩 중..." : "매장 선택"} />
                </SelectTrigger>
                <SelectContent>
                  {isError && <SelectItem value="error" disabled>매장 목록을 불러올 수 없습니다.</SelectItem>}
                  {stores && stores.length > 0 ? (
                    stores.map((store) => (
                      <SelectItem key={store.storeId} value={String(store.storeId)}>
                        {store.name}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-lg">
                  <Bell className="w-5 h-5 text-[#717182]" />
                  {alerts.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4D4D] rounded-full border-2 border-white"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 mr-4" onInteractOutside={(e) => e.preventDefault()}>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">이상거래 알림</h4>
                    <p className="text-sm text-muted-foreground">
                      {alerts.length > 0 ? `${alerts.length}개의 새로운 알림이 있습니다.` : '새로운 알림이 없습니다.'}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="grid grid-cols-[1fr_auto] items-start pb-4 last:pb-0 cursor-pointer group"
                      >
                        <div className="grid gap-1" onClick={() => handleAlertClick(alert)}>
                          <p className="text-sm font-medium leading-none group-hover:underline">
                            {alert.type}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.time), { addSuffix: true, locale: ko })}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); removeAlert(alert.id); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                   <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/alerts">모든 알림 보기</Link>
                    </Button>
                </div>
              </PopoverContent>
            </Popover>
            <div className="w-8 h-8 rounded-full bg-[#FEE500] flex items-center justify-center">
              <User className="w-4 h-4 text-[#3C1E1E]" />
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠가 렌더링될 영역 */}
        <div className="flex-1 overflow-auto bg-white p-8">
          <Outlet />
        </div>
      </main>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={setSelectedAlert}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle>알림 상세정보</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#717182] mb-1">알림ID</div>
                  <div className="text-[#333333]">{selectedAlert.id}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">발생시각</div>
                  <div className="text-[#333333]">{selectedAlert.time}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">유형</div>
                  <div className="text-[#333333]">{selectedAlert.type}</div>
                </div>
                <div>
                  <div className="text-sm text-[#717182] mb-1">상태</div>
                  <Badge
                    variant={"default"}
                    className="rounded"
                  >
                    미확인
                  </Badge>
                </div>
              </div>

              <Card className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">상세 설명</h3>
                <p className="text-sm text-gray-800">{selectedAlert.description}</p>
              </Card>

              {selectedAlert.type !== '정산 완료' && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">관련 거래 내역</h4>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-gray-50 text-sm cursor-pointer hover:bg-gray-100" onClick={() => setSelectedTransaction(transactionDetails['TX-20251015-003'])}>
                      <div className="flex justify-between">
                        <span className="font-medium">TX-20251015-003</span>
                        <span className="text-red-500">취소</span>
                      </div>
                      <div className="text-gray-600">15,000원 · 카드결제</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 text-sm cursor-pointer hover:bg-gray-100" onClick={() => setSelectedTransaction(transactionDetails['TX-20251015-008'])}>
                      <div className="flex justify-between">
                        <span className="font-medium">TX-20251015-008</span>
                        <span className="text-red-500">취소</span>
                      </div>
                      <div className="text-gray-600">48,000원 · 카드결제</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={handleModalClose}>닫기</Button>
                <Button className="flex-1 rounded-lg bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FFD700]" onClick={handleModalClose}>
                  확인 완료
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
