import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile, rename, readFile } from 'node:fs/promises';

const version = process.argv[2] || 'v1';
const root = `docs/reviews/stage-2/media/${version}`;
const origin = process.env.TEST_BASE_URL || 'http://localhost:3000';
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const videosOnly = process.argv.includes('--videos-only');
const fallbackOnly = process.argv.includes('--fallback-only');
const states =
  videosOnly || fallbackOnly ? JSON.parse(await readFile(`${root}/manifest.json`, 'utf8')) : [];
async function waitForMap(page) {
  await page.waitForFunction(
    () => {
      const map = document.querySelector('.living-map');
      return (
        map?.dataset.mapReady === 'true' &&
        (map.dataset.mapMode === 'fallback' || map.dataset.tilesReady === 'true')
      );
    },
    null,
    { timeout: 30000 },
  );
}
try {
  for (const width of videosOnly || fallbackOnly ? [] : [1440, 1024, 390])
    for (const locale of ['en', 'ar'])
      for (const theme of ['dark', 'light']) {
        const context = await browser.newContext({
          viewport: { width, height: width === 390 ? 844 : 1000 },
        });
        const page = await context.newPage();
        for (const route of ['', '/explore']) {
          const errors = [];
          const handleError = (error) => errors.push(error.message);
          page.on('pageerror', handleError);
          const started = Date.now();
          await page.goto(`${origin}/${locale}${route}?theme=${theme}`);
          await page.locator('.living-map[data-map-ready="true"]').waitFor({ timeout: 30000 });
          const readyMs = Date.now() - started;
          await waitForMap(page);
          const tilesReadyMs = Date.now() - started;
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(1600);
          await waitForMap(page);
          const stem = `${route ? 'explore' : 'arrival'}-${locale}-${theme}-${width}`;
          await page.screenshot({ path: `${root}/${stem}.png`, fullPage: true });
          if (!route) await page.screenshot({ path: `${root}/${stem}-viewport.png` });
          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze();
          const state = {
            route: route || '/',
            width,
            locale,
            theme,
            errors,
            readyMs,
            tilesReadyMs,
            ...(await page.evaluate(() => ({
              direction: document.documentElement.dir,
              overflow: document.documentElement.scrollWidth > innerWidth,
              map: { ...document.querySelector('.living-map').dataset },
              canvas: document.querySelector('.atlas-map-canvas')?.getBoundingClientRect().toJSON(),
            }))),
            violations: axe.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
            })),
          };
          states.push(state);
          console.log(
            JSON.stringify({
              route: state.route,
              width,
              locale,
              theme,
              readyMs,
              mode: state.map.mapMode,
              errors: errors.length,
              violations: state.violations.length,
              overflow: state.overflow,
            }),
          );
          page.off('pageerror', handleError);
        }
        await context.close();
      }
  if (!videosOnly) {
    const fallbackStates = [];
    for (const width of [375, 390])
      for (const locale of ['en', 'ar'])
        for (const theme of ['dark', 'light']) {
          const context = await browser.newContext({ viewport: { width, height: 844 } });
          await context.addInitScript(() => {
            const original = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
              return /webgl/.test(kind) ? null : Reflect.apply(original, this, [kind, ...args]);
            };
          });
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', (e) => errors.push(e.message));
          await page.goto(`${origin}/${locale}?theme=${theme}`);
          await page
            .locator('.living-map[data-map-mode="fallback"][data-tiles-ready="true"]')
            .waitFor({ timeout: 30000 });
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({
            path: `${root}/fallback-arrival-${locale}-${theme}-${width}.png`,
          });
          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze();
          const state = {
            width,
            locale,
            theme,
            errors,
            violations: axe.violations.map((v) => v.id),
            overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          };
          fallbackStates.push(state);
          if (errors.length || state.violations.length || state.overflow) process.exitCode = 1;
          await context.close();
        }
    await writeFile(`${root}/fallback-manifest.json`, JSON.stringify(fallbackStates, null, 2));
  }
  for (const locale of fallbackOnly ? [] : ['en', 'ar']) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      recordVideo: { dir: root, size: { width: 390, height: 844 } },
    });
    const page = await context.newPage();
    let flowComplete = false;
    try {
      await page.goto(`${origin}/${locale}?theme=dark`);
      await page.locator('.living-map[data-map-ready="true"]').waitFor({ timeout: 30000 });
      await page
        .locator('#arrival-intent')
        .fill(
          locale === 'ar'
            ? 'فيلا على البحر في السعديات أو النخلة'
            : 'North Coast summer home, compare with Dubai',
        );
      await page.waitForTimeout(1300);
      await waitForMap(page);
      await page.screenshot({ path: `${root}/signature-${locale}-camera.png` });
      await page.locator('#arrival-intent').press('Enter');
      await page.locator('.atlas-sheet-handle').waitFor();
      await page.locator('.living-map[data-map-ready="true"]').waitFor({ timeout: 30000 });
      await page.locator('.atlas-sheet-handle').click();
      await page.locator('.atlas-project-select').first().waitFor();
      await page.locator('.atlas-compare-add').nth(0).click();
      await page.locator('.atlas-compare-add').nth(1).click();
      await page.screenshot({ path: `${root}/signature-${locale}-comparison.png` });
      await page.locator('.atlas-project-select').first().click();
      await page.locator('.atlas-evidence').waitFor();
      await page.screenshot({ path: `${root}/signature-${locale}-evidence.png` });
      await page.keyboard.press('Escape');
      await page.locator('.atlas-sheet-handle').click();
      await page.locator('.atlas-tool-toggle').click();
      await page.locator('.atlas-layer-chips button').nth(2).click();
      await page.screenshot({ path: `${root}/signature-${locale}-layers.png` });
      flowComplete = true;
    } finally {
      const video = await page.video().path();
      await context.close();
      await rename(video, `${root}/signature-${locale}${flowComplete ? '' : '-failed'}.webm`);
    }
  }
} finally {
  await browser.close();
  await writeFile(`${root}/manifest.json`, JSON.stringify(states, null, 2));
}
const failures = states.filter(
  (s) =>
    s.errors.length ||
    s.overflow ||
    s.violations.length ||
    s.direction !== (s.locale === 'ar' ? 'rtl' : 'ltr'),
);
console.log(
  JSON.stringify(
    {
      configurations: states.length,
      failures: failures.map(({ route, width, locale, theme, violations, errors, overflow }) => ({
        route,
        width,
        locale,
        theme,
        violations,
        errors,
        overflow,
      })),
    },
    null,
    2,
  ),
);
if (failures.length || states.length !== 24) process.exitCode = 1;
