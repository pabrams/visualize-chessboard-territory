import React from 'react';

export interface DrillResult {
  success: boolean;
  timeMs: number;
}

interface DrillScoreboardProps {
  results: DrillResult[];
  theme: 'dark' | 'light';
  rating: number;
}

export const DrillScoreboard: React.FC<DrillScoreboardProps> = ({ results, theme, rating }) => {
  const solvedCount = results.filter((r) => r.success).length;
  const attemptedCount = results.length;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '150px',
        maxHeight: '200px',
        padding: '0.75rem',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'}`,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <div
          style={{
            flex: 1,
            padding: '0.4rem',
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
            borderRadius: '8px',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            textAlign: 'center',
          }}
        >
          Solved: {solvedCount}/{attemptedCount}
        </div>
        <div
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
            borderRadius: '8px',
            color: theme === 'dark' ? '#ffd700' : '#ff8c00',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Rating: {rating}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
              borderRadius: '6px',
            }}
          >
            {result.success ? (
              <span style={{ color: '#33cc33', fontSize: '1rem' }}>✓</span>
            ) : (
              <span style={{ color: '#ff3333', fontSize: '1rem' }}>✗</span>
            )}
            <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000', fontSize: '0.9rem' }}>
              {(result.timeMs / 1000).toFixed(1)}s
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
