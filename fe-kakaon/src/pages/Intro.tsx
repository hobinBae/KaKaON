import Hero from '@/components/intro/Hero';
import Benefits from '@/components/intro/Benefits';
import Features from '@/components/intro/Features';
import HowItWorks from '@/components/intro/HowItWorks';
import SocialProof from '@/components/intro/SocialProof';
import FAQ from '@/components/intro/FAQ';
import FinalCTA from '@/components/intro/FinalCTA';
import IntroHeader from '@/components/intro/IntroHeader';
import IntroFooter from '@/components/intro/IntroFooter';

export default function Intro() {
  return (
    <div className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white">
      <IntroHeader />
      <main>
        <Hero />
        <Benefits />
        <Features />
        <HowItWorks />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <IntroFooter />
    </div>
  );
}
