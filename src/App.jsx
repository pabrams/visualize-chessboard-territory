import React, { useState, useEffect, useRef } from 'react';
import { 
  Chessboard, 
  INPUT_EVENT_TYPE, 
  COLOR, 
  BORDER_TYPE 
} from 'cm-chessboard/src/Chessboard';
import { Chess, SQUARES } from 'chess.js';

function App() {
  const boardRef = useRef();
  
  useEffect(() => {
    if (boardRef.current) {
      console.log('Chessboard class available:', Chessboard);
    }
  }, []);

  return (
    <div className="App">
      <div ref={boardRef} style={{ width: '400px', height: '400px' }}>
        {/* Chessboard will be initialized here */}
      </div>
    </div>
  );
}

export default App;