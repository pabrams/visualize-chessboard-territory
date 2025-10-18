import React, { useState, useEffect } from 'react';

interface DrillTimerProps {
  onTimeUp: () => void;
  theme: 'dark' | 'light';
  isCountdown: boolean;
}

export const DrillTimer: React.FC<DrillTimerProps> = ({ onTimeUp, isCountdown }) => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (isCountdown) {
      return; // Don't count down during the traffic light countdown
    }

    if (timeLeft === 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, isCountdown]);

  if (isCountdown) {
    return (
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
        }}
      >
        0:00
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 30;

  return (
    <div
      style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: isLowTime ? '#ff3333' : 'inherit',
      }}
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};
