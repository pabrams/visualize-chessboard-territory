import { useState, useRef } from 'react';
import { Chess, Square } from 'chess.js';

export const useChessGame = () => {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 means starting position

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
  };

  const goToEnd = () => {
    if (moveHistory.length === 0) return;
    const tempGame = new Chess();
    moveHistory.forEach(move => tempGame.move(move));
    setChessPosition(tempGame.fen());
    setCurrentMoveIndex(moveHistory.length - 1);
  };

  const goForward = () => {
    if (currentMoveIndex >= moveHistory.length - 1) return;
    const newIndex = currentMoveIndex + 1;
    const tempGame = new Chess();
    for (let i = 0; i <= newIndex; i++) {
      tempGame.move(moveHistory[i]);
    }
    setChessPosition(tempGame.fen());
    setCurrentMoveIndex(newIndex);
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
    }
  };

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = chessGame.move({
        from: sourceSquare, 
        to: targetSquare,
        promotion: 'q'
      });
      setChessPosition(chessGame.fen());
      const newHistory = chessGame.history();
      setMoveHistory(newHistory);
      setCurrentMoveIndex(newHistory.length - 1);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const loadFen = (fen: string) => {
    try {
      chessGame.load(fen);
      setChessPosition(chessGame.fen());
      const newHistory = chessGame.history();
      setMoveHistory(newHistory);
      setCurrentMoveIndex(newHistory.length - 1);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const getAttackers = (square: Square, color: 'w' | 'b') => {
    return chessGame.attackers(square, color);
  };

  // Check if we're at the final position
  const isAtFinalPosition = currentMoveIndex === moveHistory.length - 1 || moveHistory.length === 0;

  return {
    chessPosition,
    moveHistory,
    currentMoveIndex,
    isAtFinalPosition,
    getLastMove,
    goToStart,
    goToEnd,
    goForward,
    goBackward,
    makeMove,
    loadFen,
    getAttackers,
  };
};
