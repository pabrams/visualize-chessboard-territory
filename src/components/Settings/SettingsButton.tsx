import React from 'react';

interface SettingsButtonProps {
  theme: 'dark' | 'light';
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ theme, onClick }) => {
  return (
    <button
      onClick={onClick}
      data-testid="settingsButton"
      title="Settings"
      style={{
        position: 'absolute',
        top: '1.5rem',
        right: '4.5rem', // To the right of theme button
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21.5 12c0-.28-.03-.55-.08-.82l1.98-1.98a.5.5 0 0 0-.15-.68l-1.41-.7a11.02 11.02 0 0 0-1.65-2.86l-.7-1.41a.5.5 0 0 0-.68-.15L15.82 4.08c-.27-.05-.54-.08-.82-.08s-.55.03-.82.08L12.18 2.1a.5.5 0 0 0-.68.15l-.7 1.41a11.02 11.02 0 0 0-2.86 1.65l-1.41.7a.5.5 0 0 0-.15.68l1.98 1.98c-.05.27-.08.54-.08.82s.03.55.08.82l-1.98 1.98a.5.5 0 0 0 .15.68l1.41.7a11.02 11.02 0 0 0 1.65 2.86l.7 1.41a.5.5 0 0 0 .68.15l1.98-1.98c.27.05.54.08.82.08s.55-.03.82-.08l1.98 1.98a.5.5 0 0 0 .68-.15l.7-1.41a11.02 11.02 0 0 0 2.86-1.65l1.41-.7a.5.5 0 0 0 .15-.68L21.42 12.82c.05-.27.08-.54.08-.82z" fill="currentColor" />
      </svg>
    </button>
  );
};
