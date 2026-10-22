import { chromium } from 'playwright';
import { mkdir, writeFile, rename } from 'node:fs/promises';
const concepts = (process.argv[2] ?? 'a,b,c').split(',');
const iteration = process.argv[3] ?? 'v1';
const root = `docs/reviews/stage-0/media/${iteration}`;
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const manifest = [];
for (const concept of concepts) {
  const context = await browser.newContext();
  for (const width of [1440, 1024, 390])
    for (const lang of ['en', 'ar'])
      for (const theme of ['light', 'dark'])
        for (const view of ['home', 'map']) {
          const page = await context.newPage({
            viewport: { width, height: width === 390 ? 844 : 1000 },
          });
          await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
          const errors = [];
          page.on('pageerror', (e) => errors.push(e.message));
          const url = `http://localhost:6006/prototypes/concept-${concept}/?lang=${lang}&theme=${theme}&view=${view}`;
          await page.goto(url);
          await page.waitForFunction(() => window.__map?.loaded(), null, { timeout: 30000 });
          await page.evaluate(() => document.fonts.ready);
          const file = `${root}/${concept}-${view}-${lang}-${theme}-${width}.png`;
          await page.screenshot({ path: file, animations: 'disabled' });
          const state = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            htmlLang: document.documentElement.lang,
            dir: document.documentElement.dir,
            center: window.__map.getCenter().toArray(),
          }));
          manifest.push({ concept, width, lang, theme, view, file, errors, ...state });
          await page.close();
        }
  await context.close();
  for (const lang of ['en', 'ar']) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      recordVideo: { dir: root, size: { width: 1440, height: 1000 } },
    });
    const page = await context.newPage();
    await page.goto(
      `http://localhost:6006/prototypes/concept-${concept}/?lang=${lang}&theme=dark&view=home`,
    );
    await page.waitForFunction(() => window.__map?.loaded(), null, { timeout: 30000 });
    const input = page.locator(concept === 'b' ? '#brief' : '#intent');
    await input.pressSequentially(
      lang === 'ar' ? 'بيت صيفي في الساحل الشمالي' : 'A summer home on the North Coast',
      { delay: 80 },
    );
    await input.press('Enter');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${root}/${concept}-signature-${lang}.png` });
    const video = page.video();
    await context.close();
    await rename(await video.path(), `${root}/${concept}-signature-${lang}.webm`);
  }
  console.info(`Captured concept ${concept}: 24 screenshots + 2 signature recordings`);
}
await browser.close();
await writeFile(`${root}/manifest-${concepts.join('')}.json`, JSON.stringify(manifest, null, 2));
const failures = manifest.filter(
  (x) =>
    x.overflow ||
    x.errors.length ||
    x.htmlLang !== x.lang ||
    x.dir !== (x.lang === 'ar' ? 'rtl' : 'ltr'),
);
console.info(JSON.stringify({ captures: manifest.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
