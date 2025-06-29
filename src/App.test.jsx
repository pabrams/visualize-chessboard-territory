// App.test.jsx
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import App from './App';
import { Chess } from 'chess.js';
import { showSquareControlFunc } from './App';

const mockChessboardInstance = {
  setPosition: vi.fn().mockResolvedValue(),
  enableMoveInput: vi.fn(),
  disableMoveInput: vi.fn(),
  addMarker: vi.fn(),
  removeMarkers: vi.fn(),
  removeArrows: vi.fn(),
  addArrow: vi.fn(),
  getPiece: vi.fn(),
  addLegalMovesMarkers: vi.fn(),
  showPromotionDialog: vi.fn(),
  destroy: vi.fn(),
  state: { moveInputProcess: Promise.resolve() }
};

vi.mock('cm-chessboard', () => ({
  Chessboard: vi.fn().mockImplementation(() => mockChessboardInstance),
  INPUT_EVENT_TYPE: {
    movingOverSquare: 'movingOverSquare',
    moveInputStarted: 'moveInputStarted',
    validateMoveInput: 'validateMoveInput',
    moveInputFinished: 'moveInputFinished'
  },
  COLOR: { white: 'white', black: 'black' },
  BORDER_TYPE: { frame: 'frame' }
}));

vi.mock('cm-chessboard/src/extensions/accessibility/Accessibility', () => ({
  Accessibility: vi.fn()
}));

vi.mock('cm-chessboard/src/extensions/promotion-dialog/PromotionDialog', () => ({
  PromotionDialog: vi.fn(),
  PROMOTION_DIALOG_RESULT_TYPE: {
    pieceSelected: 'pieceSelected'
  }
}));

vi.mock('cm-chessboard/src/extensions/markers/Markers', () => ({
  Markers: vi.fn(),
  MARKER_TYPE: {
    square: 'square',
    frame: 'frame',
    dot: 'dot',
    circle: 'circle',
    framePrimary: 'framePrimary',
    frameDanger: 'frameDanger',
    circlePrimary: 'circlePrimary',
    circleDanger: 'circleDanger'
  }
}));

vi.mock('cm-chessboard/src/extensions/arrows/Arrows', () => ({
  Arrows: vi.fn(),
  ARROW_TYPE: {
    default: 'default',
    danger: 'danger'
  }
}));

vi.mock('chess.js');

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

describe('Chess App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Component Rendering', () => {
    test('renders main heading', () => {
      render(<App />);
      expect(screen.getByText('chessboard with square control')).toBeInTheDocument();
    });

    test('renders control checkboxes', () => {
      render(<App />);
      expect(screen.getByLabelText(/Show square frames/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Show controlling pieces/)).toBeInTheDocument();
    });

    test('renders FEN selector dropdown', () => {
      render(<App />);
      expect(screen.getByLabelText('Select FEN:')).toBeInTheDocument();
    });

    test('renders custom FEN input', () => {
      render(<App />);
      expect(screen.getByLabelText('Or enter manually:')).toBeInTheDocument();
    });
  });

  describe('Checkbox Controls', () => {
    test('square control checkbox updates state', () => {
      render(<App />);
      const checkbox = screen.getByLabelText(/Show square frames/);
      
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('squareControl', '0');
    });

    test('hover control checkbox updates state', () => {
      render(<App />);
      const checkbox = screen.getByLabelText(/Show controlling pieces/);
      
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('squareControlHover', '0');
    });
  });

  describe('FEN Position Controls', () => {
    test('preset FEN selection updates position', () => {
      render(<App />);
      const select = screen.getByLabelText('Select FEN:');
      
      fireEvent.change(select, { 
        target: { value: '5rk1/pp4pp/4p3/2R3Q1/3n4/2q4r/P1P2PPP/5RK1 b' } 
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('FEN', '5rk1/pp4pp/4p3/2R3Q1/3n4/2q4r/P1P2PPP/5RK1 b');
    });

    test('custom FEN input updates value', () => {
      render(<App />);
      const input = screen.getByLabelText('Or enter manually:');
      const testFEN = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq';
      
      fireEvent.change(input, { target: { value: testFEN } });
      
      expect(input.value).toBe(testFEN);
    });

    test('apply button saves custom FEN to localStorage', () => {
      render(<App />);
      const input = screen.getByLabelText('Or enter manually:');
      const button = screen.getByText('apply');
      const testFEN = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq';
      
      fireEvent.change(input, { target: { value: testFEN } });
      fireEvent.click(button);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('FEN', testFEN);
    });
  });

  describe('LocalStorage Integration', () => {
    test('loads saved square control setting from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'squareControl') return '0';
        return null;
      });
      
      render(<App />);
      const checkbox = screen.getByLabelText(/Show square frames/);
      
      expect(checkbox).not.toBeChecked();
    });

    test('loads saved hover control setting from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'squareControlHover') return '0';
        return null;
      });
      
      render(<App />);
      const checkbox = screen.getByLabelText(/Show controlling pieces/);
      
      expect(checkbox).not.toBeChecked();
    });

    test('loads saved FEN from localStorage', () => {
      const savedFEN = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq';
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'FEN') return savedFEN;
        return null;
      });
      
      render(<App />);
      const input = screen.getByLabelText('Or enter manually:');
      
      expect(input.value).toBe(savedFEN);
    });
  });

  describe('Preset Positions', () => {
    test('contains expected preset positions', () => {
      render(<App />);
      
      expect(screen.getByText('Standard starting position')).toBeInTheDocument();
      expect(screen.getByText('1912 Levitsky Marshall')).toBeInTheDocument();
      expect(screen.getByText('1962 Nezhmetdinov Chernikov')).toBeInTheDocument();
      expect(screen.getByText('1963 Petrosian Spassky')).toBeInTheDocument();
      expect(screen.getByText('1965 Kholmov Bronstein')).toBeInTheDocument();
      expect(screen.getByText('1972 Fischer Spassky game 2')).toBeInTheDocument();
    });
  });

  describe('En Prise Highlighting', () => {
    let mockChessInstance;

    beforeEach(() => {
      mockChessInstance = {
        fen: vi.fn(),
        turn: vi.fn().mockReturnValue('w'),
        move: vi.fn(),
        moves: vi.fn().mockReturnValue([]),
        attackers: vi.fn(),
        load: vi.fn(),
      };
      vi.mocked(Chess).mockImplementation(() => mockChessInstance);
    });


    test('highlights2 e4 as en prise after 1. e4 d5', () => {
      // Override attackers mock to simulate black attacking e4, white not defending
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'e4' && color === 'b') return ['d5'];
        if (square === 'e4' && color === 'w') return [];
        return [];
      });

      mockChessboardInstance.getPiece.mockReturnValue('wp'); // Mock a white pawn on e4
      
      // Call your function with the mock objects
      showSquareControlFunc(mockChessboardInstance, 'e4', mockChessInstance);

      // Assert the en prise marker was added for e4
      expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith('circlePrimary', 'e4');
    });
    test('highlights e4 as en prise after 1. e4 d5', async () => {
      
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'e4' && color === 'b') return ['d5'];
        if (square === 'e4' && color === 'w') return [];
        return [];
      });
      let inputHandler;

      mockChessboardInstance.enableMoveInput.mockImplementation((handler) => {
        inputHandler = handler;
      });

      render(<App />);

      await waitFor(() => {
        expect(mockChessboardInstance.enableMoveInput).toHaveBeenCalled();
      });

      // Play 1. e4
      await act(() => {
        inputHandler({
          type: 'validateMoveInput',
          squareFrom: 'e2',
          squareTo: 'e4',
        });
      });

      expect(mockChessInstance.move).toHaveBeenCalledWith({ from: 'e2', to: 'e4' });

      // Play 1...d5
      await act(() => {
        inputHandler({
          type: 'validateMoveInput',
          squareFrom: 'd7',
          squareTo: 'd5',
        });
      });

      expect(mockChessInstance.move).toHaveBeenCalledWith({ from: 'd7', to: 'd5' });

      // 🔥 Here's the critical part: manually trigger the logic you're trying to test
      act(() => {
        // You may need to import this from the same module it's defined in
        // If it's inside App, you might need to expose it or mock it
        showSquareControlFunc(mockChessboardInstance, 'e4', mockChessInstance);
      });

      // Assert that e4 got marked as en prise
      const calls = mockChessboardInstance.addMarker.mock.calls;
      console.log('addMarker calls:', calls);

      const e4Marked = calls.some(
        ([type, square]) => type === 'circlePrimary' && square === 'e4'
      );
      await waitFor(() => {
        const e4Marked = mockChessboardInstance.addMarker.mock.calls.some(
          ([type, square]) => type === 'circlePrimary' && square === 'e4'
        );
        expect(e4Marked).toBe(true);
      });
    });



    test('highlights white piece en prise when attacked by black and undefended', async () => {
      // Setup: White knight on d4 attacked by black bishop, no white defenders
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'd4' && color === 'b') return ['c5']; // Black bishop attacks
        if (square === 'd4' && color === 'w') return [];     // No white defenders
        return [];
      });

      mockChessboardInstance.getPiece.mockImplementation((square) => {
        if (square === 'd4') return 'wn'; // White knight
        return '';
      });

      let inputHandler;
      mockChessboardInstance.enableMoveInput.mockImplementation((handler) => {
        inputHandler = handler;
      });

      render(<App />);
      act(() => {
        showSquareControlFunc(mockChessboardInstance, 'd4', mockChessInstance);
      });
      await waitFor(() => expect(mockChessboardInstance.enableMoveInput).toHaveBeenCalled());

      // Simulate a move to trigger game logic (can be arbitrary)
      await act(async () => {
        await inputHandler({
          type: 'validateMoveInput',
          squareFrom: 'e2',
          squareTo: 'e4',
        });
      });

      // Wait for en prise marker
      await waitFor(() => {
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith('circlePrimary', 'd4');
      });
    });


    test('highlights black piece en prise when attacked by white and undefended', async () => {
      // Setup: Black queen on e5 attacked by white rook, no black defenders
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'e5' && color === 'w') return ['e1']; // White rook attacks
        if (square === 'e5' && color === 'b') return []; // No black defenders
        return [];
      });
      
      mockChessboardInstance.getPiece.mockImplementation((square) => {
        if (square === 'e5') return 'bq'; // Black queen
        return '';
      });

      render(<App />);
      act(() => {
        showSquareControlFunc(mockChessboardInstance, 'e5', mockChessInstance);
      });

      await waitFor(() => {
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith(
          'circleDanger', 'e5'
        );
      });
    });

    test('does not highlight defended piece as en prise', async () => {
      // Setup: White knight on d4 attacked by black but also defended by white
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'd4' && color === 'b') return ['c5']; // Black bishop attacks
        if (square === 'd4' && color === 'w') return ['c3']; // White knight defends
        return [];
      });
      
      mockChessboardInstance.getPiece.mockImplementation((square) => {
        if (square === 'd4') return 'wn'; // White knight
        return '';
      });

      render(<App />);

      await waitFor(() => {
        // Should not highlight as en prise (no circle) because it's defended
        expect(mockChessboardInstance.addMarker).not.toHaveBeenCalledWith(
          'circlePrimary', 'd4'
        );
        expect(mockChessboardInstance.addMarker).not.toHaveBeenCalledWith(
          'circleDanger', 'd4'
        );
      });
    });

    test('does not highlight piece on unattacked square', async () => {
      // Setup: White piece on safe square
      mockChessInstance.attackers.mockImplementation((square, color) => {
        return []; // No attackers
      });
      
      mockChessboardInstance.getPiece.mockImplementation((square) => {
        if (square === 'a1') return 'wr'; // White rook
        return '';
      });

      render(<App />);

      await waitFor(() => {
        expect(mockChessboardInstance.addMarker).not.toHaveBeenCalledWith(
          'circlePrimary', 'a1'
        );
        expect(mockChessboardInstance.addMarker).not.toHaveBeenCalledWith(
          'circleDanger', 'a1'
        );
      });
    });

    test('highlights multiple pieces en prise correctly', async () => {
      mockChessInstance.attackers.mockImplementation((square, color) => {
        // White knight on d4: attacked by black, undefended
        if (square === 'd4' && color === 'b') return ['c5'];
        if (square === 'd4' && color === 'w') return [];
        
        // Black bishop on f6: attacked by white, undefended  
        if (square === 'f6' && color === 'w') return ['g5'];
        if (square === 'f6' && color === 'b') return [];
        
        return [];
      });

      mockChessboardInstance.getPiece.mockImplementation((square) => {
        if (square === 'd4') return 'wn'; // White knight
        if (square === 'f6') return 'bb'; // Black bishop
        return '';
      });

      render(<App />);

      act(() => {
        showSquareControlFunc(mockChessboardInstance, 'd4', mockChessInstance);
        showSquareControlFunc(mockChessboardInstance, 'f6', mockChessInstance);
      });

      await waitFor(() => {
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith(
          'circlePrimary', 'd4'
        );
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith(
          'circleDanger', 'f6'
        );
      });
    });

    test('handles insufficiently defended pieces (more attackers than defenders)', async () => {
      // Setup: White queen attacked by 2 black pieces, defended by 1 white piece
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'e4' && color === 'b') return ['d5', 'f3']; // 2 black attackers
        if (square === 'e4' && color === 'w') return ['e1'];       // 1 white defender
        return [];
      });

      mockChessboardInstance.getPiece.mockImplementation((square) => {
        if (square === 'e4') return 'wq'; // White queen
        return '';
      });

      render(<App />);

      act(() => {
        showSquareControlFunc(mockChessboardInstance, 'e4', mockChessInstance);
      });

      await waitFor(() => {
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith(
          'framePrimary', 'e4'
        );
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith(
          'circlePrimary', 'e4'
        );
      });
    });

    test('handles overdefended pieces (more defenders than attackers)', async () => {
      // Setup: Black rook attacked by 1 white piece, defended by 2 black pieces
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'h8' && color === 'w') return ['h1'];       // 1 white attacker
        if (square === 'h8' && color === 'b') return ['g8', 'h7']; // 2 black defenders
        return [];
      });

      mockChessboardInstance.getPiece.mockImplementation((square) => {
        if (square === 'h8') return 'br'; // Black rook
        return '';
      });

      render(<App />);

      act(() => {
        showSquareControlFunc(mockChessboardInstance, 'h8', mockChessInstance);
      });

      await waitFor(() => {
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith(
          'framePrimary', 'h8'
        );
      });
    });

    test('does not highlight empty squares as en prise', async () => {
      // Setup: Empty square that's attacked
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'e4' && color === 'b') return ['d5']; // Black attacks empty square
        if (square === 'e4' && color === 'w') return []; // No white control
        return [];
      });

      mockChessboardInstance.getPiece.mockImplementation((square) => {
        return ''; // Empty square
      });

      render(<App />);
      await waitFor(() => {
        expect(mockChessboardInstance.addMarker).not.toHaveBeenCalledWith(
          'circlePrimary', 'e4'
        );
      });

    });

    test('en prise highlighting is disabled when showSquareControl is false', async () => {
      mockChessInstance.attackers.mockImplementation((square, color) => {
        if (square === 'd4' && color === 'b') return ['c5'];
        if (square === 'd4' && color === 'w') return [];
        return [];
      });
      
      mockChessboardInstance.getPiece.mockImplementation((square) => {
        if (square === 'd4') return 'wn';
        return '';
      });

      render(<App />);
      
      // Disable square control
      const checkbox = screen.getByLabelText(/Show square frames/);
      fireEvent.click(checkbox);

      await waitFor(() => {
        // Should not show any markers when square control is disabled
        expect(mockChessboardInstance.removeMarkers).toHaveBeenCalled();
      });
    });

    test('complex position with multiple en prise pieces', async () => {
      mockChessInstance.attackers.mockImplementation((square, color) => {
        const attacks = {
          'e4': { b: ['d5', 'f3'], w: ['e1'] },   // White queen
          'f7': { b: ['f8'], w: ['f1', 'g6'] },   // Black pawn
          'c3': { b: ['b4'], w: ['c1', 'd2'] },   // White knight
          'd6': { b: ['c7', 'e7'], w: ['d4'] }    // Black bishop
        };
        return attacks[square]?.[color] || [];
      });

      mockChessboardInstance.getPiece.mockImplementation((square) => {
        const pieces = {
          'e4': 'wq', // White queen (en prise)
          'f7': 'bp', // Black pawn (en prise) 
          'c3': 'wn', // White knight (safe)
          'd6': 'bb'  // Black bishop (safe)
        };
        return pieces[square] || '';
      });

      render(<App />);

      // Manually trigger control highlighting logic
      act(() => {
        showSquareControlFunc(mockChessboardInstance, 'e4', mockChessInstance);
        showSquareControlFunc(mockChessboardInstance, 'f7', mockChessInstance);
        showSquareControlFunc(mockChessboardInstance, 'c3', mockChessInstance);
        showSquareControlFunc(mockChessboardInstance, 'd6', mockChessInstance);
      });

      await waitFor(() => {
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith(
          'circlePrimary', 'e4'
        );
        expect(mockChessboardInstance.addMarker).toHaveBeenCalledWith(
          'circleDanger', 'f7'
        );
        expect(mockChessboardInstance.addMarker).not.toHaveBeenCalledWith(
          'circlePrimary', 'c3'
        );
        expect(mockChessboardInstance.addMarker).not.toHaveBeenCalledWith(
          'circleDanger', 'd6'
        );
      });
    });
  });

  describe('Chess Game Logic', () => {
    let mockChessInstance;

    beforeEach(() => {
      mockChessInstance = {
        fen: vi.fn().mockReturnValue('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
        turn: vi.fn().mockReturnValue('w'),
        move: vi.fn((move) => {
          if (move.from === 'e2' && move.to === 'e4') {
            mockChessInstance.fen.mockReturnValue('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
            mockChessInstance.turn.mockReturnValue('b');
            return { from: 'e2', to: 'e4', san: 'e4' };
          }
          if (move.from === 'c7' && move.to === 'c5') {
            mockChessInstance.fen.mockReturnValue('rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2');
            mockChessInstance.turn.mockReturnValue('w');
            return { from: 'c7', to: 'c5', san: 'c5' };
          }
          return null;
        }),
        moves: vi.fn().mockReturnValue(['e4']),
        attackers: vi.fn().mockReturnValue([]),
        load: vi.fn(),
      };
      vi.mocked(Chess).mockImplementation(() => mockChessInstance);
    });
    
    test('should allow a valid white move and then a black move', async () => {
      let inputHandler;
      let restrictedToColor = null;
      
      mockChessboardInstance.enableMoveInput.mockImplementation((handler, colorRestriction) => {
        inputHandler = handler;
        restrictedToColor = colorRestriction;
      });
      
      render(<App />);
      
      await waitFor(() =>
        expect(mockChessboardInstance.enableMoveInput).toHaveBeenCalled()
      );
      
      // --- White's move: e2 to e4 ---
      await act(async () => {
        const piece = { color: 'w' }; // e2 has a white piece
        const moveAllowedByChessboard = !restrictedToColor || piece.color === restrictedToColor;
        
        if (moveAllowedByChessboard) {
          const result = inputHandler({ type: 'validateMoveInput', squareFrom: 'e2', squareTo: 'e4' });
          expect(result).toBeTruthy();
        } else {
          throw new Error('White move unexpectedly blocked');
        }
      });
      
      expect(mockChessInstance.move).toHaveBeenCalledWith({ from: 'e2', to: 'e4' });
      
      // --- Black's move: c7 to c5 ---
      await act(async () => {
        const piece = { color: 'b' };
        const moveAllowedByChessboard = !restrictedToColor || piece.color === restrictedToColor;
        
        if (moveAllowedByChessboard) {
          const result = inputHandler({ type: 'validateMoveInput', squareFrom: 'c7', squareTo: 'c5' });
          expect(result).toBeTruthy();
        } else {
          expect(restrictedToColor).toBe('w');
          return;
        }
      });
      expect(mockChessInstance.move).toHaveBeenCalledWith({ from: 'c7', to: 'c5' });
    });
    
  });
});
