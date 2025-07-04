import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, SQUARES } from 'chess.js';

const App = () => {
    const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq");
    const [showSquareControl, setShowSquareControl] = useState(true);
    const [showHoverControl, setShowHoverControl] = useState(true);
    const [lastPosition, setLastPosition] = useState(null);
    const [hoveredSquare, setHoveredSquare] = useState(null);
    const [moveFrom, setMoveFrom] = useState(null);
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});

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

    const getSquareControlInfo = (square) => {
        if (!gameRef.current) return { netAttackers: 0, winningColor: '', isEnPrise: false, pieceColor: null };
        
        const blackAttackers = gameRef.current.attackers(square, 'b').length;
        const whiteAttackers = gameRef.current.attackers(square, 'w').length;
        let netAttackers = blackAttackers - whiteAttackers;
        let winningColor = "";

        if (netAttackers > 0) winningColor = 'b';
        else if (netAttackers < 0) winningColor = 'w';

        netAttackers = Math.abs(netAttackers);
        
        const piece = gameRef.current.get(square);
        let isEnPrise = false;
        let pieceColor = null;

        if (piece) {
            pieceColor = piece.color;
            const opponentColor = pieceColor === 'w' ? 'b' : 'w';
            
            const attackers = gameRef.current.attackers(square, opponentColor).length;
            const defenders = gameRef.current.attackers(square, pieceColor).length;

            // A piece is en pris if it's attacked and has fewer defenders than attackers
            isEnPrise = attackers > 0 && attackers > defenders;
        }

        return { netAttackers, winningColor, isEnPrise, pieceColor };
    };

    const customSquareStyles = useMemo(() => {
        if (!showSquareControl) return {};
        
        const styles = {};
        
        SQUARES.forEach(square => {
            const { netAttackers, winningColor, isEnPrise, pieceColor } = getSquareControlInfo(square);
            
            let squareStyle = {};
            
            // Add frame for square control
            if (netAttackers > 0) {
                const opacity = Math.min(0.3 + (netAttackers * 0.2), 1);
                if (winningColor === 'b') {
                    squareStyle.boxShadow = `inset 0 0 0 ${Math.min(netAttackers * 2 + 2, 8)}px rgba(0, 100, 255, ${opacity})`;
                } else if (winningColor === 'w') {
                    squareStyle.boxShadow = `inset 0 0 0 ${Math.min(netAttackers * 2 + 2, 8)}px rgba(255, 0, 0, ${opacity})`;
                }
            }
            
            // Add circle for en prise pieces
            if (isEnPrise) {
                const circleColor = pieceColor === 'w' ? 'rgba(0, 100, 255, 0.8)' : 'rgba(255, 0, 0, 0.8)';
                squareStyle.background = `radial-gradient(circle, transparent 65%, ${circleColor} 70%, ${circleColor} 85%, transparent 90%)`;
            }
            
            if (Object.keys(squareStyle).length > 0) {
                styles[square] = squareStyle;
            }
        });
        
        return styles;
    }, [showSquareControl, fen]);

    const customArrows = useMemo(() => {
        if (!showHoverControl || !hoveredSquare) return [];
        
        const arrows = [];
        const blackAttackers = gameRef.current?.attackers(hoveredSquare, 'b') || [];
        const whiteAttackers = gameRef.current?.attackers(hoveredSquare, 'w') || [];
        
        blackAttackers.forEach(attacker => {
            arrows.push([attacker, hoveredSquare, 'rgb(0, 100, 255)']);
        });
        
        whiteAttackers.forEach(attacker => {
            arrows.push([attacker, hoveredSquare, 'rgb(255, 0, 0)']);
        });
        
        return arrows;
    }, [hoveredSquare, showHoverControl, fen]);

    const onSquareClick = (square) => {
        if (!gameRef.current) return;

        // If no piece is selected, select this square if it has a piece
        if (!moveFrom) {
            const piece = gameRef.current.get(square);
            if (piece && piece.color === gameRef.current.turn()) {
                setMoveFrom(square);
                
                // Show possible moves
                const moves = gameRef.current.moves({ square, verbose: true });
                const newSquares = {};
                moves.forEach(move => {
                    newSquares[move.to] = {
                        background: gameRef.current.get(move.to) 
                            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                        borderRadius: '50%'
                    };
                });
                setOptionSquares(newSquares);
            }
            return;
        }

        // If clicking on the same square, deselect
        if (moveFrom === square) {
            setMoveFrom(null);
            setOptionSquares({});
            return;
        }

        // Try to make the move
        try {
            const move = gameRef.current.move({
                from: moveFrom,
                to: square,
                promotion: 'q' // Always promote to queen for simplicity
            });

            if (move) {
                const newFen = gameRef.current.fen();
                localStorage.setItem("lastPosition", newFen);
                setLastPosition(newFen);
                setFen(newFen);
            }
        } catch (error) {
            // Invalid move, just deselect
        }

        setMoveFrom(null);
        setOptionSquares({});
    };

    const onSquareRightClick = (square) => {
        const color = 'rgba(255, 255, 0, 0.4)';
        setRightClickedSquares({
            ...rightClickedSquares,
            [square]: rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === color
                ? undefined
                : { backgroundColor: color }
        });
    };

    const onMouseOverSquare = (square) => {
        if (showHoverControl) {
            setHoveredSquare(square);
        }
    };

    const onMouseOutSquare = () => {
        setHoveredSquare(null);
    };

    const handleFenSelectChange = (e) => {
        const newFen = e.target.value;
        setFen(newFen);
        setMoveFrom(null);
        setOptionSquares({});
        setRightClickedSquares({});
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
                    position={fen}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    onMouseOverSquare={onMouseOverSquare}
                    onMouseOutSquare={onMouseOutSquare}
                    customSquareStyles={{
                        ...customSquareStyles,
                        ...optionSquares,
                        ...rightClickedSquares,
                        ...(moveFrom && {
                            [moveFrom]: {
                                backgroundColor: 'rgba(255, 255, 0, 0.4)'
                            }
                        })
                    }}
                    customArrows={customArrows}
                    boardWidth={680}
                    animationDuration={300}
                />
            </div>
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
                Uses <a href="https://github.com/Clariity/react-chessboard">react-chessboard</a> and <a href="https://github.com/jhlywa/chess.js">chess.js</a>.
            </div>
        </div>
    );
};

export default App;