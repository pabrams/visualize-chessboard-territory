import React, { useState, useRef, useEffect } from 'react';
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs} from 'react-chessboard';
import { Chess, Square } from 'chess.js';

interface Variation {
  startIndex: number;
  moves: string[];
  subVariations: Variation[];
}

const App = () => {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 means starting position
  const [lastClickedSquare, setLastClickedSquare] = useState<string | null>(null);
  const [fenInput, setFenInput] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    return savedTheme || 'dark';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);

  const [lightThemeColors, setLightThemeColors] = useState({
    pageBackgroundColor: '#f8f9fa',
    pageForegroundColor: '#000000',
    lightSquareColor: '#ffffff',
    darkSquareColor: '#777777',
    whiteArrowColor: '#ff0000',
    blackArrowColor: '#0000ff'
  });

  const [darkThemeColors, setDarkThemeColors] = useState({
    pageBackgroundColor: '#0a0a0a',
    pageForegroundColor: '#ffffff',
    lightSquareColor: '#dddddd',
    darkSquareColor: '#444444',
    whiteArrowColor: '#ff0000',
    blackArrowColor: '#0000ff'
  });

  const getCurrentMoves = (): string[] => {
    const moves: string[] = [];
    if (currentPath.length === 0) {
      return moveHistory.slice(0, currentMoveIndex + 1);
    } else {
      const firstVar = variations[currentPath[0]];
      moves.push(...moveHistory.slice(0, firstVar.startIndex + 1));
      let currVariations = variations;
      for (let i = 0; i < currentPath.length; i++) {
        const varIndex = currentPath[i];
        const vari = currVariations[varIndex];
        let upTo: number;
        if (i < currentPath.length - 1) {
          upTo = vari.subVariations[currentPath[i + 1]].startIndex;
        } else {
          upTo = currentMoveIndex + 1;
        }
        moves.push(...vari.moves.slice(0, upTo));
        currVariations = vari.subVariations;
      }
      return moves;
    }
  };

  const getCurrentFEN = (): string => {
    const moves = getCurrentMoves();
    const temp = new Chess();
    moves.forEach(m => temp.move(m));
    return temp.fen();
  };

  const getCurrentLevelMovesLength = (): number => {
    if (currentPath.length === 0) return moveHistory.length;
    let curr = variations;
    for (let i of currentPath.slice(0, -1)) curr = curr[i].subVariations;
    return curr[currentPath[currentPath.length - 1]].moves.length;
  };

  const currentThemeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;

  // position sync
  useEffect(() => {
    const fen = getCurrentFEN();
    setChessPosition(fen);
    chessGameRef.current.load(fen);
  }, [currentMoveIndex, currentPath, moveHistory, variations]);


  // Load from localStorage
  useEffect(() => {
    const savedLight = localStorage.getItem('lightThemeColors');
    if (savedLight) {
      setLightThemeColors(JSON.parse(savedLight));
    }
    const savedDark = localStorage.getItem('darkThemeColors');
    if (savedDark) {
      setDarkThemeColors(JSON.parse(savedDark));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('lightThemeColors', JSON.stringify(lightThemeColors));
    localStorage.setItem('darkThemeColors', JSON.stringify(darkThemeColors));
  }, [lightThemeColors, darkThemeColors]);

  const getLastMove = () => {
    if (currentMoveIndex < 0) return null;
    const currentMoves = getCurrentMoves();
    if (currentMoves.length === 0) return null;
    const temp = new Chess();
    currentMoves.forEach(m => temp.move(m));
    const history = temp.history({ verbose: true });
    return history[history.length - 1] || null;
  };

  const goToStart = () => {
    setCurrentPath([]);
    setCurrentMoveIndex(-1);
    setArrows([]);
    setLastClickedSquare(null);
  };

  const goToEnd = () => {
    if (moveHistory.length === 0) return;
    if (currentPath.length === 0) {
      setCurrentMoveIndex(moveHistory.length - 1);
    } else {
      const movesLength = getCurrentLevelMovesLength();
      setCurrentMoveIndex(movesLength - 1);
    }
    setArrows([]);
    setLastClickedSquare(null);
  };

  const goForward = () => {
    const isOnMain = currentPath.length === 0;
    if (isOnMain) {
      if (currentMoveIndex < moveHistory.length - 1) {
        setCurrentMoveIndex(currentMoveIndex + 1);
      }
    } else {
      // Switch to main and forward
      setCurrentPath([]);
      const firstVarStart = variations[currentPath[0]]?.startIndex || 0;
      setCurrentMoveIndex(firstVarStart);
      if (currentMoveIndex < moveHistory.length - 1) {
        setCurrentMoveIndex(currentMoveIndex + 1);
      }
    }
    setArrows([]);
    setLastClickedSquare(null);
  };

  const goBackward = () => {
    const isOnMain = currentPath.length === 0;
    if (isOnMain) {
      if (currentMoveIndex > -1) {
        setCurrentMoveIndex(currentMoveIndex - 1);
      }
    } else {
      setCurrentPath([]);
      const firstVarStart = variations[currentPath[0]]?.startIndex || 0;
      setCurrentMoveIndex(firstVarStart);
      if (currentMoveIndex > 0) {
        setCurrentMoveIndex(currentMoveIndex - 1);
      }
    }
    if (currentMoveIndex < 0) {
      goToStart();
    }
    setArrows([]);
    setLastClickedSquare(null);
  };

  const isAtFinalPosition = currentMoveIndex === (currentPath.length === 0 ? moveHistory.length - 1 : getCurrentLevelMovesLength() - 1);


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
          color: currentThemeColors.whiteArrowColor,  // White attackers
        });
      });
      
      const blackAttackers = chessGame.attackers(square as Square, 'b');
      blackAttackers.forEach((attackerSquare) => {
        newArrows.push({
          startSquare: attackerSquare,
          endSquare: square,
          color: currentThemeColors.blackArrowColor,  // Black attackers
        });
      });

      setArrows(newArrows);
      setLastClickedSquare(square);
    }
  };

  const [arrows, setArrows] = useState<
    { startSquare: string; endSquare: string, color: string }[]
  >([]);

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
    document.body.style.backgroundColor = currentThemeColors.pageBackgroundColor;
    document.body.style.color = currentThemeColors.pageForegroundColor;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    document.body.style.transition = 'background-color 0.2s ease';
  }, [currentThemeColors]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const onPieceDrop = ({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false;

    let move;
    try {
      move = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      const moveStr = move.san;

      // Get current level details
      const currentLevelMoves = currentPath.length === 0 ? moveHistory : (() => {
        let curr = variations;
        for (let i of currentPath.slice(0, -1)) curr = curr[i].subVariations;
        return curr[currentPath[currentPath.length - 1]].moves;
      })();
      
      const atEnd = currentMoveIndex === currentLevelMoves.length - 1;
      
      // Check if this is the next expected move in current path
      if (!atEnd) {
        const nextExpected = currentLevelMoves[currentMoveIndex + 1];
        if (nextExpected === moveStr) {
          setCurrentMoveIndex(currentMoveIndex + 1);
          setChessPosition(chessGame.fen());
          const newHistory = chessGame.history();
          setMoveHistory(newHistory);
          setCurrentMoveIndex(newHistory.length - 1);
          setArrows([]);
          setLastClickedSquare(null);
          return true;
        }
      }

      // Get current sub-variations
      let currentSubVariations: Variation[];
      if (currentPath.length === 0) {
        currentSubVariations = variations;
      } else {
        let curr = variations;
        for (let i of currentPath) curr = curr[i].subVariations;
        currentSubVariations = curr;
      }

      // Check for existing sub-variation starting with this move
      const matchingSub = currentSubVariations.findIndex(v => 
        v.startIndex === currentMoveIndex + 1 && v.moves[0] === moveStr
      );

      if (matchingSub !== -1) {
        setCurrentPath([...currentPath, matchingSub]);
        setCurrentMoveIndex(0);
        setChessPosition(chessGame.fen());
        const newHistory = chessGame.history();
        setMoveHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);
        setArrows([]);
        setLastClickedSquare(null);
        return true;
      }

      // If at end, append to current path
      if (atEnd) {
        if (currentPath.length === 0) {
          setMoveHistory([...moveHistory, moveStr]);
        } else {
          let newVariations = [...variations];
          let curr = newVariations;
          for (let i of currentPath.slice(0, -1)) curr = curr[i].subVariations;
          const lastVar = curr[currentPath[currentPath.length - 1]];
          lastVar.moves = [...lastVar.moves, moveStr];
          setVariations(newVariations);
        }
        setCurrentMoveIndex(currentMoveIndex + 1);
      } else {
        // Create new sub-variation
        const newVar: Variation = {
          startIndex: currentMoveIndex + 1,
          moves: [moveStr],
          subVariations: []
        };
        currentSubVariations.push(newVar);
        setVariations([...variations]);
        const newIndex = currentSubVariations.length - 1;
        setCurrentPath([...currentPath, newIndex]);
        setCurrentMoveIndex(0);
      }

      setChessPosition(chessGame.fen());
      const newHistory = chessGame.history();
      setMoveHistory(newHistory);
      setCurrentMoveIndex(newHistory.length - 1);
      setArrows([]);
      setLastClickedSquare(null);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Add renderVariation function (can be a const or in JSX)
  const renderVariation = (v: Variation, basePair: number, basePath: number[]) => {
    let variationString = '';
    let currentPair = basePair;

    // Build the moves string
    if (v.moves.length > 0) {
      variationString = `${currentPair}. ${v.moves[0]}`;
      for (let j = 1; j < v.moves.length; j++) {
        if (j % 2 === 1) {
          variationString += ` ${v.moves[j]}`;
        } else {
          currentPair++;
          variationString += ` ${currentPair}. ${v.moves[j]}`;
        }
      }
    }

    // Add sub-variations
    v.subVariations.forEach((sub, subIndex) => {
      const subStartIndexInString = /* calculate position based on sub.startIndex */;
      // For simplicity, append at the end or find the position
      // But for now, append at the end
      variationString += ` (${renderSubVariation(sub, currentPair + Math.floor(sub.startIndex / 2), [...basePath, subIndex])})`;
    });

    // Make it clickable with highlighting
    const parts = variationString.split(' ').map((part, index) => {
      // Parse if it's a move or number
      const isMove = !part.includes('.') && part !== '..';
      if (isMove) {
        const moveIndex = /* calculate which move */;
        const isCurrent = /* check if this is the current position */;
        return (
          <span
            key={index}
            style={{
              backgroundColor: isCurrent ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)') : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => {
              setCurrentPath(basePath);
              setCurrentMoveIndex(moveIndex);
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });

    return <span>{parts}</span>;
  };
  const renderSubVariation = (sub: Variation, subPair: number, path: number[]) => {
    // Similar logic to renderVariation but for sub
    // ...
  };

  const lastMove = getLastMove();
  console.log("lastMove", lastMove);
  const sourceSquare = lastMove ? lastMove.from : null;
  const targetSquare = lastMove ? lastMove.to : null;

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
        backgroundColor: currentThemeColors.darkSquareColor,
        border: 'none',
      },
      lightSquareStyle: {
        backgroundColor: currentThemeColors.lightSquareColor,
        border: 'none',
      },
      
      squareStyles: {
        ...(sourceSquare ? { [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {}),
        ...(targetSquare ? { [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {}),
      },
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
        backgroundColor: currentThemeColors.pageBackgroundColor,
        color: currentThemeColors.pageForegroundColor,
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

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          borderRadius: '12px',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        }}>
          <button
            onClick={goToStart}
            disabled={currentMoveIndex < 0}
            data-testid="goToStart"
            title="Go to start"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: currentMoveIndex < 0 
                ? (theme === 'dark' ? '#333' : '#ccc')
                : (theme === 'dark' ? '#555' : '#888'),
              color: currentMoveIndex < 0 
                ? (theme === 'dark' ? '#666' : '#999')
                : '#ffffff',
              cursor: currentMoveIndex < 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ⏮
          </button>
          <button
            onClick={goBackward}
            disabled={currentMoveIndex < 0}
            data-testid="goBackward"
            title="Previous move"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: currentMoveIndex < 0 
                ? (theme === 'dark' ? '#333' : '#ccc')
                : (theme === 'dark' ? '#555' : '#888'),
              color: currentMoveIndex < 0 
                ? (theme === 'dark' ? '#666' : '#999')
                : '#ffffff',
              cursor: currentMoveIndex < 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ◀
          </button>
          <button
            onClick={goForward}
            disabled={currentMoveIndex >= moveHistory.length - 1}
            data-testid="goForward"
            title="Next move"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: currentMoveIndex >= moveHistory.length - 1 
                ? (theme === 'dark' ? '#333' : '#ccc')
                : (theme === 'dark' ? '#555' : '#888'),
              color: currentMoveIndex >= moveHistory.length - 1 
                ? (theme === 'dark' ? '#666' : '#999')
                : '#ffffff',
              cursor: currentMoveIndex >= moveHistory.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ▶
          </button>
          <button
            onClick={goToEnd}
            disabled={currentMoveIndex >= moveHistory.length - 1}
            data-testid="goToEnd"
            title="Go to end"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: currentMoveIndex >= moveHistory.length - 1 
                ? (theme === 'dark' ? '#333' : '#ccc')
                : (theme === 'dark' ? '#555' : '#888'),
              color: currentMoveIndex >= moveHistory.length - 1 
                ? (theme === 'dark' ? '#666' : '#999')
                : '#ffffff',
              cursor: currentMoveIndex >= moveHistory.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ⏭
          </button>
        </div>


      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        data-testid="settingsButton"
        title="Settings"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '4.5rem', // To the right of theme button
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21.5 12c0-.28-.03-.55-.08-.82l1.98-1.98a.5.5 0 0 0-.15-.68l-1.41-.7a11.02 11.02 0 0 0-1.65-2.86l-.7-1.41a.5.5 0 0 0-.68-.15L15.82 4.08c-.27-.05-.54-.08-.82-.08s-.55.03-.82.08L12.18 2.1a.5.5 0 0 0-.68.15l-.7 1.41a11.02 11.02 0 0 0-2.86 1.65l-1.41.7a.5.5 0 0 0-.15.68l1.98 1.98c-.05.27-.08.54-.08.82s.03.55.08.82l-1.98 1.98a.5.5 0 0 0 .15.68l1.41.7a11.02 11.02 0 0 0 1.65 2.86l.7 1.41a.5.5 0 0 0 .68.15l1.98-1.98c.27.05.54.08.82.08s.55-.03.82-.08l1.98 1.98a.5.5 0 0 0 .68-.15l.7-1.41a11.02 11.02 0 0 0 2.86-1.65l1.41-.7a.5.5 0 0 0 .15-.68L21.42 12.82c.05-.27.08-.54.08-.82z" fill="currentColor" />
        </svg>
      </button>

      {/* Settings panel */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(currentThemeColors).map(([key, value]) => {
              const configName = key.replace('Color', '-color').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ color: theme === 'dark' ? '#ffffff' : '#000000', flex: 1 }}>
                    {configName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => {
                      const newColors = { ...currentThemeColors, [key]: e.target.value };
                      if (theme === 'dark') {
                        setDarkThemeColors(newColors);
                      } else {
                        setLightThemeColors(newColors);
                      }
                    }}
                    data-testid={`${theme}-theme-${configName}`}
                    style={{ marginLeft: '10px' }}
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
          {moveHistory.length === 0 ? (
            <div style={{ color: theme === 'dark' ? '#666' : '#999', fontStyle: 'italic', fontSize: '13px' }}>
              No moves yet
            </div>
          ) : (
            <div style={{ display: 'table', width: '100%' }}>
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                const whiteMoveIndex = i * 2;
                const blackMoveIndex = i * 2 + 1;
                const whiteMove = moveHistory[whiteMoveIndex];
                const blackMove = moveHistory[blackMoveIndex];

                // Calculate if current
                const isCurrentWhite = currentPath.length === 0 && currentMoveIndex === whiteMoveIndex;
                const isCurrentBlack = currentPath.length === 0 && currentMoveIndex === blackMoveIndex;

                return (
                  <React.Fragment key={i}>
                    <div style={{ display: 'table-row', marginBottom: '4px', lineHeight: '1.4' }}>
                      <div style={{ display: 'table-cell', width: '40px', paddingRight: '12px', color: theme === 'dark' ? '#888' : '#666', textAlign: 'right' }}>
                        {i + 1}.
                      </div>
                      <div style={{ display: 'table-cell', width: '80px', paddingRight: '12px' }}>
                        {whiteMove ? (
                          <span
                            style={{
                              color: theme === 'dark' ? '#ffffff' : '#000000',
                              backgroundColor: isCurrentWhite ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)') : 'transparent',
                              padding: '1px 3px',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setCurrentPath([]);
                              setCurrentMoveIndex(whiteMoveIndex);
                            }}
                          >
                            {whiteMove}
                          </span>
                        ) : (
                          isCurrentWhite && (
                            <span style={{ color: theme === 'dark' ? '#888' : '#666' }}>..</span>
                          )
                        )}
                      </div>
                      <div style={{ display: 'table-cell', width: '80px' }}>
                        {blackMove ? (
                          <span
                            style={{
                              color: theme === 'dark' ? '#ffffff' : '#000000',
                              backgroundColor: isCurrentBlack ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)') : 'transparent',
                              padding: '1px 3px',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setCurrentPath([]);
                              setCurrentMoveIndex(blackMoveIndex);
                            }}
                          >
                            {blackMove}
                          </span>
                        ) : (
                          isCurrentBlack && (
                            <span style={{ color: theme === 'dark' ? '#888' : '#666' }}>..</span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Add variations after this pair */}
                    {(() => {
                      const afterIndex = blackMove ? 2 * i + 1 : 2 * i;
                      const varsAt = variations.filter(v => v.startIndex === afterIndex);
                      if (varsAt.length > 0) {
                        return varsAt.map((v, varIndex) => (
                          <div key={`var-${i}-${varIndex}`} style={{ display: 'table-row' }}>
                            <div style={{ display: 'table-cell', colspan: 3, paddingLeft: '20px' }}>
                              ( {renderVariation(v, i + 1, [varIndex])} )
                            </div>
                          </div>
                        ));
                      }
                      return null;
                    })()}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
        
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
                const newHistory = chessGame.history();
                setMoveHistory(newHistory);
                setCurrentMoveIndex(newHistory.length - 1);
                setVariations([]);
                setCurrentPath([]);
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
      </div>
    </div>
  );
};

export default App;