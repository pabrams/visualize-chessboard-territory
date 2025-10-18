import fs from 'fs';
import readline from 'readline';

async function processPuzzles() {
  const inputFile = './lichess_db_puzzle.csv';
  const outputFile = './public/single-move-puzzles.json';

  const singleMovePuzzles = [];
  let totalProcessed = 0;
  let singleMoveCount = 0;

  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // Skip header
    }

    totalProcessed++;
    if (totalProcessed % 100000 === 0) {
      console.log(`Processed ${totalProcessed} puzzles, found ${singleMoveCount} single-move puzzles...`);
    }

    const parts = line.split(',');

    if (parts.length < 9) continue;

    const puzzleId = parts[0];
    const fen = parts[1];
    const moves = parts[2];
    const rating = parseInt(parts[3]);
    const themes = parts[7];
    const gameUrl = parts[8];

    // Split moves by space - format is "setup_move solution_move1 ..."
    // For single-move puzzles, we want exactly 2 moves (setup + solution)
    const moveList = moves.trim().split(/\s+/);

    if (moveList.length === 2) {
      singleMoveCount++;
      singleMovePuzzles.push({
        id: puzzleId,
        fen: fen,
        setupMove: moveList[0],  // Opponent's setup move
        solution: moveList[1],    // Player's solution
        rating: rating,
        themes: themes.split(/\s+/).filter(t => t),
        gameUrl: gameUrl
      });
    }
  }

  // Create output with attribution
  const output = {
    _source: "Lichess Puzzle Database",
    _license: "CC0 Public Domain",
    _url: "https://database.lichess.org/#puzzles",
    _generated: new Date().toISOString(),
    _count: singleMovePuzzles.length,
    puzzles: singleMovePuzzles
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

  console.log(`\nComplete!`);
  console.log(`Total puzzles processed: ${totalProcessed}`);
  console.log(`Single-move puzzles found: ${singleMoveCount}`);
  console.log(`Output saved to: ${outputFile}`);
}

processPuzzles().catch(console.error);
