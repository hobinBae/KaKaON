import { ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/lib/hooks';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Section({ children, className, id }: SectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        'w-full max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-24',
        'transition-opacity duration-500 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </section>
  );
}
