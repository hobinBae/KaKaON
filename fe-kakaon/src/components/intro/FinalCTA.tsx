import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Section from './Section';

export default function FinalCTA() {
  return (
    <Section id="final-cta" className="text-center bg-gray-50 dark:bg-gray-900">
      <div className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          지금 바로 시작하여 매출 관리를 혁신하세요
        </h2>
        <Button asChild size="lg" className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 rounded-full px-8 py-6 text-base">
          <Link to="/login" data-analytics="final-cta-primary">
            무료로 시작하기
          </Link>
        </Button>
      </div>
    </Section>
  );
}
