import React from 'react';

interface MoveHistoryProps {
  theme: 'dark' | 'light';
  moveHistory: string[];
  currentMoveIndex: number;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  theme,
  moveHistory,
  currentMoveIndex,
}) => {
  return (
    <div 
      data-testid="movehistory"
      style={{
        width: '100%',
        maxWidth: '500px',
        height: '200px',
        border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        borderRadius: '12px',
        padding: '1.5rem',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        overflowY: 'auto',
        fontSize: '14px',
        fontFamily: 'monospace',
        boxShadow: theme === 'dark' 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {moveHistory.length === 0 ? (
        <div style={{ color: theme === 'dark' ? '#666' : '#999', fontStyle: 'italic', fontSize: '13px' }}>
          No moves yet
        </div>
      ) : (
        <div style={{ display: 'table', width: '100%' }}>
          {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
            const whiteMove = moveHistory[i * 2];
            const blackMove = moveHistory[i * 2 + 1];
            const whiteMoveIndex = i * 2;
            const blackMoveIndex = i * 2 + 1;

            return (
              <div key={i} style={{ 
                display: 'table-row',
                marginBottom: '4px', 
                lineHeight: '1.4' 
              }}>
                {/* Move number column */}
                <div style={{ 
                  display: 'table-cell',
                  width: '40px',
                  paddingRight: '12px',
                  color: theme === 'dark' ? '#888' : '#666',
                  textAlign: 'right'
                }}>
                  {i + 1}.
                </div>
                
                {/* White move column */}
                <div style={{ 
                  display: 'table-cell',
                  width: '80px',
                  paddingRight: '12px'
                }}>
                  {whiteMove ? (
                    <span
                      style={{
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        backgroundColor: currentMoveIndex === whiteMoveIndex
                          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                          : 'transparent',
                        padding: '1px 3px',
                        borderRadius: '3px'
                      }}
                    >
                      {whiteMove}
                    </span>
                  ) : (
                    currentMoveIndex === whiteMoveIndex && (
                      <span style={{ color: theme === 'dark' ? '#888' : '#666' }}>
                        ..
                      </span>
                    )
                  )}
                </div>
                
                {/* Black move column */}
                <div style={{ 
                  display: 'table-cell',
                  width: '80px'
                }}>
                  {blackMove ? (
                    <span
                      style={{
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        backgroundColor: currentMoveIndex === blackMoveIndex
                          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                          : 'transparent',
                        padding: '1px 3px',
                        borderRadius: '3px'
                      }}
                    >
                      {blackMove}
                    </span>
                  ) : (
                    currentMoveIndex === blackMoveIndex && (
                      <span style={{ color: theme === 'dark' ? '#888' : '#666' }}>
                        ..
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
