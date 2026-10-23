import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// A complementary observed-browser measurement, not a replacement for the
// simulated Lighthouse categories in performance.mjs. Each CLI invocation
// launches a fresh Chrome profile with Lighthouse's default mobile 4G settings.
const base = process.env.LIGHTHOUSE_BASE_URL ?? 'http://localhost:3001';
const output =
  process.env.STORY_4G_OUTPUT_DIR ?? (await mkdtemp(join(tmpdir(), 'darivo-story-4g-')));
await mkdir(output, { recursive: true });
const pages = [
  ['reference-en', '/en/p/project-orla-palm-jumeirah'],
  ['reference-ar', '/ar/p/project-orla-palm-jumeirah'],
  ['residence-ar', '/ar/p/unit-the-courtyard-001'],
];
const results = [];
for (let round = 1; round <= 3; round++) {
  for (const [name, path] of pages) {
    const report = join(output, `${name}-${round}.json`);
    await new Promise((resolve, reject) => {
      const child = spawn(
        'pnpm',
        [
          'exec',
          'lighthouse',
          `${base}${path}`,
          '--chrome-flags=--headless --no-sandbox',
          '--only-categories=performance',
          '--throttling-method=devtools',
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
    const lcpNode = result.audits['lcp-breakdown-insight']?.details?.items?.find(
      (item) => item.type === 'node',
    );
    const measurement = {
      name,
      round,
      url: result.finalDisplayedUrl,
      fetchedAt: result.fetchTime,
      lighthouseVersion: result.lighthouseVersion,
      settings: result.configSettings,
      performance: result.categories.performance.score * 100,
      lcpMs: result.audits['largest-contentful-paint'].numericValue,
      fcpMs: result.audits['first-contentful-paint'].numericValue,
      tbtMs: result.audits['total-blocking-time'].numericValue,
      cls: result.audits['cumulative-layout-shift'].numericValue,
      lcpNode,
      fonts: result.audits['network-requests'].details.items
        .filter((item) => item.url.includes('/fonts/'))
        .map((item) => ({
          url: item.url,
          startMs: item.networkRequestTime,
          endMs: item.networkEndTime,
          transferSize: item.transferSize,
        })),
      warnings: result.runWarnings,
      report,
    };
    results.push(measurement);
    await writeFile(join(output, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
    console.info(JSON.stringify({ name, round, lcpMs: measurement.lcpMs, report }));
    if (
      measurement.lcpMs >= 2000 ||
      !lcpNode?.selector?.includes('#story-title') ||
      result.configSettings.throttlingMethod !== 'devtools'
    )
      process.exitCode = 1;
  }
}
