import React, { useState } from 'react';
import { fetchPuzzle } from '../../services/lichessAuth';

interface PuzzleButtonProps {
  theme: 'dark' | 'light';
  chessGame: {
    loadPgn: (pgn: string, initialPly?: number) => boolean;
  };
}

export const PuzzleButton: React.FC<PuzzleButtonProps> = ({ theme, chessGame }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetPuzzle = async () => {
    setIsLoading(true);
    try {
      const puzzle = await fetchPuzzle({ rating: 1000 }); // Request easier puzzles
      if (puzzle) {
        console.log('🧩 Lichess Puzzle:', puzzle);
        console.log('🎯 Puzzle ID:', puzzle.puzzle.id);
        console.log('📈 Rating:', puzzle.puzzle.rating);
        console.log('🎨 Themes:', puzzle.puzzle.themes);
        console.log('🔧 Solution:', puzzle.puzzle.solution);
        console.log('♟️ Initial Position PGN:', puzzle.game.pgn);
        console.log('🎲 Initial Ply (starting position):', puzzle.puzzle.initialPly);
        
        // Load the PGN and navigate to the puzzle starting position
        const success = chessGame.loadPgn(puzzle.game.pgn, puzzle.puzzle.initialPly);
        if (success) {
          console.log('✅ Puzzle loaded successfully! Position set to initial puzzle position.');
        } else {
          console.error('❌ Failed to load puzzle PGN');
        }
      } else {
        console.error('Failed to fetch puzzle');
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGetPuzzle}
      disabled={isLoading}
      data-testid="puzzleButton"
      title={isLoading ? "Loading puzzle..." : "Get Lichess Puzzle"}
      style={{
        position: 'absolute',
        top: '1.5rem',
        right: '7rem', // Position to the right of settings button
        background: theme === 'dark' ? '#222222' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#444' : '#eeeeee'}`,
        borderRadius: '8px',
        padding: '12px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        zIndex: 1000,
        color: theme === 'dark' ? '#ffffff' : '#000000',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.2s ease',
        boxShadow: theme === 'dark' 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
            : '0 6px 16px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      {isLoading ? (
        // Loading spinner
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
            strokeDasharray="31.416" 
            strokeDashoffset="31.416"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              dur="2s"
              values="0 12 12;360 12 12"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-dasharray"
              dur="2s"
              values="0 31.416;15.708 15.708;0 31.416;0 31.416"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-dashoffset"
              dur="2s"
              values="0;-15.708;-31.416;-31.416"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ) : (
        // Puzzle piece icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-2 .9-2 2v3.8h1.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
};