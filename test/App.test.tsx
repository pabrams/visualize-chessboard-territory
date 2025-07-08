import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import App from '../src/App';

// We'll hold the move to simulate here — tests will set this before clicking
let moveToSimulate: { sourceSquare: string; targetSquare: string; piece: { pieceType: string; isSparePiece: boolean } } | null = null;

vi.mock('react-chessboard', () => ({
  Chessboard: ({ options = {} }: any) => {
    return (
      <div
        data-testid="chessboard"
        data-position={options.position ?? ''}
        onClick={() => {
          if (options.onPieceDrop && moveToSimulate) {
            options.onPieceDrop(moveToSimulate);
          }
        }}
      >
        {/* Optionally render some squares for clarity */}
        <div>Mocked Chessboard</div>
      </div>
    );
  },
}));

describe('App', () => {
  beforeEach(() => {
    // Reset the move before each test to avoid leakage
    moveToSimulate = null;
  });

  it('renders chessboard with initial position', () => {
    render(<App />);
    const chessboard = screen.getByTestId('chessboard');
    expect(chessboard).toBeInTheDocument();
    expect(chessboard).toHaveAttribute(
      'data-position',
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
  });

  it('updates state when piece is dropped via onPieceDrop', () => {
    render(<App />);
    expect(screen.getByText(/Source square: None/)).toBeInTheDocument();
    expect(screen.getByText(/Target square: None/)).toBeInTheDocument();
    expect(screen.getByText(/Dropped piece: None/)).toBeInTheDocument();

    moveToSimulate = {
      sourceSquare: 'e2',
      targetSquare: 'e4',
      piece: { pieceType: 'pawn', isSparePiece: false },
    };

    const chessboard = screen.getByTestId('chessboard');
    fireEvent.click(chessboard);

    expect(screen.getByText(/Source square: e2/)).toBeInTheDocument();
    expect(screen.getByText(/Target square: e4/)).toBeInTheDocument();
    expect(screen.getByText(/Dropped piece: pawn/)).toBeInTheDocument();
    expect(screen.getByText(/Is spare piece: No/)).toBeInTheDocument();
  });

  it('updates chess position when valid move is made', () => {
    render(<App />);
    const chessboard = screen.getByTestId('chessboard');
    const initialPosition = chessboard.getAttribute('data-position');

    moveToSimulate = {
      sourceSquare: 'e2',
      targetSquare: 'e4',
      piece: { pieceType: 'pawn', isSparePiece: false },
    };

    fireEvent.click(chessboard);
    const newPosition = chessboard.getAttribute('data-position');

    expect(newPosition).not.toBe(initialPosition);
  });

  it('adds move to history when white makes e4 from starting position', () => {
    render(<App />);

    moveToSimulate = {
      sourceSquare: 'e2',
      targetSquare: 'e4',
      piece: { pieceType: 'pawn', isSparePiece: false },
    };

    const chessboard = screen.getByTestId('chessboard');
    fireEvent.click(chessboard);

    const moveHistoryElement = screen.getByTestId('movehistory');
    expect(moveHistoryElement).toHaveTextContent('1. e4');
  });

  it('displays correct history after 1.e4 d5', () => {
    render(<App />);

    // First move e2-e4
    moveToSimulate = {
      sourceSquare: 'e2',
      targetSquare: 'e4',
      piece: { pieceType: 'pawn', isSparePiece: false },
    };
    const chessboard = screen.getByTestId('chessboard');
    fireEvent.click(chessboard);

    // TODO: For d7-d5, you might need to simulate a second move
    // You can do it by changing moveToSimulate before clicking again:

    moveToSimulate = {
      sourceSquare: 'd7',
      targetSquare: 'd5',
      piece: { pieceType: 'pawn', isSparePiece: false },
    };
    fireEvent.click(chessboard);

    const moveHistoryElement = screen.getByTestId('movehistory');
    expect(moveHistoryElement).toHaveTextContent('1. e4 d5');
  });

  it('toggles background color when button is clicked', () => {
    render(<App />);

    const container = screen.getByTestId('app-container');
    const toggleButton = screen.getByRole('button', { name: /switch to/i });

    const initialBg = getComputedStyle(container).backgroundColor;

    fireEvent.click(toggleButton);
    const afterClickBg = getComputedStyle(container).backgroundColor;

    expect(afterClickBg).not.toBe(initialBg);

    const expectedToggleText = /switch to (dark|light) mode/i;
    expect(toggleButton).toHaveTextContent(expectedToggleText);

    fireEvent.click(toggleButton);
    const afterSecondClickBg = getComputedStyle(container).backgroundColor;
    expect(afterSecondClickBg).toBe(initialBg);
  });
});
