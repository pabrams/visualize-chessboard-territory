import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, children }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        width: '300px',
        minWidth: '300px',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderRight: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header with close button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '1.25rem',
            color: theme === 'dark' ? '#ffffff' : '#000000',
          }}
        >
          Menu
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
};
