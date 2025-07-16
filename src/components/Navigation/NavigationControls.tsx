import React from 'react';

interface NavigationControlsProps {
  theme: 'dark' | 'light';
  isAtStart: boolean;
  canGoBackward: boolean;
  canGoForward: boolean;
  isAtFinalPosition: boolean;
  goToStart: () => void;
  goBackward: () => void;
  goForward: () => void;
  goToEnd: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  theme,
  isAtStart,
  canGoBackward,
  canGoForward,
  isAtFinalPosition,
  goToStart,
  goBackward,
  goForward,
  goToEnd,
}) => {

  const getButtonStyle = (disabled: boolean) => ({
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: disabled 
      ? (theme === 'dark' ? '#333' : '#ccc')
      : (theme === 'dark' ? '#555' : '#888'),
    color: disabled 
      ? (theme === 'dark' ? '#666' : '#999')
      : '#ffffff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: '12px',
      boxShadow: theme === 'dark' 
        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
    }}>
      <button
        onClick={goToStart}
        disabled={isAtStart}
        data-testid="goToStart"
        title="Go to start"
        style={getButtonStyle(isAtStart)}
      >
        ⏮
      </button>
      <button
        onClick={goBackward}
        disabled={!canGoBackward}
        data-testid="goBackward"
        title="Previous move"
        style={getButtonStyle(!canGoBackward)}
      >
        ◀
      </button>
      <button
        onClick={goForward}
        disabled={!canGoForward}
        data-testid="goForward"
        title="Next move"
        style={getButtonStyle(!canGoForward)}
      >
        ▶
      </button>
      <button
        onClick={goToEnd}
        disabled={isAtFinalPosition}
        data-testid="goToEnd"
        title="Go to end"
        style={getButtonStyle(isAtFinalPosition)}
      >
        ⏭
      </button>
    </div>
  );
};
