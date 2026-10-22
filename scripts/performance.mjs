import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.env.LIGHTHOUSE_BASE_URL ?? 'http://localhost:3001';
const output =
  process.env.LIGHTHOUSE_OUTPUT_DIR ?? (await mkdtemp(join(tmpdir(), 'darivo-lighthouse-')));
await mkdir(output, { recursive: true });
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    if ((await fetch(`${base}/en`, { signal: AbortSignal.timeout(1000) })).ok) {
      ready = true;
      break;
    }
  } catch {
    // The production process may still be starting.
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (!ready) throw new Error(`Production preview unavailable at ${base}`);

const pages = [
  ['home', '/en'],
  ['search', '/en/search'],
  ['explore', '/en/explore'],
  ['concierge', '/en/concierge'],
  ['detail-ar', '/ar/properties/property-002'],
];
const requested = process.env.LIGHTHOUSE_PAGES?.split(',');
if (requested?.some((name) => !pages.some(([candidate]) => candidate === name)))
  throw new Error('Unknown LIGHTHOUSE_PAGES entry');
for (const [name, path] of pages.filter(([name]) => !requested || requested.includes(name))) {
  const report = join(output, `${name}.json`);
  await new Promise((resolve, reject) => {
    const child = spawn(
      'pnpm',
      [
        'exec',
        'lighthouse',
        `${base}${path}`,
        '--chrome-flags=--headless --no-sandbox',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=json',
        `--output-path=${report}`,
        '--quiet',
      ],
      { stdio: 'inherit' },
    );
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`Lighthouse exited ${code}`)),
    );
  });
  const result = JSON.parse(await readFile(report, 'utf8'));
  const scores = Object.fromEntries(
    Object.entries(result.categories).map(([key, value]) => [key, Math.round(value.score * 100)]),
  );
  const metrics = {
    lcpMs: result.audits['largest-contentful-paint'].numericValue,
    blockingMs: result.audits['total-blocking-time'].numericValue,
    layoutShift: result.audits['cumulative-layout-shift'].numericValue,
  };
  console.info(JSON.stringify({ page: path, scores, metrics, report }));
  if (Object.values(scores).some((score) => score < 90)) process.exitCode = 1;
}
