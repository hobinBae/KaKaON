import Section from './Section';

const steps = [
  {
    step: 1,
    title: '간편 가입 및 인증',
    description: '카카오 계정으로 1분 만에 가입하고, 본인 인증을 통해 안전하게 서비스를 시작하세요.',
  },
  {
    step: 2,
    title: '결제 데이터 연동',
    description: '다른 서비스에서 사용했던 데이터도 최대 10만건 까지 손쉽게 업로드 가능합니다.',
  },
  {
    step: 3,
    title: '분석 대시보드 확인',
    description: '연동이 완료되면, 카카온이 데이터를 분석하여 맞춤형 AI 리포트를 제공합니다.',
  },
  {
    step: 4,
    title: 'AI분석 데이터 기반 의사결정',
    description: 'AI 분석 결과를 바탕으로 매장 운영 전략을 세우고, 비즈니스 성장을 가속화하세요.',
  },
];

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold">시작하는 방법</h2>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4 sm:px-0">
          단 4단계만으로 복잡한 매출 관리를 끝낼 수 있습니다.
        </p>
      </div>
      <div className="relative max-w-xs mx-auto md:max-w-none">
        {/* Vertical connector for mobile */}
        <div className="absolute top-6 left-6 h-full border-l-2 border-dashed border-gray-200 dark:border-gray-700 md:hidden" />
        {/* Horizontal connector for desktop */}
        <div className="absolute top-6 left-0 w-full h-px bg-gray-200 dark:bg-gray-700 hidden md:block" />

        <div className="grid gap-12 md:grid-cols-4 md:gap-8">
          {steps.map((step) => (
            <div key={step.step} className="relative flex md:flex-col items-center md:items-center text-left md:text-center">
              <div className="mb-0 md:mb-4 bg-white dark:bg-gray-900 z-10 mr-6 md:mr-0">
                <div className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center text-[#3C1E1E] font-bold text-xl shrink-0">
                  {step.step}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
