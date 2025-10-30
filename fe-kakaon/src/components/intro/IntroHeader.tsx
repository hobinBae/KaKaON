import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoImg from "@/assets/logo.png";

export default function IntroHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="KaKaON Logo" className="h-8" />
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/login">로그인</Link>
          </Button>
          <Button asChild className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90">
            <Link to="/login">무료로 시작하기</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
