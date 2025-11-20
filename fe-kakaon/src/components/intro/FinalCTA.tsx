import { Button } from '@/components/ui/button';
import Section from './Section';
import { useBoundStore } from '@/stores/storeStore';
import { Link } from 'react-router-dom';

export default function FinalCTA() {
  const { member } = useBoundStore();
  const handleLogin = () => {
    const url = import.meta.env.VITE_OAUTH2_AUTHORIZE ;
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(url, 'kakaoLogin', `width=${width},height=${height},top=${top},left=${left}`);
  };

  return (
    <Section id="final-cta" className="text-center bg-gray-50 dark:bg-gray-900">
      <div className="space-y-6 md:space-y-8">
        <h2 className="text-3xl sm:text-4xl font-bold px-4 sm:px-0">
          지금 바로 시작하여 <br className="sm:hidden" />
          매출 관리를 혁신하세요
        </h2>
        {member ? (
          <Button asChild size="lg" className="w-full sm:w-auto bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 rounded-full px-8 py-6 text-base">
            <Link to="/dashboard">대시보드 가기</Link>
          </Button>
        ) : (
          <Button size="lg" className="w-full sm:w-auto bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 rounded-full px-8 py-6 text-base" onClick={handleLogin}>
            무료로 시작하기
          </Button>
        )}
      </div>
    </Section>
  );
}
