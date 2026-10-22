import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const version = process.argv[2];
if (!version || !/^[a-z0-9-]+$/i.test(version)) throw new Error('Supply a new capture version');
const root = `docs/reviews/stage-3/media/${version}/supplement`;
const origin = process.env.TEST_BASE_URL || 'http://localhost:3001';
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = [];
try {
  for (const locale of ['en', 'ar']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${origin}/${locale}/concierge`);
    await page.locator('.living-map[data-map-ready="true"]').waitFor();
    const prompts =
      locale === 'en'
        ? [
            ['units', 'Show demo units in Dubai'],
            ['chart', 'Show price-area chart'],
            ['timeline', 'Show payment plan for the first one'],
            [
              'calculation',
              'Calculate for the first one: annual rent 100000 AED, annual costs 10000 AED, vacancy 5%',
            ],
            ['proposal', 'Save the first one'],
            ['developer', 'Tell me about developer Omniyat'],
            ['exact-unit', 'Show demo units The Courtyard 001 in Palm Jumeirah'],
            ['unit-timeline', 'Show payment plan for the first one'],
            ['reference-timeline', 'Show SouthMED payment plan'],
          ]
        : [
            ['units', 'اعرض وحدات تجريبية في دبي'],
            ['chart', 'اعرض مخطط السعر والمساحة'],
            ['timeline', 'اعرض خطة السداد للاول'],
            ['calculation', 'احسب للاول: ايجار سنوي ١٠٠٠٠٠ درهم، تكاليف سنوية ١٠٠٠٠ درهم، شغور ٥%'],
            ['proposal', 'احفظ الاول'],
            ['developer', 'عرفني على المطور سوديك'],
            ['exact-unit', 'اعرض وحدات تجريبية دار الفناء 001 في نخلة جميرا'],
            ['unit-timeline', 'اعرض خطة السداد للاول'],
            ['reference-timeline', 'اعرض خطة السداد في ساوث ميد'],
          ];
    for (const [name, prompt] of prompts) {
      const prior = await page.getByTestId('concierge-turn').count();
      await page.locator('#concierge-prompt').fill(prompt);
      await page.locator('#concierge-prompt').press('Enter');
      await page.waitForFunction(
        (n) => document.querySelectorAll('[data-testid="concierge-turn"]').length > n,
        prior,
      );
      const turn = page.getByTestId('concierge-turn').last();
      await turn.locator('.cq-answer').waitFor({ timeout: 30000 });
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll('[data-testid="concierge-turn"]')].at(-1)?.dataset
            .status === 'complete',
      );
      const kinds = await turn
        .locator('[data-component-kind]')
        .evaluateAll((nodes) => nodes.map((n) => n.dataset.componentKind));
      const targetKinds = {
        chart: 'price-area-chart',
        timeline: 'payment-timeline',
        calculation: 'project-cards',
        proposal: 'confirmation',
        developer: 'developer-card',
        'unit-timeline': 'payment-timeline',
        'reference-timeline': 'payment-timeline',
      };
      const target = turn.locator(`[data-component-kind="${targetKinds[name]}"]`).first();
      if (await target.count())
        await target.evaluate((element) => element.scrollIntoView({ block: 'start' }));
      else await turn.evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${root}/${locale}-${name}.png` });
      report.push({ locale, name, prompt, kinds, text: await turn.innerText() });
    }
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(`${root}/manifest.json`, JSON.stringify(report, null, 2));
}
