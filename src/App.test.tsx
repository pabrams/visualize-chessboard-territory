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
    fireEvent.click(chessboard);
    const newPosition = chessboard.getAttribute('data-position');
    expect(newPosition).not.toBe(initialPosition);
  });

  it('toggles background color when button is clicked', () => {
    render(<App />);
    
    // Check initial state - should be light mode (white background)
    const container = screen.getByTestId('chessboard').parentElement;
    expect(container).toHaveStyle('background-color: rgb(255, 255, 255)');
    
    // Find and click the toggle button
    const toggleButton = screen.getByText('Switch to Dark Mode');
    fireEvent.click(toggleButton);
    
    // Check that background changed to dark mode
    expect(container).toHaveStyle('background-color: rgb(0, 0, 0)');
    expect(toggleButton).toHaveTextContent('Switch to Light Mode');
    
    // Click again to switch back to light mode
    fireEvent.click(toggleButton);
    expect(container).toHaveStyle('background-color: rgb(255, 255, 255)');
    expect(toggleButton).toHaveTextContent('Switch to Dark Mode');
  });
});
