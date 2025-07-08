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
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [arrows, setArrows] = useState<Array<{ from: string; to: string; color: string }>>([]);

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
  
  // Function to find all pieces attacking a given square
  const findAttackingPieces = (targetSquare: Square) => {
    const attackingArrows: Array<{ from: string; to: string; color: string }> = [];
    
    // Get all squares on the board
    const squares = [
      'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
      'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
      'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
      'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
      'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
      'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
      'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
      'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
    ] as Square[];

    // Check each square for pieces that can attack the target
    squares.forEach(square => {
      const piece = chessGame.get(square);
      if (piece) {
        // Create a temporary game state to test if this piece can move to target
        const tempGame = new Chess(chessGame.fen());
        try {
          const move = tempGame.move({
            from: square,
            to: targetSquare,
            promotion: 'q' // Handle pawn promotion
          });
          
          if (move) {
            // This piece can attack the target square
            const arrowColor = piece.color === 'w' ? 'red' : 'blue';
            attackingArrows.push({
              from: square,
              to: targetSquare,
              color: arrowColor
            });
          }
        } catch (e) {
          // Move is not legal, piece cannot attack this square
        }
      }
    });

    return attackingArrows;
  };

  // Handle right-click on squares
  const onSquareRightClick = (square: Square) => {
    const attackingArrows = findAttackingPieces(square);
    setArrows(attackingArrows);
  };

  // Clear arrows on left click
  const onSquareClick = () => {
    setArrows([]);
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
      onSquareClick,
      id: 'on-piece-drop',
      position: chessPosition,
      arrows,
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
        <Chessboard options={chessboardOptions} data-testid="chessboard" />

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