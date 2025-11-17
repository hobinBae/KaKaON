import Section from './Section';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: '카카온 도입 후, 매일 2시간씩 하던 매출 정산이 10분으로 줄었어요. 이제 남는 시간에 신메뉴 개발에 더 집중할 수 있게 되었습니다.',
    author: '김사장',
    store: '사장님 카페',
    avatar: '/path/to/avatar1.png',
  },
  {
    quote: '이상거래 알림 덕분에 카드 도용 범죄를 막을 수 있었습니다. 소상공인에게 정말 필요한 서비스라고 생각합니다.',
    author: '박점장',
    store: '알찬 편의점',
    avatar: '/path/to/avatar2.png',
  },
];

const metrics = [
    { value: '43%', label: '취소탐지 리드타임 단축' },
    { value: '99.8%', label: '매출 데이터 정확도' },
    { value: '2,000+', label: '가입 가맹점 수' },
]

export default function SocialProof() {
  return (
    <Section id="social-proof" className="bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold px-4 sm:px-0">이미 많은 사장님들이 경험하고 있습니다</h2>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 mb-12 md:mb-16 text-center">
        {metrics.map((metric) => (
            <div key={metric.label}>
                <p className="text-4xl md:text-5xl font-bold text-[#FEE500]">{metric.value}</p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{metric.label}</p>
            </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.author}>
            <CardContent className="pt-6">
              <p className="mb-4 text-base sm:text-lg">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.store}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
