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
  // Initialize dark mode state from localStorage or default to false
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode !== null ? savedDarkMode === 'true' : false;
  });

  // Save dark mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

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

    const toggleBackground = () => {
      setIsDarkMode(!isDarkMode);
    };

    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#000' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      minHeight: '100vh',
      padding: '1rem'
    }}>
        <button
          onClick={toggleBackground}
          style={{
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            backgroundColor: isDarkMode ? '#333' : '#ddd',
            color: isDarkMode ? '#fff' : '#000',
            border: '1px solid #666',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
        color: isDarkMode ? '#ccc' : '#666'
      }}>
          Drag and drop pieces to see the drop events
        </p>
      </div>;
};

export default App;
