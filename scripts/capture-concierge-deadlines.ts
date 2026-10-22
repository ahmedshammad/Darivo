import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import {
  runDeadlineJourney,
  type DeadlineCheckpoint,
} from '../e2e/helpers/concierge-deadline-journey';

async function main() {
  const version = process.argv[2];
  if (!version || !/^[a-z0-9-]+$/i.test(version)) throw new Error('Supply a new capture version');
  const root = `docs/reviews/stage-3/media/${version}/deadline-context`;
  await mkdir(`docs/reviews/stage-3/media/${version}`, { recursive: true });
  // Atomic EEXIST refusal protects completed and interrupted evidence alike.
  await mkdir(root, { recursive: false });
  const provenance = {
    source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    workingTreeStatus: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
    startedAt: new Date().toISOString(),
    origin: process.env.TEST_BASE_URL ?? 'http://localhost:3001',
  };
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const states: Array<
    DeadlineCheckpoint & {
      width: number;
      theme: string;
      screenshot: string;
      errors: string[];
      axe: string[];
      overflow: boolean;
      map: {
        status: string | null;
        ready: string | null;
        tilesReady: string | null;
        moving: string | null;
        settled: boolean;
      };
      mapWaitError: string | null;
    }
  > = [];
  const failures: string[] = [];
  try {
    for (const width of [1440, 1024, 390])
      for (const locale of ['en', 'ar'] as const)
        for (const theme of ['dark', 'light'] as const) {
          const context = await browser.newContext({
            viewport: { width, height: width === 390 ? 844 : 1000 },
          });
          const page = await context.newPage();
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(String(error)));
          try {
            await runDeadlineJourney(page, {
              locale,
              theme,
              origin: process.env.TEST_BASE_URL ?? 'http://localhost:3001',
              checkpoint: async (evidence) => {
                const screenshot = `${locale}-${theme}-${width}-${evidence.name}.png`;
                const axe = (await new AxeBuilder({ page }).analyze()).violations.map((v) => v.id);
                let mapWaitError: string | null = null;
                try {
                  let stableSince = 0;
                  await expect
                    .poll(
                      async () => {
                        const settled = await page.evaluate(() => {
                          const map = document.querySelector<HTMLElement>('.living-map');
                          return (
                            map?.dataset.mapReady === 'true' &&
                            (map.dataset.mapStatus === 'fallback' ||
                              (map.dataset.tilesReady === 'true' && map.dataset.moving === 'false'))
                          );
                        });
                        if (!settled) stableSince = 0;
                        else if (!stableSince) stableSince = Date.now();
                        return Boolean(stableSince && Date.now() - stableSince >= 600);
                      },
                      { timeout: 45000, intervals: [100] },
                    )
                    .toBe(true);
                } catch (error) {
                  mapWaitError = String(error);
                }
                // Inline browser callback has no named nested helper: tsx cannot
                // introduce a module-only __name dependency into serialized code.
                const map = await page.evaluate(() => {
                  const element = document.querySelector<HTMLElement>('.living-map');
                  return {
                    status: element?.dataset.mapStatus ?? null,
                    ready: element?.dataset.mapReady ?? null,
                    tilesReady: element?.dataset.tilesReady ?? null,
                    moving: element?.dataset.moving ?? null,
                    settled:
                      element?.dataset.mapReady === 'true' &&
                      (element.dataset.mapStatus === 'fallback' ||
                        (element.dataset.tilesReady === 'true' &&
                          element.dataset.moving === 'false')),
                  };
                });
                const overflow = await page.evaluate(
                  () => document.documentElement.scrollWidth > innerWidth || scrollY !== 0,
                );
                await page.screenshot({ path: `${root}/${screenshot}` });
                states.push({
                  ...evidence,
                  width,
                  theme,
                  screenshot,
                  errors: [...errors],
                  axe,
                  overflow,
                  map,
                  mapWaitError,
                });
                if (errors.length || axe.length || overflow || mapWaitError || !map.settled)
                  throw new Error(JSON.stringify({ errors, axe, overflow, map, mapWaitError }));
              },
            });
          } catch (error) {
            failures.push(`${locale}/${theme}/${width}: ${String(error)}`);
            await page
              .screenshot({ path: `${root}/failure-${locale}-${theme}-${width}.png` })
              .catch(() => {});
            throw error;
          } finally {
            await context.close();
          }
        }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await writeFile(
      `${root}/manifest.json`,
      JSON.stringify(
        {
          ...provenance,
          browser: browser.version(),
          scope:
            'Real guest UI and unmodified streamed responses; no mocked responses or confirmed writes. Cancellation is tested separately, not in this capture.',
          limitations: [
            'Phone emulation/reduced motion, not physical-device performance.',
            'Each state records actual renderer and settled flags. Fallback states do not certify WebGL; unsettled states are retained as failures.',
            'MockProvider and seeded data; no live-provider/native-human or external-market certification.',
          ],
          expectedConfigurations: 12,
          states,
          failures,
        },
        null,
        2,
      ),
    );
  }
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
