import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Home, CreditCard, TrendingUp, Bell, Store, Settings, LogOut, Lock, Menu, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useAlerts, useReadAlert, useUnreadAlertCount, useAlertDetail } from "@/lib/hooks/useAlerts";
import { Alert } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

  const location = useLocation();
  const { selectedStoreId, setSelectedStoreId } = useBoundStore();
  const { mutate: logout } = useLogout();

  const { data: stores, isLoading: isLoadingStores, isError: isErrorStores } = useMyStores();

  const { data: unreadCountData } = useUnreadAlertCount(selectedStoreId!);
  const { data: alertsData } = useAlerts(selectedStoreId!, { checked: false }, 0, 5);
  const { data: selectedAlertDetail } = useAlertDetail(selectedStoreId!, selectedAlertId);
  const { mutate: readAlert } = useReadAlert();

  const alerts = alertsData?.content || [];
  const unreadCount = unreadCountData?.unreadCount || 0;

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlertId(alert.id);
    setIsAlertModalOpen(true);
    if (!alert.checked) {
      readAlert({ storeId: selectedStoreId!, alertId: alert.id });
    }
  };

  const handleModalClose = () => {
    setIsAlertModalOpen(false);
    setSelectedAlertId(null);
  };

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
      <aside
        className={`fixed top-0 left-0 z-20 h-full w-64 bg-[#FAFAFA] border-r border-[rgba(0,0,0,0.06)] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-18 flex items-center justify-center p-4">
          <Link to="/" className="flex items-center gap-2">
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
                <SelectTrigger className="w-[200px] rounded-lg bg-[#F5F5F5]">
                  <SelectValue placeholder={isLoadingStores ? "로딩 중..." : "매장 선택"} />
                </SelectTrigger>
                <SelectContent>
                  {isErrorStores && <SelectItem value="error" disabled>매장 목록을 불러올 수 없습니다.</SelectItem>}
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
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4D4D] rounded-full border-2 border-white"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 mr-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">이상거래 알림</h4>
                    <p className="text-sm text-muted-foreground">
                      {unreadCount > 0 ? `미확인 알림이 ${unreadCount}개 있습니다.` : '새로운 알림이 없습니다.'}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="grid grid-cols-1 items-start pb-4 last:pb-0 cursor-pointer group"
                        onClick={() => handleAlertClick(alert)}
                      >
                        <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none group-hover:underline">
                            {alert.alertType}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true, locale: ko })}
                          </p>
                        </div>
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

        <div className="flex-1 overflow-auto bg-white p-8">
          <Outlet />
        </div>
      </main>

      <Dialog open={isAlertModalOpen} onOpenChange={handleModalClose}>
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
                  <div className="text-[#333333]">{selectedAlertDetail.alertType}</div>
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
                      <div key={p.paymentId} className="p-3 rounded-lg bg-gray-50 text-sm">
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
                <Button variant="outline" className="flex-1 rounded-lg" onClick={handleModalClose}>닫기</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
