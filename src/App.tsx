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
import { fetchPuzzle, fetchSingleMovePuzzles } from './services/lichessAuth';
import { LichessPuzzle } from './types/lichess';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [drillState, setDrillState] = useState<{
    active: boolean;
    showCountdown: boolean;
    loading: boolean;
    results: DrillResult[];
    puzzleQueue: LichessPuzzle[];
  }>({
    active: false,
    showCountdown: false,
    loading: false,
    results: [],
    puzzleQueue: [],
  });
  
  const chessGame = useChessGame();
  const theme = useTheme();
  const arrows = useArrows();

  const loadNextDrillPuzzle = useCallback(() => {
    setDrillState(prev => {
      if (prev.puzzleQueue.length === 0) {
        console.error('Puzzle queue is empty!');
        return prev;
      }

      const [puzzle, ...remainingQueue] = prev.puzzleQueue;

      console.log('Full puzzle object:', puzzle);
      console.log(`Loading puzzle with ${puzzle.puzzle.solution.length} solution moves:`, puzzle.puzzle.solution);

      // Exit puzzle mode first to allow the setup move
      chessGame.exitPuzzleMode();

      // Wait for exitPuzzleMode to complete
      setTimeout(() => {
        // Load from FEN and make the setup move manually to avoid state sync issues
        import('chess.js').then(({ Chess }) => {
          const setupMove = (puzzle as any)._setupMove;
          const fen = (puzzle as any)._fen;

          // Create PGN with just the setup move
          const tempChess = new Chess(fen);
          const from = setupMove.substring(0, 2);
          const to = setupMove.substring(2, 4);
          const promotion = setupMove.length > 4 ? setupMove.substring(4) : undefined;

          const move = tempChess.move({ from, to, promotion: promotion as any });

          if (move) {
            const pgn = tempChess.pgn();
            const success = chessGame.loadPgn(pgn);

            if (success) {
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
        });
      }, 0);

      return {
        ...prev,
        puzzleQueue: remainingQueue,
      };
    });
  }, [chessGame]);

  const handleDrillStart = async () => {
    setDrillState({
      active: true,
      showCountdown: false,
      loading: true,
      results: [],
      puzzleQueue: [],
    });

    try {
      // Load puzzles from local JSON file
      console.log('Loading single-move puzzles from local database...');
      const response = await fetch('/visualize-chessboard-territory/single-move-puzzles.json');
      const data = await response.json();

      // Shuffle and take a random subset
      const shuffled = data.puzzles.sort(() => Math.random() - 0.5).slice(0, 200);

      // Convert to LichessPuzzle format
      const puzzles = shuffled.map((p: any) => ({
        game: {
          pgn: '', // We'll construct this from FEN and moves
          id: p.gameUrl.split('/')[3] || p.id,
        },
        puzzle: {
          id: p.id,
          initialPly: 0,
          plays: 0,
          rating: p.rating,
          solution: [p.solution], // Single move solution
          themes: p.themes,
        },
        // We need to construct a minimal PGN - just use FEN + the setup move
        _fen: p.fen,
        _setupMove: p.setupMove,
      }));

      console.log(`Loaded ${puzzles.length} puzzles from local database`);

      // Now show countdown with puzzles loaded
      setDrillState(prev => ({
        ...prev,
        showCountdown: true,
        loading: false,
        puzzleQueue: puzzles,
      }));
    } catch (error) {
      console.error('Error loading puzzles:', error);
      setDrillState(prev => ({
        ...prev,
        loading: false,
        active: false,
      }));
    }
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
      loading: false,
      results: [],
      puzzleQueue: [],
    });
    chessGame.exitPuzzleMode();
  };

  // Watch for puzzle completion in drill mode
  const hasRecordedRef = React.useRef(false);

  React.useEffect(() => {
    if (drillState.active && chessGame.puzzleState.completed && chessGame.puzzleState.drillMode && !hasRecordedRef.current) {
      hasRecordedRef.current = true;

      // Record success and load next puzzle
      const timeMs = Date.now() - (chessGame.puzzleState.puzzleStartTime || Date.now());
      setDrillState(prev => ({
        ...prev,
        results: [...prev.results, { success: true, timeMs }],
      }));

      // Small delay to ensure state is updated, then load next puzzle and reset flag
      setTimeout(() => {
        hasRecordedRef.current = false;
        loadNextDrillPuzzle();
      }, 50);
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
      <PuzzleSuccessIndicator show={chessGame.puzzleState.completed && !chessGame.puzzleState.drillMode && !drillState.active} theme={theme.theme} />

      {/* Drill mode components */}
      {drillState.loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10001,
          }}
        >
          <div
            style={{
              fontSize: '24px',
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            Loading puzzles...
          </div>
        </div>
      )}
      {drillState.showCountdown && <DrillCountdown onComplete={handleCountdownComplete} />}
      {drillState.active && !drillState.showCountdown && !drillState.loading && (
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
