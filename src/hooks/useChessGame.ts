import { useState, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { GameTree, GameNode } from '../types/GameTree';
import {
  createInitialGameTree,
  addMoveToTree,
  navigateToNode,
  getPathToNode,
  getMainLine,
} from '../utils/gameTreeUtils';

export const useChessGame = () => {
  const chessGameRef = useRef(new Chess());
  const [gameTree, setGameTree] = useState<GameTree>(createInitialGameTree());
  const [chessPosition, setChessPosition] = useState(chessGameRef.current.fen());

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
    if (currentNode.move) {
      const tempGame = new Chess();
      tempGame.load(currentNode.fen);
      const history = tempGame.history({ verbose: true });
      return history[history.length - 1];
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

  const makeMove = (sourceSquare: string, targetSquare: string) => {
    try {
      // Create a temporary chess instance at the current position
      const tempGame = new Chess();
      const currentNode = getCurrentNode();
      tempGame.load(currentNode.fen);

      const move = tempGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (!move) {
        return false;
      }

      // Add the move to the game tree
      const { tree: updatedTree } = addMoveToTree(
        gameTree,
        gameTree.currentNodeId,
        move.lan, // Long algebraic notation for internal storage
        move.san, // Standard algebraic notation for display
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

  const getAttackers = (square: Square, color: 'w' | 'b') => {
    return chessGameRef.current.attackers(square, color);
  };

  // Get move history for display (backward compatibility)
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

  // Check if we're at the final position (no children and no variations)
  const isAtFinalPosition = (): boolean => {
    const currentNode = getCurrentNode();
    return currentNode.children.length === 0 && currentNode.variations.length === 0;
  };

  // Check if we can go forward (has children in main line)
  const canGoForward = (): boolean => {
    const currentNode = getCurrentNode();
    return currentNode.children.length > 0;
  };

  // Check if we can go backward (has parent)
  const canGoBackward = (): boolean => {
    const currentNode = getCurrentNode();
    return currentNode.parent !== null;
  };

  // Check if we're at the start
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
    getAttackers,
  };
};
