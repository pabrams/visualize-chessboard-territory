import React, { useState, useEffect, useRef } from 'react';
import { Chessboard, INPUT_EVENT_TYPE, COLOR, BORDER_TYPE } from 'cm-chessboard';
import { Accessibility } from 'cm-chessboard/src/extensions/accessibility/Accessibility.js';
import { PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog } from 'cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js';
import { MARKER_TYPE, Markers } from 'cm-chessboard/src/extensions/markers/Markers.js';
import { ARROW_TYPE, Arrows } from 'cm-chessboard/src/extensions/arrows/Arrows.js';
import { Chess, SQUARES } from 'chess.js';

// Import CSS files
import 'cm-chessboard/assets/chessboard.css';
import 'cm-chessboard/assets/extensions/markers/markers.css';
import 'cm-chessboard/assets/extensions/arrows/arrows.css';
import 'cm-chessboard/assets/extensions/promotion-dialog/promotion-dialog.css';

const App = () => {
  const boardRef = useRef(null);
  const chessboardRef = useRef(null);
  const chessRef = useRef(null);
  
  const [showSquareControl, setShowSquareControl] = useState(true);
  const [showControlOnHover, setShowControlOnHover] = useState(true);
  const [selectedFEN, setSelectedFEN] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq");
  const [customFEN, setCustomFEN] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq");

  const presetPositions = [
    { value: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq", label: "Standard starting position" },
    { value: "5rk1/pp4pp/4p3/2R3Q1/3n4/2q4r/P1P2PPP/5RK1 b", label: "1912 Levitsky Marshall" },
    { value: "r1b2rk1/pp1ppp1p/5bp1/q7/3nP2Q/1BN1B3/PPP2PPP/R4RK1 w", label: "1962 Nezhmetdinov Chernikov" },
    { value: "6k1/5r1p/p2N4/nppP2q1/2P5/1P2N3/PQ5P/7K w", label: "1963 Petrosian Spassky" },
    { value: "r1b2r1k/4qp1p/p2ppb1Q/4nP2/1p1NP3/2N5/PPP4P/2KR1BR1 w", label: "1965 Kholmov Bronstein" },
    { value: "5k2/pp4pp/3bpp2/1P6/8/P2KP3/5PPP/2B5 b", label: "1972 Fischer Spassky game 2" }
  ];

  // Initialize chess instance
  useEffect(() => {
    chessRef.current = new Chess(customFEN);
    
    // Load from localStorage
    const storedSquareControl = localStorage.getItem("squareControl");
    const storedSquareControlHover = localStorage.getItem("squareControlHover");
    const storedFEN = localStorage.getItem("FEN");
    
    if (storedSquareControl !== null) {
      setShowSquareControl(storedSquareControl === "1");
    }
    if (storedSquareControlHover !== null) {
      setShowControlOnHover(storedSquareControlHover === "1");
    }
    if (storedFEN !== null) {
      setCustomFEN(storedFEN);
      setSelectedFEN(storedFEN);
    }
  }, []);

  // Initialize chessboard
  useEffect(() => {
    if (!boardRef.current || chessboardRef.current) return;

    const board = new Chessboard(boardRef.current, {
      position: chessRef.current.fen(),
      assetsUrl: "/cm-chessboard-assets/",
      responsive: true,
      style: {
        cssClass: "black-and-white",
        borderType: BORDER_TYPE.frame,
        pieces: { file: "pieces/staunty.svg" },
        animationDuration: 300
      },
      orientation: COLOR.white,
      extensions: [
        { class: Markers, props: { autoMarkers: MARKER_TYPE.square } },
        { class: Arrows },
        { class: PromotionDialog },
        {
          class: Accessibility,
          props: {
            brailleNotationInAlt: true,
            boardAsTable: true,
            movePieceForm: true,
            piecesAsList: true,
            visuallyHidden: true
          }
        }
      ]
    });

    chessboardRef.current = board;
    board.enableMoveInput(inputHandler, chessRef.current.turn());
    showAllSquareControl(board);

    return () => {
      if (chessboardRef.current) {
        // Cleanup if needed
      }
    };
  }, []);

  // Update square control display when settings change
  useEffect(() => {
    if (chessboardRef.current) {
      showAllSquareControl(chessboardRef.current);
    }
  }, [showSquareControl]);

  const showSquareControlForSquare = (chessboard, square) => {
    if (!showSquareControl) return;

    const blackAttackers = chessRef.current.attackers(square, 'b').length;
    const whiteAttackers = chessRef.current.attackers(square, 'w').length;
    let netAttackers = blackAttackers - whiteAttackers;
    let color = "";
    
    if (netAttackers > 0) {
      color = 'b';
    } else if (netAttackers < 0) {
      color = 'w';
    }
    
    netAttackers = Math.abs(netAttackers);
    const blackMarkerType = MARKER_TYPE.framePrimary;
    const whiteMarkerType = MARKER_TYPE.frameDanger;
    const piece = chessboard.getPiece(square) || "";
    
    if (color === 'b') {
      for (let i = 0; i < netAttackers; i++) {
        chessboard.addMarker(blackMarkerType, square);
      }
      if (piece.startsWith('w')) {
        chessboard.addMarker(MARKER_TYPE.circlePrimary, square);
      }
    }

    if (color === 'w') {
      for (let i = 0; i < netAttackers; i++) {
        chessboard.addMarker(whiteMarkerType, square);
      }
      if (piece.startsWith('b')) {
        chessboard.addMarker(MARKER_TYPE.circleDanger, square);
      }
    }
  };

  const showControlArrows = (chessboard, square) => {
    if (!showControlOnHover) return;
    
    chessboard.removeArrows();
    const redType = ARROW_TYPE.danger;
    const blueType = ARROW_TYPE.default;
    
    chessRef.current.attackers(square, 'b').forEach((attacker) => {
      chessboard.addArrow(blueType, attacker, square);
    });
    
    chessRef.current.attackers(square, 'w').forEach((attacker) => {
      chessboard.addArrow(redType, attacker, square);
    });
  };

  const showAllSquareControl = (chessboard) => {
    removeAllMarkers();
    if (showSquareControl) {
      SQUARES.forEach((square) => {
        showSquareControlForSquare(chessboard, square);
      });
    }
  };

  const removeAllMarkers = () => {
    if (!chessboardRef.current) return;
    
    const markerTypes = [
      MARKER_TYPE.square,
      MARKER_TYPE.frame,
      MARKER_TYPE.dot,
      MARKER_TYPE.circle
    ];

    for (const type of markerTypes) {
      chessboardRef.current.removeMarkers(type);
    }
  };

  const applyFEN = (fen) => {
    chessRef.current = new Chess(fen);
    if (chessboardRef.current) {
      chessboardRef.current.setPosition(chessRef.current.fen(), true).then(() => {
        chessboardRef.current.enableMoveInput(inputHandler, chessRef.current.turn());
        showAllSquareControl(chessboardRef.current);
      });
    }
  };

  const inputHandler = (event) => {
    if (event.type === INPUT_EVENT_TYPE.movingOverSquare) {
      showControlArrows(chessboardRef.current, event.squareTo);
    }
    
    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
      const moves = chessRef.current.moves({ square: event.squareFrom, verbose: true });
      event.chessboard.addLegalMovesMarkers(moves);
      removeAllMarkers();
      event.chessboard.addMarker(MARKER_TYPE.circle, event.squareFrom);
      return moves.length > 0;
    } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
      const move = { from: event.squareFrom, to: event.squareTo, promotion: event.promotion };
      const result = chessRef.current.move(move);
      
      if (result) {
        event.chessboard.state.moveInputProcess.then(() => {
          event.chessboard.setPosition(chessRef.current.fen(), true).then(() => {
            event.chessboard.enableMoveInput(inputHandler, chessRef.current.turn());
          });
        });
      } else {
        // Check for promotion
        let possibleMoves = chessRef.current.moves({ square: event.squareFrom, verbose: true });
        for (const possibleMove of possibleMoves) {
          if (possibleMove.promotion && possibleMove.to === event.squareTo) {
            event.chessboard.showPromotionDialog(event.squareTo, COLOR.white, (result) => {
              if (result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected) {
                chessRef.current.move({
                  from: event.squareFrom,
                  to: event.squareTo,
                  promotion: result.piece.charAt(1)
                });
              }
              event.chessboard.setPosition(chessRef.current.fen(), true).then(() => {
                event.chessboard.enableMoveInput(inputHandler, chessRef.current.turn());
              });
            });
            return true;
          }
        }
      }
      return result;
    } else if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
      if (event.legalMove) {
        event.chessboard.disableMoveInput();
      }
      event.chessboard.removeArrows();
      showAllSquareControl(event.chessboard);
    }
  };

  const handleSquareControlChange = (e) => {
    const checked = e.target.checked;
    setShowSquareControl(checked);
    localStorage.setItem("squareControl", checked ? "1" : "0");
  };

  const handleSquareControlHoverChange = (e) => {
    const checked = e.target.checked;
    setShowControlOnHover(checked);
    localStorage.setItem("squareControlHover", checked ? "1" : "0");
  };

  const handlePresetFENChange = (e) => {
    const fen = e.target.value;
    setSelectedFEN(fen);
    setCustomFEN(fen);
    applyFEN(fen);
    localStorage.setItem("FEN", fen);
  };

  const handleApplyCustomFEN = () => {
    applyFEN(customFEN);
    localStorage.setItem("FEN", customFEN);
  };

  const handleCustomFENChange = (e) => {
    setCustomFEN(e.target.value);
  };

  return (
    <div className="container" style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      <div 
        ref={boardRef} 
        className="board board-large left-element" 
        style={{ width: '500px', height: '500px' }}
      />
      
      <div className="right-element" style={{ flex: 1 }}>
        <h1>chessboard with square control</h1>
        
        <ul>
          <li>Blue frames denote Black control</li>
          <li>Red frames denote White control</li>
          <li>The higher the control, the more opaque the frame will appear.</li>
          <li>Pieces <em>en pris</em> are circled.</li>
        </ul>

        <h2>Square Control</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={showSquareControl}
              onChange={handleSquareControlChange}
            />
            Show square frames indicating control
          </label>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label>
            <input
              type="checkbox"
              checked={showControlOnHover}
              onChange={handleSquareControlHoverChange}
            />
            Show controlling pieces on hover
          </label>
        </div>

        <h2>
          Set Position{' '}
          <a href="https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation">
            (Forsyth-Edwards Notation)
          </a>
        </h2>

        <table style={{ marginBottom: '1rem' }}>
          <tbody>
            <tr>
              <td>
                <label>Select FEN:</label>
              </td>
              <td>
                <select value={selectedFEN} onChange={handlePresetFENChange}>
                  {presetPositions.map((position) => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <label>Or enter manually:</label>
              </td>
              <td>
                <input
                  type="text"
                  value={customFEN}
                  onChange={handleCustomFENChange}
                  style={{ width: '300px', marginRight: '0.5rem' }}
                />
                <button onClick={handleApplyCustomFEN}>apply</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="footer" style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
          Source{' '}
          <a href="https://github.com/pabrams/marked-chessboard">github</a>
          <br />
          Uses{' '}
          <a href="https://github.com/shaack/cm-chessboard">cm-chessboard</a> and{' '}
          <a href="https://github.com/jhlywa/chess.js">chess.js</a>.
        </div>
      </div>
    </div>
  );
};

export default App;