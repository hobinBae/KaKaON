import Section from './Section';

const features = [
  {
    title: '실시간 매출 분석 대시보드',
    description: '카드, 현금, 배달 앱 등 모든 결제 수단의 매출을 실시간으로 집계하여 한눈에 보여줍니다. 시간대별, 메뉴별 분석으로 수익성을 극대화하세요.',
    image: '/path/to/feature1.png',
    imageAlt: '매출 분석 대시보드 스크린샷',
  },
  {
    title: 'AI 기반 이상거래 탐지',
    description: '과거 데이터를 학습한 AI가 평소와 다른 결제 패턴을 발견하면 즉시 알림을 보냅니다. 카드 도용이나 비정상적인 대량 취소를 사전에 방지하세요.',
    image: '/path/to/feature2.png',
    imageAlt: '이상거래 탐지 알림 스크린샷',
  },
  {
    title: '간편한 직원 급여 자동계산',
    description: '출퇴근 기록과 설정된 시급을 바탕으로 직원별 급여를 자동으로 계산합니다. 복잡한 엑셀 작업 없이 정확한 급여 명세서를 생성하세요.',
    image: '/path/to/feature3.png',
    imageAlt: '급여 자동계산 화면 스크린샷',
  },
];

export default function Features() {
  return (
    <Section id="features" className="bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">사장님을 위한 똑똑한 기능들</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
          매장 운영에 꼭 필요한 기능만 모아, 복잡함은 덜고 효율성은 높였습니다.
        </p>
      </div>
      <div className="space-y-16">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
              index % 2 === 1 ? 'md:grid-flow-col-dense' : ''
            }`}
          >
            <div className={`space-y-4 ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
              <h3 className="text-2xl font-bold">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
            <img
              src={feature.image}
              alt={feature.imageAlt}
              className="rounded-lg shadow-lg"
              width={500}
              height={300}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
