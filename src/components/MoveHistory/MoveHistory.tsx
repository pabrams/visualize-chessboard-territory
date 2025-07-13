import React from 'react';
import { MoveNode } from '../../hooks/useChessGame';

interface MoveHistoryProps {
  theme: 'dark' | 'light';
  moveHistory: string[];
  currentMoveIndex: number;
  moveTree: MoveNode | null;
  currentNode: MoveNode | null;
  onNavigateToNode: (node: MoveNode | null) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  theme,
  moveHistory,
  currentMoveIndex,
  moveTree,
  currentNode,
  onNavigateToNode,
}) => {
  // Helper function to render variations inline
  const renderVariations = (variations: MoveNode[], depth: number = 0): React.ReactNode => {
    if (variations.length === 0) return null;

    return variations.map((variation, index) => {
      const variationText = renderVariationText(variation, depth + 1);
      return (
        <span key={index} style={{ marginLeft: '4px' }}>
          {depth === 0 ? ' (' : ' ('}
          {variationText}
          {')'}
        </span>
      );
    });
  };

  // Helper function to render variation text recursively
  const renderVariationText = (node: MoveNode, depth: number): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    
    // Add move number and move notation
    if (node.isWhiteMove) {
      // White move - always show move number
      elements.push(
        <span key={`move-number-${node.move}`} style={{ marginRight: '4px' }}>
          {node.moveNumber}.
        </span>
      );
    } else {
      // Black move - show move number with ellipsis if it starts a variation
      // or if the previous move in the variation was not the white move of the same number
      const isFirstInVariation = !node.parent || 
        (node.parent.isWhiteMove && node.parent.moveNumber !== node.moveNumber) ||
        (!node.parent.isWhiteMove);
      
      if (isFirstInVariation) {
        elements.push(
          <span key={`move-number-${node.move}`} style={{ marginRight: '4px' }}>
            {node.moveNumber}...
          </span>
        );
      }
    }
    
    // Add the move
    elements.push(
      <span
        key={`move-${node.move}`}
        onClick={() => onNavigateToNode(node)}
        style={{
          cursor: 'pointer',
          backgroundColor: currentNode === node
            ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
            : 'transparent',
          padding: '1px 3px',
          borderRadius: '3px',
          textDecoration: 'underline',
          marginRight: '4px'
        }}
      >
        {node.san}
      </span>
    );

    // Add main line continuation
    if (node.mainLine) {
      elements.push(renderVariationText(node.mainLine, depth));
    }

    // Add sub-variations (using brackets for depth > 1)
    if (node.variations.length > 0) {
      if (depth > 1) {
        // Use brackets for sub-variations of sub-variations
        node.variations.forEach((variation, index) => {
          elements.push(
            <span key={`subvar-${index}`} style={{ marginLeft: '4px' }}>
              {' ['}
              {renderVariationText(variation, depth + 1)}
              {']'}
            </span>
          );
        });
      } else {
        // Use parentheses for first-level variations
        elements.push(renderVariations(node.variations, depth));
      }
    }

    return elements;
  };

  // Build the main line display with variations
  const buildMoveDisplay = () => {
    if (!moveTree) return null;

    const rows: React.ReactNode[] = [];
    let current: MoveNode | null = moveTree;
    let moveNumber = 1;

    while (current) {
      const isWhiteMove = current.isWhiteMove;
      
      if (isWhiteMove) {
        // Capture the white move node before it gets reassigned
        const whiteNode = current;
        
        // Start a new row for white moves
        const whiteMove = (
          <span
            key={`white-${whiteNode.move}`}
            onClick={() => onNavigateToNode(whiteNode)}
            style={{
              cursor: 'pointer',
              backgroundColor: currentNode === whiteNode
                ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                : 'transparent',
              padding: '1px 3px',
              borderRadius: '3px',
              textDecoration: 'underline'
            }}
            onMouseEnter={(e) => {
              if (currentNode !== whiteNode) {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentNode !== whiteNode) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {whiteNode.san}
          </span>
        );

        let blackMove: React.ReactNode = null;
        let whiteVariations: React.ReactNode = null;
        let blackVariations: React.ReactNode = null;

        // Get variations for white move
        whiteVariations = renderVariations(current.variations);

        // Check if there's a black move
        if (current.mainLine && !current.mainLine.isWhiteMove) {
          const blackNode: MoveNode = current.mainLine;
          blackMove = (
            <span
              key={`black-${blackNode.move}`}
              onClick={() => onNavigateToNode(blackNode)}
              style={{
                cursor: 'pointer',
                backgroundColor: currentNode === blackNode
                  ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                  : 'transparent',
                padding: '1px 3px',
                borderRadius: '3px',
                textDecoration: 'underline'
              }}
              onMouseEnter={(e) => {
                if (currentNode !== blackNode) {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentNode !== blackNode) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {blackNode.san}
            </span>
          );

          // Get variations for black move
          blackVariations = renderVariations(blackNode.variations);
          current = blackNode.mainLine;
        } else {
          current = current.mainLine;
        }

        // Add the main move row
        rows.push(
          <div key={`row-${moveNumber}`} style={{ 
            display: 'table-row',
            marginBottom: '4px', 
            lineHeight: '1.4' 
          }}>
            {/* Move number column */}
            <div style={{ 
              display: 'table-cell',
              width: '40px',
              paddingRight: '12px',
              color: theme === 'dark' ? '#888' : '#666',
              textAlign: 'right'
            }}>
              {moveNumber}.
            </div>
            
            {/* White move column */}
            <div style={{ 
              display: 'table-cell',
              width: '80px',
              paddingRight: '12px'
            }}>
              {whiteMove}
            </div>
            
            {/* Black move column */}
            <div style={{ 
              display: 'table-cell',
              width: '80px'
            }}>
              {blackMove}
            </div>
          </div>
        );

        // Add variations row if there are any
        const hasVariations = whiteVariations || blackVariations;
        if (hasVariations) {
          rows.push(
            <div key={`variations-${moveNumber}`} style={{ 
              display: 'table-row',
              marginBottom: '8px', 
              lineHeight: '1.4' 
            }}>
              {/* Empty move number column */}
              <div style={{ 
                display: 'table-cell',
                width: '40px',
                paddingRight: '12px'
              }}></div>
              
              {/* Variations span across white and black columns */}
              <div style={{ 
                display: 'table-cell',
                paddingTop: '4px',
                fontSize: '12px',
                color: theme === 'dark' ? '#ccc' : '#555',
                wordWrap: 'break-word'
              }}>
                {whiteVariations}
                {blackVariations}
              </div>
              
              {/* Empty black move column */}
              <div style={{ 
                display: 'table-cell',
                width: '80px'
              }}></div>
            </div>
          );
        }

        moveNumber++;
      } else {
        // This shouldn't happen in normal flow, but handle it
        current = current.mainLine;
      }
    }

    return rows;
  };

  return (
    <div 
      data-testid="movehistory"
      style={{
        width: '100%',
        maxWidth: '500px',
        height: '200px',
        border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        borderRadius: '12px',
        padding: '1.5rem',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        overflowY: 'auto',
        fontSize: '14px',
        fontFamily: 'monospace',
        boxShadow: theme === 'dark' 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {!moveTree ? (
        <div style={{ color: theme === 'dark' ? '#666' : '#999', fontStyle: 'italic', fontSize: '13px' }}>
          No moves yet
        </div>
      ) : (
        <div style={{ display: 'table', width: '100%' }}>
          {buildMoveDisplay()}
        </div>
      )}
    </div>
  );
};
