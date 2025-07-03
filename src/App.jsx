// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, SQUARES } from 'chess.js';

import 'react-chessboard/dist/chessboard.css';

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
        for (let i = 0; i < netAttackers; i++) chessboard.addMarker('framePrimary', square);
    } else if (winningColor === 'w') {
        for (let i = 0; i < netAttackers; i++) chessboard.addMarker('frameDanger', square);
    }

    if (piece) {
        const pieceColor = piece.charAt(0);
        const opponentColor = pieceColor === 'w' ? 'b' : 'w';
        
        const attackers = game.attackers(square, opponentColor).length;
        const defenders = game.attackers(square, pieceColor).length;

        // A piece is en prise if it's attacked and has fewer defenders than attackers
        if (attackers > 0 && attackers > defenders) {
            if (pieceColor === 'w') {
                chessboard.addMarker('circlePrimary', square);
            } else {
                chessboard.addMarker('circleDanger', square);
            }
        }
    }
};

const App = () => {
    const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq");
    const [showSquareControl, setShowSquareControl] = useState(true);
    const [showHoverControl, setShowHoverControl] = useState(true);

    const chessboardRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        gameRef.current = new Chess(fen);
    }, [fen]);

    useEffect(() => {
        if (chessboardRef.current) {
            chessboardRef.current.set({ fen: fen });
            showAllSquareControl(chessboardRef.current);
        }
    }, [fen]);

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

    useEffect(() => {
        if (chessboardRef.current) {
            showAllSquareControl(chessboardRef.current);
        }
    }, [showSquareControl]);

    const removeAllMarkers = () => {
        if (chessboardRef.current) {
          chessboardRef.current.removeMarkers('circle');
          chessboardRef.current.removeMarkers('square');
          chessboardRef.current.removeMarkers('frame');
          chessboardRef.current.removeMarkers('framePrimary');
          chessboardRef.current.removeMarkers('frameDanger');
          chessboardRef.current.removeMarkers('dot');
          chessboardRef.current.removeMarkers('circlePrimary');
          chessboardRef.current.removeMarkers('circleDanger');
        }
    };

    const showAllSquareControl = (chessboard) => {
        removeAllMarkers();
        if (showSquareControl) {
          SQUARES.forEach(square => showSquareControlFunc(chessboard, square, gameRef.current));
        }
    };

    const showControlArrows = (chessboard, square) => {
        if (showHoverControl) {
            chessboard.removeArrows();
            gameRef.current.attackers(square, 'b').forEach(attacker => chessboard.addArrow('default', attacker, square));
            gameRef.current.attackers(square, 'w').forEach(attacker => chessboard.addArrow('danger', attacker, square));
        }
    };

    const handleMove = (move) => {
        const board = chessboardRef.current;
        const game = gameRef.current;
        const { from, to, promotion } = move;

        // Simplified promotion handling (adapt as needed for react-chessboard)
        const result = game.move(move);
        if (result) {
            setFen(game.fen());
            showAllSquareControl(board);
        }
        return result;
    };
    
    const handleFenSelectChange = (e) => {
        const newFen = e.target.value;
        setFen(newFen);
        localStorage.setItem("FEN", newFen);
    };

    const presetPositions = [
        { value: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq", label: "Standard starting position" },
        { value: "5rk1/pp4pp/4p3/2R3Q1/3n4/2q4r/P1P2PPP/5RK1 b", label: "1912 Levitsky Marshall" },
        { value: "r1b2rk1/pp1ppp1p/5bp1/q7/3nP2Q/1BN1B3/PPP2PPP/R4RK1 w", label: "1962 Nezhmetdinov Chernikov" },
        { value: "6k1/5r1p/p2N4/nppP2q1/2P5/1P2N3/PQ5P/7K w", label: "1963 Petrosian Spassky" },
        { value: "r1b2r1k/4qp1p/p2ppb1Q/4nP2/1p1NP3/2N5/PPP4P/2KR1BR1 w", label: "1965 Kholmov Bronstein" },
        { value: "5k2/pp4pp/3bpp2/1P6/8/P2KP3/5PPP/2B5 b", label: "1972 Fischer Spassky game 2" },
        { value: "4k3/8/8/2b5/3N4/8/8/4K3 w - - 0 1", label: "Test en prise" }

        
      ];
      
    return (
        <div className="container">
            <Chessboard ref={chessboardRef} position={fen} onMove={handleMove} />
            <div className="right-element">
                <h1>chessboard with square control</h1>
                <ul>
                    <li>Blue frames denote Black control</li>
                    <li>Red frames denote White control</li>
                    <li>The higher the control, the more opaque the frame will appear.</li>
                    <li>Pieces <i>en prise</i> are circled.</li>
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
                                <select id="ddFEN" size="1" value={fen} onChange={handleFenSelectChange}>
                                    {presetPositions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="txtFEN" title="Select FEN:">Or enter manually:</label>
                            </td>
                            <td>
                                <input id="txtFEN" type="text" name="FEN" value={fen} onChange={handleFenSelectChange} size="40" />
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