In a chess game, the "main variation" represents the actual moves made. Subvariations are used in analysis, and represent alternative decisions that could have been made by either player. This is reflected in our chessboard app in what we call the "move history". The Move History shows the main variation in a three-column display: "move" number, White move, and Black move. Note that there are two different meanings of the word "move" in the previous sentence: it can mean one of White's moves or one of Black's moves, but when we refer to "move number" it's actually the "full" move number, which is only incremented when White moves. Moves are represented in algebraic chess notation, which consists usually of a capital letter identifying the piece (RNBQKP), and a lowercase square identifier (a1-a8..h1-h8). 

1. 

2. When move history navigation buttons are used, or a move in the move history is clicked, the chessboard moves to the correct corresponding position. 

3. The user is free to make any (legal) move at any point in the move history. 

4. When a move is made from a position, and that move exists as one of the next moves in the current variation or any sub-variatioon, the effect is just to move to that spot in the move history (and update the board accordingly).

5. When a move is made, and that move does not already exist as one of the possible next moves in the move history, add a new row to the move history, containing the new move. 

