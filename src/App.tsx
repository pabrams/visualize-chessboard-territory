import React, { useState, useRef, useEffect } from 'react';
import { Chessboard, PieceDropHandlerArgs } from 'react-chessboard';
import { Chess, Square } from 'chess.js';

const App = () => {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [sourceSquare, setSourceSquare] = useState<string>('None');
  const [targetSquare, setTargetSquare] = useState<string>('None');
  const [droppedPiece, setDroppedPiece] = useState<string>('None');
  const [isSparePiece, setIsSparePiece] = useState<boolean>(false);

  // Theme state management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'dark';
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
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
      setSourceSquare(sourceSquare);
      setTargetSquare(targetSquare || 'None');
      setDroppedPiece(piece.pieceType);
      setIsSparePiece(piece.isSparePiece);
      return true; 
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const chessboardOptions = {
      onPieceDrop,
      id: 'on-piece-drop',
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
      data-testid="app-container" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        backgroundColor: theme === 'light' ? '#fff' : '#000',
        color: theme === 'light' ? '#000' : '#fff',
        minHeight: '100vh',
        padding: '1rem'
      }}
    >
      <button 
        onClick={toggleTheme}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: theme === 'light' ? '#000' : '#fff',
          color: theme === 'light' ? '#fff' : '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
        <div>
          Source square: {sourceSquare}
          <br />
          Target square: {targetSquare}
          <br />
          Dropped piece: {droppedPiece}
          <br />
          Is spare piece: {isSparePiece ? 'Yes' : 'No'}
        </div>

        <Chessboard options={chessboardOptions} data-testid="chessboard" />


      <p style={{
        fontSize: '0.8rem',
        color: theme === 'light' ? '#666' : '#999'
      }}>
          Drag and drop pieces to see the drop events
        </p>
      </div>;
};

export default App;