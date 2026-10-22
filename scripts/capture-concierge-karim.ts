import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  runKarimCurrencyJourney,
  type KarimCheckpoint,
} from '../e2e/helpers/karim-currency-journey';

const version = process.argv[2];
if (!version || !/^[a-z0-9-]+$/i.test(version)) throw new Error('Supply a new capture version');
const root = `docs/reviews/stage-3/media/${version}/karim-currencies`;
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report: Array<KarimCheckpoint & { width: number; screenshot: string; errors: string[] }> = [];
const failures: string[] = [];
try {
  for (const width of [1440, 390])
    for (const locale of ['en', 'ar'] as const) {
      const page = await browser.newPage({
        viewport: { width, height: width === 390 ? 844 : 1000 },
      });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(String(error)));
      try {
        await runKarimCurrencyJourney(page, {
          locale,
          origin: process.env.TEST_BASE_URL ?? 'http://localhost:3001',
          checkpoint: async (evidence) => {
            const screenshot = `${locale}-${width}-${evidence.name}.png`;
            await page.screenshot({ path: `${root}/${screenshot}` });
            report.push({ ...evidence, width, screenshot, errors: [...errors] });
            if (errors.length) throw new Error(errors.join('\n'));
          },
        });
      } finally {
        await page.close();
      }
    }
} catch (error) {
  failures.push(String(error));
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(
    `${root}/manifest.json`,
    JSON.stringify(
      {
        scope: 'Real guest UI and streamed MockProvider responses; no mocked requests or writes',
        limitations: [
          'Seeded prices and FX, not live offers or exchange rates.',
          'No physical-device, native-human-language or real-provider certification.',
        ],
        states: report,
        failures,
      },
      null,
      2,
    ),
  );
}
