import Section from './Section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '카카온은 어떤 서비스인가요?',
    answer: '카카온은 여러 결제 채널에서 발생하는 매출 데이터를 통합하여 분석하고, 이상 거래를 실시간으로 탐지해주는 가맹점 매출 관리 플랫폼입니다.',
  },
  {
    question: '서비스 이용 요금은 어떻게 되나요?',
    answer: '기본적인 매출 조회 및 분석 기능은 무료로 제공됩니다. 이상거래 탐지, 직원 관리 등 고급 기능은 별도의 유료 플랜을 통해 이용하실 수 있습니다.',
  },
  {
    question: '어떤 결제 수단을 연동할 수 있나요?',
    answer: '대부분의 카드사, PG사, 배달 앱 등과 연동을 지원합니다. 자세한 지원 목록은 고객센터로 문의해주세요.',
  },
  {
    question: '데이터 보안은 안전한가요?',
    answer: '네, 카카온은 금융권 수준의 강력한 암호화 기술을 적용하여 사장님의 소중한 데이터를 안전하게 보호합니다.',
  },
  {
    question: '가입 절차는 어떻게 되나요?',
    answer: '카카오 계정을 통해 간편하게 가입할 수 있으며, 본인 인증 및 사업자 정보 확인 후 즉시 서비스를 이용할 수 있습니다.',
  },
];

export default function FAQ() {
  return (
    <Section id="faq">
      <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold">자주 묻는 질문</h2>
      </div>
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-base sm:text-lg text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
