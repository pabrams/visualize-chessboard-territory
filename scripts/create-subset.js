import fs from 'fs';
console.log('Loading full puzzle set...');
const fullData = JSON.parse(fs.readFileSync('./public/single-move-puzzles.json', 'utf8'));
console.log(`Total puzzles: ${fullData.puzzles.length}`);
const shuffled = fullData.puzzles
  .sort(() => Math.random() - 0.5)
  .slice(0, 10000);
const output = {
  _source: fullData._source,
  _license: fullData._license,
  _url: fullData._url,
  _generated: new Date().toISOString(),
  _count: shuffled.length,
  _note: "Random subset of 10,000 single-move puzzles for optimal loading performance",
  puzzles: shuffled
};

fs.writeFileSync('./public/single-move-puzzles.json', JSON.stringify(output, null, 2));

console.log(`\nCreated subset with ${shuffled.length} puzzles`);

const stats = fs.statSync('./public/single-move-puzzles.json');
console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
