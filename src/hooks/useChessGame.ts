import { useState, useRef } from 'react';
import { Chess, Square } from 'chess.js';

export interface MoveNode {
  move: string;
  san: string; // Standard algebraic notation for display
  fen: string;
  parent: MoveNode | null;
  mainLine: MoveNode | null;
  variations: MoveNode[];
  moveNumber: number;
  isWhiteMove: boolean;
}

export const useChessGame = () => {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]); // Keep for backward compatibility
  const [moveTree, setMoveTree] = useState<MoveNode | null>(null);
  const [currentNode, setCurrentNode] = useState<MoveNode | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 means starting position

  // Helper function to build linear move history from tree for backward compatibility
  const buildLinearHistory = (node: MoveNode | null): string[] => {
    if (!node) return [];
    const history: string[] = [];
    let current: MoveNode | null = node;
    
    // Find the root and build path
    const path: MoveNode[] = [];
    while (current) {
      path.unshift(current);
      current = current.parent || null;
    }
    
    return path.map(n => n.move);
  };

  // Helper function to navigate to a specific node
  const navigateToNode = (node: MoveNode | null) => {
    if (!node) {
      // Go to starting position
      chessGame.reset();
      setChessPosition(chessGame.fen());
      setCurrentNode(null);
      setCurrentMoveIndex(-1);
      return;
    }

    // Build path from root to this node
    const path: MoveNode[] = [];
    let current: MoveNode | null = node;
    while (current) {
      path.unshift(current);
      current = current.parent || null;
    }

    // Reset the chess game and play moves to reach this position
    chessGame.reset();
    for (const moveNode of path) {
      chessGame.move(moveNode.move);
    }

    setChessPosition(chessGame.fen());
    setCurrentNode(node);
    
    // Update linear history for backward compatibility
    const linearHistory = buildLinearHistory(node);
    setMoveHistory(linearHistory);
    setCurrentMoveIndex(linearHistory.length - 1);
  };

  // Helper function to find if a move exists in the next moves
  const findNextMove = (move: string, currentNode: MoveNode | null): MoveNode | null => {
    if (!currentNode) {
      // At starting position, check if move tree has this as first move
      if (moveTree && moveTree.move === move) {
        return moveTree;
      }
      return null;
    }

    // Check main line
    if (currentNode.mainLine && currentNode.mainLine.move === move) {
      return currentNode.mainLine;
    }

    // Check variations
    for (const variation of currentNode.variations) {
      if (variation.move === move) {
        return variation;
      }
    }

    return null;
  };

  const getLastMove = () => {
    if (currentNode) {
      const tempGame = new Chess();
      const path: MoveNode[] = [];
      let current: MoveNode | null = currentNode;
      while (current) {
        path.unshift(current);
        current = current.parent || null;
      }
      
      for (const moveNode of path) {
        tempGame.move(moveNode.move);
      }
      
      const history = tempGame.history({ verbose: true });
      return history[history.length - 1];
    }
    return null;
  };

  const goToStart = () => {
    navigateToNode(null);
  };

  const goToEnd = () => {
    if (!moveTree) return;
    
    // Find the end of the main line
    let current = moveTree;
    while (current.mainLine) {
      current = current.mainLine;
    }
    
    navigateToNode(current);
  };

  const goForward = () => {
    if (!currentNode) {
      // At starting position, go to first move if it exists
      if (moveTree) {
        navigateToNode(moveTree);
      }
      return;
    }

    // Go to main line if it exists
    if (currentNode.mainLine) {
      navigateToNode(currentNode.mainLine);
    }
  };

  const goBackward = () => {
    if (!currentNode) return;
    
    if (currentNode.parent) {
      navigateToNode(currentNode.parent);
    } else {
      navigateToNode(null); // Go to starting position
    }
  };

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    try {
      // Try to make the move on the current chess game state
      const moveObj = chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (!moveObj) return false;

      const moveStr = moveObj.lan; // Long algebraic notation
      const moveSan = moveObj.san; // Standard algebraic notation

      // Check if this move already exists as a next move
      const existingMove = findNextMove(moveStr, currentNode);
      if (existingMove) {
        // Navigate to existing move (this will reset the chess game state)
        navigateToNode(existingMove);
        return true;
      }

      // Create new move node
      const isWhiteMove = currentNode ? !currentNode.isWhiteMove : true;
      const moveNumber = currentNode ? 
        (isWhiteMove ? currentNode.moveNumber + 1 : currentNode.moveNumber) :
        1;

      const newNode: MoveNode = {
        move: moveStr,
        san: moveSan,
        fen: chessGame.fen(),
        parent: currentNode,
        mainLine: null,
        variations: [],
        moveNumber,
        isWhiteMove
      };

      if (!currentNode) {
        // First move of the game
        setMoveTree(newNode);
      } else {
        // Add as main line or variation
        if (!currentNode.mainLine) {
          // This becomes the main line
          currentNode.mainLine = newNode;
        } else {
          // This becomes a variation
          currentNode.variations.push(newNode);
        }
      }

      // Navigate to the new move (this will update the chess game state)
      navigateToNode(newNode);
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
      
      // Reset the move tree and history
      setMoveTree(null);
      setCurrentNode(null);
      setMoveHistory([]);
      setCurrentMoveIndex(-1);
      
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const getAttackers = (square: Square, color: 'w' | 'b') => {
    return chessGame.attackers(square, color);
  };

  // Check if we're at the final position (no main line continuation from current node)
  const isAtFinalPosition = !currentNode || !currentNode.mainLine;
  
  // Navigation state for buttons
  const isAtStart = !currentNode; // At starting position
  const isAtEnd = !moveTree || (!currentNode?.mainLine && currentNode !== null); // At end of current line

  return {
    chessPosition,
    moveHistory,
    moveTree,
    currentNode,
    currentMoveIndex,
    isAtFinalPosition,
    isAtStart,
    isAtEnd,
    getLastMove,
    goToStart,
    goToEnd,
    goForward,
    goBackward,
    makeMove,
    loadFen,
    getAttackers,
    navigateToNode,
  };
};
