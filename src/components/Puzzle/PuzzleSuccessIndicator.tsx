import React from 'react';

interface PuzzleSuccessIndicatorProps {
  show: boolean;
  theme: 'dark' | 'light';
}

export const PuzzleSuccessIndicator: React.FC<PuzzleSuccessIndicatorProps> = ({ show, theme }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: theme === 'dark' ? 'rgba(34, 34, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        color: theme === 'dark' ? '#4ade80' : '#16a34a',
        padding: '2rem 3rem',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        border: `2px solid ${theme === 'dark' ? '#4ade80' : '#16a34a'}`,
        zIndex: 10000,
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        animation: 'successPulse 0.5s ease-out',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
        ✓
      </div>
      <div>Puzzle Complete!</div>
      <style>
        {`
          @keyframes successPulse {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 0;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.05);
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};
