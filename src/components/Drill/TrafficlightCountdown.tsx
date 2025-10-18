import React, { useState, useEffect } from 'react';

interface TrafficlightCountdownProps {
  onComplete: () => void;
}

export const TrafficlightCountdown: React.FC<TrafficlightCountdownProps> = ({ onComplete }) => {
  const [lightState, setLightState] = useState<'red' | 'yellow' | 'green'>('red');

  useEffect(() => {
    if (lightState === 'red') {
      const timer = setTimeout(() => {
        setLightState('yellow');
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lightState === 'yellow') {
      const timer = setTimeout(() => {
        setLightState('green');
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lightState === 'green') {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lightState, onComplete]);

  const handleGreenClick = () => {
    onComplete();
  };

  return (
    <div
      style={{
        background: '#333',
        borderRadius: '20px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Red light */}
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: lightState === 'red' ? '#ff0000' : '#440000',
          boxShadow: lightState === 'red' ? '0 0 40px #ff0000' : 'none',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Yellow light */}
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: lightState === 'yellow' ? '#ffff00' : '#444400',
          boxShadow: lightState === 'yellow' ? '0 0 40px #ffff00' : 'none',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Green light */}
      <div
        onClick={handleGreenClick}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: lightState === 'green' ? '#00ff00' : '#004400',
          boxShadow: lightState === 'green' ? '0 0 40px #00ff00' : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          transform: 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />
    </div>
  );
};
