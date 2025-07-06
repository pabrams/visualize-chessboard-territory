import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

vi.mock('react-chessboard', () => ({
  Chessboard: ({ options = {} }: any) => {
    const { position } = options;

    return (
      <div
        data-testid="chessboard"
        data-position={position ?? ''}
        onClick={() => {
          if (options.onPieceDrop) {
            options.onPieceDrop({
              sourceSquare: 'e2',
              targetSquare: 'e4',
              piece: { pieceType: 'pawn', isSparePiece: false },
            });
          }
        }}
      >
        <div>e2</div>
        <div>e4</div>
      </div>
    );
  },
}));

describe('App', () => {
  it('renders chessboard with initial position', () => {
    render(<App />);
    
    const chessboard = screen.getByTestId('chessboard');
    expect(chessboard).toBeInTheDocument();
    expect(chessboard).toHaveAttribute('data-position', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });

  it('updates state when piece is dropped via onPieceDrop', () => {
    render(<App />);
    
    // Initial state check - use a more robust way to find the text
    expect(screen.getByText(/Source square: None/)).toBeInTheDocument();
    expect(screen.getByText(/Target square: None/)).toBeInTheDocument();
    expect(screen.getByText(/Dropped piece: None/)).toBeInTheDocument();
    
    const chessboard = screen.getByTestId('chessboard');
    
    // Simulate clicking the mocked chessboard (which triggers onPieceDrop)
    fireEvent.click(chessboard);
    
    // Check that the UI shows the move information
    expect(screen.getByText(/Source square: e2/)).toBeInTheDocument();
    expect(screen.getByText(/Target square: e4/)).toBeInTheDocument();
    expect(screen.getByText(/Dropped piece: pawn/)).toBeInTheDocument();
    expect(screen.getByText(/Is spare piece: No/)).toBeInTheDocument();
  });

  it('updates chess position when valid move is made', () => {
    render(<App />);
    
    const chessboard = screen.getByTestId('chessboard');
    const initialPosition = chessboard.getAttribute('data-position');
    
    // Simulate piece drop
    fireEvent.click(chessboard);
    
    // Check that the position updated (should be different from initial)
    const newPosition = chessboard.getAttribute('data-position');
    expect(newPosition).not.toBe(initialPosition);
  });

  it('does not crash when invalid move is attempted', () => {
    // Mock the chessboard to simulate an invalid move
    vi.doMock('react-chessboard', () => ({
      Chessboard: ({ options, ...props }: any) => (
        <div 
          data-testid="chessboard" 
          data-position={props['data-position']}
          onClick={() => {
            // Simulate an invalid move by calling onPieceDrop with invalid parameters
            // This should cause chess.js to throw an error in the App component
            if (options.onPieceDrop) {
              // Call onPieceDrop with an invalid move (same source and target square)
              // This should cause chess.js to throw an error
              options.onPieceDrop({
                sourceSquare: 'e2',
                targetSquare: 'e2', // Invalid: same square - this should fail in chess.js
                piece: { pieceType: 'pawn', isSparePiece: false }
              });
            }
          }}
        >
          <div>e2</div>
        </div>
      )
    }));

    render(<App />);
    
    const chessboard = screen.getByTestId('chessboard');
    
    // This should not crash the app
    expect(() => {
      fireEvent.click(chessboard);
    }).not.toThrow();
    
    // The state should remain as "None" since the move was invalid
    // Let's check what text is actually in the DOM
    const allText = screen.getAllByText(/.*/);
    console.log('All text in DOM after invalid move attempt:', allText.map(element => element.textContent));
    
    // The state should remain as "None" since the move was invalid
    // The chess.js library should throw an error for invalid moves, 
    // and the App component should catch it and not update the state
    expect(screen.getByText('Source square: None')).toBeInTheDocument();
  });
});
