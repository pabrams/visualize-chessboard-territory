import { Chess } from 'chess.js';
import { GameTree, GameNode, MoveVariation } from '../types/GameTree';

export const createInitialGameTree = (): GameTree => {
  const chess = new Chess();
  const rootId = 'root';
  
  const rootNode: GameNode = {
    id: rootId,
    move: null,
    san: null,
    fen: chess.fen(),
    parent: null,
    children: [],
    variations: [],
    moveNumber: 0, // Root starts at 0, first white move will be 1
    isWhiteMove: false, // Root is "before" white's first move
  };

  return {
    nodes: { [rootId]: rootNode },
    rootId,
    currentNodeId: rootId,
  };
};

export const generateNodeId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const addMoveToTree = (
  tree: GameTree,
  fromNodeId: string,
  move: string,
  san: string,
  resultingFen: string
): { tree: GameTree; newNodeId: string } => {
  const fromNode: GameNode | undefined = tree.nodes[fromNodeId];
  if (!fromNode) {
    throw new Error(`Node ${fromNodeId} not found`);
  }

  const newNodeId = generateNodeId();
  const isWhiteMove = !fromNode.isWhiteMove; // The new move is opposite color of the parent
  const moveNumber = isWhiteMove ? fromNode.moveNumber + 1 : fromNode.moveNumber;

  const newNode: GameNode = {
    id: newNodeId,
    move,
    san,
    fen: resultingFen,
    parent: fromNodeId,
    children: [],
    variations: [],
    moveNumber,
    isWhiteMove,
    createdAt: Date.now(),
  };

  const updatedTree = { ...tree };
  updatedTree.nodes = { ...tree.nodes };
  updatedTree.nodes[newNodeId] = newNode;

  // Check if this move already exists as a child or variation
  const existingChild = fromNode.children.find(childId => {
    const childNode: GameNode | undefined = tree.nodes[childId];
    return childNode && childNode.san === san;
  });

  const existingVariation = fromNode.variations.find(variationId => {
    const variationNode: GameNode | undefined = tree.nodes[variationId];
    return variationNode && variationNode.san === san;
  });

  if (existingChild) {
    // Move already exists as main line, just navigate to it
    updatedTree.currentNodeId = existingChild;
    return { tree: updatedTree, newNodeId: existingChild };
  }

  if (existingVariation) {
    // Move already exists as variation, just navigate to it
    updatedTree.currentNodeId = existingVariation;
    return { tree: updatedTree, newNodeId: existingVariation };
  }

  // Add as new child or variation
  if (fromNode.children.length === 0 && fromNode.variations.length === 0) {
    // First child becomes the main line
    updatedTree.nodes[fromNodeId] = {
      ...fromNode,
      children: [newNodeId],
    };
  } else {
    // Additional children become variations (append to end for creation order)
    // This handles both cases: when there's already a main line child, or when there are existing variations
    updatedTree.nodes[fromNodeId] = {
      ...fromNode,
      variations: [...fromNode.variations, newNodeId],
    };
  }

  updatedTree.currentNodeId = newNodeId;
  return { tree: updatedTree, newNodeId };
};

export const navigateToNode = (tree: GameTree, nodeId: string): GameTree => {
  if (!tree.nodes[nodeId]) {
    throw new Error(`Node ${nodeId} not found`);
  }

  return {
    ...tree,
    currentNodeId: nodeId,
  };
};

export const getPathToNode = (tree: GameTree, nodeId: string): GameNode[] => {
  const path: GameNode[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node: GameNode | undefined = tree.nodes[currentId];
    if (!node) break;
    path.unshift(node);
    currentId = node.parent;
  }

  return path;
};

export const getMainLine = (tree: GameTree): GameNode[] => {
  const mainLine: GameNode[] = [];
  let currentNode: GameNode | undefined = tree.nodes[tree.rootId];

  while (currentNode) {
    mainLine.push(currentNode);
    if (currentNode.children.length > 0) {
      currentNode = tree.nodes[currentNode.children[0]];
    } else {
      break;
    }
  }

  return mainLine.slice(1); // Remove root node
};

export const getVariationsFromNode = (tree: GameTree, nodeId: string): MoveVariation[] => {
  const node: GameNode | undefined = tree.nodes[nodeId];
  if (!node) return [];

  const variations: MoveVariation[] = [];

  // Main line continuation
  if (node.children.length > 0) {
    const mainChild: GameNode | undefined = tree.nodes[node.children[0]];
    if (mainChild) {
      const mainLineMoves = getMovesFromNode(tree, node.children[0]);
      variations.push({
        nodeId: node.children[0],
        moves: mainLineMoves,
        isMainLine: true,
      });
    }
  }

  // Variations
  node.variations.forEach((variationId: string) => {
    const variationMoves = getMovesFromNode(tree, variationId);
    variations.push({
      nodeId: variationId,
      moves: variationMoves,
      isMainLine: false,
    });
  });

  return variations;
};

const getMovesFromNode = (tree: GameTree, nodeId: string): GameNode[] => {
  const moves: GameNode[] = [];
  let currentNode: GameNode | undefined = tree.nodes[nodeId];

  while (currentNode) {
    moves.push(currentNode);
    if (currentNode.children.length > 0) {
      currentNode = tree.nodes[currentNode.children[0]];
    } else {
      break;
    }
  }

  return moves;
};

export const formatMoveForDisplay = (node: GameNode): string => {
  if (!node.san) return '';
  
  if (node.isWhiteMove) {
    return `${node.moveNumber}.${node.san}`;
  } else {
    return node.san;
  }
};

export const formatVariationStart = (node: GameNode): string => {
  if (!node.san) return '';
  
  if (node.isWhiteMove) {
    return `${node.moveNumber}.${node.san}`;
  } else {
    return `${node.moveNumber}...${node.san}`;
  }
};
