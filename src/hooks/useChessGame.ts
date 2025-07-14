import { useState, useRef, useCallback, useEffect } from 'react';
import { Chess, Square } from 'chess.js';

type Move = {
  san: string;
  children: Move[];
};

export const useChessGame = () => {
  const [moveTree, setMoveTree] = useState<Move[]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const chessGameRef = useRef(new Chess());
  const [chessPosition, setChessPosition] = useState(chessGameRef.current.fen());

  const getFenForPath = useCallback((path: number[]) => {
    const game = new Chess();
    let currentChildren = moveTree;
    for (let idx of path) {
      const move = currentChildren[idx];
      game.move(move.san);
      currentChildren = move.children;
    }
    return game.fen();
  }, [moveTree]);

  useEffect(() => {
    setChessPosition(getFenForPath(currentPath));
  }, [currentPath, getFenForPath]);

  const getLastMove = () => {
    if (currentPath.length === 0) return null;
    const game = new Chess();
    let currentChildren = moveTree;
    for (let i = 0; i < currentPath.length - 1; i++) {
      const idx = currentPath[i];
      game.move(currentChildren[idx].san);
      currentChildren = currentChildren[idx].children;
    }
    const lastIdx = currentPath[currentPath.length - 1];
    const lastSan = currentChildren[lastIdx].san;
    game.move(lastSan);
    const history = game.history({ verbose: true });
    return history[history.length - 1];
  };

  const goToStart = () => setCurrentPath([]);

  const goToEnd = () => {
    let path = [];
    let current = moveTree;
    while (current[0]) {
      path.push(0);
      current = current[0].children;
    }
    setCurrentPath(path);
  };

  const goForward = () => {
    const currentChildren = getCurrentChildren(currentPath);
    if (currentChildren[0]) {
      setCurrentPath([...currentPath, 0]);
    }
  };

  const goBackward = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const getCurrentChildren = (path: number[]) => {
    let children = moveTree;
    for (let idx of path) {
      children = children[idx].children;
    }
    return children;
  };

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    const currentFen = getFenForPath(currentPath);
    const game = new Chess(currentFen);
    const piece = game.get(sourceSquare as Square);
    const isPromotion = piece?.type === 'p' &&
      ((piece.color === 'w' && targetSquare[1] === '8') ||
       (piece.color === 'b' && targetSquare[1] === '1'));
    let move;
    try {
      move = game.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: isPromotion ? 'q' : undefined
      });
    } catch (e) {
      console.error(e);
      return false;
    }
    const san = move.san;
    let children = getCurrentChildren(currentPath);
    const existingIndex = children.findIndex(c => c.san === san);
    if (existingIndex !== -1) {
      setCurrentPath([...currentPath, existingIndex]);
    } else {
      const newTree = JSON.parse(JSON.stringify(moveTree));
      let newChildren = getCurrentChildrenForTree(currentPath, newTree);
      newChildren.push({ san, children: [] });
      setMoveTree(newTree);
      setCurrentPath([...currentPath, newChildren.length - 1]);
    }
    return true;
  };

  // Helper for getting children in cloned tree
  const getCurrentChildrenForTree = (path: number[], tree: Move[]) => {
    let children = tree;
    for (let idx of path) {
      children = children[idx].children;
    }
    return children;
  };

  const loadFen = (fen: string) => {
    try {
      chessGameRef.current.load(fen);
      setChessPosition(fen);
      const history = chessGameRef.current.history();
      const newTree: Move[] = [];
      let current = newTree;
      history.forEach((san) => {
        const newMove = { san, children: [] };
        current.push(newMove);
        current = newMove.children;
      });
      setMoveTree(newTree);
      setCurrentPath(history.length > 0 ? Array.from({length: history.length}, () => 0) : []);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const getAttackers = (square: Square, color: 'w' | 'b') => {
    const game = new Chess(chessPosition);
    return game.attackers(square, color);
  };

  const isAtFinalPosition = getCurrentChildren(currentPath)[0] === undefined;

  const currentMoveIndex = currentPath.length - 1;

  const moveHistoryLength = (() => {
    let len = 0;
    let current = moveTree;
    while (current[0]) {
      len++;
      current = current[0].children;
    }
    return len;
  })();

  return {
    chessPosition,
    moveTree,
    currentPath,
    currentMoveIndex,
    moveHistoryLength,
    isAtFinalPosition,
    getLastMove,
    goToStart,
    goToEnd,
    goForward,
    goBackward,
    makeMove,
    loadFen,
    getAttackers,
    setCurrentPath,
  };
};
