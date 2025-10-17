import React, { useState, useCallback } from 'react';
import { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import { useChessGame } from './hooks/useChessGame';
import { useTheme } from './hooks/useTheme';
import { useArrows } from './hooks/useArrows';
import { ChessBoard } from './components/ChessBoard/ChessBoard';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { NavigationControls } from './components/Navigation/NavigationControls';
import { MoveHistory } from './components/MoveHistory/MoveHistory';
import { FenInput } from './components/FenInput/FenInput';
import { PuzzleButton } from './components/Puzzle/PuzzleButton';
import { PuzzleSuccessIndicator } from './components/Puzzle/PuzzleSuccessIndicator';
import { Sidebar } from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import { DrillCountdown } from './components/Drill/DrillCountdown';
import { DrillTimer } from './components/Drill/DrillTimer';
import { DrillScoreboard, DrillResult } from './components/Drill/DrillScoreboard';
import { DrillButton } from './components/Drill/DrillButton';
import { fetchPuzzle } from './services/lichessAuth';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [drillState, setDrillState] = useState<{
    active: boolean;
    showCountdown: boolean;
    results: DrillResult[];
  }>({
    active: false,
    showCountdown: false,
    results: [],
  });
  
  // Custom hooks
  const chessGame = useChessGame();
  const theme = useTheme();
  const arrows = useArrows();

  // Drill mode functions
  const loadNextDrillPuzzle = useCallback(async () => {
    try {
      const puzzle = await fetchPuzzle({ rating: 1000 });
      if (puzzle) {
        // For drill mode, load directly to the final position (no initialPly)
        const success = chessGame.loadPgn(puzzle.game.pgn);
        if (success) {
          // In drill mode, we start immediately at the final position
          // The solution is just the puzzle moves, no need to prepend PGN move
          chessGame.startPuzzleMode(puzzle.puzzle.solution, true, () => {
            // On wrong move in drill mode: record failure and load next puzzle
            const timeMs = Date.now() - (chessGame.puzzleState.puzzleStartTime || Date.now());
            setDrillState(prev => ({
              ...prev,
              results: [...prev.results, { success: false, timeMs }],
            }));
            loadNextDrillPuzzle();
          });
        }
      }
    } catch (error) {
      console.error('Error fetching drill puzzle:', error);
    }
  }, [chessGame]);

  const handleDrillStart = () => {
    setDrillState({
      active: true,
      showCountdown: true,
      results: [],
    });
  };

  const handleCountdownComplete = () => {
    setDrillState(prev => ({ ...prev, showCountdown: false }));
    loadNextDrillPuzzle();
  };

  const handleDrillTimeUp = () => {
    // Save results to localStorage
    const drillResults = {
      timestamp: Date.now(),
      results: drillState.results,
    };
    const existingResults = JSON.parse(localStorage.getItem('drillResults') || '[]');
    localStorage.setItem('drillResults', JSON.stringify([...existingResults, drillResults]));

    // End drill mode
    setDrillState({
      active: false,
      showCountdown: false,
      results: [],
    });
    chessGame.exitPuzzleMode();
  };

  // Watch for puzzle completion in drill mode
  React.useEffect(() => {
    if (drillState.active && chessGame.puzzleState.completed && chessGame.puzzleState.drillMode) {
      // Record success and load next puzzle
      const timeMs = Date.now() - (chessGame.puzzleState.puzzleStartTime || Date.now());
      setDrillState(prev => ({
        ...prev,
        results: [...prev.results, { success: true, timeMs }],
      }));
      loadNextDrillPuzzle();
    }
  }, [chessGame.puzzleState.completed, drillState.active, chessGame.puzzleState.drillMode, loadNextDrillPuzzle]);

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
      <Header
        onOpenSidebar={() => setShowSidebar(true)}
        theme={theme.theme}
        onToggleTheme={theme.toggleTheme}
        onOpenSettings={() => setShowSettings(!showSettings)}
      />
      <PuzzleSuccessIndicator show={chessGame.puzzleState.completed && !chessGame.puzzleState.drillMode} theme={theme.theme} />

      {/* Drill mode components */}
      {drillState.showCountdown && <DrillCountdown onComplete={handleCountdownComplete} />}
      {drillState.active && !drillState.showCountdown && (
        <>
          <DrillTimer onTimeUp={handleDrillTimeUp} theme={theme.theme} />
          <DrillScoreboard results={drillState.results} theme={theme.theme} />
        </>
      )}

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
        {/* Sidebar */}
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} theme={theme.theme}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, marginBottom: '0.5rem', color: theme.theme === 'dark' ? '#ffffff' : '#000000' }}>
              Puzzles
            </h3>
            <PuzzleButton theme={theme.theme} chessGame={chessGame} />
            <DrillButton theme={theme.theme} onStartDrill={handleDrillStart} />
          </div>
        </Sidebar>
        <div data-testid="arrows-list" style={{ display: 'none' }}>
          {arrows.arrows.map(({ startSquare, endSquare, color }, i) => (
            <div key={i}>
              start: {startSquare}, end: {endSquare}, color: {color}
            </div>
          ))}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <SettingsPanel
            theme={theme.theme}
            currentThemeColors={theme.currentThemeColors}
            setLightThemeColors={theme.setLightThemeColors}
            setDarkThemeColors={theme.setDarkThemeColors}
            onClose={() => setShowSettings(false)}
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
