// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chessboard, Promotion } from 'react-chessboard';  // Import Promotion for custom promotion
import { Chess, SQUARES } from 'chess.js';

import './App.css';  // Keep existing styles

export const showSquareControlFunc = (chessboard, square, game) => {
    const blackAttackers = game.attackers(square, 'b').length;
    const whiteAttackers = game.attackers(square, 'w').length;
    let netAttackers = blackAttackers - whiteAttackers;
    let winningColor = "";

    if (netAttackers > 0) winningColor = 'b';
    else if (netAttackers < 0) winningColor = 'w';

    netAttackers = Math.abs(netAttackers);
    const piece = chessboard.getPiece(square) || "";

    if (winningColor === 'b') {
        for (let i = 0; i < netAttackers; i++) chessboard.addMarker(MARKER_TYPE.framePrimary, square);
    } else if (winningColor === 'w') {
        for (let i = 0; i < netAttackers; i++) chessboard.addMarker(MARKER_TYPE.frameDanger, square);
    }

    if (piece) {
        const pieceColor = piece.charAt(0);
        const opponentColor = pieceColor === 'w' ? 'b' : 'w';
        
        const attackers = game.attackers(square, opponentColor).length;
        const defenders = game.attackers(square, pieceColor).length;

        // A piece is en pris if it's attacked and has fewer defenders than attackers
        if (attackers > 0 && attackers > defenders) {
            if (pieceColor === 'w') {
                chessboard.addMarker(MARKER_TYPE.circlePrimary, square);
            } else {
                chessboard.addMarker(MARKER_TYPE.circleDanger, square);
            }
        }
    }
};

const App = () => {
    const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq");
    const [showSquareControl, setShowSquareControl] = useState(true);
    const [showHoverControl, setShowHoverControl] = useState(true);
    const [lastPosition, setLastPosition] = useState(null);
    const [hoveredSquare, setHoveredSquare] = useState(null);

    const gameRef = useRef(null);

    useEffect(() => {
        gameRef.current = new Chess(fen);
    }, [fen]);
    useEffect(() => {
        const savedLastPosition = localStorage.getItem('lastPosition');
        if (savedLastPosition) {
            setLastPosition(savedLastPosition);
        }
    }, []);
    useEffect(() => {
        const storedSquareControl = localStorage.getItem("squareControl");
        if (storedSquareControl !== null) {
            setShowSquareControl(storedSquareControl === "1");
        }
        const storedHoverControl = localStorage.getItem("squareControlHover");
        if (storedHoverControl !== null) {
            setShowHoverControl(storedHoverControl === "1");
        }
        const storedFen = localStorage.getItem("FEN");
        if (storedFen !== null) { 
            setFen(storedFen);
        }
    }, []);

    const handlePieceDrop = (source, target, piece, newPosition, oldPosition, orientation) => {
        const game = gameRef.current;
        const move = { from: source, to: target, promotion: piece?.charAt(1) || null };
        const result = game.move(move);
        if (result) {
            const newFen = game.fen();
            localStorage.setItem("lastPosition", newFen);
            setLastPosition(newFen);
            setFen(newFen);
            return true;
        }
        return false;
    };

    const customBoardStyle = (square) => {
        if (!showSquareControl) return {};
        
        const game = gameRef.current;
        const blackAttackers = game.attackers(square, 'b').length;
        const whiteAttackers = game.attackers(square, 'w').length;
        let netAttackers = blackAttackers - whiteAttackers;
        let borderWidth = 0;
        
        if (netAttackers > 0) {
            borderWidth = Math.min(3, netAttackers);
        } else if (netAttackers < 0) {
            borderWidth = Math.min(3, Math.abs(netAttackers));
        }
        
        const style = {};
        if (borderWidth > 0) {
            if (netAttackers > 0) {
                // Black control (blue)
                style.border = `${borderWidth}px solid #0000ff`;
                style.borderRightWidth = `${borderWidth}px`;
                style.borderLeftWidth = `${borderWidth}px`;
                style.borderTopWidth = `${borderWidth}px`;
                style.borderBottomWidth = `${borderWidth}px`;
            } else {
                // White control (red)
                style.border = `${borderWidth}px solid #ff0000`;
                style.borderRightWidth = `${borderWidth}px`;
                style.borderLeftWidth = `${borderWidth}px`;
                style.borderTopWidth = `${borderWidth}px`;
                style.borderBottomWidth = `${borderWidth}px`;
            }
        }
        
        // En prise logic (approximated with background)
        const piece = game.get(square);
        if (piece) {
            const pieceColor = piece.charAt(0);
            const opponentColor = pieceColor === 'w' ? 'b' : 'w';
            const attackers = game.attackers(square, opponentColor).length;
            const defenders = game.attackers(square, pieceColor).length;
            if (attackers > 0 && attackers > defenders) {
                style.backgroundColor = pieceColor === 'w' ? '#0000ff' : '#ff0000';
                style.opacity = 0.3;
            }
        }
        
        return style;
    };

    const handleSquareClick = (square) => {
        // Basic click handling - can be extended
        console.log(`Square ${square} clicked`);
    };

    const handleMouseMove = (square) => {
        setHoveredSquare(square);
    };

    const presetPositions = [
        { value: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq", label: "Standard starting position" },
        { value: "5rk1/pp4pp/4p3/2R3Q1/3n4/2q4r/P1P2PPP/5RK1 b", label: "1912 Levitsky Marshall" },
        { value: "r1b2rk1/pp1ppp1p/5bp1/q7/3nP2Q/1BN1B3/PPP2PPP/R4RK1 w", label: "1962 Nezhmetdinov Chernikov" },
        { value: "6k1/5r1p/p2N4/nppP2q1/2P5/1P2N3/PQ5P/7K w", label: "1963 Petrosian Spassky" },
        { value: "r1b2r1k/4qp1p/p2ppb1Q/4nP2/1p1NP3/2N5/PPP4P/2KR1BR1 w", label: "1965 Kholmov Bronstein" },
        { value: "5k2/pp4pp/3bpp2/1P6/8/P2KP3/5PPP/2B5 b", label: "1972 Fischer Spassky game 2" },
        { value: "4k3/8/8/2b5/3N4/8/8/4K3 w - - 0 1", label: "Test en pris" }
      ];
      const options = [
        ...presetPositions,
        ...(lastPosition
            ? [{ value: lastPosition, label: "Last position" }]
            : [])
      ];
    return (
        <div className="container">
            <div className="board board-large left-element">
                <Chessboard
                    id="board"
                    position={fen}
                    onPieceDrop={handlePieceDrop}
                    customBoardStyle={customBoardStyle}
                    onSquareClick={handleSquareClick}
                    onMouseMove={handleMouseMove}
                    boardWidth={680}  // Match cm-chessboard size
                    lightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                    darkSquareStyle={{ backgroundColor: '#b58863' }}
                />
            </div>
            <div className="right-element">
                <h1>chessboard with square control</h1>
                <ul>
                    <li>Blue frames/borders denote Black control</li>
                    <li>Red frames/borders denote White control</li>
                    <li>The higher the control, the thicker the border</li>
                    <li>Pieces <i>en prise</i> have colored background</li>
                </ul>
                <br /><br />
                <h2>Square Control</h2>
                <input id="chkSquareControl" type="checkbox" checked={showSquareControl} onChange={e => {
                    setShowSquareControl(e.target.checked);
                    localStorage.setItem("squareControl", e.target.checked ? "1" : "0");
                }} />
                <label htmlFor="chkSquareControl" title="Show square control by size of square border.">Show square frames indicating control</label>
                <br />
                <input id="chkSquareControlHover" type="checkbox" checked={showHoverControl} onChange={e => {
                    setShowHoverControl(e.target.checked);
                    localStorage.setItem("squareControlHover", e.target.checked ? "1" : "0");
                }} />
                <label htmlFor="chkSquareControlHover" title="When hovering over a square, show arrows from the pieces controlling that square.">Show controlling pieces on hover</label>
                <br /><br /><br /><br />
                <h2>
                    <label htmlFor="txtInputFen" title="input FEN:">
                        Set Position <a href="https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation">(Forsyth-Edwards Notation)</a>
                    </label>
                </h2>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <label htmlFor="ddFEN" title="Select FEN">Select FEN:</label>
                            </td>
                            <td>
                                <select id="ddFEN" size="1" value={fen} onChange={e => setFen(e.target.value)}>
                                {options.map(p => (
                                    <option key={p.label} value={p.value}>
                                    {p.label}
                                    </option>
                                ))}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="txtFEN" title="Select FEN:">Or enter manually:</label>
                            </td>
                            <td>
                                <input id="txtFEN" type="text" name="FEN" value={fen} onChange={e => setFen(e.target.value)} size="40" />
                                <button id="btnFEN" type="button" onClick={() => localStorage.setItem("FEN", fen)}>apply</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="footer">
                <hr />
                Source <a href="https://github.com/pabrams/marked-chessboard">github</a>
                <br />
                Uses <a href="https://github.com/react-chessboard/react-chessboard">react-chessboard</a> and <a href="https://github.com/jhlywa/chess.js">chess.js</a>.
            </div>
        </div>
    );
};

export default App;