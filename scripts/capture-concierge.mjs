import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { conciergeCopy } from '../messages/concierge.ts';

const version = process.argv[2] || 'v1';
if (!/^[a-z0-9-]+$/i.test(version)) throw new Error('Invalid capture version');
const root = `docs/reviews/stage-3/media/${version}`;
const origin = process.env.TEST_BASE_URL || 'http://localhost:3000';
const videosOnly = process.argv.includes('--videos-only');
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const states = [];
const journeys = ['karim', 'elena', 'sheikha'];

async function settle(page) {
  await page.locator('.living-map[data-map-ready="true"]').waitFor({ timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
}
async function submit(page, locale, index) {
  await page
    .getByRole('button', { name: new RegExp(conciergeCopy[locale].examples[index].name) })
    .click();
  await page.getByTestId('concierge-turn').last().locator('.cq-answer').waitFor({ timeout: 30000 });
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="concierge-turn"]')?.getAttribute('data-status') ===
      'complete',
  );
  await page.locator('.cq-reading').evaluate((element) => {
    element.scrollTop = 0;
  });
  await settle(page);
}
async function capture(page, stem, errors, meta) {
  await page.screenshot({ path: `${root}/${stem}.png` });
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const state = {
    ...meta,
    stem,
    errors: [...errors],
    ...(await page.evaluate(() => ({
      direction: document.documentElement.dir,
      overflow: document.documentElement.scrollWidth > innerWidth,
      map: { ...document.querySelector('.living-map').dataset },
      components: [...document.querySelectorAll('[data-component-kind]')].map((node) =>
        node.getAttribute('data-component-kind'),
      ),
      reading: document.querySelector('.cq-reading')?.getBoundingClientRect().toJSON(),
      composer: document.querySelector('#concierge-prompt')?.getBoundingClientRect().toJSON(),
    }))),
    violations: axe.violations.map((item) => ({
      id: item.id,
      impact: item.impact,
      nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
  };
  states.push(state);
  console.log(
    JSON.stringify({
      stem,
      errors: state.errors.length,
      violations: state.violations.length,
      overflow: state.overflow,
      mode: state.map.mapMode,
    }),
  );
}
try {
  for (const width of videosOnly ? [] : [1440, 1024, 390]) {
    for (const locale of ['en', 'ar']) {
      for (const theme of ['dark', 'light']) {
        const context = await browser.newContext({
          viewport: { width, height: width === 390 ? 844 : 1000 },
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        for (let index = 0; index < journeys.length; index++) {
          await page.goto(`${origin}/${locale}/concierge?theme=${theme}`);
          await settle(page);
          const meta = { width, locale, theme, journey: journeys[index] };
          if (index === 0) await capture(page, `arrival-${locale}-${theme}-${width}`, errors, meta);
          await submit(page, locale, index);
          await capture(page, `${journeys[index]}-${locale}-${theme}-${width}`, errors, meta);
        }
        await context.close();
      }
    }
  }
  for (const locale of ['en', 'ar']) {
    for (let index = 0; index < journeys.length; index++) {
      const width = locale === 'ar' ? 390 : 1440;
      const size = { width, height: width === 390 ? 844 : 1000 };
      const context = await browser.newContext({
        viewport: size,
        recordVideo: { dir: `${root}/raw-video`, size },
      });
      const page = await context.newPage();
      await page.goto(`${origin}/${locale}/concierge?theme=dark`);
      await settle(page);
      await submit(page, locale, index);
      const copy = conciergeCopy[locale];
      await page.getByRole('button', { name: copy.brief, exact: true }).click();
      await page.waitForTimeout(1200);
      await page.getByRole('button', { name: copy.conversation, exact: true }).click();
      const target =
        index === 0
          ? page.locator('[data-component-kind="comparison"]').first()
          : index === 1
            ? page.locator('[data-component-kind="mini-map"]').first()
            : page.getByTestId('concierge-project').first();
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      if (index === 0)
        await target.getByRole('button', { name: copy.compareMap, exact: true }).click();
      else if (index === 1) await target.locator('.cq-mini-places button').first().click();
      else await target.locator('h3 button').click();
      await settle(page);
      const video = page.video();
      await context.close();
      await video.saveAs(`${root}/${journeys[index]}-${locale}.webm`);
      console.log(`Recorded ${journeys[index]} ${locale}`);
    }
  }
} finally {
  await writeFile(
    `${root}/${videosOnly ? 'video-' : ''}manifest.json`,
    JSON.stringify(states, null, 2),
  );
  await browser.close();
}
if (states.some((state) => state.errors.length || state.violations.length || state.overflow))
  process.exitCode = 1;
