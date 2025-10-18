import fs from 'fs';
import readline from 'readline';
import path from 'path';

async function processSingleCSV(inputFile, outputFile) {
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

  // Determine note based on filename
  const filename = path.basename(inputFile);
  let note = '';
  if (filename.includes('-b-')) {
    note = 'Black to move puzzles only';
  } else if (filename.includes('-w-')) {
    note = 'White to move puzzles only';
  }

  // Create output with attribution
  const output = {
    _source: "Lichess Puzzle Database",
    _license: "CC0 Public Domain",
    _url: "https://database.lichess.org/#puzzles",
    _generated: new Date().toISOString(),
    _count: singleMovePuzzles.length,
    _note: note,
    puzzles: singleMovePuzzles
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

  console.log(`  Processed ${totalProcessed} lines, found ${singleMoveCount} puzzles`);
  return singleMoveCount;
}

async function processAllCSVs() {
  const publicDir = './public';
  const files = fs.readdirSync(publicDir);
  const csvFiles = files.filter(f => f.endsWith('.csv') && f.startsWith('lichess_db_puzzle-'));

  console.log(`Found ${csvFiles.length} CSV files to convert\n`);

  for (const csvFile of csvFiles) {
    const csvPath = path.join(publicDir, csvFile);
    const jsonFile = csvFile.replace('.csv', '.json');
    const jsonPath = path.join(publicDir, jsonFile);

    console.log(`Converting ${csvFile}...`);
    await processSingleCSV(csvPath, jsonPath);
    console.log(`  Created ${jsonFile}\n`);
  }

  console.log('Conversion complete!');
}

processAllCSVs().catch(console.error);
