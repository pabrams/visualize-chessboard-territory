import React from 'react';
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import { Arrow } from '../../hooks/useArrows';

interface ChessBoardProps {
  theme: 'dark' | 'light';
  chessPosition: string;
  arrows: Arrow[];
  lightSquareColor: string;
  darkSquareColor: string;
  sourceSquare: string | null;
  targetSquare: string | null;
  isAtFinalPosition: boolean;
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onSquareRightClick: (args: SquareHandlerArgs) => void;
  onMoveComplete: () => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  theme,
  chessPosition,
  arrows,
  lightSquareColor,
  darkSquareColor,
  sourceSquare,
  targetSquare,
  isAtFinalPosition,
  onPieceDrop,
  onSquareRightClick,
  onMoveComplete,
}) => {
  const handlePieceDrop = (args: PieceDropHandlerArgs) => {
    const success = onPieceDrop(args);
    if (success) {
      onMoveComplete();
    }
    return success;
  };

  const chessboardOptions = {
    onPieceDrop: handlePieceDrop,
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
      width: 'min(90vh, calc(100vw - 600px))',
      height: 'min(90vh, calc(100vw - 600px))',
      maxWidth: '100%',
      maxHeight: '100%',
      boxShadow: theme === 'dark' 
        ? '0 8px 32px rgba(0, 0, 0, 0.8)' 
        : '0 8px 32px rgba(0, 0, 0, 0.15)',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    darkSquareStyle: {
      backgroundColor: darkSquareColor,
      border: 'none',
    },
    lightSquareStyle: {
      backgroundColor: lightSquareColor,
      border: 'none',
    },
    squareStyles: {
      ...(sourceSquare ? { [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {}),
      ...(targetSquare ? { [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {}),
    },
  };

  return (
    <Chessboard 
      options={chessboardOptions} 
      data-testid="chessboard" 
    />
  );
};
