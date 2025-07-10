import React, { useState, useRef, useEffect } from 'react';
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs} from 'react-chessboard';
import { Chess, Square } from 'chess.js';

const App = () => {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastClickedSquare, setLastClickedSquare] = useState<string | null>(null);
  const [fenInput, setFenInput] = useState('');

  const onSquareRightClick = ({ square, piece }: SquareHandlerArgs) => {
    if (square === lastClickedSquare && arrows.length > 0) {
      // Clear arrows on second click of same square
      setArrows([]);
      setLastClickedSquare(null);
    } else {
      const newArrows: { startSquare: string; endSquare: string; color: string }[] = [];

      const whiteAttackers = chessGame.attackers(square as Square, 'w');
      whiteAttackers.forEach((attackerSquare) => {
        newArrows.push({
          startSquare: attackerSquare,
          endSquare: square,
          color: 'red',  // White attackers red
        });
      });
      
      const blackAttackers = chessGame.attackers(square as Square, 'b');
      blackAttackers.forEach((attackerSquare) => {
        newArrows.push({
          startSquare: attackerSquare,
          endSquare: square,
          color: 'blue',  // Black attackers blue
        });
      });

      setArrows(newArrows);
      setLastClickedSquare(square);
    }
  };


  const [arrows, setArrows] = useState<
    { startSquare: string; endSquare: string, color: string }[]
  >([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    return savedTheme || 'dark';
  });

  const defaultColors = {
    light: {
      pageBackground: '#f8f9fa',
      pageForeground: '#000000',
      lightSquare: '#ffffff',
      darkSquare: '#777777',
      blackArrow: 'blue',
      whiteArrow: 'red',
    },
    dark: {
      pageBackground: '#0a0a0a',
      pageForeground: '#ffffff',
      lightSquare: '#dddddd',
      darkSquare: '#444444',
      blackArrow: 'blue',
      whiteArrow: 'red',
    }
  };

  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('customColors');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      light: { ...defaultColors.light },
      dark: { ...defaultColors.dark }
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);



  // Save theme to localStorage when it changes, but handle initial render correctly
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      // Only save to localStorage on initial render if no theme was previously saved
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        localStorage.setItem('theme', theme);
      }
      return;
    }
    // For subsequent renders, always save the theme
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('customColors', JSON.stringify(customColors));
  }, [customColors]);
  
  // Apply theme to body element
  useEffect(() => {
    document.body.style.backgroundColor = customColors[theme].pageBackground;
    document.body.style.color = customColors[theme].pageForeground;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    document.body.style.transition = 'background-color 0.2s ease';
  }, [theme, customColors]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const onSquareRightClick = ({ square, piece }: SquareHandlerArgs) => {
    if (square === lastClickedSquare && arrows.length > 0) {
      // Clear arrows on second click of same square
      setArrows([]);
      setLastClickedSquare(null);
    } else {
      const newArrows: { startSquare: string; endSquare: string; color: string }[] = [];

      const whiteAttackers = chessGame.attackers(square as Square, 'w');
      whiteAttackers.forEach((attackerSquare) => {
        newArrows.push({
          startSquare: attackerSquare,
          endSquare: square,
          color: customColors[theme].whiteArrow,  // White attackers
        });
      });
      
      const blackAttackers = chessGame.attackers(square as Square, 'b');
      blackAttackers.forEach((attackerSquare) => {
        newArrows.push({
          startSquare: attackerSquare,
          endSquare: square,
          color: customColors[theme].blackArrow,  // Black attackers
        });
      });

      setArrows(newArrows);
      setLastClickedSquare(square);
    }
  };

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
    piece
  }: PieceDropHandlerArgs) => {
    if (!targetSquare) {
      return false;
    }
    let move;
    try {
      move = chessGame.move({
        from: sourceSquare, 
        to: targetSquare,
        promotion: 'q'
      });
      setChessPosition(chessGame.fen());
      setMoveHistory(chessGame.history());
      // Clear arrows and reset last clicked after move
      setArrows([]);
      setLastClickedSquare(null);
      return true; 
    } catch (e) {
      console.error(e);
      return false;
    }
  };


  const chessboardOptions = {
      onPieceDrop,
      onSquareRightClick,
      arrows,
      id: 'chessboard-options',
      position: chessPosition,
      arrowOptions: {
        color: 'yellow',
        secondaryColor: 'red',
        tertiaryColor: 'blue',
        arrowLengthReducerDenominator: 4,
        sameTargetArrowLengthReducerDenominator: 2,
        arrowWidthDenominator: 10,
        activeArrowWidthMultiplier: 1.5,
        opacity: 0.5,
        activeOpacity: 0.6,
      },
      boardStyle: {
        width: '50vmin',
        height: '50vmin',
        boxShadow: theme === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.8)' 
          : '0 8px 32px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        overflow: 'hidden',
      },
      darkSquareStyle: {
        backgroundColor: customColors[theme].darkSquare,
        border: 'none',
      },
      lightSquareStyle: {
        backgroundColor: customColors[theme].lightSquare,
        border: 'none',
      },
      allowDragging: true,
      showNotation: false,
    };

  return (
    <div 
      data-testid="app-container" 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem',
        backgroundColor: customColors[theme].pageBackground,
        color: customColors[theme].pageForeground,
        transition: 'all 0.2s ease',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <div data-testid="arrows-list" style={{ display: 'none' }}>
        {arrows.map(({ startSquare, endSquare, color }, i) => (
          <div key={i}>
            start: {startSquare}, end: {endSquare}, color: {color}
          </div>
        ))}
      </div>


      
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        data-testid="toggleTheme"
        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: theme === 'dark' ? '#222222' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#444' : '#eeeeee'}`,
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          zIndex: 1000,
          color: theme === 'dark' ? '#ffffff' : '#000000',
          transition: 'all 0.2s ease',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
            : '0 6px 16px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
      >
        {theme === 'dark' ? (
          // Sun icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          // Moon icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Settings button */}
      <button
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        title="Open settings"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '5rem', // Positioned to the left of theme toggle
          background: theme === 'dark' ? '#222222' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#444' : '#eeeeee'}`,
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          zIndex: 1000,
          color: theme === 'dark' ? '#ffffff' : '#000000',
          transition: 'all 0.2s ease',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
            : '0 6px 16px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5 5.5 5.5 0 0 1-5.5-5.5 5.5 5.5 0 0 1 5.5-5.5zM12 2v2M12 20v2M3.5 12h2M18.5 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42" />
        </svg>
      </button>

      {/* Settings panel */}
      {isSettingsOpen && (
        <div
          style={{
            position: 'absolute',
            top: '5rem',
            right: '1.5rem',
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
            border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1001,
            minWidth: '200px',
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', color: theme === 'dark' ? '#fff' : '#000' }}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme Settings
          </h3>
          {Object.keys(customColors[theme]).map((key) => (
            <div key={key} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              <label
                style={{ 
                  flex: '1', 
                  marginRight: '0.5rem', 
                  color: theme === 'dark' ? '#ddd' : '#333',
                  fontSize: '0.9rem'
                }}
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="color"
                value={customColors[theme][key]}
                onChange={(e) => {
                  setCustomColors((prev) => ({
                    ...prev,
                    [theme]: { ...prev[theme], [key]: e.target.value }
                  }));
                }}
                data-testid={`${theme}-theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  cursor: 'pointer' 
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main content container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        width: '100%',
        maxWidth: '800px',
      }}>
        <Chessboard 
          options={chessboardOptions} 
          data-testid="chessboard" 
        />

        {/* ... existing code ... */}

      </div>
    </div>
  );
};

export default App;