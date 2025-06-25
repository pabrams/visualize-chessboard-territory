// App.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import App from './App';

// Mock the chess libraries since they're external dependencies
vi.mock('cm-chessboard', () => ({
  Chessboard: vi.fn().mockImplementation(() => ({
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
    state: { moveInputProcess: Promise.resolve() }
  })),
  INPUT_EVENT_TYPE: {
    movingOverSquare: 'movingOverSquare',
    moveInputStarted: 'moveInputStarted',
    validateMoveInput: 'validateMoveInput',
    moveInputFinished: 'moveInputFinished'
  },
  COLOR: { white: 'white', black: 'black' },
  BORDER_TYPE: { frame: 'frame' }
}));

vi.mock('cm-chessboard/src/extensions/accessibility/Accessibility.js', () => ({
  Accessibility: vi.fn()
}));

vi.mock('cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js', () => ({
  PromotionDialog: vi.fn(),
  PROMOTION_DIALOG_RESULT_TYPE: {
    pieceSelected: 'pieceSelected'
  }
}));

vi.mock('cm-chessboard/src/extensions/markers/Markers.js', () => ({
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

vi.mock('cm-chessboard/src/extensions/arrows/Arrows.js', () => ({
  Arrows: vi.fn(),
  ARROW_TYPE: {
    default: 'default',
    danger: 'danger'
  }
}));

vi.mock('chess.js', () => ({
  Chess: vi.fn().mockImplementation((fen) => ({
    fen: vi.fn().mockReturnValue(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
    turn: vi.fn().mockReturnValue('w'),
    move: vi.fn(),
    moves: vi.fn().mockReturnValue([]),
    attackers: vi.fn().mockReturnValue([])
  })),
  SQUARES: ['a1', 'a2', 'a3', 'b1', 'b2', 'b3'] // abbreviated for testing
}));

// Mock localStorage
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
      const select = screen.getByLabelText('Select FEN:');
      
      expect(screen.getByText('Standard starting position')).toBeInTheDocument();
      expect(screen.getByText('1912 Levitsky Marshall')).toBeInTheDocument();
      expect(screen.getByText('1962 Nezhmetdinov Chernikov')).toBeInTheDocument();
      expect(screen.getByText('1963 Petrosian Spassky')).toBeInTheDocument();
      expect(screen.getByText('1965 Kholmov Bronstein')).toBeInTheDocument();
      expect(screen.getByText('1972 Fischer Spassky game 2')).toBeInTheDocument();
    });
  });
});

// Additional utility function tests that could be extracted
describe('Chess App Utility Functions', () => {
  // If you extract these functions to separate modules, you can test them independently
  
  describe('FEN Validation', () => {
    test('should validate standard starting position', () => {
      const standardFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq";
      // This would test a utility function that validates FEN strings
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Square Control Calculation', () => {
    test('should calculate net attackers correctly', () => {
      // This would test the logic in showSquareControlForSquare
      // if extracted to a pure function
      expect(true).toBe(true); // Placeholder
    });
  });
});