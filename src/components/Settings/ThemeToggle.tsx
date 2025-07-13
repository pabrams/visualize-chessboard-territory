import React from 'react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      data-testid="toggleTheme"
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      style={{
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: theme === 'dark' ? '#222222' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#444' : '#eeeeee'}`,
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        zIndex: 1000,
        color: theme === 'dark' ? '#ffffff' : '#000000',
        transition: 'all 0.2s ease',
        boxShadow: theme === 'dark' 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
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
      {theme === 'dark' ? (
        // Sun icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" />
        </svg>
      ) : (
        // Moon icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};
