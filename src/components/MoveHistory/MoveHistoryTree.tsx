import React from 'react';
import { GameTree, GameNode } from '../../types/GameTree';
import { getMainLine, getVariationsFromNode } from '../../utils/gameTreeUtils';

interface MoveHistoryTreeProps {
  theme: 'dark' | 'light';
  gameTree: GameTree;
  onMoveClick: (nodeId: string) => void;
}

interface MoveDisplayProps {
  theme: 'dark' | 'light';
  node: GameNode;
  isCurrentMove: boolean;
  onClick: () => void;
}

const MoveDisplay: React.FC<MoveDisplayProps> = ({ theme, node, isCurrentMove, onClick }) => {
  return (
    <span
      onClick={onClick}
      style={{
        color: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: isCurrentMove
          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
          : 'transparent',
        padding: '1px 3px',
        borderRadius: '3px',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isCurrentMove
          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.4)' : 'rgba(255, 215, 0, 0.5)')
          : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isCurrentMove
          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
          : 'transparent';
      }}
    >
      {node.san}
    </span>
  );
};

const getBracketStyle = (depth: number): { open: string; close: string } => {
  // Start with round brackets and alternate between round and square
  // Level 0: no brackets (main line)
  // Level 1: round brackets ()
  // Level 2: square brackets []
  // Level 3: round brackets ()
  // Level 4: square brackets []
  // etc.
  
  if (depth === 0) {
    return { open: '', close: '' };
  }
  
  // For depth 1, 3, 5, ... use round brackets
  // For depth 2, 4, 6, ... use square brackets
  const useRoundBrackets = depth % 2 === 1;
  
  return useRoundBrackets 
    ? { open: '(', close: ')' }
    : { open: '[', close: ']' };
};

interface VariationDisplayProps {
  theme: 'dark' | 'light';
  gameTree: GameTree;
  startNode: GameNode;
  currentNodeId: string;
  onMoveClick: (nodeId: string) => void;
  depth: number;
}

const VariationDisplay: React.FC<VariationDisplayProps> = ({
  theme,
  gameTree,
  startNode,
  currentNodeId,
  onMoveClick,
  depth
}) => {
  const renderVariationMoves = (node: GameNode): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let currentNode: GameNode | undefined = node;
    let key = 0;

    while (currentNode) {
      const isCurrentMove = currentNode.id === currentNodeId;
      
      // Add move number for white moves or when starting a variation with black
      if (currentNode.isWhiteMove || (elements.length === 0 && !currentNode.isWhiteMove)) {
        const moveNumberText = currentNode.isWhiteMove 
          ? `${currentNode.moveNumber}.`
          : `${currentNode.moveNumber}...`;
        
        elements.push(
          <span key={`num-${key}`} style={{ 
            color: theme === 'dark' ? '#888' : '#666',
            marginRight: '4px'
          }}>
            {moveNumberText}
          </span>
        );
      }

      // Add the move
      elements.push(
        <MoveDisplay
          key={`move-${key}`}
          theme={theme}
          node={currentNode}
          isCurrentMove={isCurrentMove}
          onClick={() => onMoveClick(currentNode!.id)}
        />
      );

      // Add space after move
      elements.push(<span key={`space-${key}`}> </span>);

      // Check for variations at this node
      const variations = getVariationsFromNode(gameTree, currentNode.id);
      const nonMainVariations = variations.filter(v => !v.isMainLine);
      
      if (nonMainVariations.length > 0) { // Removed depth limit for infinite nesting
        nonMainVariations.forEach((variation, varIndex) => {
          const firstVariationNode = gameTree.nodes[variation.nodeId];
          if (firstVariationNode) {
            const brackets = getBracketStyle(depth + 1);
            
            elements.push(
              <span key={`var-open-${key}-${varIndex}`} style={{ 
                color: theme === 'dark' ? '#888' : '#666',
                marginLeft: '4px',
                marginRight: '2px'
              }}>
                {brackets.open}
              </span>
            );
            
            elements.push(
              <VariationDisplay
                key={`var-${key}-${varIndex}`}
                theme={theme}
                gameTree={gameTree}
                startNode={firstVariationNode}
                currentNodeId={currentNodeId}
                onMoveClick={onMoveClick}
                depth={depth + 1}
              />
            );
            
            elements.push(
              <span key={`var-close-${key}-${varIndex}`} style={{ 
                color: theme === 'dark' ? '#888' : '#666',
                marginLeft: '2px',
                marginRight: '4px'
              }}>
                {brackets.close}
              </span>
            );
          }
        });
      }

      // Move to next node in main line
      if (currentNode.children.length > 0) {
        currentNode = gameTree.nodes[currentNode.children[0]];
      } else {
        break;
      }
      key++;
    }

    return elements;
  };

  return <>{renderVariationMoves(startNode)}</>;
};

export const MoveHistoryTree: React.FC<MoveHistoryTreeProps> = ({
  theme,
  gameTree,
  onMoveClick,
}) => {
  const mainLine = getMainLine(gameTree);
  const currentNodeId = gameTree.currentNodeId;

  if (mainLine.length === 0) {
    return (
      <div style={{ color: theme === 'dark' ? '#666' : '#999', fontStyle: 'italic', fontSize: '13px' }}>
        No moves yet
      </div>
    );
  }

  // Build table rows with proper variation placement
  const tableRows: React.ReactNode[] = [];
  
  // Process each move in the main line and add variations immediately after
  for (let i = 0; i < mainLine.length; i++) {
    const currentMove = mainLine[i];
    const isWhiteMove = currentMove.isWhiteMove;
    const moveNumber = currentMove.moveNumber;
    
    // Find if this is the start of a new move pair (white move)
    if (isWhiteMove) {
      const blackMove = i + 1 < mainLine.length && !mainLine[i + 1].isWhiteMove ? mainLine[i + 1] : null;
      
      // Main move row
      tableRows.push(
        <tr key={`main-${moveNumber}`}>
          <td style={{ 
            width: '40px',
            paddingRight: '12px',
            color: theme === 'dark' ? '#888' : '#666',
            textAlign: 'right',
            verticalAlign: 'top'
          }}>
            {moveNumber}.
          </td>
          
          <td style={{ 
            width: '80px',
            paddingRight: '12px',
            verticalAlign: 'top'
          }}>
            <MoveDisplay
              theme={theme}
              node={currentMove}
              isCurrentMove={currentMove.id === currentNodeId}
              onClick={() => onMoveClick(currentMove.id)}
            />
          </td>
          
          <td style={{ 
            width: '80px',
            verticalAlign: 'top'
          }}>
            {blackMove && (
              <MoveDisplay
                theme={theme}
                node={blackMove}
                isCurrentMove={blackMove.id === currentNodeId}
                onClick={() => onMoveClick(blackMove.id)}
              />
            )}
          </td>
        </tr>
      );

      // Add variations for the white move immediately after
      const whiteVariations = getVariationsFromNode(gameTree, currentMove.id);
      const whiteNonMainVariations = whiteVariations.filter(v => !v.isMainLine);
      
      if (whiteNonMainVariations.length > 0) {
        tableRows.push(
          <tr key={`white-var-${moveNumber}-${i}`}>
            <td></td>
            <td colSpan={2} style={{ 
              fontSize: '13px',
              paddingLeft: '8px',
              verticalAlign: 'top'
            }}>
              {whiteNonMainVariations.map((variation, varIndex) => {
                const firstNode = gameTree.nodes[variation.nodeId];
                return firstNode ? (
                  <div key={varIndex} style={{ marginBottom: '2px' }}>
                    <VariationDisplay
                      theme={theme}
                      gameTree={gameTree}
                      startNode={firstNode}
                      currentNodeId={currentNodeId}
                      onMoveClick={onMoveClick}
                      depth={1}
                    />
                  </div>
                ) : null;
              })}
            </td>
          </tr>
        );
      }

      // Add variations for the black move if it exists
      if (blackMove) {
        const blackVariations = getVariationsFromNode(gameTree, blackMove.id);
        const blackNonMainVariations = blackVariations.filter(v => !v.isMainLine);
        
        if (blackNonMainVariations.length > 0) {
          tableRows.push(
            <tr key={`black-var-${moveNumber}-${i + 1}`}>
              <td></td>
              <td colSpan={2} style={{ 
                fontSize: '13px',
                paddingLeft: '8px',
                verticalAlign: 'top'
              }}>
                {blackNonMainVariations.map((variation, varIndex) => {
                  const firstNode = gameTree.nodes[variation.nodeId];
                  return firstNode ? (
                    <div key={varIndex} style={{ marginBottom: '2px' }}>
                      <VariationDisplay
                        theme={theme}
                        gameTree={gameTree}
                        startNode={firstNode}
                        currentNodeId={currentNodeId}
                        onMoveClick={onMoveClick}
                        depth={1}
                      />
                    </div>
                  ) : null;
                })}
              </td>
            </tr>
          );
        }
        
        // Skip the black move in the next iteration since we processed it here
        i++;
      }
    }
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {tableRows}
      </tbody>
    </table>
  );
};
