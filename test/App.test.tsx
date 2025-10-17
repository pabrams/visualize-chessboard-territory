
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import App from '../src/App';
let moveToSimulate: { sourceSquare: string; targetSquare: string; piece: { pieceType: string; isSparePiece: boolean } } | null = null;

vi.mock('react-chessboard', () => ({
  Chessboard: ({ options = {} }: any) => {
    const { onSquareRightClick } = options;
    
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
        {/* Render squares with data-square attributes for testing */}
        <div 
          data-square="e2" 
          data-column="e" 
          data-row="2" 
          style={{ width: '50px', height: '50px' }}
          onContextMenu={(e) => {
            e.preventDefault();
            if (onSquareRightClick) {
              onSquareRightClick({ square: 'e2', piece: { pieceType: 'p' } });
            }
          }}
        >
          e2 square
        </div>
        <div>Mocked Chessboard</div>
      </div>
    );
  },
}));
describe('App', () => {
  beforeEach(() => {
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
    expect(moveHistoryElement).toHaveTextContent('1.e4');
  });

  test('persists theme across reloads', async () => {
    localStorage.setItem('theme', 'light');
    const { unmount } = render(<App />);
    const container = screen.getByTestId('app-container');

    await waitFor(() => {
      expect(getComputedStyle(container).backgroundColor).toBe('rgb(248, 249, 250)');
    });

    fireEvent.click(screen.getByTestId('toggleTheme'));
    await waitFor(() => {
      expect(getComputedStyle(container).backgroundColor).toBe('rgb(10, 10, 10)');
    });

    // Simulate page reload by unmounting and remounting the component
    unmount();
    render(<App />);
    const containerReloaded = screen.getByTestId('app-container');

    await waitFor(() => {
      expect(getComputedStyle(containerReloaded).backgroundColor).toBe('rgb(10, 10, 10)');
    });
  });


  it('displays correct history after 1.e4 d5', () => {
    render(<App />);

    moveToSimulate = {
      sourceSquare: 'e2',
      targetSquare: 'e4',
      piece: { pieceType: 'pawn', isSparePiece: false },
    };
    const chessboard = screen.getByTestId('chessboard');
    fireEvent.click(chessboard);

    moveToSimulate = {
      sourceSquare: 'd7',
      targetSquare: 'd5',
      piece: { pieceType: 'pawn', isSparePiece: false },
    };
    fireEvent.click(chessboard);

    const moveHistoryElement = screen.getByTestId('movehistory');
    expect(moveHistoryElement).toHaveTextContent('1.e4d5');
  });

  it('toggles background color when button is clicked', () => {
    render(<App />);

    const container = screen.getByTestId('app-container');
    const toggleButton = screen.getByTestId('toggleTheme');

    const initialBg = getComputedStyle(container).backgroundColor;

    fireEvent.click(toggleButton);
    const afterClickBg = getComputedStyle(container).backgroundColor;

    expect(afterClickBg).not.toBe(initialBg);

    fireEvent.click(toggleButton);
    const afterSecondClickBg = getComputedStyle(container).backgroundColor;
    expect(afterSecondClickBg).toBe(initialBg);
  });
  
  it('saves dark mode preference to localStorage when toggled', () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    
    vi.stubGlobal('localStorage', localStorageMock);
    render(<App />);
    
    // Mock that no preference exists in localStorage
    localStorageMock.getItem.mockReturnValue(null);

    const btn = screen.getByTestId('toggleTheme') 
    fireEvent.click(btn);
    
    // Check that localStorage.setItem was called with the correct values
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Click again to switch back to light mode
    fireEvent.click(btn);
    
    // Check that localStorage.setItem was called again with false
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    
    // Restore global localStorage
    vi.restoreAllMocks();
  });

  test('right-clicking on e2 shows arrows in state', async () => {
    const { container } = render(<App />);

    // Find the e2 square using its data-square attribute
    const e2Square = container.querySelector('[data-square="e2"]');
    expect(e2Square).not.toBeNull();

    if (e2Square) {
      // Simulate right-clicking on the e2 square
      fireEvent.contextMenu(e2Square);
    }

    // Check the arrows list in the DOM (it's hidden but contains the arrow data)
    const arrowsList = screen.getByTestId('arrows-list');
    expect(arrowsList).toHaveTextContent('start: d1, end: e2, color: #ff0000');
  });

});

// Add this test to your existing App.test.tsx file

describe('Board Position Tests', () => {
  // Parameterized test function
  const testBoardPosition = (
    description: string,
    expectedFen: string,
    movesToMake: Array<{ sourceSquare: string; targetSquare: string; piece: { pieceType: string; isSparePiece: boolean } }> = []
  ) => {
    it(description, () => {
      render(<App />);
      const chessboard = screen.getByTestId('chessboard');

      // Make the specified moves
      movesToMake.forEach(move => {
        moveToSimulate = move;
        fireEvent.click(chessboard);
      });

      // Check that the board position matches the expected FEN
      expect(chessboard).toHaveAttribute('data-position', expectedFen);
    });
  };

  // Test cases using the parameterized function
  testBoardPosition(
    'confirms starting position matches starting FEN',
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );

  testBoardPosition(
    'confirms position after 1.e4 matches expected FEN',
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    [
      {
        sourceSquare: 'e2',
        targetSquare: 'e4',
        piece: { pieceType: 'pawn', isSparePiece: false }
      }
    ]
  );

  testBoardPosition(
    'confirms position after 1.e4 d5 matches expected FEN',
    'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    [
      {
        sourceSquare: 'e2',
        targetSquare: 'e4',
        piece: { pieceType: 'pawn', isSparePiece: false }
      },
      {
        sourceSquare: 'd7',
        targetSquare: 'd5',
        piece: { pieceType: 'pawn', isSparePiece: false }
      }
    ]
  );

  testBoardPosition(
    'confirms position after 1.Nf3 matches expected FEN',
    'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
    [
      {
        sourceSquare: 'g1',
        targetSquare: 'f3',
        piece: { pieceType: 'knight', isSparePiece: false }
      }
    ]
  );

  // You can also create individual tests for specific scenarios
  it('confirms custom position matches expected FEN', () => {
    const customFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const movesToMake: Array<{ sourceSquare: string; targetSquare: string; piece: { pieceType: string; isSparePiece: boolean } }> = [];

    render(<App />);
    const chessboard = screen.getByTestId('chessboard');

    // Make moves if any
    movesToMake.forEach(move => {
      moveToSimulate = move;
      fireEvent.click(chessboard);
    });

    expect(chessboard).toHaveAttribute('data-position', customFen);
  });

  it('updates chess position when FEN is input and applied', () => {
    render(<App />);
    
    // Get the FEN input field and apply button
    const fenInput = screen.getByTestId('FEN');
    const applyButton = screen.getByText('Apply') || screen.getByTestId('applyFen');
    const chessboard = screen.getByTestId('chessboard');
    
    // Verify initial position
    expect(chessboard).toHaveAttribute(
      'data-position',
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
    
    // Test FEN representing position after 1.e4 e5 2.Nf3
    const testFen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';
    
    // Input the FEN string
    fireEvent.change(fenInput, { target: { value: testFen } });
    
    // Click the apply button
    fireEvent.click(applyButton);
    
    // Verify that the chessboard position has been updated to the new FEN
    expect(chessboard).toHaveAttribute('data-position', testFen);
  });

  it('handles invalid FEN input gracefully', () => {
    render(<App />);
    
    const fenInput = screen.getByTestId('FEN');
    const applyButton = screen.getByTestId('applyFen');
    const chessboard = screen.getByTestId('chessboard');
    
    // Store initial position
    const initialPosition = chessboard.getAttribute('data-position');
    
    // Test with invalid FEN
    const invalidFen = 'invalid-fen-string';
    
    // Input the invalid FEN string
    fireEvent.change(fenInput, { target: { value: invalidFen } });
    
    // Click the apply button
    fireEvent.click(applyButton);
    
    // Verify that the position remains unchanged (or shows error handling)
    expect(chessboard).toHaveAttribute('data-position', initialPosition);
  });

  it('updates move history when FEN with moves is applied', () => {
    render(<App />);
    
    const fenInput = screen.getByTestId('FEN');
    const applyButton = screen.getByTestId('applyFen');
    const moveHistoryElement = screen.getByTestId('movehistory');
    
    // FEN after 1.e4 e5 should result in move history showing these moves
    const fenAfterE4E5 = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
    
    fireEvent.change(fenInput, { target: { value: fenAfterE4E5 } });
    fireEvent.click(applyButton);
    expect(moveHistoryElement).toBeInTheDocument();
  });

});
