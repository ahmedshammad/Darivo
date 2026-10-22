import { readFile } from 'node:fs/promises';
const folder = process.argv[2] ?? 'docs/reviews/stage-0/v1';
const column = Number(process.argv[3] ?? 3);
const names = ['sheikha', 'karim', 'elena', 'rajiv', 'head-of-sales', 'private-advisor', 'critic'];
const reviews = [];
for (const name of names) {
  const text = await readFile(`${folder}/${name}.md`, 'utf8');
  const rows = text
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((x) => x.trim()),
    );
  const scores = rows
    .filter(
      (row) =>
        row.length > column &&
        /^(?:10|[1-9])(?:\.\d+)?$/.test(row[column]) &&
        !/mean|average/i.test(row[0]),
    )
    .map((row) => ({ criterion: row[0].replaceAll('*', ''), score: Number(row[column]) }));
  if (scores.length !== 12)
    throw new Error(`${name}: expected12 criterion scores, found${scores.length}`);
  const average = scores.reduce((sum, x) => sum + x.score, 0) / 12;
  reviews.push({
    name,
    average: Number(average.toFixed(3)),
    minimum: Math.min(...scores.map((x) => x.score)),
    scores,
  });
}
const boardAverage =
  reviews.reduce((sum, x) => sum + x.scores.reduce((s, v) => s + v.score, 0), 0) / 84;
const minimum = Math.min(...reviews.map((r) => r.minimum));
const blanketPerfect = reviews.some((r) => r.scores.every((s) => s.score === 10));
const pass = boardAverage >= 9 && minimum >= 8 && !blanketPerfect;
console.info(
  JSON.stringify(
    {
      folder,
      column,
      boardAverage: Number(boardAverage.toFixed(3)),
      minimum,
      blanketPerfect,
      pass,
      reviews,
    },
    null,
    2,
  ),
);
if (!pass) process.exitCode = 1;
