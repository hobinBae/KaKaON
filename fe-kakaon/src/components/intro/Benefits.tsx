import { BarChart, ShieldCheck, Zap } from 'lucide-react';
import Section from './Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const benefits = [
  {
    icon: <BarChart className="w-8 h-8 text-[#FEE500]" />,
    title: '매출 데이터 통합 분석',
    description: '여러 채널의 매출을 자동으로 집계하고 시각화하여 비즈니스 현황을 한눈에 파악할 수 있습니다.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-[#FEE500]" />,
    title: '이상 거래 실시간 탐지',
    description: '의심스러운 결제 패턴이나 비정상적인 취소 요청을 즉시 감지하여 금융 사고를 예방합니다.',
  },
  {
    icon: <Zap className="w-8 h-8 text-[#FEE500]" />,
    title: '운영 효율성 극대화',
    description: '수작업으로 처리하던 정산 및 보고서 작성을 자동화하여 시간과 비용을 절약할 수 있습니다.',
  },
];

export default function Benefits() {
  return (
    <Section id="benefits">
      <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold">카카온이 제공하는 핵심 가치</h2>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4 sm:px-0">
          단순한 매출 조회를 넘어, 데이터 기반의 스마트한 매장 관리를 경험해보세요.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="text-center p-2">
            <CardHeader className="pb-4">
              <div className="mx-auto bg-gray-100 dark:bg-gray-800 rounded-full p-4 w-fit">
                {benefit.icon}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="text-xl">{benefit.title}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
