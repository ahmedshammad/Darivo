// TEST_BASE_URL=http://localhost:3001 node --import tsx scripts/capture-concierge-poi.mjs
// Run sequentially in the allocated browser slot, after the production build is ready.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { conciergeCopy } from '../messages/concierge.ts';

const version = process.argv[2] || 'v7-poi-final';
if (!/^[a-z0-9-]+$/i.test(version)) throw new Error('Invalid capture version');
const root = `docs/reviews/stage-3/media/${version}`;
const origin = process.env.TEST_BASE_URL || 'http://localhost:3001';
await mkdir(root, { recursive: true });
const manifest = {
  source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  workingTreeStatus: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  origin,
  startedAt: new Date().toISOString(),
  scope:
    'Phone viewport/touch emulation, not physical-device or native assistive-technology validation. Reduced motion for settled visual checks; no cadence claim.',
  expectedStates: 64,
  states: [],
  failures: [],
};
const save = () => writeFile(`${root}/manifest.json`, JSON.stringify(manifest, null, 2));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
manifest.browser = browser.version();

async function settle(page, renderer) {
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.living-map[data-map-ready="true"]').waitFor({ timeout: 45000 });
  await page.waitForFunction(
    (mode) => {
      const map = document.querySelector('.living-map');
      return (
        map?.dataset.mapMode === mode &&
        map.dataset.tilesReady === 'true' &&
        map.dataset.moving === 'false'
      );
    },
    renderer,
    { timeout: 45000 },
  );
  // Include the layout/focus effect and two paints, even with reduced motion enabled.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

function emittedLayers(body) {
  const found = new Set();
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (value.type === 'map.showLayer' && value.visible === true) found.add(value.layer);
    for (const item of Object.values(value)) visit(item);
  };
  for (const line of body.split('\n')) {
    if (!line.startsWith('data:')) continue;
    try {
      visit(JSON.parse(line.slice(5).trim()));
    } catch {
      /* SSE terminal marker is not JSON. */
    }
  }
  return [...found];
}

async function capture(page, meta, errors, networkFailures, layers) {
  const stem = `${meta.journey}-${meta.locale}-${meta.theme}-${meta.width}-${meta.renderer}-${meta.sheet}`;
  await settle(page, meta.renderer);
  const geometry = await page.evaluate(({ sheet, locale }) => {
    const map = document.querySelector('.living-map');
    const strip = document.querySelector('.atlas-poi-strip-qualification');
    const bottom = document.querySelector('.atlas-map-evidence .atlas-poi-qualification');
    const expected = sheet === 'expanded' ? strip : bottom;
    const other = sheet === 'expanded' ? bottom : strip;
    const qualification = expected?.getBoundingClientRect().toJSON() ?? null;
    const mapBox = map?.getBoundingClientRect().toJSON() ?? null;
    const panel = document.querySelector('.cq-panel')?.getBoundingClientRect().toJSON() ?? null;
    // Inline callbacks remain serializable under tsx; include hidden ancestors, not only own style.
    const visibility = [expected, other].map((node) => {
      if (!node) return false;
      const box = node.getBoundingClientRect();
      if (!box.width || !box.height || getComputedStyle(node).visibility !== 'visible')
        return false;
      for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (style.display === 'none' || Number(style.opacity) === 0) return false;
      }
      return true;
    });
    const fullyExposed =
      qualification &&
      mapBox &&
      panel &&
      qualification.top >= mapBox.top &&
      qualification.left >= mapBox.left &&
      qualification.right <= mapBox.right &&
      qualification.bottom <= Math.min(panel.top, mapBox.bottom);
    return {
      map: { ...map.dataset },
      theme: document.querySelector('[data-testid="concierge"]')?.dataset.theme,
      sheet: document.querySelector('[data-testid="concierge"]')?.dataset.sheet,
      qualification,
      mapBox,
      panel,
      qualificationText: expected?.textContent,
      correctText:
        expected?.textContent ===
        (locale === 'ar' ? 'مرافق تجريبية · غير موثّقة' : 'Demo amenities · not verified'),
      visible: visibility[0],
      duplicateVisible: visibility[1],
      fullyExposed: Boolean(fullyExposed),
      overflow: document.documentElement.scrollWidth > innerWidth,
      windowScroll: scrollY,
      fallbackPoiLabels: [...document.querySelectorAll('text[data-poi-label]')].map(
        (node) => node.textContent,
      ),
    };
  }, meta);
  await page.screenshot({ path: `${root}/${stem}.png` });
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const state = {
    ...meta,
    stem,
    ...geometry,
    emittedVisibleLayers: layers,
    errors: [...errors],
    networkFailures: [...networkFailures],
    violations: axe.violations.map((item) => ({
      id: item.id,
      impact: item.impact,
      nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
  };
  manifest.states.push(state);
  const checks = {
    qualifierVisible: state.visible,
    qualifierFullyExposed: state.fullyExposed,
    exactDemoQualification: state.correctText,
    noDuplicateQualification: !state.duplicateVisible,
    expectedActiveLayer: layers.includes(meta.journey === 'elena' ? 'school' : 'beach'),
    expectedTheme: state.theme === meta.theme,
    expectedSheet: state.sheet === meta.sheet,
    expectedRenderer: state.map.mapMode === meta.renderer,
    settledMap: state.map.tilesReady === 'true' && state.map.moving === 'false',
    noAxeViolations: state.violations.length === 0,
    noPageErrors: state.errors.length === 0,
    noOverflow: !state.overflow,
    noOuterScroll: state.windowScroll === 0,
  };
  for (const [check, pass] of Object.entries(checks))
    if (!pass) manifest.failures.push({ stem, check });
  await save();
  console.log(JSON.stringify({ stem, checks }));
}

try {
  for (const locale of ['en', 'ar'])
    for (const theme of ['dark', 'light'])
      for (const width of [375, 390])
        for (const renderer of ['webgl', 'fallback']) {
          const context = await browser.newContext({
            viewport: { width, height: 844 },
            deviceScaleFactor: 1,
            isMobile: true,
            hasTouch: true,
            reducedMotion: 'reduce',
          });
          try {
            for (const journey of ['elena', 'sheikha']) {
              const page = await context.newPage();
              // Observe a clone of the real SSE response inside the browser. Return the original
              // fetch promise immediately; no route, mock, app buffering or signal/body changes.
              await page.addInitScript(() => {
                window.__darivoPoiSse = [];
                const originalFetch = window.fetch.bind(window);
                window.fetch = (input, init) => {
                  const url = new URL(
                    input instanceof Request ? input.url : String(input),
                    location.href,
                  );
                  const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
                  const record =
                    url.pathname === '/api/v1/concierge' && method.toUpperCase() === 'POST'
                      ? { complete: false }
                      : undefined;
                  if (record) window.__darivoPoiSse.push(record);
                  const pending = originalFetch(input, init);
                  if (record)
                    void pending.then(
                      (response) => {
                        record.status = response.status;
                        try {
                          void response
                            .clone()
                            .text()
                            .then(
                              (text) => {
                                record.text = text;
                                record.complete = true;
                              },
                              (error) => {
                                record.error = String(error);
                                record.complete = true;
                              },
                            );
                        } catch (error) {
                          record.error = String(error);
                          record.complete = true;
                        }
                      },
                      (error) => {
                        record.error = String(error);
                        record.complete = true;
                      },
                    );
                  return pending;
                };
              });
              const errors = [];
              const networkFailures = [];
              page.on('pageerror', (error) => errors.push(error.message));
              page.on('requestfailed', (request) =>
                networkFailures.push({ url: request.url(), error: request.failure()?.errorText }),
              );
              const meta = { locale, theme, width, height: 844, renderer, journey };
              try {
                await page.goto(
                  `${origin}/${locale}/concierge?theme=${theme}${renderer === 'fallback' ? '&fallback=1' : ''}`,
                );
                await settle(page, renderer);
                await page
                  .getByRole('button', {
                    name: new RegExp(
                      conciergeCopy[locale].examples[journey === 'elena' ? 1 : 2].name,
                    ),
                  })
                  .click();
                await page
                  .locator('[data-testid="concierge-turn"][data-status="complete"]')
                  .last()
                  .waitFor({ timeout: 45000 });
                await page.waitForFunction(() => window.__darivoPoiSse[0]?.complete, null, {
                  timeout: 45000,
                });
                const captured = await page.evaluate(() => ({
                  ...window.__darivoPoiSse[0],
                  count: window.__darivoPoiSse.length,
                }));
                if (
                  captured.count !== 1 ||
                  captured.status !== 200 ||
                  captured.error ||
                  !captured.text
                )
                  throw new Error(
                    `SSE observation failed: ${JSON.stringify({ count: captured.count, status: captured.status, error: captured.error })}`,
                  );
                const layers = emittedLayers(captured.text);
                await page.locator('.cq-reading').evaluate((element) => {
                  element.scrollTop = 0;
                });
                await capture(
                  page,
                  { ...meta, sheet: 'expanded' },
                  errors,
                  networkFailures,
                  layers,
                );
                await page
                  .getByRole('button', { name: conciergeCopy[locale].collapse, exact: true })
                  .click();
                await capture(
                  page,
                  { ...meta, sheet: 'collapsed' },
                  errors,
                  networkFailures,
                  layers,
                );
              } catch (error) {
                const stem = `${journey}-${locale}-${theme}-${width}-${renderer}`;
                manifest.failures.push({ stem, error: String(error), errors: [...errors] });
                await page.screenshot({ path: `${root}/${stem}-failure.png` }).catch(() => {});
                await save();
                console.error(`${stem}: ${String(error)}`);
              } finally {
                await page.close();
              }
            }
          } finally {
            await context.close();
          }
        }
} finally {
  if (manifest.states.length !== manifest.expectedStates)
    manifest.failures.push({
      check: 'completeMatrix',
      actual: manifest.states.length,
      expected: manifest.expectedStates,
    });
  manifest.finishedAt = new Date().toISOString();
  await browser.close();
  await save();
}
console.log(
  JSON.stringify({
    output: root,
    states: manifest.states.length,
    failures: manifest.failures.length,
  }),
);
if (manifest.failures.length) process.exitCode = 1;
