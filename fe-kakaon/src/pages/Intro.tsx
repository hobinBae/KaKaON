import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoundStore } from '@/stores/storeStore';
import { setToken } from '@/lib/apiClient';
import Hero from '@/components/intro/Hero';
import Benefits from '@/components/intro/Benefits';
import Features from '@/components/intro/Features';
import HowItWorks from '@/components/intro/HowItWorks';
import SocialProof from '@/components/intro/SocialProof';
import FAQ from '@/components/intro/FAQ';
import FinalCTA from '@/components/intro/FinalCTA';
import IntroHeader from '@/components/intro/IntroHeader';
import IntroFooter from '@/components/intro/IntroFooter';

export default function Intro() {
  const navigate = useNavigate();
  const { login } = useBoundStore();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // origin을 체크하여 신뢰할 수 있는 메시지만 처리
      if (event.origin !== window.location.origin) {
        return;
      }

      const { type, accessToken, member } = event.data;
      if (type === 'LOGIN_SUCCESS' && accessToken) {
        setToken(accessToken);
        // 임시 member 객체 또는 실제 전달받은 member 객체 사용
        login(member || { memberId: 0, email: '', nickname: '', provider: 'KAKAO', role: 'USER' });
        navigate('/dashboard');
      } else if (type === 'LOGIN_FAILURE') {
        alert('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    };

    window.addEventListener('message', handleMessage);

    // 컴포넌트가 언마운트될 때 이벤트 리스너를 정리
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate, login]);

  return (
    <div className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white overflow-hidden">
      <IntroHeader />
      <main>
        <Hero />
        <Benefits />
        <Features />
        <HowItWorks />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <IntroFooter />
    </div>
  );
}
