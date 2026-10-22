// TEST_BASE_URL=http://localhost:3001 node --import tsx scripts/capture-concierge-timeline.mjs
// Two real guest turns per state: authorized unit lookup, then its payment plan.
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { conciergeCopy } from '../messages/concierge.ts';
import { conciergeStreamEventSchema } from '../src/lib/concierge.ts';

const version = process.argv[2] || 'v8-timeline-final';
if (!/^[a-z0-9-]+$/i.test(version)) throw new Error('Invalid capture version');
const root = `docs/reviews/stage-3/media/${version}`;
const origin = process.env.TEST_BASE_URL || 'http://localhost:3001';
await mkdir(root, { recursive: false }); // Preserve previous evidence rather than overwrite it.
const manifest = {
  source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  workingTreeStatus: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  origin,
  startedAt: new Date().toISOString(),
  scope:
    'Real guest browser/SSE with MockProvider, no intercepted requests or writes. Two submitted turns per state. Reduced-motion emulation, not physical-device or cadence evidence.',
  expectedStates: 12,
  expectedRequests: 24,
  states: [],
  failures: [],
};
const save = () => writeFile(`${root}/manifest.json`, JSON.stringify(manifest, null, 2));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
manifest.browser = browser.version();

async function submit(page, locale, message, index) {
  await page.locator('#concierge-prompt').fill(message);
  await page.getByRole('button', { name: conciergeCopy[locale].send, exact: true }).click();
  const turns = page.getByTestId('concierge-turn');
  await expect(turns).toHaveCount(index + 1);
  await expect(turns.last()).toHaveAttribute('data-status', 'complete', { timeout: 45000 });
  await page.waitForFunction((i) => window.__timelineEvidence[i]?.complete, index);
  const record = await page.evaluate(
    (i) => ({ ...window.__timelineEvidence[i], count: window.__timelineEvidence.length }),
    index,
  );
  expect(record.count).toBe(index + 1);
  expect(record.status).toBe(200);
  expect(record.error).toBeUndefined();
  const events = record.text
    .split('\n')
    .filter((line) => line.startsWith('data: ') && !line.includes('[DONE]'))
    .flatMap((line) => {
      const packet = JSON.parse(line.slice(6));
      return packet.type === 'data-concierge'
        ? [conciergeStreamEventSchema.parse(packet.data)]
        : [];
    });
  const components = new Map();
  for (const event of events)
    if (event.type === 'component.upsert') components.set(event.component.id, event.component);
  return {
    status: record.status,
    requestCount: record.count,
    components: [...components.values()],
  };
}

try {
  for (const locale of ['en', 'ar'])
    for (const theme of ['dark', 'light'])
      for (const width of [1440, 1024, 390]) {
        const stem = `timeline-${locale}-${theme}-${width}`;
        const context = await browser.newContext({
          viewport: { width, height: width === 390 ? 844 : 1000 },
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(String(error)));
        try {
          // Clone responses inside the browser before CDP can discard streamed bodies.
          // Inline callbacks avoid tsx's module-only __name helper in serialized code.
          await page.addInitScript(() => {
            window.__timelineEvidence = [];
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
              if (record) window.__timelineEvidence.push(record);
              const pending = originalFetch(input, init);
              if (record)
                void pending.then(
                  (response) => {
                    record.status = response.status;
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
                  },
                  (error) => {
                    record.error = String(error);
                    record.complete = true;
                  },
                );
              return pending;
            };
          });
          await page.goto(`${origin}/${locale}/concierge?theme=${theme}`);
          const lookup = await submit(
            page,
            locale,
            locale === 'ar'
              ? 'اعرض وحدات تجريبية دار الفناء 001 في نخلة جميرا'
              : 'Show demo units The Courtyard 001 in Palm Jumeirah',
            0,
          );
          const unit = lookup.components
            .flatMap((component) => (component.kind === 'project-cards' ? component.cards : []))
            .find((card) => card.kind === 'demo-unit' && card.unitId === 'property-001');
          expect(unit).toBeDefined();
          expect(unit.price.native).toEqual({ currency: 'AED', amount: 42980000 });
          const response = await submit(
            page,
            locale,
            locale === 'ar' ? 'اعرض خطة السداد للأول' : 'Show payment plan for the first one',
            1,
          );
          const timeline = response.components.find(
            (component) => component.kind === 'payment-timeline',
          );
          expect(timeline).toBeDefined();
          expect(timeline.entity).toEqual({ kind: 'unit', id: unit.unitId });
          expect(timeline.subjectName).toEqual(unit.name);
          expect(timeline.price.native).toEqual(unit.price.native);
          expect(timeline.schedule.map((step) => step.percent)).toEqual([20, 40, 40]);
          expect(timeline.mode).toBe('DEMO_ESTIMATE');
          const schedule = page
            .getByTestId('concierge-turn')
            .last()
            .locator('[data-component-kind="payment-timeline"]');
          const title = schedule.getByRole('heading', {
            name: conciergeCopy[locale].payment,
            exact: true,
          });
          const subject = schedule.getByTestId('concierge-timeline-subject');
          await expect(subject).toHaveText(unit.name[locale]);
          await schedule.evaluate((element) => {
            const pane = element.closest('.cq-reading');
            if (!pane) throw new Error('Missing reading panel');
            pane.scrollTo({
              top:
                pane.scrollTop +
                element.getBoundingClientRect().top -
                pane.getBoundingClientRect().top,
              behavior: 'instant',
            });
          });
          await page.evaluate(() => document.fonts.ready);
          await expect(title).toBeInViewport({ ratio: 1 });
          await expect(subject).toBeInViewport({ ratio: 1 });
          await page.locator('.living-map[data-map-ready="true"]').waitFor({ timeout: 45000 });
          await page.waitForFunction(
            () => {
              const map = document.querySelector('.living-map');
              return map?.dataset.tilesReady === 'true' && map.dataset.moving === 'false';
            },
            null,
            { timeout: 45000 },
          );
          const geometry = await schedule.evaluate((element) => {
            const pane = element.closest('.cq-reading').getBoundingClientRect();
            const title = element.querySelector('h3').getBoundingClientRect();
            const subject = element
              .querySelector('[data-testid="concierge-timeline-subject"]')
              .getBoundingClientRect();
            const header = document.querySelector('.cq-header')?.getBoundingClientRect();
            return {
              pane: pane.toJSON(),
              title: title.toJSON(),
              subject: subject.toJSON(),
              header: header?.toJSON(),
              fullyInsideReading: [title, subject].every(
                (rect) =>
                  rect.top >= pane.top &&
                  rect.bottom <= pane.bottom &&
                  rect.left >= pane.left &&
                  rect.right <= pane.right,
              ),
              overflow: document.documentElement.scrollWidth > innerWidth,
              windowScroll: scrollY,
              theme: document.querySelector('[data-testid="concierge"]')?.dataset.theme,
            };
          });
          await page.screenshot({ path: `${root}/${stem}.png` });
          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze();
          const state = {
            stem,
            locale,
            theme,
            width,
            lookup,
            response,
            expectedSubject: unit.name,
            geometry,
            errors,
            violations: axe.violations.map((violation) => ({
              id: violation.id,
              impact: violation.impact,
              nodes: violation.nodes.map((node) => node.target),
            })),
          };
          manifest.states.push(state);
          expect(geometry.fullyInsideReading).toBe(true);
          expect(geometry.overflow).toBe(false);
          expect(geometry.windowScroll).toBe(0);
          expect(geometry.theme).toBe(theme);
          expect(errors).toEqual([]);
          expect(state.violations).toEqual([]);
        } catch (error) {
          manifest.failures.push({ stem, error: String(error), errors });
          await page.screenshot({ path: `${root}/${stem}-failed.png` }).catch(() => {});
        } finally {
          await context.close();
          await save();
        }
      }
} finally {
  await browser.close();
  manifest.finishedAt = new Date().toISOString();
  await save();
}
if (manifest.failures.length || manifest.states.length !== manifest.expectedStates)
  process.exitCode = 1;
