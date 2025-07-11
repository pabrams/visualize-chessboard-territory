import React, { useState, useRef, useEffect } from 'react';
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs} from 'react-chessboard';
import { Chess, Square } from 'chess.js';

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

  const [branches, setBranches] = useState<{ [key: number]: { moves: string[]; branches?: { [key: number]: any } } }>({});
  const [currentPath, setCurrentPath] = useState<number[]>([]);

  const loadPosition = () => {
    const tempGame = new Chess();
    if (currentPath.length === 0) {
      for (let i = 0; i <= currentMoveIndex; i++) {
        if (i < moveHistory.length) {
          tempGame.move(moveHistory[i]);
        }
      }
    } else {
      // Replay main line to branch point
      for (let i = 0; i < currentPath[0]; i++) {
        if (i < moveHistory.length) {
          tempGame.move(moveHistory[i]);
        }
      }
      // Replay the branch path
      let currentBr = branches;
      for (let p = 0; p < currentPath.length - 1; p++) {
        const idx = currentPath[p];
        for (let j = 0; j <= currentPath[p + 1]; j++) {
          if (j < currentBr[idx]?.moves?.length) {
            tempGame.move(currentBr[idx].moves[j]);
          }
        }
        currentBr = currentBr[idx]?.branches || {};
      }
      // Last level
      const lastIdx = currentPath[currentPath.length - 1];
      for (let j = 0; j <= lastIdx; j++) {
        if (j < currentBr[currentPath[currentPath.length - 2]]?.moves?.length) {
          tempGame.move(currentBr[currentPath[currentPath.length - 2]].moves[j]);
        }
      }
    }
    setChessPosition(tempGame.fen());
    setArrows([]);
    setLastClickedSquare(null);
  };

  // Helper to build sub-variation string
  const buildSubVariation = (branch: any, startNum: number) => {
    let str = `${startNum}. `;
    branch.moves.forEach((move: string, j: number) => {
      str += `${move} `;
      if (branch.branches && branch.branches[j + 1]) {
        str += `(${buildSubVariation(branch.branches[j + 1], startNum + Math.floor(j / 2) + 1)}) `;
      }
      if (j % 2 === 1 && j < branch.moves.length - 1) {
        str += `${startNum + Math.floor((j + 1) / 2) + 1}. `;
      }
    });
    return str.trim();
  };
  
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

  const currentThemeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;

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
    if (currentMoveIndex >= 0 && moveHistory.length > 0) {
      const tempGame = new Chess();
      for (let i = 0; i <= currentMoveIndex; i++) {
        tempGame.move(moveHistory[i]);
      }
      const history = tempGame.history({ verbose: true });
      return history[history.length - 1];
    }
    return null;
  };

  const goToStart = () => {
    const tempGame = new Chess();
    setChessPosition(tempGame.fen());
    setCurrentMoveIndex(-1);
    setArrows([]);
    setLastClickedSquare(null);
  };

  const goToEnd = () => {
    if (moveHistory.length === 0) return;
    const tempGame = new Chess();
    moveHistory.forEach(move => tempGame.move(move));
    setChessPosition(tempGame.fen());
    setCurrentMoveIndex(moveHistory.length - 1);
    setArrows([]);
    setLastClickedSquare(null);
  };

  // Updated navigation functions to handle variations
  const goForward = () => {
    if (currentPath.length === 0) {
      if (currentMoveIndex >= moveHistory.length - 1) return;
      const newIndex = currentMoveIndex + 1;
      const tempGame = new Chess();
      for (let i = 0; i <= newIndex; i++) {
        tempGame.move(moveHistory[i]);
      }
      setChessPosition(tempGame.fen());
      setCurrentMoveIndex(newIndex);
      setArrows([]);
      setLastClickedSquare(null);      
    } else {
      // In branch, try to go forward in current branch or exit to main
      const currentBranches = getCurrentBranches(currentPath.slice(0, -1), branches);
      const currentBranchIndex = currentPath[currentPath.length - 1];
      if (currentBranchIndex < currentBranches[currentPath[currentPath.length - 2]]?.moves?.length - 1) {
        setCurrentPath([...currentPath.slice(0, -1), currentBranchIndex + 1]);
      } else {
        // Exit branch to main line
        const branchPoint = currentPath[0];
        setCurrentPath([]);
        setCurrentMoveIndex(branchPoint);
      }
    }
    loadPosition();
  };

  // Helper function
  const getCurrentBranches = (path: number[], br: any) => {
    let cb = br;
    for (let p of path) {
      cb = cb[p]?.branches || {};
    }
    return cb;
  };

  const goBackward = () => {
    if (currentMoveIndex < 0) return;
    const newIndex = currentMoveIndex - 1;
    if (newIndex < 0) {
      goToStart();
    } else {
      const tempGame = new Chess();
      for (let i = 0; i <= newIndex; i++) {
        tempGame.move(moveHistory[i]);
      }
      setChessPosition(tempGame.fen());
      setCurrentMoveIndex(newIndex);
      setArrows([]);
      setLastClickedSquare(null);
    }
    loadPosition();
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

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
    piece
  }: PieceDropHandlerArgs) => {
    // Check if we're at the final position
    const isAtFinalPosition = currentMoveIndex === moveHistory.length - 1 && currentPath.length === 0;

    if (isAtFinalPosition) {
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
        const newHistory = chessGame.history();
        setMoveHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);
        // Clear arrows and reset last clicked after move
        setArrows([]);
        setLastClickedSquare(null);
        return true; 
      } catch (e) {
        console.error(e);
        return false;
      }
    } else {
      // Creating or extending a branch
      let branchIndex;
      let currentBranches = branches;
      if (currentPath.length > 0) {
        // Navigate to the current branches level
        for (let p = 0; p < currentPath.length - 1; p++) {
          currentBranches = currentBranches[currentPath[p]]?.branches || {};
        }
        branchIndex = currentPath[currentPath.length - 1] + 1;
      } else {
        branchIndex = currentMoveIndex + 1;
      }

      if (!currentBranches[branchIndex]) {
        currentBranches[branchIndex] = { moves: [] };
      }

      const move = chessGame.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move) {
        currentBranches[branchIndex].moves.push(move.san);
        setChessPosition(chessGame.fen());
        
        // Update branches state
        setBranches(prev => {
          const newBranches = JSON.parse(JSON.stringify(prev));
          // Update the nested structure - this is simplified, in production use a library like immer
          return newBranches;
        });

        // Update current path
        if (currentPath.length === 0) {
          setCurrentPath([branchIndex, 0]);
        } else {
          setCurrentPath([...currentPath.slice(0, -1), branchIndex, currentBranches[branchIndex].moves.length - 1]);
        }

        setArrows([]);
        setLastClickedSquare(null);
        return true;
      }
    }
  }

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
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '12px',
            fontSize: '16px',
            color: theme === 'dark' ? '#e0e0e0' : '#333333'
          }}>
            Move History
          </div>
          {moveHistory.length === 0 ? (
            <div style={{ color: theme === 'dark' ? '#666' : '#999', fontStyle: 'italic', fontSize: '13px' }}>
              No moves yet
            </div>
          ) : (
            <div>              
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                const moveNum = i + 1;
                const whiteIndex = i * 2;
                const blackIndex = whiteIndex + 1;
                const whiteMove = moveHistory[whiteIndex];
                const blackMove = moveHistory[blackIndex] || '..';
                
                const isWhiteHighlighted = currentPath.length === 0 && currentMoveIndex === whiteIndex;
                const isBlackHighlighted = currentPath.length === 0 && currentMoveIndex === blackIndex;
                
                let subVariation = '';
                if (branches[whiteIndex + 1]) {
                  subVariation = buildSubVariation(branches[whiteIndex + 1], moveNum + 1);
                }
                
                return (
                  <div key={i} style={{ marginBottom: '4px', padding: '2px 0', lineHeight: '1.4' }}>
                    <span style={{ color: theme === 'dark' ? '#888' : '#666' }}>
                      {moveNum}.
                    </span>{' '}
                    <span
                      style={{
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        backgroundColor: isWhiteHighlighted
                          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                          : 'transparent',
                        padding: '1px 3px',
                        borderRadius: '3px'
                      }}
                    >
                      {whiteMove || (currentMoveIndex === whiteIndex ? '..' : '')}
                    </span>{' '}
                    <span
                      style={{
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        backgroundColor: isBlackHighlighted
                          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                          : 'transparent',
                        padding: '1px 3px',
                        borderRadius: '3px'
                      }}
                    >
                      {blackMove}
                    </span>
                    {subVariation && (
                      <div style={{ marginLeft: '20px', fontSize: 'smaller' }}>
                        ({subVariation})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
};

export default App;