import { ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/lib/hooks';

interface SlideInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function SlideInView({
  children,
  className,
  delay = 0,
}: SlideInViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isVisible = useIntersectionObserver(ref, {
    threshold: 0.1,
  });

  const animationStyle = {
    animationDelay: `${delay}s`,
  };

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0', // 기본적으로 투명하게 설정
        isVisible && 'animate-slide-bottom', // 보일 때 애니메이션 적용
        className
      )}
      style={animationStyle}
    >
      {children}
    </div>
  );
}
