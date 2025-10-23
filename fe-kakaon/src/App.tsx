import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner"; // sonner로 Toaster 변경
import { AppLayout } from "@/components/layout/AppLayout";
import { useBoundStore } from "@/stores/storeStore";

// 페이지 컴포넌트들을 import 합니다.
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Analytics from "@/pages/Analytics";
import Alerts from "@/pages/Alerts";
import StoreManage from "@/pages/StoreManage";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";

const queryClient = new QueryClient();

// 로그인이 필요한 라우트를 감싸는 PrivateRoute 컴포넌트입니다.
const PrivateRoute = () => {
  const isLoggedIn = useBoundStore((state) => state.isLoggedIn);
  // 로그인 상태이면 자식 라우트(Outlet)를, 아니면 /login으로 리다이렉트합니다.
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/",
    element: <PrivateRoute />, // PrivateRoute가 하위 경로들을 보호합니다.
    children: [
      {
        element: <AppLayout />, // AppLayout은 로그인된 사용자에게만 보입니다.
        children: [
          { index: true, element: <Dashboard /> },
          { path: "transactions", element: <Transactions /> },
          { path: "analytics", element: <Analytics /> },
          { path: "alerts", element: <Alerts /> },
          { path: "stores", element: <StoreManage /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
