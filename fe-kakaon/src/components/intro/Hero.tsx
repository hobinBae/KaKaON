import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Section from './Section';

export default function Hero() {
  return (
    <Section id="hero" className="relative text-center">
      <div className="absolute inset-0 overflow-hidden z-0">
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
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          복잡한 매출 관리, 카카온으로 간편하게
        </h1>
        <p className="max-w-2xl text-lg text-white/90">
          흩어져 있는 매출 데이터를 한눈에 확인하고, 이상 거래는 실시간으로 감지하세요. 사장님은 비즈니스 성장에만 집중할 수 있도록 카카온이 돕겠습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 rounded-full px-8 py-6 text-base">
            <Link to="/login" data-analytics="hero-cta-primary">
              무료로 시작하기
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-base">
            <Link to="/dashboard" data-analytics="hero-cta-secondary">
              라이브 데모 보기
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
