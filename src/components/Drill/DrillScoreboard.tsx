import React from 'react';

export interface DrillResult {
  success: boolean;
  timeMs: number;
}

interface DrillScoreboardProps {
  results: DrillResult[];
  theme: 'dark' | 'light';
}

export const DrillScoreboard: React.FC<DrillScoreboardProps> = ({ results, theme }) => {
  const solvedCount = results.filter((r) => r.success).length;
  const attemptedCount = results.length;

  return (
    <div
      style={{
        position: 'fixed',
        top: '150px',
        right: '20px',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'}`,
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        minWidth: '200px',
        maxHeight: '60vh',
        overflowY: 'auto',
      }}
    >
      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.2rem',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        }}
      >
        Drill Results
      </h3>
      <div
        style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
          borderRadius: '8px',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        }}
      >
        <div>Solved: {solvedCount}/{attemptedCount}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
              borderRadius: '6px',
            }}
          >
            {result.success ? (
              <span style={{ color: '#33cc33', fontSize: '1.2rem' }}>✓</span>
            ) : (
              <span style={{ color: '#ff3333', fontSize: '1.2rem' }}>✗</span>
            )}
            <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              {(result.timeMs / 1000).toFixed(1)}s
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
