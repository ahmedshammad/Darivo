import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { conciergeCopy } from '../messages/concierge.ts';

const version = process.argv[2];
if (!version || !/^[a-z0-9-]+$/i.test(version)) throw new Error('Supply capture version');
const root = `docs/reviews/stage-3/media/${version}/settled`;
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = [];
try {
  for (const width of [1440, 390]) {
    for (const locale of ['en', 'ar']) {
      const page = await browser.newPage({
        viewport: { width, height: width === 390 ? 844 : 1000 },
      });
      const failures = [];
      page.on('requestfailed', (request) =>
        failures.push({ url: request.url(), error: request.failure()?.errorText }),
      );
      for (const journey of ['elena', 'sheikha']) {
        const copy = conciergeCopy[locale];
        await page.goto(
          `${process.env.TEST_BASE_URL || 'http://localhost:3001'}/${locale}/concierge`,
        );
        await page.locator('.living-map[data-map-ready="true"]').waitFor();
        await page
          .getByRole('button', {
            name: new RegExp(copy.examples[journey === 'elena' ? 1 : 2].name),
          })
          .click();
        await page.waitForFunction(
          () =>
            document.querySelector('[data-testid="concierge-turn"]')?.dataset.status === 'complete',
        );
        if (journey === 'elena') {
          await page.locator('.cq-mini-places button').first().click();
        } else {
          const before = await page.evaluate(() => scrollY);
          await page.getByRole('button', { name: copy.reviewRequirements, exact: true }).click();
          await page
            .getByRole('checkbox', { name: copy.evidenceRequired, exact: true })
            .waitFor({ state: 'visible' });
          const scroll = await page.evaluate(() => ({
            outer: scrollY,
            reading: document.querySelector('.cq-reading')?.scrollTop,
          }));
          await page.screenshot({ path: `${root}/requirements-${locale}-${width}.png` });
          report.push({ kind: 'requirements', locale, width, before, ...scroll });
          if (width === 390)
            await page.getByRole('button', { name: copy.collapse, exact: true }).click();
        }
        let settled = true;
        try {
          await page.waitForFunction(
            () => {
              const map = document.querySelector('.living-map');
              return map?.dataset.tilesReady === 'true' && map?.dataset.moving === 'false';
            },
            null,
            { timeout: 15000 },
          );
        } catch {
          settled = false;
        }
        await page.waitForTimeout(500);
        const state = await page
          .locator('.living-map')
          .evaluate((element) => ({ ...element.dataset }));
        await page.screenshot({ path: `${root}/${journey}-${locale}-${width}.png` });
        report.push({
          kind: 'map',
          journey,
          locale,
          width,
          settled,
          state,
          failures: [...failures],
        });
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(`${root}/manifest.json`, JSON.stringify(report, null, 2));
}
