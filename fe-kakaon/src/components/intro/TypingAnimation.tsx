import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

export default function TypingAnimation({
  children,
  className,
  duration = 2,
  delay = 0,
}: TypingAnimationProps) {
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    const totalDuration = (duration + delay) * 1000;
    const timer = setTimeout(() => {
      setIsAnimationDone(true);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [duration, delay]);

  // 텍스트 길이를 기반으로 steps를 계산합니다.
  // ReactNode를 문자열로 변환하여 길이를 계산합니다.
  const getTextLength = (node: ReactNode): number => {
    if (typeof node === 'string') {
      return node.length;
    }
    if (Array.isArray(node)) {
      return node.reduce((acc, curr) => acc + getTextLength(curr), 0);
    }
    if (typeof node === 'object' && node !== null && 'props' in node) {
      return getTextLength(node.props.children);
    }
    return 0;
  };

  const steps = getTextLength(children);

  const typingStyles = {
    '--typing-duration': `${duration}s`,
    '--typing-steps': steps,
    '--animation-delay': `${delay}s`,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        'relative inline-block border-r-2',
        !isAnimationDone && 'overflow-hidden whitespace-nowrap animate-typing-width',
        isAnimationDone ? 'border-r-transparent' : 'animate-blink-caret border-r-black',
        className,
      )}
      style={typingStyles}
    >
      {children}
    </div>
  );
}
