// src/components/Assessments/Timer.jsx
import { useState, useEffect } from 'react';

const Timer = ({ timeLimit, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`px-3 py-1 rounded-md font-medium ${
      timeLeft < 60 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      Time Left: {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;