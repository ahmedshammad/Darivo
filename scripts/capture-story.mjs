import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const dir = process.env.STORY_CAPTURE_DIR ?? 'docs/reviews/stage-4/media/story-v1';
const selected = process.env.STORY_CAPTURE_FILTER?.split(',') ?? [];
await fs.mkdir(dir, { recursive: true });
const manifest = {
  sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  dirty: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3000',
  startedAt: new Date().toISOString(),
  states: [],
  failures: [],
};
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const kind of ['reference', 'unit'])
    for (const locale of ['en', 'ar'])
      for (const theme of ['dark', 'light'])
        for (const width of [1440, 1024, 390]) {
          const name = `${kind}-${locale}-${theme}-${width}`;
          if (selected.length && !selected.includes(name)) continue;
          const context = await browser.newContext({
            viewport: { width, height: width === 390 ? 844 : 1000 },
            reducedMotion: 'reduce',
          });
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', (error) => errors.push(error.message));
          try {
            const slug =
              kind === 'reference' ? 'project-orla-palm-jumeirah' : 'unit-the-courtyard-001';
            await page.goto(`${manifest.baseURL}/${locale}/p/${slug}?theme=${theme}`);
            await page.locator('#story-title').waitFor();
            await page.evaluate(() => document.fonts.ready);
            await page.screenshot({ path: `${dir}/${name}-arrival.png` });
            const initialAxe = await new AxeBuilder({ page }).analyze();
            const initialOverflow = await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            );
            await page.locator('.story-chapters a[href="#story-place"]').click();
            await page.locator('.living-map[data-map-ready="true"]').waitFor({ timeout: 30000 });
            await page.waitForFunction(
              () => {
                const root = document.querySelector('.living-map');
                return (
                  root?.getAttribute('data-map-mode') === 'fallback' ||
                  (root?.getAttribute('data-tiles-ready') === 'true' &&
                    root?.getAttribute('data-moving') !== 'true')
                );
              },
              { timeout: 30000 },
            );
            await page.screenshot({ path: `${dir}/${name}-place.png` });
            const map = await page.locator('.living-map').evaluate((element) => ({
              mode: element.dataset.mapMode,
              ready: element.dataset.mapReady,
              tilesReady: element.dataset.tilesReady,
              center: element.dataset.center,
              width: element.clientWidth,
              height: element.clientHeight,
            }));
            await page.locator('.story-chapters a[href="#story-numbers"]').click();
            await page.screenshot({ path: `${dir}/${name}-numbers.png` });
            const finalAxe = await new AxeBuilder({ page }).analyze();
            const overflow = await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            );
            const violations = [...initialAxe.violations, ...finalAxe.violations].map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
            }));
            const state = { name, errors, overflow: initialOverflow || overflow, violations, map };
            manifest.states.push(state);
            if (errors.length || state.overflow || violations.length) manifest.failures.push(state);
          } catch (error) {
            manifest.failures.push({ name, error: String(error), errors });
            await page.screenshot({ path: `${dir}/${name}-failure.png` }).catch(() => {});
          }
          await context.close();
          await fs.writeFile(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
          console.log(name);
        }
} finally {
  await browser.close();
  manifest.finishedAt = new Date().toISOString();
  await fs.writeFile(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
}
