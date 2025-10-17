import React from 'react';

interface DrillButtonProps {
  theme: 'dark' | 'light';
  onStartDrill: () => void;
}

export const DrillButton: React.FC<DrillButtonProps> = ({ theme, onStartDrill }) => {
  return (
    <button
      onClick={onStartDrill}
      data-testid="drillButton"
      title="Start Drill Puzzles"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: theme === 'dark' ? '#222222' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#444' : '#eeeeee'}`,
        borderRadius: '8px',
        padding: '12px 16px',
        cursor: 'pointer',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        transition: 'all 0.2s ease',
        boxShadow: theme === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 6px 16px rgba(0, 0, 0, 0.4)'
          : '0 6px 16px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Timer icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2" />
        <path d="M9 2h6" />
        <path d="M12 2v2" />
      </svg>
      <span>Drill Puzzles</span>
    </button>
  );
};
