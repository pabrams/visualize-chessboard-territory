import React, { useState } from 'react';
import { useChessGame } from '../../hooks/useChessGame';

interface PuzzlesMenuProps {
  theme: 'light' | 'dark';
}

const PuzzlesMenu: React.FC<PuzzlesMenuProps> = ({ theme }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chessGame = useChessGame();

  const fetchDailyPuzzle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test with a known FEN position first
      const testFen = 'r3qrk1/ppp5/3p1nn1/3Pp1Q1/4P3/2PN4/P1P3PP/R4RK1 b - - 2 20';
      console.log('Loading test FEN:', testFen);
      
      const loadSuccess = chessGame.loadFen(testFen);
      console.log('Load FEN success:', loadSuccess);
      console.log('New chess position:', chessGame.chessPosition);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load puzzle');
      console.error('Error loading puzzle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const menuStyle = {
    backgroundColor: theme === 'light' ? '#ffffff' : '#2d2d2d',
    color: theme === 'light' ? '#000000' : '#ffffff',
    border: `1px solid ${theme === 'light' ? '#e0e0e0' : '#444444'}`,
    borderRadius: '8px',
    padding: '1rem',
    minWidth: '200px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const headingStyle = {
    margin: '0 0 1rem 0',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    borderBottom: `2px solid ${theme === 'light' ? '#007bff' : '#61dafb'}`,
    paddingBottom: '0.5rem',
  };

  const buttonStyle = {
    backgroundColor: theme === 'light' ? '#007bff' : '#61dafb',
    color: theme === 'light' ? '#ffffff' : '#000000',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
    width: '100%',
    marginBottom: '0.5rem',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme === 'light' ? '#6c757d' : '#495057',
    cursor: 'not-allowed',
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
  };

  return (
    <div style={menuStyle}>
      <h3 style={headingStyle}>Puzzles</h3>
      
      <button
        onClick={fetchDailyPuzzle}
        disabled={isLoading}
        style={isLoading ? disabledButtonStyle : buttonStyle}
      >
        {isLoading ? 'Loading...' : 'Daily Puzzle'}
      </button>
      
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
};

export default PuzzlesMenu;
