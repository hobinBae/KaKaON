import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
  const subtitleLine1 = "흩어져 있는 매출 데이터를 한눈에 확인하고, 이상 거래는 실시간으로 감지하세요.";
  const subtitleLine2 = "사장님은 비즈니스 성장에만 집중할 수 있도록 카카온이 돕겠습니다.";

  const handleLogin = () => {
    const url = import.meta.env.VITE_OAUTH2_AUTHORIZE ;
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(url, 'kakaoLogin', `width=${width},height=${height},top=${top},left=${left}`);
  };

  return (
    <section id="hero" className="relative w-full text-center overflow-hidden">
      {/* Full-width background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/images/hero-poster.jpg"
          aria-label="카카온 대시보드 기능 시연 영상"
          preload="eager"
        >
          <source src="/videos/hero-video.webm" type="video/webm" />
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Constrained content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-24">
        <div className="flex flex-col items-center space-y-6">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
          <TypingAnimation duration={1.5}>
            복잡한 매출 관리, <span className="text-primary">카카온</span>으로 간편하게
          </TypingAnimation>
        </h1>
        <p
          className="max-w-3xl text-lg text-white/90 opacity-0 animate-slide-bottom"
          style={{ animationDelay: '1.6s' }}
        >
          {subtitleLine1}
          <br />
          {subtitleLine2}
        </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 rounded-full px-8 py-6 text-base" onClick={handleLogin}>
              무료로 시작하기
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-base">
              <Link to="/dashboard" data-analytics="hero-cta-secondary">
                라이브 데모 보기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
