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
  await page.waitForFunction(
    () => {
      const map = document.querySelector('.living-map');
      return map?.dataset.tilesReady === 'true' && map?.dataset.moving === 'false';
    },
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(500);
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
async function reviewBeachfrontEvidence(page, locale, checkpoint) {
  const copy = conciergeCopy[locale];
  await page.getByRole('button', { name: copy.reviewRequirements, exact: true }).last().click();
  const group = page
    .getByTestId('concierge-brief')
    .getByRole('group', { name: copy.must, exact: true });
  const condition = group.locator('.cq-constraint-editor').first();
  const text = await condition.getByRole('textbox').inputValue();
  if (!/beachfront|على البحر|علي البحر/.test(text))
    throw new Error('Expected the retained beachfront requirement');
  const evidence = condition.getByRole('checkbox', { name: copy.evidenceRequired, exact: true });
  // The recovery action opens this disclosure after React switches tabs. Await it;
  // clicking its summary here races that focus effect and can close it again.
  await evidence.waitFor({ state: 'visible' });
  if (!(await evidence.isChecked()))
    throw new Error('Initial evidence requirement must remain strict');
  if (checkpoint) {
    await page.screenshot({ path: `${root}/${checkpoint}-requirements.png` });
    await page.waitForTimeout(1200);
  }
  // This recorded client action explicitly permits unknown evidence; it is not an automatic relaxation.
  await evidence.uncheck();
  const before = await page.getByTestId('concierge-turn').count();
  await page
    .getByTestId('concierge-brief')
    .getByRole('button', { name: copy.apply, exact: true })
    .click();
  await page.waitForFunction((count) => {
    const turns = [...document.querySelectorAll('[data-testid="concierge-turn"]')];
    return turns.length > count && turns.at(-1)?.getAttribute('data-status') === 'complete';
  }, before);
  await page.getByRole('button', { name: copy.conversation, exact: true }).click();
  await page
    .getByTestId('concierge-turn')
    .last()
    .evaluate((element) => element.scrollIntoView({ block: 'start' }));
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
          if (index === 2 && !(await page.getByTestId('concierge-project').count())) {
            await reviewBeachfrontEvidence(page, locale);
            await capture(page, `sheikha-refined-${locale}-${theme}-${width}`, errors, {
              ...meta,
              journey: 'sheikha-refined',
              explicitClientAction:
                'Allow unverified beachfront evidence; retain location, villa type and beachfront preference',
            });
          }
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
      if (index === 2 && !(await page.getByTestId('concierge-project').count())) {
        await page.screenshot({ path: `${root}/sheikha-${locale}-no-match.png` });
        await reviewBeachfrontEvidence(page, locale, `sheikha-${locale}`);
        await page.screenshot({ path: `${root}/sheikha-${locale}-refined.png` });
      }
      const target =
        index === 0
          ? page.locator('[data-component-kind="comparison"]').first()
          : index === 1
            ? page.locator('[data-component-kind="mini-map"]').first()
            : page.getByTestId('concierge-project').first();
      if (await target.count()) {
        await target.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${root}/${journeys[index]}-${locale}-component.png` });
        if (index === 0)
          await target.getByRole('button', { name: copy.compareMap, exact: true }).click();
        else if (index === 1) await target.locator('.cq-mini-places button').first().click();
        else await target.locator('h3 button').click();
      }
      await settle(page);
      await page.screenshot({ path: `${root}/${journeys[index]}-${locale}-map.png` });
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
