import React, { useState } from 'react';
import { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import { useChessGame } from './hooks/useChessGame';
import { useTheme } from './hooks/useTheme';
import { useArrows } from './hooks/useArrows';
import { ChessBoard } from './components/ChessBoard/ChessBoard';
import { ThemeToggle } from './components/Settings/ThemeToggle';
import { SettingsButton } from './components/Settings/SettingsButton';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { NavigationControls } from './components/Navigation/NavigationControls';
import { MoveHistory } from './components/MoveHistory/MoveHistory';
import { FenInput } from './components/FenInput/FenInput';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom hooks
  const chessGame = useChessGame();
  const theme = useTheme();
  const arrows = useArrows();

  const handleSquareRightClick = ({ square }: SquareHandlerArgs) => {
    arrows.showAttackersForSquare(
      square,
      chessGame.getAttackers,
      theme.currentThemeColors.whiteArrowColor,
      theme.currentThemeColors.blackArrowColor
    );
  };

  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) {
      return false;
    }
    return chessGame.makeMove(sourceSquare, targetSquare);
  };

  const handleMoveComplete = () => {
    arrows.clearArrows();
  };

  const handleNavigationAction = (action: () => void) => {
    action();
    arrows.clearArrows();
  };

  const handleApplyFen = (fen: string) => {
    const success = chessGame.loadFen(fen);
    if (success) {
      arrows.clearArrows();
    }
  };

  const lastMove = chessGame.getLastMove();
  const sourceSquare = lastMove ? lastMove.from : null;
  const targetSquare = lastMove ? lastMove.to : null;

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
        backgroundColor: theme.currentThemeColors.pageBackgroundColor,
        color: theme.currentThemeColors.pageForegroundColor,
        transition: 'all 0.2s ease',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <div data-testid="arrows-list" style={{ display: 'none' }}>
        {arrows.arrows.map(({ startSquare, endSquare, color }, i) => (
          <div key={i}>
            start: {startSquare}, end: {endSquare}, color: {color}
          </div>
        ))}
      </div>

      {/* Theme toggle button */}
      <ThemeToggle theme={theme.theme} toggleTheme={theme.toggleTheme} />

      {/* Settings button */}
      <SettingsButton theme={theme.theme} onClick={() => setShowSettings(!showSettings)} />

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          theme={theme.theme}
          currentThemeColors={theme.currentThemeColors}
          setLightThemeColors={theme.setLightThemeColors}
          setDarkThemeColors={theme.setDarkThemeColors}
        />
      )}

      {/* Main content container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        width: '100%',
        maxWidth: '800px',
      }}>
        <ChessBoard
          theme={theme.theme}
          chessPosition={chessGame.chessPosition}
          arrows={arrows.arrows}
          lightSquareColor={theme.currentThemeColors.lightSquareColor}
          darkSquareColor={theme.currentThemeColors.darkSquareColor}
          sourceSquare={sourceSquare}
          targetSquare={targetSquare}
          isAtFinalPosition={chessGame.isAtFinalPosition}
          onPieceDrop={handlePieceDrop}
          onSquareRightClick={handleSquareRightClick}
          onMoveComplete={handleMoveComplete}
        />

        {/* Navigation buttons */}
        <NavigationControls
          theme={theme.theme}
          currentMoveIndex={chessGame.currentMoveIndex}
          moveHistoryLength={chessGame.moveHistory.length}
          isAtStart={chessGame.isAtStart}
          isAtEnd={chessGame.isAtEnd}
          goToStart={() => handleNavigationAction(chessGame.goToStart)}
          goBackward={() => handleNavigationAction(chessGame.goBackward)}
          goForward={() => handleNavigationAction(chessGame.goForward)}
          goToEnd={() => handleNavigationAction(chessGame.goToEnd)}
        />

        {/* Move history */}
        <MoveHistory
          theme={theme.theme}
          moveHistory={chessGame.moveHistory}
          currentMoveIndex={chessGame.currentMoveIndex}
          moveTree={chessGame.moveTree}
          currentNode={chessGame.currentNode}
          onNavigateToNode={chessGame.navigateToNode}
        />
        
        {/* FEN input container */}
        <FenInput
          theme={theme.theme}
          onApplyFen={handleApplyFen}
        />
      </div>
    </div>
  );
};

export default App;
