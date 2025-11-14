import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoImg from "@/assets/logo.png";
import { useBoundStore } from '@/stores/storeStore';
import { useLogout } from '@/auth/hooks/useAuth';

export default function IntroHeader() {
  const { isLoggedIn } = useBoundStore();
  const { mutate: logout } = useLogout();

  const handleLogin = () => {
    // 카카오 로그인 페이지를 팝업으로 열도록 수정했음
    const url = import.meta.env.VITE_OAUTH2_AUTHORIZE ;
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(url, 'kakaoLogin', `width=${width},height=${height},top=${top},left=${left}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="KaKaON Logo" className="h-9 sm:h-10" />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" asChild className="text-sm sm:text-base">
                <Link to="/dashboard">대시보드</Link>
              </Button>
              <Button onClick={() => logout()} className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 text-sm sm:text-base">
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleLogin} className="text-sm sm:text-base">
                로그인
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
