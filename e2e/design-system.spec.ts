import { expect, test } from '@playwright/test';
import { designCopy } from '../messages/design';

test.describe('living design system', () => {
  test.use({ reducedMotion: 'reduce' });

  test('palette focuses search, wraps upward, and transfers focus to the selected section', async ({
    page,
  }) => {
    await page.goto('/en/design');
    await page.locator('#design-command-trigger').click();
    const palette = page.locator('.dv-palette');
    const search = palette.locator('input');
    await expect(search).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(palette.locator('.dv-command-list button').last()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(palette.locator('.dv-command-list button').first()).toBeFocused();
    await search.fill('Numbers');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(palette).not.toBeVisible();
    await expect(page.locator('#evidence h2')).toBeFocused();
    await expect(page.locator('#evidence h2')).toBeInViewport();
  });

  for (const locale of ['en', 'ar'] as const) {
    test(`${locale}: numeral preference covers comparison areas, years, timeline, source date and currency`, async ({
      page,
    }) => {
      const t = designCopy[locale];
      await page.goto(`/${locale}/design?theme=light`);
      await page.locator('#design-digits').check();
      const area = page.getByRole('row').filter({ hasText: t.size });
      const timing = page.getByRole('row').filter({ hasText: t.handover });
      await expect(area).toContainText('٥٢٠');
      await expect(area).toContainText('٤٦٠');
      await expect(timing).toContainText('٢٠٢٨');
      await expect(timing).toContainText('٢٠٢٩');
      await expect(page.locator('.dv-payment ol')).toContainText('٢٠٢٦–٢٠٢٨');
      await expect(page.locator('.dv-source')).toContainText('٢٠٢٦-٠٦');
      await page.locator('#design-currency').selectOption('USD');
      await expect(page.locator('.dv-payment-total')).toContainText('٥٬٤٤٦٬٠٠٠');
      await page.locator('#design-digits').uncheck();
      await expect(area).toContainText('520');
      await expect(timing).toContainText('2029');
      await expect(page.locator('.dv-payment ol')).toContainText('2026–2028');
    });
  }

  test('mobile Brief wraps real requests and sheet expansion changes its geometry', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/design?theme=light');
    const purpose = page.locator('#design-brief').getByLabel('Purpose', { exact: true });
    const budget = page.locator('#design-brief').getByLabel('Budget and currency', { exact: true });
    await purpose.fill('Summer family home and a separate long-term investment in Dubai');
    await budget.fill(
      'GBP 4 million overall; payment in EGP where available, with exchange assumptions shown',
    );
    await expect(budget).toHaveValue(/GBP 4 million/);
    for (const field of [purpose, budget]) {
      const dimensions = await field.evaluate((element) => ({
        height: element.clientHeight,
        scrollHeight: element.scrollHeight,
        width: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.height + 1);
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
      expect(dimensions.height).toBeGreaterThan(38);
    }
    await page.locator('#design-sheet-trigger').click();
    const sheet = page.locator('.dv-sheet');
    const collapsed = await sheet.boundingBox();
    expect(collapsed).not.toBeNull();
    await sheet.getByRole('button', { name: 'Expand sheet', exact: true }).click();
    await expect
      .poll(async () => (await sheet.boundingBox())?.height ?? 0)
      .toBeGreaterThan((collapsed?.height ?? 0) + 120);
    await sheet.getByRole('button', { name: 'Collapse sheet', exact: true }).click();
    await expect
      .poll(async () => (await sheet.boundingBox())?.height ?? 0)
      .toBeLessThan((collapsed?.height ?? 0) + 2);
    await page.keyboard.press('Escape');
    await expect(page.locator('#design-sheet-trigger')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
});
