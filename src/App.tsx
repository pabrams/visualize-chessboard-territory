import React, { useState, useCallback } from 'react';
import { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import { useChessGame } from './hooks/useChessGame';
import { useTheme } from './hooks/useTheme';
import { useArrows } from './hooks/useArrows';
import { ChessBoard } from './components/ChessBoard/ChessBoard';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import Header from './components/Header/Header';
import { TrafficlightCountdown } from './components/Drill/TrafficlightCountdown';
import { DrillTimer } from './components/Drill/DrillTimer';
import { DrillScoreboard, DrillResult } from './components/Drill/DrillScoreboard';
import { LichessPuzzle } from './types/lichess';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [drillState, setDrillState] = useState<{
    active: boolean;
    showCountdown: boolean;
    loading: boolean;
    results: DrillResult[];
    puzzleQueue: LichessPuzzle[];
    playerColor: 'white' | 'black';
  }>({
    active: false,
    showCountdown: false,
    loading: false,
    results: [],
    puzzleQueue: [],
    playerColor: 'white',
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
    // Randomly select white or black
    const playerColor: 'white' | 'black' = Math.random() < 0.5 ? 'white' : 'black';
    console.log(`Drill color selected: ${playerColor}`);

    setDrillState({
      active: true,
      showCountdown: false,
      loading: true,
      results: [],
      puzzleQueue: [],
      playerColor,
    });

    try {
      // Load puzzles from color-specific JSON file
      const puzzleFile = playerColor === 'white'
        ? '/visualize-chessboard-territory/single-move-puzzles-w.json'
        : '/visualize-chessboard-territory/single-move-puzzles-b.json';
      console.log(`Loading ${playerColor} puzzles from ${puzzleFile}...`);
      const response = await fetch(puzzleFile);
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
      playerColor: 'white',
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

  const handleMoveComplete = () => {
    arrows.clearArrows();
  };

  const lastMove = chessGame.getLastMove();
  const sourceSquare = lastMove ? lastMove.from : null;
  const targetSquare = lastMove ? lastMove.to : null;

  return (
    <>
      <Header
        theme={theme.theme}
        onToggleTheme={theme.toggleTheme}
        onOpenSettings={() => setShowSettings(!showSettings)}
      />

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
      <div
        data-testid="app-container"
        style={{
          minHeight: 'calc(100vh - 60px)', // Adjust for header height
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
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

        {/* Begin drill button / Timer container */}
        {drillState.active && !drillState.loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.theme === 'dark' ? '#222222' : '#ffffff',
              border: `1px solid ${theme.theme === 'dark' ? '#444' : '#eeeeee'}`,
              borderRadius: '8px',
              padding: '16px 24px',
              color: theme.theme === 'dark' ? '#ffffff' : '#000000',
              boxShadow: theme.theme === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '2rem',
            }}
          >
            <DrillTimer onTimeUp={handleDrillTimeUp} theme={theme.theme} isCountdown={drillState.showCountdown} />
          </div>
        ) : !drillState.loading && (
          <button
            onClick={handleDrillStart}
            data-testid="beginButton"
            title="Begin Drill Puzzles"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              background: theme.theme === 'dark' ? '#222222' : '#ffffff',
              border: `1px solid ${theme.theme === 'dark' ? '#444' : '#eeeeee'}`,
              borderRadius: '8px',
              padding: '16px 24px',
              cursor: 'pointer',
              color: theme.theme === 'dark' ? '#ffffff' : '#000000',
              transition: 'all 0.2s ease',
              boxShadow: theme.theme === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '2rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = theme.theme === 'dark'
                ? '0 6px 16px rgba(0, 0, 0, 0.4)'
                : '0 6px 16px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = theme.theme === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Timer icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
              <path d="M9 2h6" />
              <path d="M12 2v2" />
            </svg>
            <span>Begin</span>
          </button>
        )}

        {/* Chessboard and scoreboard container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          width: 'min(90vh, calc(100vw - 600px))',
          maxWidth: '100%',
          position: 'relative',
        }}>
          {/* Chessboard */}
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
            boardOrientation={drillState.active ? (drillState.playerColor === 'white' ? 'black' : 'white') : 'white'}
          />

          {/* Traffic light countdown - overlaid on chessboard */}
          {drillState.showCountdown && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: '0.5rem', // Account for gap before scoreboard
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <TrafficlightCountdown onComplete={handleCountdownComplete} />
            </div>
          )}

          {/* Drill scoreboard - below chessboard */}
          {drillState.active && !drillState.showCountdown && !drillState.loading && (
            <DrillScoreboard results={drillState.results} theme={theme.theme} />
          )}
        </div>
      </div>
    </>
  );
};

export default App;
