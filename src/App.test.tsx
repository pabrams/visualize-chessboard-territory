import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
import '@testing-library/jest-dom';

// Create mocks for chess.js methods your component uses
const moveMock = vi.fn();
const movesMock = vi.fn();
const fenMock = vi.fn(() => 'startpos');
const isGameOverMock = vi.fn(() => false);
const getMock = vi.fn();

// Mock the entire chess.js module
vi.mock('chess.js', () => {
  return {
    Chess: vi.fn().mockImplementation(() => {
      return {
        move: moveMock,
        moves: movesMock,
        fen: fenMock,
        isGameOver: isGameOverMock,
        get: getMock,
      };
    }),
  };
});

describe('App', () => {
  beforeEach(() => {
    moveMock.mockReset();
    movesMock.mockReset();
    fenMock.mockReturnValue('startpos');
    isGameOverMock.mockReturnValue(false);
    getMock.mockReset();
  });

  it('renders chessboard with initial position', () => {
    render(<App />);
    expect(screen.getByTestId('chessboard')).toHaveTextContent('position: startpos');
  });

  it('calls getMoveOptions and sets moveFrom when piece is clicked', () => {
    movesMock.mockReturnValue([{ from: 'e2', to: 'e4', san: 'e4' }]);
    getMock.mockImplementation((square) => ({ color: square === 'e2' ? 'w' : 'b' }));

    render(<App />);

    const board = screen.getByTestId('chessboard');

    fireEvent.click(board, { target: { square: 'e2', piece: 'wP' } }); // simulate click on e2 with piece

    expect(movesMock).toHaveBeenCalledWith({ square: 'e2', verbose: true });
  });

  it('tries to make a move if moveFrom is set and destination square is valid', () => {
    movesMock.mockReturnValue([{ from: 'e2', to: 'e4', san: 'e4' }]);
    getMock.mockImplementation((square) => ({ color: square === 'e2' ? 'w' : 'b' }));
    moveMock.mockReturnValue(true);

    render(<App />);

    const board = screen.getByTestId('chessboard');

    // simulate first click on e2 (set moveFrom)
    fireEvent.click(board, { target: { square: 'e2', piece: 'wP' } });
    // simulate second click on e4 (make move)
    fireEvent.click(board, { target: { square: 'e4' } });

    expect(moveMock).toHaveBeenCalledWith({ from: 'e2', to: 'e4', promotion: 'q' });
  });

  it('does not crash when invalid move is attempted', () => {
    movesMock.mockReturnValue([]);
    getMock.mockImplementation((square) => ({ color: square === 'e2' ? 'w' : 'b' }));
    moveMock.mockImplementation(() => {
      throw new Error('invalid move');
    });

    render(<App />);

    const board = screen.getByTestId('chessboard');

    fireEvent.click(board, { target: { square: 'e2', piece: 'wP' } });
    fireEvent.click(board, { target: { square: 'e5' } });

    expect(moveMock).toHaveBeenCalled();
  });
});
