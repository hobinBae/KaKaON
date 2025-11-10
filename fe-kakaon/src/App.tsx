import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner"; // sonner로 Toaster 변경
import { AppLayout } from "@/components/layout/AppLayout";
import { useBoundStore } from "@/stores/storeStore";
import AuthProvider from "@/auth/AuthProvider";

// 페이지 컴포넌트들을 import 합니다.
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Analytics from "@/pages/Analytics";
import Alerts from "@/pages/Alerts";
import StoreManage from "@/pages/StoreManage";
import Settings from "@/pages/Settings";
import LoginCallback from "@/pages/LoginCallback";
import Pos from "@/pages/Pos";
import KioskLanding from "@/pages/KioskLanding";
import FrontKiosk from "@/pages/FrontKiosk";
import GeneralKiosk from "@/pages/GeneralKiosk";
import Intro from "@/pages/Intro";
import BusinessHours from "@/pages/BusinessHours";


const queryClient = new QueryClient();

// 로그인이 필요한 라우트를 감싸는 PrivateRoute 컴포넌트입니다.
const PrivateRoute = () => {
  const isLoggedIn = useBoundStore((state) => state.isLoggedIn);
  // 로그인 상태이면 자식 라우트(Outlet)를, 아니면 인트로 페이지('/')로 리다이렉트합니다.
  return isLoggedIn ? <Outlet /> : <Navigate to="/" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Intro />,
  },
  {
    path: "/auth/callback",
    element: <LoginCallback />,
  },
  {
    path: "/pos",
    element: <Pos />,
  },
  {
    path: "/kiosk",
    element: <KioskLanding />,
  },
  {
    path: "/kiosk/front",
    element: <FrontKiosk />,
  },
  {
    path: "/kiosk/general",
    element: <GeneralKiosk />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/transactions", element: <Transactions /> },
          { path: "/analytics", element: <Analytics /> },
          { path: "/alerts", element: <Alerts /> },
          { path: "/stores", element: <StoreManage /> },
          { path: "/settings", element: <Settings /> },
          { path: "/business-hours", element: <BusinessHours /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
