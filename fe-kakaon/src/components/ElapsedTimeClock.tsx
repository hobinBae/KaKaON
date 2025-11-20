import { useState, useEffect, useRef } from 'react';
import './Clock.css';

const formatDigit = (digit: number) => {
  return digit.toString().padStart(2, '0').split('');
};

// 이전 값을 추적하는 커스텀 훅
function usePrevious(value: number) {
  const ref = useRef<number>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current ?? 0;
}

const FlipUnit = ({ currentDigit, previousDigit }: { currentDigit: string, previousDigit: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (currentDigit !== previousDigit) {
      setIsPlaying(true);
      const timeout = setTimeout(() => setIsPlaying(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [currentDigit, previousDigit]);

  return (
    <ul className={`flip ${isPlaying ? 'play' : ''}`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <li
          key={i}
          className={`${currentDigit === i.toString() ? 'active' : ''} ${
            currentDigit !== previousDigit && previousDigit === i.toString() ? 'before' : ''
          }`}
        >
          <a href="#">
            <div className="up">
              <div className="shadow"></div>
              <div className="inn">{i}</div>
            </div>
            <div className="down">
              <div className="shadow"></div>
              <div className="inn">{i}</div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};

const ElapsedTimeClock = ({ elapsedSeconds }: { elapsedSeconds: number }) => {
  const prevElapsedSeconds = usePrevious(elapsedSeconds);

  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = elapsedSeconds % 60;

  const hours = formatDigit(h);
  const minutes = formatDigit(m);
  const seconds = formatDigit(s);
  
  const prevH = Math.floor(prevElapsedSeconds / 3600);
  const prevM = Math.floor((prevElapsedSeconds % 3600) / 60);
  const prevS = prevElapsedSeconds % 60;

  const prevHours = formatDigit(prevH);
  const prevMinutes = formatDigit(prevM);
  const prevSeconds = formatDigit(prevS);

  return (
    <div className="clock-container">
      <FlipUnit currentDigit={hours[0]} previousDigit={prevHours[0]} />
      <FlipUnit currentDigit={hours[1]} previousDigit={prevHours[1]} />
      <div className="divider">:</div>
      <FlipUnit currentDigit={minutes[0]} previousDigit={prevMinutes[0]} />
      <FlipUnit currentDigit={minutes[1]} previousDigit={prevMinutes[1]} />
      <div className="divider">:</div>
      <FlipUnit currentDigit={seconds[0]} previousDigit={prevSeconds[0]} />
      <FlipUnit currentDigit={seconds[1]} previousDigit={prevSeconds[1]} />
    </div>
  );
};

export default ElapsedTimeClock;
