import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
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
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders chessboard with initial position', () => {
    render(<App />);
    
    const chessboard = screen.getByTestId('chessboard');
    expect(chessboard).toBeInTheDocument();
    expect(chessboard).toHaveAttribute('data-position', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
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

    const container = screen.getByTestId('app-container');
    const toggleButton = screen.getByRole('button', { name: /switch to/i });

    const initialBg = getComputedStyle(container).backgroundColor;

    fireEvent.click(toggleButton);
    const afterClickBg = getComputedStyle(container).backgroundColor;

    // Background should have changed
    expect(afterClickBg).not.toBe(initialBg);

    // Button text should toggle too
    const expectedToggleText = /switch to (dark|light) mode/i;
    expect(toggleButton).toHaveTextContent(expectedToggleText);

    // Click again and check it toggles back
    fireEvent.click(toggleButton);
    const afterSecondClickBg = getComputedStyle(container).backgroundColor;
    expect(afterSecondClickBg).toBe(initialBg);
  });

  it('saves theme preference to localStorage when toggled', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null), // No saved theme initially
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    
    // Replace global localStorage with our mock
    vi.stubGlobal('localStorage', localStorageMock);
    
    render(<App />);
    
    // The app starts with 'dark' theme by default, so localStorage.setItem should be called with 'dark'
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Clear mock calls to isolate the toggle behavior
    localStorageMock.setItem.mockClear();
    
    // Find and click the toggle button to switch to light mode
    const btn = screen.getByRole('button', { name: /switch to/i });
    fireEvent.click(btn);
    
    // Check that localStorage.setItem was called with 'light'
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    
    // Clear mock calls again
    localStorageMock.setItem.mockClear();
    
    // Click again to switch back to dark mode
    fireEvent.click(btn);
    
    // Check that localStorage.setItem was called with 'dark'
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Restore global localStorage
    vi.restoreAllMocks();
  });

  it('loads saved theme from localStorage and applies correct background', () => {
    // Mock localStorage returns 'dark'
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue('dark'),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };

    vi.stubGlobal('localStorage', localStorageMock);

    render(<App />);
    
    const container = screen.getByTestId('app-container');

    // Get computed style for background - should be dark
    const bg = getComputedStyle(container).backgroundColor;
    expect(bg).toBe('rgb(0, 0, 0)');

    vi.restoreAllMocks();
  });
  
  it('updates localStorage "theme" value correctly when toggling', () => {
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        clear: vi.fn(() => {
          store = {};
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        key: vi.fn(),
        length: 0,
      };
    })();

    // Stub global localStorage with our mock
    vi.stubGlobal('localStorage', localStorageMock);

    // Initially nothing saved
    expect(localStorageMock.getItem('theme')).toBeNull();

    render(<App />);

    // Initial state is dark mode, so localStorage should be set to "dark" after mount
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Clear mock calls so we can isolate what happens after clicking
    localStorageMock.setItem.mockClear();

    const toggleButton = screen.getByRole('button');

    // Click to toggle to light mode
    fireEvent.click(toggleButton);

    // Now localStorage.setItem should have been called with "light"
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');

    localStorageMock.setItem.mockClear();

    // Click to toggle back to dark mode
    fireEvent.click(toggleButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Clean up mocks after test
    vi.restoreAllMocks();
  });

  describe('theme persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('persists theme correctly between reloads', async () => {
      // 1. Set localStorage theme to 'light' before initial render
      localStorage.setItem('theme', 'light');

      // 2. Render app first time
      const { unmount } = render(<App />);
      const container = screen.getByTestId('app-container');

      // 3. Wait for initial effect and check background is white (light)
      await waitFor(() => {
        expect(getComputedStyle(container).backgroundColor).toBe('rgb(255, 255, 255)');
      });

      // 4. Toggle to dark mode
      fireEvent.click(screen.getByRole('button'));

      // 5. Wait for background to change to black (dark)
      await waitFor(() => {
        expect(getComputedStyle(container).backgroundColor).toBe('rgb(0, 0, 0)');
      });

      // 6. Unmount (simulate closing page)
      unmount();

      // 7. Re-render (simulate reload)
      render(<App />);
      const container2 = screen.getByTestId('app-container');

      // 8. Wait for effect and check background is black (dark mode persisted)
      await waitFor(() => {
        expect(getComputedStyle(container2).backgroundColor).toBe('rgb(0, 0, 0)');
      });
    });
  });

  describe('loads theme from localStorage correctly', () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };

    beforeEach(() => {
      vi.stubGlobal('localStorage', localStorageMock);
      localStorageMock.setItem.mockClear();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('applies dark mode when theme in localStorage is "dark"', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      render(<App />);

      const container = screen.getByTestId('app-container');
      expect(container).toHaveStyle('background-color: #000');
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent(/Switch to Light Mode/i);
    });

    it('applies light mode when theme in localStorage is "light"', () => {
      localStorageMock.getItem.mockReturnValue('light');

      render(<App />);

      const container = screen.getByTestId('app-container');
      expect(container).toHaveStyle('background-color: #fff');

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent(/Switch to Dark Mode/i);
    });

    it('persists the theme correctly across mounts', async () => {
      // Start with localStorage theme as 'light'
      const localStorageMock = {
        getItem: vi.fn().mockImplementation((key) => {
          if (key === 'theme') return 'light';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      vi.stubGlobal('localStorage', localStorageMock);

      // Render app first time
      const { unmount } = render(<App />);
      const container = screen.getByTestId('app-container');

      // Wait for effect to set background color to white (light mode)
      await waitFor(() => {
        expect(getComputedStyle(container).backgroundColor).toBe('rgb(255, 255, 255)');
      });

      // Click button to toggle to dark mode
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      // Wait for background to turn black (dark mode)
      await waitFor(() => {
        expect(getComputedStyle(container).backgroundColor).toBe('rgb(0, 0, 0)');
      });

      // localStorage.setItem should have been called with 'dark'
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('theme', 'dark');

      // Unmount (simulate closing the app/browser)
      unmount();

      // Now mock localStorage to return the last set value ('dark')
      localStorageMock.getItem.mockReturnValue('dark');

      // Render app again (simulate reopen)
      render(<App />);
      const container2 = screen.getByTestId('app-container');

      // Wait for effect to set background color to black (dark mode)
      await waitFor(() => {
        expect(getComputedStyle(container2).backgroundColor).toBe('rgb(0, 0, 0)');
      });
    });

    it('uses localStorage theme value on initial render (waits for effect)', async () => {
      // Set up mocked localStorage to return 'light'
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

      // Wait for the background color to settle after the useEffect
      await waitFor(() => {
        // This EXPECTS light mode (white) since we mocked 'light'
        expect(getComputedStyle(container).backgroundColor).toBe('rgb(255, 255, 255)');
      });

      // Clean up
      vi.restoreAllMocks();
    });
  });

  it('loads theme from localStorage on mount without overwriting', async () => {
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

    // Wait for useEffect to apply the theme from localStorage
    await waitFor(() => {
      // The app SHOULD show white background when localStorage has 'light'
      expect(getComputedStyle(container).backgroundColor).toBe('rgb(255, 255, 255)');
    });

    // The app should call setItem with 'light' (the loaded theme)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');

    vi.restoreAllMocks();
  });

  it('correctly loads and displays the theme from localStorage', async () => {
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

    // Wait for useEffect to apply the theme
    await waitFor(() => {
      // The app should show white background when localStorage has 'light'
      expect(getComputedStyle(container).backgroundColor).toBe('rgb(255, 255, 255)');
    });

    // The setItem should be called with 'light' (the loaded theme)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');

    vi.restoreAllMocks();
  });
});