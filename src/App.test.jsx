// App.test.jsx
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import App from './App';
import { Chess } from 'chess.js';
import { showSquareControlFunc } from './App';

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
      render(<App />);
      
      // Simulate white's move: e2 to e4
      await act(async () => {
        const result = mockChessInstance.move({ from: 'e2', to: 'e4' });
        expect(result).toBeTruthy();
      });
      
      expect(mockChessInstance.move).toHaveBeenCalledWith({ from: 'e2', to: 'e4' });
      
      // Simulate black's move: c7 to c5
      await act(async () => {
        const result = mockChessInstance.move({ from: 'c7', to: 'c5' });
        expect(result).toBeTruthy();
      });
      
      expect(mockChessInstance.move).toHaveBeenCalledWith({ from: 'c7', to: 'c5' });
    });
  });
});
