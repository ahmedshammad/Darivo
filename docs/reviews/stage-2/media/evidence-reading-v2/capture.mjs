import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const root = process.argv[2];
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const locale of ['en', 'ar'])
    for (const width of [375, 390])
      for (const theme of ['dark', 'light']) {
        const page = await browser.newPage({
          viewport: { width, height: 844 },
          reducedMotion: 'reduce',
        });
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        const brief = locale === 'ar' ? 'بيت على النخلة للعائلة' : 'A family home on the Palm';
        await page.goto(
          `http://localhost:3000/${locale}/explore?fallback=1&theme=${theme}&q=${encodeURIComponent(brief)}`,
        );
        await page.locator('.living-map[data-map-ready="true"]').waitFor();
        await page.locator('.atlas-sheet-handle').click();
        await page.locator('.atlas-project-select').first().click();
        await page.locator('#atlas-evidence-title').waitFor();
        await page.evaluate(() => document.fonts.ready);
        const prefix = `${locale}-${theme}-${width}`;
        const measure = () =>
          page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            reading: document
              .querySelector('.atlas-sheet-content')
              .getBoundingClientRect()
              .toJSON(),
            composer: document.querySelector('#atlas-prompt').getBoundingClientRect().toJSON(),
            title: document.querySelector('#atlas-evidence-title').getBoundingClientRect().toJSON(),
          }));
        await page.screenshot({ path: `${root}/${prefix}-rest.png` });
        const rest = await measure();
        await page
          .locator('#atlas-prompt')
          .fill(brief + '\n2027 · AED / EGP · ' + brief + '\n' + brief);
        await page.screenshot({ path: `${root}/${prefix}-editing.png` });
        const editing = await measure();
        await page.setViewportSize({ width, height: 500 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${root}/${prefix}-short-viewport.png` });
        const short = await measure();
        await page.locator('.atlas-inline-map-evidence summary').click();
        await page.locator('#atlas-prompt').focus();
        await page.screenshot({ path: `${root}/${prefix}-short-sources.png` });
        const sources = await measure();
        results.push({ locale, width, theme, rest, editing, short, sources, errors });
        await page.close();
      }
} finally {
  await browser.close();
  await writeFile(`${root}/checks.json`, JSON.stringify(results, null, 2));
}
console.log(
  JSON.stringify({
    cases: results.length,
    failures: results.filter(
      (x) => x.errors.length || x.rest.overflow || x.editing.overflow || x.short.overflow,
    ),
  }),
);
