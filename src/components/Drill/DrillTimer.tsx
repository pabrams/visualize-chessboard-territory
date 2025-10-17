import React, { useState, useEffect } from 'react';

interface DrillTimerProps {
  onTimeUp: () => void;
  theme: 'dark' | 'light';
}

export const DrillTimer: React.FC<DrillTimerProps> = ({ onTimeUp, theme }) => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 30;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        border: `2px solid ${isLowTime ? '#ff3333' : theme === 'dark' ? '#444' : '#e0e0e0'}`,
        borderRadius: '12px',
        padding: '1rem 2rem',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: isLowTime ? '#ff3333' : theme === 'dark' ? '#ffffff' : '#000000',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
      }}
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};
