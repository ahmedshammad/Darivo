import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const root = process.argv[2];
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
function inspect() {
  const element = document.querySelector('.living-map');
  let fiber = element[Object.keys(element).find((k) => k.startsWith('__reactFiber$'))],
    map;
  for (let depth = 0; fiber && depth < 30; depth++, fiber = fiber.return) {
    for (let hook = fiber.memoizedState, n = 0; hook && n < 50; n++, hook = hook.next) {
      const candidate = hook.memoizedState?.current?.map;
      if (candidate?.queryRenderedFeatures) {
        map = candidate;
        break;
      }
    }
    if (map) break;
  }
  if (!map) return { mode: element.dataset.mapMode, error: 'No test-only React ref found' };
  return {
    mode: element.dataset.mapMode,
    zoom: map.getZoom(),
    center: map.getCenter().toArray(),
    planned: JSON.parse(element.dataset.orientationPlacements || '[]'),
    rendered: map
      .queryRenderedFeatures({ layers: ['atlas-orientation-text'] })
      .map((f) => ({ id: f.properties.id, name: f.properties.name })),
    errors: [],
    overflow: document.documentElement.scrollWidth > innerWidth,
  };
}
try {
  for (const width of [390, 1440])
    for (const locale of ['en', 'ar'])
      for (const theme of ['dark', 'light']) {
        const page = await browser.newPage({
          viewport: { width, height: width === 390 ? 844 : 1000 },
          reducedMotion: 'reduce',
        });
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        for (const [key, q] of [
          ['initial', ''],
          ['palm', locale === 'ar' ? 'النخلة' : 'Palm'],
          ['downtown', locale === 'ar' ? 'وسط دبي' : 'Downtown Dubai'],
          ['saadiyat', locale === 'ar' ? 'السعديات' : 'Saadiyat'],
        ]) {
          await page.goto(
            `http://localhost:3000/${locale}/explore?theme=${theme}&q=${encodeURIComponent(q)}`,
          );
          await page.locator('.living-map[data-map-ready="true"]').waitFor();
          await page.waitForFunction(
            () => {
              const d = document.querySelector('.living-map').dataset;
              return d.mapMode === 'fallback' || (d.moving === 'false' && d.tilesReady === 'true');
            },
            {},
            { timeout: 30000 },
          );
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(1200);
          const state = await page.evaluate(inspect);
          results.push({ width, locale, theme, key, ...state, errors: [...errors] });
          await page.screenshot({ path: `${root}/${locale}-${theme}-${width}-${key}.png` });
          console.log(JSON.stringify(results.at(-1)));
        }
        await page.close();
      }
} finally {
  await browser.close();
  await writeFile(`${root}/checks.json`, JSON.stringify(results, null, 2));
}
