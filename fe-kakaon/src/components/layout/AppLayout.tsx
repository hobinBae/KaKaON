import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, CreditCard, TrendingUp, Bell, Store, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoundStore } from "@/stores/storeStore";

// figma_mockup의 레이아웃을 기반으로 새로운 AppLayout을 정의합니다.
export function AppLayout() {
  const location = useLocation();
  const { selectedStoreId, stores, setSelectedStoreId, logout } = useBoundStore();

  // 메뉴 아이템 배열: 아이디, 아이콘, 라벨, 경로를 포함합니다.
  const menuItems = [
    { id: 'dashboard', icon: Home, label: '대시보드', path: '/' },
    { id: 'transactions', icon: CreditCard, label: '거래내역', path: '/transactions' },
    { id: 'analytics', icon: TrendingUp, label: '매출분석', path: '/analytics' },
    { id: 'alerts', icon: Bell, label: '이상거래 알림', path: '/alerts' },
    { id: 'stores', icon: Store, label: '가맹점 관리', path: '/stores' },
    { id: 'settings', icon: Settings, label: '설정', path: '/settings' },
  ];

  return (
    <div className="flex h-screen w-full bg-white">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-[#FAFAFA] border-r border-[rgba(0,0,0,0.06)] flex flex-col">
        {/* 로고 */}
        <div className="h-16 flex items-center p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEE500] flex items-center justify-center">
              <span className="text-[#3C1E1E] font-bold">K</span>
            </div>
            <div>
              <div className="text-[#333333] font-bold">KakaoPay</div>
              <div className="text-xs text-[#717182]">Franchise</div>
            </div>
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
                <Link to={item.path}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

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
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="h-16 bg-white border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {/* 가맹점 관리 페이지가 아닐 때만 필터를 보여줍니다. */}
            {location.pathname !== '/stores' && (
              <Select
                value={selectedStoreId ?? ""}
                onValueChange={(val) => setSelectedStoreId(val)}
              >
                <SelectTrigger className="w-[200px] rounded-lg bg-[#F5F5F5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative rounded-lg">
              <Bell className="w-5 h-5 text-[#717182]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4D4D] rounded-full border-2 border-white"></span>
            </Button>
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
    </div>
  );
}
