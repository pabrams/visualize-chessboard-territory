import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import App from '../src/App';

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

  test('persists theme across reloads', async () => {
    // Setup: Set initial theme to 'light'
    localStorage.setItem('theme', 'light');

    const { unmount } = render(<App />);
    const container = screen.getByTestId('app-container');

    // Wait for initial render with light theme (white background)
    await waitFor(() => {
      expect(getComputedStyle(container).backgroundColor).toBe('rgb(255, 255, 255)');
    });

    // Toggle to dark theme (black background)
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(getComputedStyle(container).backgroundColor).toBe('rgb(0, 0, 0)');
    });

    // Unmount (simulate close)
    unmount();

    // Re-mount (simulate reload)
    render(<App />);
    const containerReloaded = screen.getByTestId('app-container');

    // Now check if theme persisted as 'dark' (black background)
    await waitFor(() => {
      expect(getComputedStyle(containerReloaded).backgroundColor).toBe('rgb(0, 0, 0)');
    });

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
  
  it('respects localStorage theme preference and does not overwrite it on initial load', () => {
    // Setup mock localStorage with 'light' theme initially saved
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue('light'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    vi.stubGlobal('localStorage', localStorageMock);

    render(<App />);

    const container = screen.getByTestId('app-container');

    // The app SHOULD show white background when localStorage has 'light'
    expect(getComputedStyle(container).backgroundColor).toBe('rgb(255, 255, 255)');

    // The app should NOT call setItem during initial load (should only read)
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    vi.restoreAllMocks();
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
    // const toggleButton = screen.getByText(/Switch to Dark Mode/);
    const btn = screen.getByRole('button', { name: /switch to/i }) 
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
});
