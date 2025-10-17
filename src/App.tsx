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
import { PuzzleButton } from './components/Puzzle/PuzzleButton';
import { PuzzleSuccessIndicator } from './components/Puzzle/PuzzleSuccessIndicator';
import Header from './components/Header/Header';

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

  const handleMoveClick = (nodeId: string) => {
    chessGame.navigateToMove(nodeId);
    arrows.clearArrows();
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
    <>
      <Header />
      <PuzzleSuccessIndicator show={chessGame.puzzleState.completed} theme={theme.theme} />
      <div
        data-testid="app-container"
        style={{
          minHeight: 'calc(100vh - 60px)', // Adjust for header height
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
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

        {/* Puzzle button */}
        <PuzzleButton theme={theme.theme} chessGame={chessGame} />

        {/* Settings panel */}
        {showSettings && (
          <SettingsPanel
            theme={theme.theme}
            currentThemeColors={theme.currentThemeColors}
            setLightThemeColors={theme.setLightThemeColors}
            setDarkThemeColors={theme.setDarkThemeColors}
          />
        )}

        {/* Left side - Controls and move history */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          width: '400px',
          minWidth: '300px',
          maxWidth: '500px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>

          {/* Move history */}
          <MoveHistory
            theme={theme.theme}
            gameTree={chessGame.gameTree}
            onMoveClick={handleMoveClick}
          />
                    {/* Navigation buttons */}
                    <NavigationControls
            theme={theme.theme}
            isAtStart={chessGame.isAtStart}
            canGoBackward={chessGame.canGoBackward}
            canGoForward={chessGame.canGoForward}
            isAtFinalPosition={chessGame.isAtFinalPosition}
            goToStart={() => handleNavigationAction(chessGame.goToStart)}
            goBackward={() => handleNavigationAction(chessGame.goBackward)}
            goForward={() => handleNavigationAction(chessGame.goForward)}
            goToEnd={() => handleNavigationAction(chessGame.goToEnd)}
          />

          {/* FEN input container */}
          <FenInput
            theme={theme.theme}
            onApplyFen={handleApplyFen}
          />
        </div>

        {/* Right side - Chessboard (as large as possible) */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0, // Important for flex shrinking
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
            isPuzzleAutoPlaying={chessGame.puzzleState.active && !chessGame.puzzleState.isPlayerTurn}
          />
        </div>
      </div>
    </>
  );
};

export default App;
