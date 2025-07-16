import React from 'react';
import { GameTree } from '../../types/GameTree';
import { MoveHistoryTree } from './MoveHistoryTree';

interface MoveHistoryProps {
  theme: 'dark' | 'light';
  gameTree: GameTree;
  onMoveClick: (nodeId: string) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  theme,
  gameTree,
  onMoveClick,
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
      <MoveHistoryTree
        theme={theme}
        gameTree={gameTree}
        onMoveClick={onMoveClick}
      />
    </div>
  );
};
