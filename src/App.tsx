import React, { useState, useRef, useEffect } from 'react';
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs} from 'react-chessboard';
import { Chess, Square } from 'chess.js';

const App = () => {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const onSquareRightClick = ({ square, piece }: SquareHandlerArgs) => {
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
      },
      darkSquareStyle: {
        backgroundColor: '#777',
        border: '1px solid #000',
      },
      lightSquareStyle: {
        backgroundColor: '#EEE',
        border: '1px solid #000',
      },
      allowDragging: true,
      showNotation: false,
    };
    return <div 
          data-testid="app-container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? '#000' : '#fff'
      }}>
        <div data-testid="arrows-list" style={{ display: 'none' }}>
          {arrows.map(({ startSquare, endSquare, color }, i) => (
            <div key={i}>
              start: {startSquare}, end: {endSquare}, color: {color}
            </div>
          ))}
        </div>
        <Chessboard 
          options={chessboardOptions} 
          data-testid="chessboard" 
        />

        <div 
          data-testid="movehistory"
          style={{
            width: '300px',
            height: '150px',
            border: `1px solid ${theme === 'dark' ? '#666' : '#ccc'}`,
            borderRadius: '4px',
            padding: '8px',
            backgroundColor: theme === 'dark' ? '#222' : '#f9f9f9',
            color: theme === 'dark' ? '#fff' : '#000',
            overflowY: 'auto',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Move History:</div>
          {moveHistory.length === 0 ? (
            <div style={{ color: theme === 'dark' ? '#888' : '#666', fontStyle: 'italic' }}>
              No moves yet
            </div>
          ) : (
            <div>
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                <div key={i} style={{ marginBottom: '2px' }}>
                  {i + 1}. {moveHistory[i * 2] ?? ''} {moveHistory[i * 2 + 1] ?? ''}
                </div>
              ))}
            </div>
          )}
        </div>
      <button onClick={toggleTheme}>
        {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      </div>;
};

export default App;