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
    
    // Initial state check
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

  it('saves dark mode preference to localStorage when toggled', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    
    // Replace global localStorage with our mock
    vi.stubGlobal('localStorage', localStorageMock);
    
    render(<App />);
    
    // Mock that no dark mode preference exists in localStorage
    localStorageMock.getItem.mockReturnValue(null);
    
    // Find and click the toggle button
    const toggleButton = screen.getByText('Switch to Dark Mode');
    fireEvent.click(toggleButton);
    
    // Check that localStorage.setItem was called with the correct values
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
    
    // Click again to switch back to light mode
    fireEvent.click(toggleButton);
    
    // Check that localStorage.setItem was called again with false
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'false');
    
    // Restore global localStorage
    vi.restoreAllMocks();
  });

  it('loads dark mode preference from localStorage on initial render', () => {
    // Mock localStorage with dark mode enabled
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue('true'),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    
    vi.stubGlobal('localStorage', localStorageMock);
    
    render(<App />);
    
    // Check that the app starts in dark mode (black background)
    const container = screen.getByTestId('chessboard').parentElement;
    expect(container).toHaveStyle('background-color: rgb(0, 0, 0)');
    
    // The button should show "Switch to Light Mode" since we're in dark mode
    expect(screen.getByText('Switch to Light Mode')).toBeInTheDocument();
    
    // Restore global localStorage
    vi.restoreAllMocks();
  });
});
