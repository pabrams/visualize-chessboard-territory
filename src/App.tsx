import React, { useState, useRef, useEffect } from 'react';
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs} from 'react-chessboard';
import { Chess, Square } from 'chess.js';

interface Colors {
  pageBackground: string;
  pageForeground: string;
  lightSquare: string;
  darkSquare: string;
  blackArrow: string;
  whiteArrow: string;
}

const App = () => {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastClickedSquare, setLastClickedSquare] = useState<string | null>(null);
  const [fenInput, setFenInput] = useState('');
  const [fenInput, setFenInput] = useState('');

  const [arrows, setArrows] = useState<
    { startSquare: string; endSquare: string, color: string }[]
  >([]);
   const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    return savedTheme || 'dark';
  });
  const [colors, setColors] = useState<{ light: Colors; dark: Colors }>({
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
    },
  });
  const [showSettings, setShowSettings] = useState(false);

  // Load colors from localStorage
  useEffect(() => {
    const savedColors = localStorage.getItem('colors');
    if (savedColors) {
      setColors(JSON.parse(savedColors));
    }
  }, []);

  // Save colors to localStorage
  useEffect(() => {
    localStorage.setItem('colors', JSON.stringify(colors));
  }, [colors]);

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
          color: colors[theme].whiteArrow,  // White attackers red
        });
      });
      
      const blackAttackers = chessGame.attackers(square as Square, 'b');
      blackAttackers.forEach((attackerSquare) => {
        newArrows.push({
          startSquare: attackerSquare,
          endSquare: square,
          color: colors[theme].blackArrow,  // Black attackers
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

  // Apply theme to body element
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#ffffff' : '#000000';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    document.body.style.transition = 'background-color 0.2s ease';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
        backgroundColor: colors[theme].darkSquare,
        border: 'none',
      },
      lightSquareStyle: {
        backgroundColor: colors[theme].lightSquare,
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
        backgroundColor: colors[theme].pageBackground,
        color: colors[theme].pageForeground,
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

        {/* FEN input container */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          width: '100%',
          maxWidth: '500px',
          padding: '1rem',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          borderRadius: '12px',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        }}>
          <input
            type="text"
            value={fenInput}
            onChange={(e) => setFenInput(e.target.value)}
            placeholder="Enter FEN position..."
            data-testid="FEN"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#444' : '#ccc'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f9f9f9',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontSize: '14px',
              fontFamily: 'monospace',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? '#6b5b95' : '#8b4513';
              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(107, 91, 149, 0.2)' : 'rgba(139, 69, 19, 0.2)'}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? '#444' : '#ccc';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            data-testid="applyFen"
            onClick={() => {
              try {
                chessGame.load(fenInput);
                setChessPosition(chessGame.fen());
                setMoveHistory(chessGame.history());
                setArrows([]);
                setLastClickedSquare(null);
              } catch (e) {
                console.error(e);
              }
            }}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#333333' : '#888888',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#333333' : '#777777';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#666666' : '#999999';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Apply
          </button>
        </div>

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        data-testid="settingsButton"
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
        {/* Gear icon for settings */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
 {/* Settings panel */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: theme === 'dark' 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '300px',
          }}
        >
          <h3 style={{ marginBottom: '15px', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {Object.entries(colors[theme]).map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, ' $1').trim();
              const dataTestId = `${theme}-theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: theme === 'dark' ? '#cccccc' : '#666666' }}>
                    {label}
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) =>
                      setColors((prev) => ({
                        ...prev,
                        [theme]: { ...prev[theme], [key]: e.target.value },
                      }))
                    }
                    data-testid={dataTestId}
                    style={{
                      width: '100%',
                      height: '30px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Move history */}
        <div 
          data-testid="movehistory"
          style={{
            width: '100%',
            maxWidth: '500px',
            height: '200px',
            border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            overflowY: 'auto',
            fontSize: '14px',
            fontFamily: 'monospace',
            boxShadow: theme === 'dark' 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '12px',
            fontSize: '16px',
            color: theme === 'dark' ? '#e0e0e0' : '#333333'
          }}>
            Move History
          </div>
          {moveHistory.length === 0 ? (
            <div style={{ 
              color: theme === 'dark' ? '#666' : '#999', 
              fontStyle: 'italic',
              fontSize: '13px'
            }}>
              No moves yet
            </div>
          ) : (
            <div>
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                <div key={i} style={{ 
                  marginBottom: '4px',
                  padding: '2px 0',
                  lineHeight: '1.4'
                }}>
                  <span style={{ color: theme === 'dark' ? '#888' : '#666' }}>
                    {i + 1}.
                  </span>{' '}
                  <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    {moveHistory[i * 2] ?? ''}
                  </span>{' '}
                  <span style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    {moveHistory[i * 2 + 1] ?? ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;