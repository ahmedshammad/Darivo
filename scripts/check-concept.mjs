import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile, mkdir } from 'node:fs/promises';
const version = process.argv[2] ?? 'v3';
const root = `docs/reviews/stage-0/media/${version}`;
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
for (const width of [1440, 1024, 390])
  for (const locale of ['en', 'ar'])
    for (const theme of ['dark', 'light']) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 1000 },
      });
      await context.addInitScript(() => {
        window.__lcp = 0;
        new PerformanceObserver((list) => {
          window.__lcp = list.getEntries().at(-1)?.startTime ?? 0;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      const page = await context.newPage();
      await page.goto(`http://localhost:6006/prototypes/concept-c/?lang=${locale}&theme=${theme}`);
      await page.waitForFunction(() => window.__map?.loaded(), null, { timeout: 30000 });
      const mapReadyMs = await page.evaluate(() => performance.now());
      await page.evaluate(() => document.fonts.ready);
      const home = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const lcp = await page.evaluate(() => window.__lcp);
      const intent =
        locale === 'ar'
          ? 'عرّفني على أحياء دبي لعائلة مع طفلين قرب مدرسة بريطانية'
          : 'Explain Dubai neighbourhoods for a family with two kids near a British school';
      await page.locator('#intent').fill(intent);
      await page.locator('#intent').press('Enter');
      await page.waitForTimeout(900);
      const map = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        brief:
          document.querySelector('.brief-panel')?.textContent ??
          document.querySelector('#brief-location')?.parentElement?.parentElement?.textContent,
        center: window.__map.getCenter().toArray(),
        schoolMatched: /school|مدرس|مدارس/i.test(
          document.querySelector('[data-t=priority]')?.textContent ?? '',
        ),
      }));
      results.push({
        width,
        locale,
        theme,
        lcp,
        mapReadyMs,
        homeViolations: home.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target),
        })),
        mapViolations: map.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target),
        })),
        ...state,
      });
      await context.close();
    }
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
await page.goto('http://localhost:6006/prototypes/concept-c/?view=map');
await page.waitForFunction(() => window.__map?.loaded(), null, { timeout: 30000 });
const frames = await page.evaluate(async () => {
  const map = window.__map;
  const deltas = [];
  let last = null;
  const frame = () => {
    const now = performance.now();
    if (map.isMoving()) {
      if (last !== null) deltas.push(now - last);
      last = now;
    } else last = null;
  };
  map.on('render', frame);
  for (const center of [
    [55.13, 25.12],
    [55.17, 25.15],
    [55.13, 25.12],
  ]) {
    map.flyTo({ center, zoom: 11.2, pitch: 45, duration: 600 });
    await new Promise((resolve) => setTimeout(resolve, 750));
    last = null;
  }
  map.off('render', frame);
  const sorted = deltas.sort((a, b) => a - b);
  return {
    samples: sorted.length,
    medianMs: sorted[Math.floor(sorted.length / 2)],
    p95Ms: sorted[Math.floor(sorted.length * 0.95)],
    maximumMs: sorted.at(-1),
    longFramesOver50Ms: sorted.filter((d) => d > 50).length,
    note: 'Local Chrome rendering sample; not an M1/mid-range physical-device certification.',
  };
});
await context.close();
await browser.close();
await writeFile(`${root}/quality.json`, JSON.stringify({ results, frames }, null, 2));
console.info(
  JSON.stringify(
    {
      states: results.length,
      violations: results.filter(
        (r) => r.overflow || r.homeViolations.length || r.mapViolations.length,
      ),
      frames,
    },
    null,
    2,
  ),
);
if (
  results.some(
    (r) => r.overflow || !r.schoolMatched || r.homeViolations.length || r.mapViolations.length,
  )
)
  process.exitCode = 1;
