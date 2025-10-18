import { useState, useRef, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { GameTree, GameNode } from '../types/GameTree';
import {
  createInitialGameTree,
  addMoveToTree,
  navigateToNode,
  getPathToNode,
  getMainLine,
} from '../utils/gameTreeUtils';

interface PuzzleState {
  active: boolean;
  solution: string[]; // Array of moves in UCI format (e.g., ['e2e4', 'e7e5'])
  currentMoveIndex: number; // Index of the next expected move in the solution
  isPlayerTurn: boolean; // Whether it's the player's turn or the engine is making a move
  completed: boolean; // Whether the puzzle has been successfully completed
  drillMode: boolean; // Whether this is a drill puzzle
  puzzleStartTime?: number; // Timestamp when puzzle started (for drill mode)
  onWrongMove?: () => void; // Callback for wrong moves in drill mode
}

export const useChessGame = () => {
  const chessGameRef = useRef(new Chess());
  const [gameTree, setGameTree] = useState<GameTree>(createInitialGameTree());
  const [chessPosition, setChessPosition] = useState(chessGameRef.current.fen());
  const [puzzleState, setPuzzleState] = useState<PuzzleState>({
    active: false,
    solution: [],
    currentMoveIndex: 0,
    isPlayerTurn: false,
    completed: false,
    drillMode: false,
  });

  const getCurrentNode = (): GameNode => {
    return gameTree.nodes[gameTree.currentNodeId];
  };

  const updateChessPosition = (nodeId: string) => {
    const node = gameTree.nodes[nodeId];
    if (node) {
      chessGameRef.current.load(node.fen);
      setChessPosition(node.fen);
    }
  };

  const getLastMove = () => {
    const currentNode = getCurrentNode();
    if (currentNode.move && currentNode.parent) {

      const move = currentNode.move;
      const from = move.substring(0, 2);
      const to = move.substring(2, 4);
      const promotion = move.length > 4 ? move.substring(4) : undefined;
      
      return {
        from,
        to,
        promotion,
        san: currentNode.san
      };
    }
    return null;
  };

  const goToStart = () => {
    const updatedTree = navigateToNode(gameTree, gameTree.rootId);
    setGameTree(updatedTree);
    updateChessPosition(gameTree.rootId);
  };

  const goToEnd = () => {
    const mainLine = getMainLine(gameTree);
    if (mainLine.length > 0) {
      const lastNode = mainLine[mainLine.length - 1];
      const updatedTree = navigateToNode(gameTree, lastNode.id);
      setGameTree(updatedTree);
      updateChessPosition(lastNode.id);
    }
  };

  const goForward = () => {
    const currentNode = getCurrentNode();
    if (currentNode.children.length > 0) {
      const nextNodeId = currentNode.children[0]; // Follow main line
      const updatedTree = navigateToNode(gameTree, nextNodeId);
      setGameTree(updatedTree);
      updateChessPosition(nextNodeId);
    }
  };

  const goBackward = () => {
    const currentNode = getCurrentNode();
    if (currentNode.parent) {
      const updatedTree = navigateToNode(gameTree, currentNode.parent);
      setGameTree(updatedTree);
      updateChessPosition(currentNode.parent);
    }
  };

  const makeMove = (sourceSquare: string, targetSquare: string, promotion?: string) => {
    try {
      const tempGame = new Chess();
      const currentNode = getCurrentNode();
      tempGame.load(currentNode.fen);

      const moveOptions: any = {
        from: sourceSquare,
        to: targetSquare,
      };

      if (promotion) {
        moveOptions.promotion = promotion;
      }

      const move = tempGame.move(moveOptions);

      if (!move) {
        return false;
      }

      if (puzzleState.active && puzzleState.isPlayerTurn) {
        const expectedMove = puzzleState.solution[puzzleState.currentMoveIndex];
        const playerMove = move.lan;
        if (playerMove !== expectedMove) {
          if (puzzleState.drillMode && puzzleState.onWrongMove) {
            puzzleState.onWrongMove();
          }
          return false; // Reject the move if it doesn't match the solution
        }

        // Correct move! Add it to the tree
        const { tree: updatedTree } = addMoveToTree(
          gameTree,
          gameTree.currentNodeId,
          move.lan,
          move.san,
          tempGame.fen()
        );

        setGameTree(updatedTree);
        setChessPosition(tempGame.fen());
        chessGameRef.current.load(tempGame.fen());

        // Check if this was the last move in the solution
        if (puzzleState.currentMoveIndex === puzzleState.solution.length - 1) {
          // Puzzle completed!
          setPuzzleState(prev => ({
            ...prev,
            completed: true,
            isPlayerTurn: false,
          }));
        } else {
          // More moves to go - increment index and set to opponent's turn
          setPuzzleState(prev => ({
            ...prev,
            currentMoveIndex: prev.currentMoveIndex + 1,
            isPlayerTurn: false,
          }));
        }

        return true;
      }

      // Normal mode - just add the move to the game tree
      const { tree: updatedTree } = addMoveToTree(
        gameTree,
        gameTree.currentNodeId,
        move.lan,
        move.san,
        tempGame.fen()
      );

      setGameTree(updatedTree);
      setChessPosition(tempGame.fen());
      chessGameRef.current.load(tempGame.fen());
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const makeMoveFromNode = (nodeId: string, sourceSquare: string, targetSquare: string) => {
    try {
      // Create a temporary chess instance at the specified position
      const tempGame = new Chess();
      const node = gameTree.nodes[nodeId];
      if (!node) {
        return false;
      }

      tempGame.load(node.fen);

      const move = tempGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (!move) {
        return false;
      }

      // Add the move to the game tree from the specified node
      const { tree: updatedTree } = addMoveToTree(
        gameTree,
        nodeId,
        move.lan,
        move.san,
        tempGame.fen()
      );

      setGameTree(updatedTree);
      updateChessPosition(updatedTree.currentNodeId);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const navigateToMove = (nodeId: string) => {
    const updatedTree = navigateToNode(gameTree, nodeId);
    setGameTree(updatedTree);
    updateChessPosition(nodeId);
  };

  const loadFen = (fen: string) => {
    try {
      const tempGame = new Chess();
      tempGame.load(fen);
      
      // Create a new game tree with the FEN position as root
      const newTree = createInitialGameTree();
      newTree.nodes[newTree.rootId].fen = fen;
      
      setGameTree(newTree);
      chessGameRef.current.load(fen);
      setChessPosition(fen);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const loadPgn = (pgn: string, initialPly?: number) => {
    try {
      const tempGame = new Chess();
      tempGame.loadPgn(pgn);

      // Create a new game tree starting from the initial position
      const newTree = createInitialGameTree();
      let currentNodeId = newTree.rootId;

      // Get the move history
      const moves = tempGame.history({ verbose: true });

      // Add each move to the tree
      for (const move of moves) {
        const { tree: updatedTree, newNodeId } = addMoveToTree(
          newTree,
          currentNodeId,
          move.lan,
          move.san,
          move.after // This should be the FEN after the move
        );
        // Update the tree properly
        newTree.nodes = updatedTree.nodes;
        newTree.currentNodeId = updatedTree.currentNodeId;
        currentNodeId = newNodeId;
      }

      if (initialPly !== undefined && initialPly >= 0) {
        const targetPly = Math.min(initialPly, moves.length);

        if (targetPly === 0) {
          newTree.currentNodeId = newTree.rootId;
        } else {
          // Navigate to the specified ply
          let nodeId = newTree.rootId;
          for (let i = 0; i < targetPly; i++) {
            const node = newTree.nodes[nodeId];
            if (node.children.length > 0) {
              nodeId = node.children[0];
            } else {
              break;
            }
          }
          newTree.currentNodeId = nodeId;
        }
      } else {
        // Navigate to the final position
        newTree.currentNodeId = currentNodeId;
      }

      setGameTree(newTree);

      // Update chess position directly using the new tree
      const currentNode = newTree.nodes[newTree.currentNodeId];
      if (currentNode) {
        chessGameRef.current.load(currentNode.fen);
        setChessPosition(currentNode.fen);
      }

      return true;
    } catch (e) {
      console.error('Failed to load PGN:', e);
      return false;
    }
  };

  const startPuzzleMode = (solution: string[], drillMode: boolean = false, onWrongMove?: () => void) => {
    setPuzzleState({
      active: true,
      solution,
      currentMoveIndex: 0,
      // In drill mode, we load to final position so it's player's turn
      // In normal mode, solution[0] is opponent's setup move
      isPlayerTurn: drillMode,
      completed: false,
      drillMode,
      puzzleStartTime: drillMode ? Date.now() : undefined,
      onWrongMove,
    });
  };

  const exitPuzzleMode = () => {
    setPuzzleState({
      active: false,
      solution: [],
      currentMoveIndex: 0,
      isPlayerTurn: false,
      completed: false,
      drillMode: false,
      puzzleStartTime: undefined,
      onWrongMove: undefined,
    });
  };

  // Auto-play opponent moves in puzzle mode
  useEffect(() => {
    if (!puzzleState.active || puzzleState.isPlayerTurn || puzzleState.completed) {
      return;
    }

    // Drill mode: 50ms delay for all moves
    // Normal mode: First opponent move 1 second, subsequent 300ms
    const delay = puzzleState.drillMode ? 50 : (puzzleState.currentMoveIndex === 0 ? 1000 : 300);

    const timer = setTimeout(() => {
      const nextMove = puzzleState.solution[puzzleState.currentMoveIndex];
      if (!nextMove) {
        console.error('No move found in solution at index', puzzleState.currentMoveIndex);
        return;
      }

      // Parse the UCI move (e.g., "e2e4")
      const from = nextMove.substring(0, 2);
      const to = nextMove.substring(2, 4);
      const promotion = nextMove.length > 4 ? nextMove.substring(4) : undefined;

      // Create a temporary chess instance at the current position
      const tempGame = new Chess();
      const currentNode = getCurrentNode();
      tempGame.load(currentNode.fen);

      const move = tempGame.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (!move) {
        console.error('❌ Failed to make opponent move:', nextMove);
        return;
      }

      // Add the move to the game tree
      const { tree: updatedTree } = addMoveToTree(
        gameTree,
        gameTree.currentNodeId,
        move.lan,
        move.san,
        tempGame.fen()
      );

      setGameTree(updatedTree);
      setChessPosition(tempGame.fen());
      chessGameRef.current.load(tempGame.fen());

      // Now it's the player's turn
      setPuzzleState(prev => ({
        ...prev,
        currentMoveIndex: prev.currentMoveIndex + 1,
        isPlayerTurn: true,
      }));
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [puzzleState, gameTree]);

  const getAttackers = (square: Square, color: 'w' | 'b') => {
    return chessGameRef.current.attackers(square, color);
  };

  const getMoveHistory = (): string[] => {
    const path = getPathToNode(gameTree, gameTree.currentNodeId);
    return path.slice(1).map(node => node.san || '').filter(san => san !== '');
  };

  const getCurrentMoveIndex = (): number => {
    const currentNode = getCurrentNode();
    if (currentNode.id === gameTree.rootId) {
      return -1; // At starting position
    }
    // Count the number of moves from starting to current position
    const path = getPathToNode(gameTree, gameTree.currentNodeId);
    return path.length - 1;
  };

  const isAtFinalPosition = (): boolean => {
    const currentNode = getCurrentNode();
    return currentNode.children.length === 0 && currentNode.variations.length === 0;
  };

  const canGoForward = (): boolean => {
    const currentNode = getCurrentNode();
    return currentNode.children.length > 0;
  };

  const canGoBackward = (): boolean => {
    const currentNode = getCurrentNode();
    return currentNode.parent !== null;
  };

  const isAtStart = (): boolean => {
    const currentNode = getCurrentNode();
    return currentNode.id === gameTree.rootId;
  };

  return {
    chessPosition,
    gameTree,
    moveHistory: getMoveHistory(),
    currentMoveIndex: getCurrentMoveIndex(),
    isAtFinalPosition: isAtFinalPosition(),
    canGoForward: canGoForward(),
    canGoBackward: canGoBackward(),
    isAtStart: isAtStart(),
    getLastMove,
    goToStart,
    goToEnd,
    goForward,
    goBackward,
    makeMove,
    makeMoveFromNode,
    navigateToMove,
    loadFen,
    loadPgn,
    getAttackers,
    puzzleState,
    startPuzzleMode,
    exitPuzzleMode,
  };
};
