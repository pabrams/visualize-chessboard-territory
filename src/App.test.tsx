import { render, screen, fireEvent } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

const moveMock = vi.fn();
const movesMock = vi.fn();
const fenMock = vi.fn(() => 'startpos');
const isGameOverMock = vi.fn(() => false);
const getMock = vi.fn();

// Mock chess.js BEFORE importing App
vi.mock('chess.js', () => {
  return {
    Chess: class MockChess {
      constructor() {
        return {
          move: moveMock,
          moves: movesMock,
          fen: fenMock,
          isGameOver: isGameOverMock,
          get: getMock,
        };
      }
    }
  };
});

// Mock the react-chessboard component
vi.mock('react-chessboard', () => {
  return {
    Chessboard: vi.fn(({ 
      onSquareClick, 
      position, 
      // Filter out non-DOM props
      arrowOptions,
      boardStyle,
      darkSquareStyle,
      lightSquareStyle,
      allowDragging,
      showNotation,
      squareStyles,
      id,
      ...domProps // Only spread DOM-safe props
    }) => {
      return (
        <div 
          data-testid="chessboard" 
          data-position={position}
          id={id}
          onClick={(e) => {
            // Simulate square click behavior
            const target = e.target as HTMLElement;
            const square = target.getAttribute('data-square');
            const piece = target.getAttribute('data-piece');
            if (onSquareClick && square) {
              onSquareClick({ square, piece });
            }
          }}
          {...domProps}
        >
          <div data-square="e2" data-piece="wP">e2</div>
          <div data-square="e4" data-piece="">e4</div>
          <div data-square="e5" data-piece="">e5</div>
        </div>
      );
    }),
  };
});

// Import App AFTER mocks are set up
import App from './App';

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
    const chessboard = screen.getByTestId('chessboard');
    expect(chessboard).toBeInTheDocument();
    expect(chessboard).toHaveAttribute('data-position', 'startpos');
  });

  it('calls getMoveOptions and sets moveFrom when piece is clicked', () => {
    movesMock.mockReturnValue([{ from: 'e2', to: 'e4', san: 'e4' }]);
    getMock.mockImplementation((square) => ({ color: square === 'e2' ? 'w' : 'b' }));

    render(<App />);

    const e2Square = screen.getByText('e2');
    fireEvent.click(e2Square);

    expect(movesMock).toHaveBeenCalledWith({ square: 'e2', verbose: true });
  });

  it('tries to make a move if moveFrom is set and destination square is valid', () => {
    movesMock.mockReturnValue([{ from: 'e2', to: 'e4', san: 'e4' }]);
    getMock.mockImplementation((square) => ({ color: square === 'e2' ? 'w' : 'b' }));
    moveMock.mockReturnValue(true);

    render(<App />);

    const e2Square = screen.getByText('e2');
    const e4Square = screen.getByText('e4');

    // First click on e2 (set moveFrom)
    fireEvent.click(e2Square);
    
    // Second click on e4 (make move)
    fireEvent.click(e4Square);
    
    expect(moveMock).toHaveBeenCalledWith({ from: 'e2', to: 'e4', promotion: 'q' });
  });

  it('does not crash when invalid move is attempted', () => {
    // First call returns moves for e2, second call returns empty array for e5
    movesMock.mockReturnValueOnce([{ from: 'e2', to: 'e4', san: 'e4' }])
           .mockReturnValueOnce([])
           .mockReturnValue([]);
    getMock.mockImplementation((square) => ({ color: square === 'e2' ? 'w' : 'b' }));
    moveMock.mockReturnValue(null); // Invalid move returns null instead of throwing

    render(<App />);

    const e2Square = screen.getByText('e2');
    const e5Square = screen.getByText('e5');

    fireEvent.click(e2Square);
    fireEvent.click(e5Square);

    // Should not attempt invalid move since it's not in the valid moves
    expect(moveMock).not.toHaveBeenCalled();
  });

  it('makes random move after player move', async () => {
    // Setup for getMoveOptions call
    movesMock.mockReturnValueOnce([{ from: 'e2', to: 'e4', san: 'e4' }])
           // Setup for move validation
           .mockReturnValueOnce([{ from: 'e2', to: 'e4', san: 'e4' }])
           // Setup for random move - return valid moves array
           .mockReturnValueOnce(['e7e5', 'e7e6']);
    
    getMock.mockImplementation((square) => ({ color: square === 'e2' ? 'w' : 'b' }));
    moveMock.mockReturnValue(true);

    render(<App />);

    const e2Square = screen.getByText('e2');
    const e4Square = screen.getByText('e4');

    fireEvent.click(e2Square);
    fireEvent.click(e4Square);

    // Wait for the random move timeout
    await new Promise(resolve => setTimeout(resolve, 400));

    // Should have called move twice - once for player, once for random move
    expect(moveMock).toHaveBeenCalledTimes(2);
  });
});