import React, { useState, useRef, useEffect } from 'react';
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs} from 'react-chessboard';
import { Chess, Square } from 'chess.js';

// New types for variation support
interface MoveNode {
  move: string;
  fen: string;
  variations: MoveNode[][];
  parent?: MoveNode;
  moveNumber?: number;
  isWhite?: boolean;
}

interface CurrentPosition {
  node: MoveNode | null;
  variationIndex: number;
  moveIndex: number;
}

const App = () => {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  
  // Replace moveHistory and currentMoveIndex with new variation structure
  const [gameTree, setGameTree] = useState<MoveNode[]>([]);
  const [currentPosition, setCurrentPosition] = useState<CurrentPosition>({
    node: null,
    variationIndex: 0,
    moveIndex: -1
  });
  
  const [lastClickedSquare, setLastClickedSquare] = useState<string | null>(null);
  const [fenInput, setFenInput] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    return savedTheme || 'dark';
  });
  const [showSettings, setShowSettings] = useState(false);

  const [lightThemeColors, setLightThemeColors] = useState({
    pageBackgroundColor: '#f8f9fa',
    pageForegroundColor: '#000000',
    lightSquareColor: '#ffffff',
    darkSquareColor: '#777777',
    whiteArrowColor: '#ff0000',
    blackArrowColor: '#0000ff'
  });

  const [darkThemeColors, setDarkThemeColors] = useState({
    pageBackgroundColor: '#0a0a0a',
    pageForegroundColor: '#ffffff',
    lightSquareColor: '#dddddd',
    darkSquareColor: '#444444',
    whiteArrowColor: '#ff0000',
    blackArrowColor: '#0000ff'
  });

  // Helper function to get current game state
  const getCurrentGameState = () => {
    const tempGame = new Chess();
    if (currentPosition.node) {
      // Replay moves to current position
      const movesToReplay = [];
      let node = currentPosition.node;
      while (node) {
        movesToReplay.unshift(node.move);
        node = node.parent;
      }
      movesToReplay.forEach(move => tempGame.move(move));
    }
    return tempGame;
  };

  // Helper function to find a move in variations
  const findMoveInVariations = (variations: MoveNode[][], moveStr: string): { variation: MoveNode[], index: number } | null => {
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      for (let j = 0; j < variation.length; j++) {
        if (variation[j].move === moveStr) {
          return { variation, index: j };
        }
      }
    }
    return null;
  };

  const currentThemeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;

  // Load from localStorage
  useEffect(() => {
    const savedLight = localStorage.getItem('lightThemeColors');
    if (savedLight) {
      setLightThemeColors(JSON.parse(savedLight));
    }
    const savedDark = localStorage.getItem('darkThemeColors');
    if (savedDark) {
      setDarkThemeColors(JSON.parse(savedDark));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('lightThemeColors', JSON.stringify(lightThemeColors));
    localStorage.setItem('darkThemeColors', JSON.stringify(darkThemeColors));
  }, [lightThemeColors, darkThemeColors]);

const getLastMove = () => {
    if (currentPosition.node) {
      return {
        from: currentPosition.node.move.slice(0, 2),
        to: currentPosition.node.move.slice(2, 4)
      };
    }
    return null;
  };

  const goToStart = () => {
    const tempGame = new Chess();
    setChessPosition(tempGame.fen());
    setCurrentPosition({ node: null, variationIndex: 0, moveIndex: -1 });
    setArrows([]);
    setLastClickedSquare(null);
  };

  const goToEnd = () => {
    if (gameTree.length === 0) return;
    
    // Navigate to the end of the main variation
    let currentNode = gameTree[gameTree.length - 1];
    const tempGame = new Chess();
    
    // Replay all moves in main variation
    gameTree.forEach(node => tempGame.move(node.move));
    
    setChessPosition(tempGame.fen());
    setCurrentPosition({ 
      node: currentNode, 
      variationIndex: 0, 
      moveIndex: gameTree.length - 1 
    });
    setArrows([]);
    setLastClickedSquare(null);
  };

  const goForward = () => {
    if (currentPosition.node === null) {
      // At start, go to first move
      if (gameTree.length > 0) {
        const tempGame = new Chess();
        tempGame.move(gameTree[0].move);
        setChessPosition(tempGame.fen());
        setCurrentPosition({ 
          node: gameTree[0], 
          variationIndex: 0, 
          moveIndex: 0 
        });
      }
    } else {
      // Find next move in main variation
      const currentIndex = gameTree.findIndex(node => node === currentPosition.node);
      if (currentIndex >= 0 && currentIndex < gameTree.length - 1) {
        const nextNode = gameTree[currentIndex + 1];
        const tempGame = getCurrentGameState();
        tempGame.move(nextNode.move);
        setChessPosition(tempGame.fen());
        setCurrentPosition({ 
          node: nextNode, 
          variationIndex: 0, 
          moveIndex: currentIndex + 1 
        });
      }
    }
    setArrows([]);
    setLastClickedSquare(null);
  };

  const goBackward = () => {
    if (currentPosition.node === null) return;
    
    if (currentPosition.node.parent) {
      const tempGame = new Chess();
      // Replay moves up to parent
      const movesToReplay = [];
      let node = currentPosition.node.parent;
      while (node) {
        movesToReplay.unshift(node.move);
        node = node.parent;
      }
      movesToReplay.forEach(move => tempGame.move(move));
      
      setChessPosition(tempGame.fen());
      const parentIndex = gameTree.findIndex(n => n === currentPosition.node!.parent);
      setCurrentPosition({ 
        node: currentPosition.node.parent, 
        variationIndex: 0, 
        moveIndex: parentIndex 
      });
    } else {
      // Go to start
      goToStart();
    }
    setArrows([]);
    setLastClickedSquare(null);
  };

  const navigateToMove = (targetNode: MoveNode) => {
    const tempGame = new Chess();
    const movesToReplay = [];
    let node = targetNode;
    while (node) {
      movesToReplay.unshift(node.move);
      node = node.parent;
    }
    movesToReplay.forEach(move => tempGame.move(move));
    
    setChessPosition(tempGame.fen());
    const mainIndex = gameTree.findIndex(n => n === targetNode);
    setCurrentPosition({ 
      node: targetNode, 
      variationIndex: 0, 
      moveIndex: mainIndex 
    });
    setArrows([]);
    setLastClickedSquare(null);
  };


  // Check if we're at the final position
  const isAtFinalPosition = currentMoveIndex === moveHistory.length - 1 || moveHistory.length === 0;


  const onSquareRightClick = ({ square, piece }: SquareHandlerArgs) => {
    if (square === lastClickedSquare && arrows.length > 0) {
      // Clear arrows on second click of same square
      setArrows([]);
      setLastClickedSquare(null);
    } else {
      const newArrows: { startSquare: string; endSquare: string; color: string }[] = [];

      const whiteAttackers = chessGame.attackers(square as Square, 'w');
      whiteAttackers.forEach((attackerSquare) => {
        newArrows.push({
          startSquare: attackerSquare,
          endSquare: square,
          color: currentThemeColors.whiteArrowColor,  // White attackers
        });
      });
      
      const blackAttackers = chessGame.attackers(square as Square, 'b');
      blackAttackers.forEach((attackerSquare) => {
        newArrows.push({
          startSquare: attackerSquare,
          endSquare: square,
          color: currentThemeColors.blackArrowColor,  // Black attackers
        });
      });

      setArrows(newArrows);
      setLastClickedSquare(square);
    }
  };

  const [arrows, setArrows] = useState<
    { startSquare: string; endSquare: string, color: string }[]
  >([]);

  // Save theme to localStorage when it changes, but handle initial render correctly
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      // Only save to localStorage on initial render if no theme was previously saved
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        localStorage.setItem('theme', theme);
      }
      return;
    }
    // For subsequent renders, always save the theme
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply theme to body element
  useEffect(() => {
    document.body.style.backgroundColor = currentThemeColors.pageBackgroundColor;
    document.body.style.color = currentThemeColors.pageForegroundColor;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    document.body.style.transition = 'background-color 0.2s ease';
  }, [currentThemeColors]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
    piece
  }: PieceDropHandlerArgs) => {
    if (!targetSquare) {
      return false;
    }

    const currentGame = getCurrentGameState();
    let move;
    try {
      move = currentGame.move({
        from: sourceSquare, 
        to: targetSquare,
        promotion: 'q'
      });
      
      const moveStr = move.san;
      const newFen = currentGame.fen();
      
      // Check if this move already exists as a variation
      if (currentPosition.node) {
        const existingMove = findMoveInVariations(currentPosition.node.variations, moveStr);
        if (existingMove) {
          // Navigate to existing variation
          navigateToMove(existingMove.variation[existingMove.index]);
          return true;
        }
      }
      
      // Create new move node
      const newNode: MoveNode = {
        move: moveStr,
        fen: newFen,
        variations: [],
        parent: currentPosition.node
      };
      
      if (currentPosition.node === null) {
        // Adding to main variation from start
        const newGameTree = [...gameTree, newNode];
        setGameTree(newGameTree);
        setCurrentPosition({ 
          node: newNode, 
          variationIndex: 0, 
          moveIndex: newGameTree.length - 1 
        });
      } else {
        // Check if we're extending the main variation
        const currentMainIndex = gameTree.findIndex(n => n === currentPosition.node);
        if (currentMainIndex >= 0 && currentMainIndex === gameTree.length - 1) {
          // Extending main variation
          const newGameTree = [...gameTree, newNode];
          setGameTree(newGameTree);
          setCurrentPosition({ 
            node: newNode, 
            variationIndex: 0, 
            moveIndex: newGameTree.length - 1 
          });
        } else {
          // Creating a new variation
          const updatedTree = [...gameTree];
          const nodeToUpdate = updatedTree.find(n => n === currentPosition.node);
          if (nodeToUpdate) {
            nodeToUpdate.variations.push([newNode]);
          }
          setGameTree(updatedTree);
          setCurrentPosition({ 
            node: newNode, 
            variationIndex: currentPosition.node.variations.length, 
            moveIndex: 0 
          });
        }
      }
      
      setChessPosition(newFen);
      setArrows([]);
      setLastClickedSquare(null);
      return true; 
    } catch (e) {
      console.error(e);
      return false;
    }
  };
  
  // Function to render move history with variations
  const renderMoveHistory = () => {
    if (gameTree.length === 0) {
      return (
        <div style={{ color: theme === 'dark' ? '#666' : '#999', fontStyle: 'italic', fontSize: '13px' }}>
          No moves yet
        </div>
      );
    }

    const renderVariation = (variation: MoveNode[], depth: number = 0): JSX.Element[] => {
      const elements: JSX.Element[] = [];
      
      variation.forEach((node, index) => {
        const isSelected = currentPosition.node === node;
        const moveNumber = Math.floor(index / 2) + 1;
        const isWhite = index % 2 === 0;
        
        elements.push(
          <span
            key={`${depth}-${index}`}
            onClick={() => navigateToMove(node)}
            style={{
              color: theme === 'dark' ? '#ffffff' : '#000000',
              backgroundColor: isSelected
                ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                : 'transparent',
              padding: '1px 3px',
              borderRadius: '3px',
              cursor: 'pointer',
              marginRight: '4px'
            }}
          >
            {isWhite ? `${moveNumber}.` : ''} {node.move}
          </span>
        );
        
        // Render variations for this move
        if (node.variations.length > 0) {
          node.variations.forEach((subVariation, varIndex) => {
            elements.push(
              <span key={`var-${depth}-${index}-${varIndex}`} style={{ marginLeft: '4px' }}>
                ({renderVariation(subVariation, depth + 1)})
              </span>
            );
          });
        }
      });
      
      return elements;
    };

    return (
      <div style={{ display: 'table', width: '100%' }}>
        {Array.from({ length: Math.ceil(gameTree.length / 2) }).map((_, i) => {
          const whiteMove = gameTree[i * 2];
          const blackMove = gameTree[i * 2 + 1];

          return (
            <div key={i}>
              {/* Main variation row */}
              <div style={{ 
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
                  {i + 1}.
                </div>
                
                {/* White move column */}
                <div style={{ 
                  display: 'table-cell',
                  width: '80px',
                  paddingRight: '12px'
                }}>
                  {whiteMove && (
                    <span
                      onClick={() => navigateToMove(whiteMove)}
                      style={{
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        backgroundColor: currentPosition.node === whiteMove
                          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                          : 'transparent',
                        padding: '1px 3px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {whiteMove.move}
                    </span>
                  )}
                </div>
                
                {/* Black move column */}
                <div style={{ 
                  display: 'table-cell',
                  width: '80px'
                }}>
                  {blackMove && (
                    <span
                      onClick={() => navigateToMove(blackMove)}
                      style={{
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        backgroundColor: currentPosition.node === blackMove
                          ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
                          : 'transparent',
                        padding: '1px 3px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {blackMove.move}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Variations rows */}
              {whiteMove?.variations.map((variation, varIndex) => (
                <div key={`white-var-${i}-${varIndex}`} style={{
                  display: 'table-row',
                  marginBottom: '2px'
                }}>
                  <div style={{ display: 'table-cell' }}></div>
                  <div style={{ 
                    display: 'table-cell', 
                    colSpan: 2,
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: theme === 'dark' ? '#ccc' : '#555'
                  }}>
                    ({renderVariation(variation, 1)})
                  </div>
                </div>
              ))}
              
              {blackMove?.variations.map((variation, varIndex) => (
                <div key={`black-var-${i}-${varIndex}`} style={{
                  display: 'table-row',
                  marginBottom: '2px'
                }}>
                  <div style={{ display: 'table-cell' }}></div>
                  <div style={{ 
                    display: 'table-cell', 
                    colSpan: 2,
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: theme === 'dark' ? '#ccc' : '#555'
                  }}>
                    ({renderVariation(variation, 1)})
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };
  
  const lastMove = getLastMove();
  const sourceSquare = lastMove ? lastMove.from : null;
  const targetSquare = lastMove ? lastMove.to : null;

  const chessboardOptions = {
      onPieceDrop,
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
        width: '50vmin',
        height: '50vmin',
        boxShadow: theme === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.8)' 
          : '0 8px 32px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        overflow: 'hidden',
      },
      darkSquareStyle: {
        backgroundColor: currentThemeColors.darkSquareColor,
        border: 'none',
      },
      lightSquareStyle: {
        backgroundColor: currentThemeColors.lightSquareColor,
        border: 'none',
      },
      
      squareStyles: {
        ...(sourceSquare ? { [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {}),
        ...(targetSquare ? { [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {}),
      },
    };

  return (
    <div 
      data-testid="app-container" 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem',
        backgroundColor: currentThemeColors.pageBackgroundColor,
        color: currentThemeColors.pageForegroundColor,
        transition: 'all 0.2s ease',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* ... existing arrows list and theme toggle code ... */}

      {/* Main content container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        width: '100%',
        maxWidth: '800px',
      }}>
        <Chessboard 
          options={chessboardOptions} 
          data-testid="chessboard" 
        />

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          borderRadius: '12px',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        }}>
          <button
            onClick={goToStart}
            disabled={currentPosition.node === null}
            data-testid="goToStart"
            title="Go to start"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: currentPosition.node === null 
                ? (theme === 'dark' ? '#333' : '#ccc')
                : (theme === 'dark' ? '#555' : '#888'),
              color: currentPosition.node === null 
                ? (theme === 'dark' ? '#666' : '#999')
                : '#ffffff',
              cursor: currentPosition.node === null ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ⏮
          </button>
          <button
            onClick={goBackward}
            disabled={currentPosition.node === null}
            data-testid="goBackward"
            title="Previous move"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: currentPosition.node === null 
                ? (theme === 'dark' ? '#333' : '#ccc')
                : (theme === 'dark' ? '#555' : '#888'),
              color: currentPosition.node === null 
                ? (theme === 'dark' ? '#666' : '#999')
                : '#ffffff',
              cursor: currentPosition.node === null ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ◀
          </button>
          <button
            onClick={goForward}
            disabled={currentPosition.node === null ? gameTree.length === 0 : gameTree.findIndex(n => n === currentPosition.node) >= gameTree.length - 1}
            data-testid="goForward"
            title="Next move"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: (currentPosition.node === null ? gameTree.length === 0 : gameTree.findIndex(n => n === currentPosition.node) >= gameTree.length - 1)
                ? (theme === 'dark' ? '#333' : '#ccc')
                : (theme === 'dark' ? '#555' : '#888'),
              color: (currentPosition.node === null ? gameTree.length === 0 : gameTree.findIndex(n => n === currentPosition.node) >= gameTree.length - 1)
                ? (theme === 'dark' ? '#666' : '#999')
                : '#ffffff',
              cursor: (currentPosition.node === null ? gameTree.length === 0 : gameTree.findIndex(n => n === currentPosition.node) >= gameTree.length - 1) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ▶
          </button>
          <button
            onClick={goToEnd}
            disabled={currentPosition.node === null ? gameTree.length === 0 : gameTree.findIndex(n => n === currentPosition.node) >= gameTree.length - 1}
            data-testid="goToEnd"
            title="Go to end"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: (currentPosition.node === null ? gameTree.length === 0 : gameTree.findIndex(n => n === currentPosition.node) >= gameTree.length - 1)
                ? (theme === 'dark' ? '#333' : '#ccc')
                : (theme === 'dark' ? '#555' : '#888'),
              color: (currentPosition.node === null ? gameTree.length === 0 : gameTree.findIndex(n => n === currentPosition.node) >= gameTree.length - 1)
                ? (theme === 'dark' ? '#666' : '#999')
                : '#ffffff',
              cursor: (currentPosition.node === null ? gameTree.length === 0 : gameTree.findIndex(n => n === currentPosition.node) >= gameTree.length - 1) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ⏭
          </button>
        </div>



      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        data-testid="settingsButton"
        title="Settings"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '4.5rem', // To the right of theme button
          background: theme === 'dark' ? '#222222' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#444' : '#eeeeee'}`,
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          zIndex: 1000,
          color: theme === 'dark' ? '#ffffff' : '#000000',
          transition: 'all 0.2s ease',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
            : '0 6px 16px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21.5 12c0-.28-.03-.55-.08-.82l1.98-1.98a.5.5 0 0 0-.15-.68l-1.41-.7a11.02 11.02 0 0 0-1.65-2.86l-.7-1.41a.5.5 0 0 0-.68-.15L15.82 4.08c-.27-.05-.54-.08-.82-.08s-.55.03-.82.08L12.18 2.1a.5.5 0 0 0-.68.15l-.7 1.41a11.02 11.02 0 0 0-2.86 1.65l-1.41.7a.5.5 0 0 0-.15.68l1.98 1.98c-.05.27-.08.54-.08.82s.03.55.08.82l-1.98 1.98a.5.5 0 0 0 .15.68l1.41.7a11.02 11.02 0 0 0 1.65 2.86l.7 1.41a.5.5 0 0 0 .68.15l1.98-1.98c.27.05.54.08.82.08s.55-.03.82-.08l1.98 1.98a.5.5 0 0 0 .68-.15l.7-1.41a11.02 11.02 0 0 0 2.86-1.65l1.41-.7a.5.5 0 0 0 .15-.68L21.42 12.82c.05-.27.08-.54.08-.82z" fill="currentColor" />
        </svg>
      </button>

      {/* Settings panel */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: theme === 'dark' 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '300px',
          }}
        >
          <h3 style={{ marginBottom: '15px', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(currentThemeColors).map(([key, value]) => {
              const configName = key.replace('Color', '-color').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ color: theme === 'dark' ? '#ffffff' : '#000000', flex: 1 }}>
                    {configName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => {
                      const newColors = { ...currentThemeColors, [key]: e.target.value };
                      if (theme === 'dark') {
                        setDarkThemeColors(newColors);
                      } else {
                        setLightThemeColors(newColors);
                      }
                    }}
                    data-testid={`${theme}-theme-${configName}`}
                    style={{ marginLeft: '10px' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
         
        {/* Move history */}
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
          {renderMoveHistory()}
        </div>
        
        {/* FEN input container */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          width: '100%',
          maxWidth: '500px',
          padding: '1rem',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          borderRadius: '12px',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        }}>
          <input
            type="text"
            value={fenInput}
            onChange={(e) => setFenInput(e.target.value)}
            placeholder="Enter FEN position..."
            data-testid="FEN"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#444' : '#ccc'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f9f9f9',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontSize: '14px',
              fontFamily: 'monospace',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? '#6b5b95' : '#8b4513';
              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(107, 91, 149, 0.2)' : 'rgba(139, 69, 19, 0.2)'}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? '#444' : '#ccc';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            data-testid="applyFen"
            onClick={() => {
              try {
                chessGame.load(fenInput);
                setChessPosition(chessGame.fen());
                const newHistory = chessGame.history();
                // Convert to new format - this will reset variations
                const newGameTree = newHistory.map((move, index) => ({
                  move,
                  fen: '', // We'd need to replay to get accurate FENs
                  variations: [],
                  parent: index > 0 ? null : undefined // Simplified for FEN loading
                }));
                setGameTree(newGameTree);
                setCurrentPosition({ 
                  node: newGameTree.length > 0 ? newGameTree[newGameTree.length - 1] : null, 
                  variationIndex: 0, 
                  moveIndex: newGameTree.length - 1 
                });
                setArrows([]);
                setLastClickedSquare(null);
              } catch (e) {
                console.error(e);
              }
            }}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#333333' : '#888888',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#333333' : '#777777';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#666666' : '#999999';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;