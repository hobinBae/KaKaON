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
    description: '사용 중인 PG사 또는 배달 앱 계정을 연동하여 매출 데이터를 자동으로 불러옵니다.',
  },
  {
    step: 3,
    title: '분석 대시보드 확인',
    description: '연동이 완료되면, 카카온이 데이터를 분석하여 맞춤형 대시보드를 제공합니다.',
  },
  {
    step: 4,
    title: '데이터 기반 의사결정',
    description: '분석 결과를 바탕으로 매장 운영 전략을 세우고, 비즈니스 성장을 가속화하세요.',
  },
];

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">시작하는 방법</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
          단 4단계만으로 복잡한 매출 관리를 끝낼 수 있습니다.
        </p>
      </div>
      <div className="relative grid md:grid-cols-4 gap-8">
        {/* Dashed line connector for desktop */}
        <div className="absolute top-[38.5%] left-0 w-full h-px bg-gray-200 dark:bg-gray-700 hidden md:block" />
        
        {steps.map((step) => (
          <div key={step.step} className="relative flex flex-col items-center text-center">
            <div className="mb-4 bg-white dark:bg-gray-900 z-10">
              <div className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center text-[#3C1E1E] font-bold text-xl">
                {step.step}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
