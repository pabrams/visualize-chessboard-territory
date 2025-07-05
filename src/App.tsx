import React, { useState, useRef } from 'react';
import { Chessboard, SquareHandlerArgs } from 'react-chessboard';
import { Chess, Square } from 'chess.js';

const App = () => {
  const gameRef = useRef(new Chess());
  const chessGame = gameRef.current;

  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});

  function makeRandomMove() {
    const possibleMoves = chessGame.moves();
    if (chessGame.isGameOver()) return;
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    chessGame.move(randomMove);
    setChessPosition(chessGame.fen());
  }

  function getMoveOptions(square: Square) {
    const moves = chessGame.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};
    for (const move of moves) {
      newSquares[move.to] = {
        background: chessGame.get(move.to) && chessGame.get(move.to)?.color !== chessGame.get(square)?.color
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    }
    newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (!moveFrom && piece) {
      const hasMoveOptions = getMoveOptions(square as Square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    const moves = chessGame.moves({ square: moveFrom as Square, verbose: true });
    const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);
    if (!foundMove) {
      const hasMoveOptions = getMoveOptions(square as Square);
      setMoveFrom(hasMoveOptions ? square : '');
      return;
    }

    try {
      chessGame.move({ from: moveFrom, to: square, promotion: 'q' });
    } catch {
      const hasMoveOptions = getMoveOptions(square as Square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    setChessPosition(chessGame.fen());
    setTimeout(makeRandomMove, 300);
    setMoveFrom('');
    setOptionSquares({});
  }

  const chessboardOptions = {
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
    onSquareClick,
    position: chessPosition,
    squareStyles: optionSquares,
    id: 'click-to-move',
    'data-testid': 'chessboard', // Add test id for testing
  };

  return <Chessboard {...chessboardOptions} />;
};

export default App;
