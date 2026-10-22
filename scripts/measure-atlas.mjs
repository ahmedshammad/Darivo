import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.TEST_BASE_URL || 'http://localhost:3000';
const root = process.argv[2] || 'docs/reviews/stage-2/media/v1';
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const summarize = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return {
    samples: sorted.length,
    medianMs: sorted[Math.floor(sorted.length / 2)],
    p95Ms: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))],
    over33ms: sorted.filter((v) => v > 33.34).length,
  };
};
try {
  for (const route of ['', '/explore'])
    for (const width of [1440, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: width === 390 ? 844 : 1000 },
      });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      const start = Date.now();
      await page.goto(`${origin}/en${route}`);
      await page.locator('.living-map[data-tiles-ready="true"]').waitFor({ timeout: 30000 });
      const readyMs = Date.now() - start;
      const graphics = await page.evaluate(() => {
        const canvas = document.querySelector('.maplibregl-canvas');
        const gl = canvas?.getContext('webgl2');
        const info = gl?.getExtension('WEBGL_debug_renderer_info');
        return {
          renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : null,
          devicePixelRatio,
          hardwareConcurrency: navigator.hardwareConcurrency,
        };
      });
      const metrics = page.evaluate(
        () =>
          new Promise((resolve, reject) => {
            const root = document.querySelector('.living-map');
            if (!root || root.dataset.mapMode !== 'webgl')
              return reject(new Error('WebGL measurement unavailable'));
            const raf = [];
            let active = true;
            const tick = (t) => {
              raf.push(t);
              if (active) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            const timeout = setTimeout(() => reject(new Error('No render metrics')), 6500);
            root.addEventListener(
              'atlas:metrics',
              (event) => {
                active = false;
                clearTimeout(timeout);
                resolve({
                  map: event.detail,
                  rafIntervals: raf.slice(1).map((v, i) => v - raf[i]),
                });
              },
              { once: true },
            );
            root.dispatchEvent(new CustomEvent('atlas:measure', { detail: { durationMs: 3000 } }));
          }),
      );
      await page
        .locator(route ? '#atlas-prompt' : '#arrival-intent')
        .fill('A beachfront villa on Saadiyat');
      const measured = await metrics;
      const movingIntervals = measured.map.intervals.filter(
        (_, i) => measured.map.moving[i] && measured.map.moving[i + 1],
      );
      results.push({
        width,
        route: route || '/',
        readyMs,
        graphics,
        errors,
        renderMoving: summarize(movingIntervals),
        raf: summarize(measured.rafIntervals),
        raw: measured,
      });
      await page.close();
    }
} finally {
  await browser.close();
}
const report = {
  environment:
    'Headless Chrome on local Apple M3; viewport emulation is not a physical-phone or M1 measurement.',
  base: origin,
  results,
};
await writeFile(`${root}/performance.json`, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      ...report,
      results: results.map(({ route, width, readyMs, graphics, errors, renderMoving, raf }) => ({
        route,
        width,
        readyMs,
        graphics,
        errors,
        renderMoving,
        raf,
      })),
    },
    null,
    2,
  ),
);
