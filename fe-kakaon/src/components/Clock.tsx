import { useState, useEffect } from 'react';
import './Clock.css';

const formatDigit = (digit) => {
  return digit.toString().padStart(2, '0').split('');
};

const StaticUnit = ({ digit }) => (
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

const FlipUnit = ({ currentDigit, previousDigit }) => {
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

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const [prevTime, setPrevTime] = useState(new Date(new Date().getTime() - 1000));

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(currentTime => {
        setPrevTime(currentTime);
        return new Date();
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const hours = formatDigit(time.getHours());
  const minutes = formatDigit(time.getMinutes());
  const seconds = formatDigit(time.getSeconds());
  const prevSeconds = formatDigit(prevTime.getSeconds());

  return (
    <div className="clock-container">
      <StaticUnit digit={hours[0]} />
      <StaticUnit digit={hours[1]} />
      <div className="divider">:</div>
      <StaticUnit digit={minutes[0]} />
      <StaticUnit digit={minutes[1]} />
      <div className="divider">:</div>
      <FlipUnit currentDigit={seconds[0]} previousDigit={prevSeconds[0]} />
      <FlipUnit currentDigit={seconds[1]} previousDigit={prevSeconds[1]} />
    </div>
  );
};

export default Clock;
