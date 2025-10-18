// src/components/layout/AppLayout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useStoreSelection } from "@/stores/storeStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export function AppLayout() {
  const { selectedStoreId, stores, setSelectedStoreId } = useStoreSelection();
  const location = useLocation();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] grid-rows-[56px_1fr]">
      {/* Header */}
      <header className="col-span-2 border-b px-4 flex items-center justify-between">
        <Link to="/" className="font-bold">
          KakaoPay Franchise
        </Link>

        <div className="flex items-center gap-3">
          <Select
            value={selectedStoreId ?? "all"}
            onValueChange={(val) => setSelectedStoreId(val === "all" ? null : val)}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="가맹점 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 가맹점</SelectItem>
              {stores.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" asChild>
            <Link to="/settings">설정</Link>
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="border-r p-3">
        <nav className="flex flex-col gap-2 text-sm">
          <NavLink to="/" current={location.pathname === "/"}>
            대시보드
          </NavLink>
          <NavLink to="/transactions" current={location.pathname.startsWith("/transactions")}>
            거래내역
          </NavLink>
          <NavLink to="/analytics" current={location.pathname.startsWith("/analytics")}>
            매출분석
          </NavLink>
          <NavLink to="/alerts" current={location.pathname.startsWith("/alerts")}>
            이상거래 알림
          </NavLink>
          <NavLink to="/stores" current={location.pathname.startsWith("/stores")}>
            가맹점 관리
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({
  to,
  children,
  current
}: {
  to: string;
  children: React.ReactNode;
  current: boolean;
}) {
  return (
    <Link
      to={to}
      className={`rounded px-3 py-2 ${
        current
          ? "bg-neutral-100 dark:bg-neutral-800 font-medium"
          : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
      }`}
    >
      {children}
    </Link>
  );
}
