import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile, rename } from 'node:fs/promises';

const version = process.argv[2] ?? 'v1';
const root = `docs/reviews/stage-1/media/${version}`;
const origin = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const states = [];
try {
  for (const width of [1440, 1024, 390]) {
    for (const locale of ['en', 'ar']) {
      for (const theme of ['dark', 'light']) {
        const context = await browser.newContext({
          viewport: { width, height: width === 390 ? 844 : 1000 },
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/${locale}/design?theme=${theme}`);
        await page.locator('.dv-intro h1').waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(250);
        const stem = `design-${locale}-${theme}-${width}`;
        await page.screenshot({ path: `${root}/${stem}.png`, fullPage: true });
        await page.screenshot({ path: `${root}/${stem}-arrival.png` });
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        states.push({
          width,
          locale,
          theme,
          errors,
          ...(await page.evaluate(() => ({
            language: document.documentElement.lang,
            direction: document.documentElement.dir,
            theme: document.querySelector('.dv-system')?.getAttribute('data-theme'),
            overflow: document.documentElement.scrollWidth > innerWidth,
            headings: Array.from(document.querySelectorAll('main h2')).map((h) => h.textContent),
          }))),
          violations: axe.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.map((node) => ({
              target: node.target,
              summary: node.failureSummary,
            })),
          })),
        });
        await context.close();
      }
    }
  }
  for (const locale of ['en', 'ar']) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      recordVideo: { dir: root, size: { width: 390, height: 844 } },
    });
    const page = await context.newPage();
    await page.goto(`${origin}/${locale}/design?theme=dark`);
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator('.dv-composer input')
      .fill(
        locale === 'ar'
          ? 'بيت للعائلة قرب البحر، تسليم ٢٠٢٨'
          : 'A family home by the sea, ready by 2028',
      );
    await page.locator('.dv-composer input').press('Enter');
    await page.locator('.dv-demo-response').waitFor();
    await page
      .locator('.dv-brief textarea')
      .nth(2)
      .fill(locale === 'ar' ? '٢٠ مليون درهم' : 'AED 20 million');
    await page.locator('.dv-project button').first().click();
    await page.locator('.dv-sheet[open]').waitFor();
    await page.screenshot({ path: `${root}/signature-${locale}-sheet.png` });
    await page.keyboard.press('Escape');
    await page.locator('.dv-command-trigger').click();
    await page.locator('.dv-palette[open]').waitFor();
    await page.locator('.dv-command-list button').nth(3).click();
    await page.locator('.dv-payment').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${root}/signature-${locale}-evidence.png` });
    const video = await page.video().path();
    await context.close();
    await rename(video, `${root}/signature-${locale}.webm`);
  }
} finally {
  await browser.close();
  await writeFile(`${root}/manifest.json`, JSON.stringify(states, null, 2));
}
const failures = states.filter(
  (state) =>
    state.errors.length ||
    state.overflow ||
    state.violations.length ||
    state.language !== state.locale ||
    state.direction !== (state.locale === 'ar' ? 'rtl' : 'ltr'),
);
console.info(JSON.stringify({ configurations: states.length, failures }, null, 2));
if (failures.length || states.length !== 12) process.exitCode = 1;
