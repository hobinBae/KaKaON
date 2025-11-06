import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoImg from "@/assets/logo.png";
import { useBoundStore } from '@/stores/storeStore';
import { useLogout } from '@/lib/hooks/useAuth';

export default function IntroHeader() {
  const { isLoggedIn } = useBoundStore();
  const { mutate: logout } = useLogout();

  const handleLogin = () => {
    // 카카오 로그인 페이지를 팝업으로 열도록 수정했음
    // const backendUrl = (import.meta.env.VITE_API_BASE_URL || '').replace('/api/v1', '');
    // const url = `${backendUrl}/oauth2/authorization/kakao`;
    const url = import.meta.env.VITE_OAUTH2_AUTHORIZE ;
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(url, 'kakaoLogin', `width=${width},height=${height},top=${top},left=${left}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="KaKaON Logo" className="h-8" />
        </Link>
        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">대시보드 가기</Link>
              </Button>
              <Button onClick={() => logout()} className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90">
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleLogin}>
                로그인
              </Button>
              <Button onClick={handleLogin} className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90">
                무료로 시작하기
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
