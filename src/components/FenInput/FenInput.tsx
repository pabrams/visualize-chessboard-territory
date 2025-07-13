import React, { useState } from 'react';

interface FenInputProps {
  theme: 'dark' | 'light';
  onApplyFen: (fen: string) => void;
}

export const FenInput: React.FC<FenInputProps> = ({ theme, onApplyFen }) => {
  const [fenInput, setFenInput] = useState('');

  const handleApply = () => {
    onApplyFen(fenInput);
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      alignItems: 'center',
      width: '100%',
      maxWidth: '500px',
      padding: '1rem',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: '12px',
      boxShadow: theme === 'dark' 
        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
    }}>
      <input
        type="text"
        value={fenInput}
        onChange={(e) => setFenInput(e.target.value)}
        placeholder="Enter FEN position..."
        data-testid="FEN"
        style={{
          flex: 1,
          padding: '12px 16px',
          border: `1px solid ${theme === 'dark' ? '#444' : '#ccc'}`,
          borderRadius: '8px',
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f9f9f9',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          fontSize: '14px',
          fontFamily: 'monospace',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme === 'dark' ? '#6b5b95' : '#8b4513';
          e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(107, 91, 149, 0.2)' : 'rgba(139, 69, 19, 0.2)'}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme === 'dark' ? '#444' : '#ccc';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      <button
        data-testid="applyFen"
        onClick={handleApply}
        style={{
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: theme === 'dark' ? '#333333' : '#888888',
          color: '#ffffff',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#333333' : '#777777';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#666666' : '#999999';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Apply
      </button>
    </div>
  );
};
