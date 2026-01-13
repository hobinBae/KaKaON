import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect, ReactNode, Suspense } from 'react';
import { useBoundStore } from '@/stores/storeStore';
import { cn } from '@/lib/utils';
import TestLoginModal from '@/components/auth/TestLoginModal';
import HeroBackground3D from './HeroBackground3D';

interface TypingAnimationProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

function TypingAnimation({
  children,
  className,
  duration = 2,
  delay = 0,
}: TypingAnimationProps) {
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    const totalDuration = (duration + delay) * 1000;
    const timer = setTimeout(() => {
      setIsAnimationDone(true);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [duration, delay]);

  // 텍스트 길이를 기반으로 steps를 계산합니다.
  // ReactNode를 문자열로 변환하여 길이를 계산합니다.
  const getTextLength = (node: ReactNode): number => {
    if (typeof node === 'string') {
      return node.length;
    }
    if (Array.isArray(node)) {
      return node.reduce((acc, curr) => acc + getTextLength(curr), 0);
    }
    if (typeof node === 'object' && node !== null && 'props' in node) {
      return getTextLength(node.props.children);
    }
    return 0;
  };

  const steps = getTextLength(children);

  const typingStyles = {
    '--typing-duration': `${duration}s`,
    '--typing-steps': steps,
    '--animation-delay': `${delay}s`,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        'relative inline-block border-r-2',
        !isAnimationDone && 'overflow-hidden whitespace-nowrap animate-typing-width',
        isAnimationDone ? 'border-r-transparent' : 'animate-blink-caret border-r-black',
        className,
      )}
      style={typingStyles}
    >
      {children}
    </div>
  );
}

export default function Hero() {
  const { member } = useBoundStore();
  const subtitleLine1 = "흩어져 있는 매출 데이터를 AI로 한눈에 정리하고, 이상 거래를 실시간으로 감지하세요.";
  const subtitleLine2 = "사장님은 비즈니스 성장에만 집중할 수 있도록 카카온이 돕겠습니다.";

  const handleLogin = () => {
    // 카카오 로그인 페이지로 직접 리디렉션
    window.location.href = import.meta.env.VITE_OAUTH2_AUTHORIZE;
  };

  return (
    <section id="hero" className="relative w-full text-center overflow-hidden">
      {/* Full-width background */}
      <Suspense fallback={<div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FFDB58] to-[#FFFFFF]" />}>
        <HeroBackground3D />
      </Suspense>

      {/* Constrained content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 lg:py-28">
        <div className="flex flex-col items-center space-y-6 md:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#3C1E1E] text-center w-full overflow-hidden">
            <TypingAnimation duration={1.5}>
              복잡한 매출 관리, <br className="sm:hidden" />
              <span className="text-[#E56717]">카카온</span>으로 간편하게
            </TypingAnimation>
          </h1>
          <p
            className="max-w-xl md:max-w-3xl text-base sm:text-lg font-semibold text-[#3C1E1E]/90 opacity-0 animate-slide-bottom text-center"
            style={{ animationDelay: '1.6s' }}
          >
            {subtitleLine1}
            <br className="hidden md:block" />
            {subtitleLine2}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            {member ? (
              <Button asChild size="lg" className="w-full sm:w-auto bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 rounded-full px-8 py-6 text-base shadow-lg">
                <Link to="/analytics">매출분석 확인하기</Link>
              </Button>
            ) : (
              <Button size="lg" className="w-full sm:w-auto bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 rounded-full px-8 py-6 text-base shadow-lg" onClick={handleLogin}>
                무료로 시작하기
              </Button>
            )}
            {!member && (
              <TestLoginModal 
                trigger={
                  <Button size="lg" variant="outline" className="bg-transparent border-[#3C1E1E] text-[#3C1E1E] hover:bg-[#3C1E1E]/10 rounded-full px-8 py-6 text-base">
                    테스트 ID 로그인
                  </Button>
                } 
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
