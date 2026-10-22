// Run only in an uncontended browser slot against the intended production build:
// TEST_BASE_URL=http://localhost:3001 node scripts/measure-concierge.mjs <output-directory>
// Samples actual MapLibre render events and browser RAF; never infers physical-device FPS or INP.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { cpus, platform, release, arch, totalmem } from 'node:os';
import { execFileSync } from 'node:child_process';

const origin = process.env.TEST_BASE_URL || 'http://localhost:3001';
const output = process.argv[2] || 'docs/reviews/stage-3/media/motion-v1';
const durationMs = 3000;
const channel = process.env.BROWSER_CHANNEL || 'chrome';
await mkdir(output, { recursive: true });
const summarize = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return {
    samples: sorted.length,
    medianMs: sorted[Math.floor(sorted.length / 2)],
    p95Ms: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))],
    maxMs: sorted.at(-1),
    over33_34ms: sorted.filter((value) => value > 33.34).length,
    over50ms: sorted.filter((value) => value > 50).length,
  };
};
const browser = await chromium.launch({ channel, headless: true });
const report = {
  startedAt: new Date().toISOString(),
  source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  workingTreeStatus: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  origin,
  environment: {
    os: platform(),
    osRelease: release(),
    architecture: arch(),
    cpu: cpus()[0]?.model ?? null,
    logicalCpus: cpus().length,
    memoryBytes: totalmem(),
    browser: browser.version(),
    channel,
    headless: true,
    reducedMotion: 'no-preference',
  },
  scope: [
    'Three-second local synthetic interaction windows; no CPU/network throttling.',
    'Phone viewport/touch emulation is not a physical phone, M1 certification or field INP.',
    'RAF measures browser callbacks; MapLibre render events measure its rendered frames, not display presentation.',
    'No FPS claim. Empty moving-frame or sheet-motion samples are explicitly insufficient.',
    'Conversation timing starts at the first camera-key mutation; it is not provider latency or first-token latency.',
    'No screenshot, video, tracing or Lighthouse runs inside these measurement windows.',
  ],
  results: [],
};

async function measure(page, kind, action, waitForCamera = false) {
  await page.evaluate(
    ({ durationMs, waitForCamera }) => {
      const root = document.querySelector('.living-map');
      if (!root || root.dataset.mapMode !== 'webgl') throw new Error('WebGL unavailable');
      const sheet = document.querySelector('.cq-panel');
      const snapshot = () => ({
        cameraKey: root.dataset.cameraKey,
        center: root.dataset.center,
        zoom: root.dataset.zoom,
        tilesReady: root.dataset.tilesReady,
        mapDetail: root.dataset.mapDetail,
        sheet: document.querySelector('[data-testid="concierge"]')?.dataset.sheet,
        visibility: document.visibilityState,
      });
      // Test-only state, installed by this script; no production global or private React introspection.
      window.__conciergeMotionProbe = new Promise((resolve) => {
        const armedAt = performance.now();
        const initialKey = root.dataset.cameraKey;
        let startedAt;
        let active = false;
        let done = false;
        let frame;
        let finishTimer;
        let before;
        let map = null;
        const raf = [];
        const longTasks = [];
        const events = [];
        const onMetrics = (event) => {
          map = event.detail;
          finish();
        };
        const observer = new MutationObserver(() => {
          if (root.dataset.cameraKey !== initialKey && !active) start();
        });
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            longTasks.push({ startMs: entry.startTime - startedAt, durationMs: entry.duration });
        });
        const onSheet = () => {
          if (active)
            events.push({ timeMs: performance.now() - startedAt, state: snapshot().sheet });
        };
        const sheetObserver = new MutationObserver(onSheet);
        const tick = (time) => {
          const rect = sheet?.getBoundingClientRect();
          raf.push({ timeMs: time - startedAt, sheetTop: rect?.top, sheetHeight: rect?.height });
          if (active) frame = requestAnimationFrame(tick);
        };
        const finish = () => {
          if (done) return;
          done = true;
          active = false;
          clearTimeout(armTimeout);
          clearTimeout(finishTimer);
          cancelAnimationFrame(frame);
          observer.disconnect();
          sheetObserver.disconnect();
          longTaskObserver.disconnect();
          root.removeEventListener('atlas:metrics', onMetrics);
          resolve({
            before: before ?? snapshot(),
            after: snapshot(),
            armDelayMs: startedAt === undefined ? null : startedAt - armedAt,
            durationMs: startedAt === undefined ? 0 : performance.now() - startedAt,
            map,
            raf,
            longTasks,
            events,
            failure:
              startedAt === undefined
                ? 'No conversation camera change'
                : !map
                  ? 'No map metrics'
                  : null,
          });
        };
        const start = () => {
          if (active || done) return;
          observer.disconnect();
          startedAt = performance.now();
          before = snapshot();
          active = true;
          clearTimeout(armTimeout);
          if (PerformanceObserver.supportedEntryTypes.includes('longtask'))
            longTaskObserver.observe({ type: 'longtask' });
          const concierge = document.querySelector('[data-testid="concierge"]');
          if (concierge)
            sheetObserver.observe(concierge, { attributes: true, attributeFilter: ['data-sheet'] });
          root.addEventListener('atlas:metrics', onMetrics, { once: true });
          frame = requestAnimationFrame(tick);
          finishTimer = setTimeout(finish, durationMs + 2000);
          root.dispatchEvent(new CustomEvent('atlas:measure', { detail: { durationMs } }));
        };
        const armTimeout = setTimeout(finish, 45000);
        if (waitForCamera)
          observer.observe(root, { attributes: true, attributeFilter: ['data-camera-key'] });
        else start();
      });
    },
    { durationMs, waitForCamera },
  );
  await action();
  const raw = await page.evaluate(() => window.__conciergeMotionProbe);
  const rafIntervals = raw.raf.slice(1).map((frame, index) => frame.timeMs - raw.raf[index].timeMs);
  const sheetIntervals = rafIntervals.filter(
    (_, index) =>
      Math.abs(raw.raf[index + 1].sheetTop - raw.raf[index].sheetTop) > 0.1 ||
      Math.abs(raw.raf[index + 1].sheetHeight - raw.raf[index].sheetHeight) > 0.1,
  );
  const movingIntervals =
    raw.map?.intervals.filter((_, index) => raw.map.moving[index] && raw.map.moving[index + 1]) ??
    [];
  return {
    kind,
    status: raw.failure
      ? 'failed'
      : kind.startsWith('sheet-')
        ? sheetIntervals.length > 1
          ? 'measured'
          : 'insufficient-sheet-motion'
        : movingIntervals.length > 1
          ? 'measured'
          : 'insufficient-map-motion',
    mapRenderMoving: summarize(movingIntervals),
    mapRenderAll: summarize(raw.map?.intervals ?? []),
    rafAll: summarize(rafIntervals),
    rafSheetMoving: summarize(sheetIntervals),
    raw,
  };
}

try {
  for (const locale of ['en', 'ar']) {
    for (const width of [1440, 390]) {
      const phone = width === 390;
      const viewport = { width, height: phone ? 844 : 1000 };
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
        isMobile: phone,
        hasTouch: phone,
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const result = {
        locale,
        viewport,
        isMobileEmulation: phone,
        hasTouch: phone,
        errors,
        windows: [],
      };
      report.results.push(result);
      try {
        await page.goto(`${origin}/${locale}/concierge`);
        await page.locator('.living-map[data-tiles-ready="true"]').waitFor({ timeout: 45000 });
        result.graphics = await page.evaluate(() => {
          const root = document.querySelector('.living-map');
          const gl = root?.querySelector('.maplibregl-canvas')?.getContext('webgl2');
          const info = gl?.getExtension('WEBGL_debug_renderer_info');
          return {
            renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : null,
            vendor: info ? gl.getParameter(info.UNMASKED_VENDOR_WEBGL) : null,
            mapMode: root?.dataset.mapMode,
            devicePixelRatio,
            hardwareConcurrency: navigator.hardwareConcurrency,
            userAgent: navigator.userAgent,
          };
        });
        if (result.graphics.mapMode !== 'webgl') {
          result.failure = 'WebGL unavailable; fallback has no MapLibre render cadence.';
          continue;
        }
        result.windows.push(
          await measure(
            page,
            'conversation-flight',
            () => page.locator('.cq-examples button').nth(1).click(),
            true,
          ),
        );
        await page
          .locator('[data-testid="concierge-turn"][data-status="complete"]')
          .last()
          .waitFor({ timeout: 45000 });
        await page.locator('.living-map[data-tiles-ready="true"]').waitFor({ timeout: 45000 });
        result.windows.push(
          await measure(page, 'guide-anchor-flight', () =>
            page.locator('.cq-mini-places button').first().click(),
          ),
        );
        await page.locator('.living-map[data-tiles-ready="true"]').waitFor({ timeout: 45000 });
        if (phone) {
          // Opening the guide anchor collapses the sheet. Measure real keyboard-button transitions.
          const handle = page.locator('.cq-sheet-handle');
          if ((await handle.getAttribute('aria-expanded')) !== 'false')
            throw new Error('Expected collapsed sheet after map action');
          result.windows.push(
            await measure(page, 'sheet-expand', async () => {
              await handle.focus();
              await page.keyboard.press('Enter');
            }),
          );
          if ((await handle.getAttribute('aria-expanded')) !== 'true')
            throw new Error('Sheet did not expand');
          result.windows.push(
            await measure(page, 'sheet-collapse', async () => {
              await handle.focus();
              await page.keyboard.press('Enter');
            }),
          );
          if ((await handle.getAttribute('aria-expanded')) !== 'false')
            throw new Error('Sheet did not collapse');
        }
      } catch (error) {
        result.failure = String(error);
      } finally {
        await context.close();
        await writeFile(`${output}/performance.json`, JSON.stringify(report, null, 2));
      }
    }
  }
} finally {
  report.finishedAt = new Date().toISOString();
  await browser.close();
  await writeFile(`${output}/performance.json`, JSON.stringify(report, null, 2));
}
const failures = report.results.filter(
  (result) =>
    result.failure ||
    result.errors.length ||
    result.windows.some((window) => window.status !== 'measured'),
);
console.log(
  JSON.stringify(
    {
      output,
      configurations: report.results.length,
      incompleteConfigurations: failures.length,
      results: report.results.map(({ locale, viewport, failure, windows }) => ({
        locale,
        viewport,
        failure,
        windows: windows.map(({ kind, status, mapRenderMoving, rafSheetMoving }) => ({
          kind,
          status,
          mapRenderMoving,
          rafSheetMoving,
        })),
      })),
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
