import { useState, useEffect } from 'react';
import './Clock.css';

const formatDigit = (digit: number) => {
  return digit.toString().padStart(2, '0').split('');
};

const StaticUnit = ({ digit }: { digit: string }) => (
  <ul className="flip">
    <li>
      <a href="#">
        <div className="up">
          <div className="shadow"></div>
          <div className="inn">{digit}</div>
        </div>
        <div className="down">
          <div className="shadow"></div>
          <div className="inn">{digit}</div>
        </div>
      </a>
    </li>
  </ul>
);

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
          className={`${currentDigit === i.toString() ? 'active' : ''} ${previousDigit === i.toString() ? 'before' : ''}`}
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
  const [prevSeconds, setPrevSeconds] = useState(elapsedSeconds > 0 ? elapsedSeconds - 1 : 0);

  useEffect(() => {
    setPrevSeconds(elapsedSeconds > 0 ? elapsedSeconds - 1 : 0);
  }, [elapsedSeconds]);

  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = elapsedSeconds % 60;

  const hours = formatDigit(h);
  const minutes = formatDigit(m);
  const seconds = formatDigit(s);
  
  const prevS = prevSeconds % 60;
  const prevSecondsDigits = formatDigit(prevS);

  return (
    <div className="clock-container">
      <StaticUnit digit={hours[0]} />
      <StaticUnit digit={hours[1]} />
      <div className="divider">:</div>
      <StaticUnit digit={minutes[0]} />
      <StaticUnit digit={minutes[1]} />
      <div className="divider">:</div>
      <FlipUnit currentDigit={seconds[0]} previousDigit={prevSecondsDigits[0]} />
      <FlipUnit currentDigit={seconds[1]} previousDigit={prevSecondsDigits[1]} />
    </div>
  );
};

export default ElapsedTimeClock;
