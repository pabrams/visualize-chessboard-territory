export interface GameNode {
  id: string;
  move: string | null; // null for root node
  san: string | null; // Standard Algebraic Notation
  fen: string;
  parent: string | null;
  children: string[];
  variations: string[]; // IDs of variation nodes in creation order
  moveNumber: number;
  isWhiteMove: boolean;
  createdAt?: number; // Timestamp for ordering variations
}

export interface GameTree {
  nodes: { [id: string]: GameNode };
  rootId: string;
  currentNodeId: string;
}

export interface MoveVariation {
  nodeId: string;
  moves: GameNode[];
  isMainLine: boolean;
}
