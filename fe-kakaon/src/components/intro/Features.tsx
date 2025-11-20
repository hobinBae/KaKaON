import Section from './Section';
import { ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/lib/hooks';

interface SlideInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function SlideInView({
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

const features = [
  {
    title: '실시간 매출 분석',
    description: '카드, 현금, 배달 앱 등 모든 결제 수단의 매출을 실시간으로 집계하여 한눈에 보여줍니다. 시간대별, 메뉴별 판매량, 취소율 분석, 가맹점별 매출관리로 수익성을 극대화하세요.',
    image: '/gifs/대시보드.gif',
    imageAlt: '매출 분석 대시보드 시연',
  },
  {
    title: '세밀한 이상거래 탐지',
    description: '동일한 결제수단, 시간 외 거래, 반복결제, 고액결제, 거래빈도, 취소율 급증 평소와 다른 결제 패턴을 발견하면 즉시 알림을 보냅니다. 카드 도용이나 영업시간 외 거래를 방지하세요.',
    image: '/gifs/이상거래 동일 결제 수단.gif',
    imageAlt: '이상거래 탐지 시연',
  },
  {
    title: '포스기 / 키오스크 서비스 제공',
    description: '커스텀이 가능한 포스기 시스템과 일반 키오스크, 프론트 키오스크를 제공합니다. 별도의 프로그램 없이 한번에 이용하세요.',
    image: '/gifs/키오스크 화면 및 포스기 결제.gif',
    imageAlt: '키오스크 및 포스기 시연',
  },
];

export default function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="text-center space-y-3 md:space-y-4 mb-16 md:mb-24">
          <h2 className="text-3xl sm:text-4xl font-bold">사장님을 위한 똑똑한 기능들</h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4 sm:px-0">
            매장 운영에 꼭 필요한 기능만 모아, 복잡함은 덜고 효율성은 높였습니다.
          </p>
        </div>
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-center"
            >
              <div className={`space-y-4 text-center lg:text-left lg:col-span-2 ${index % 2 === 1 ? 'lg:order-last' : ''}`}>
                <h3 className="text-2xl sm:text-3xl font-bold relative pb-3 md:pb-4 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 lg:after:left-0 lg:after:translate-x-0 after:w-12 after:h-1 after:bg-primary">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <SlideInView className={`${index % 2 === 1 ? 'lg:order-first' : ''} w-full lg:col-span-3`}>
                <img
                  src={feature.image}
                  alt={feature.imageAlt}
                  className="rounded-xl border border-gray-200 shadow-2xl w-full h-auto object-cover"
                  loading="lazy"
                />
              </SlideInView>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
