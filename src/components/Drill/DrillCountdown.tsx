import React, { useState, useEffect } from 'react';

interface DrillCountdownProps {
  onComplete: () => void;
}

export const DrillCountdown: React.FC<DrillCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10001,
      }}
    >
      <div
        style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#ff3333',
          textShadow: '0 0 20px #3333ff, 0 0 40px #3333ff',
          animation: 'pulse 1s ease-in-out',
        }}
      >
        {count}
      </div>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};
