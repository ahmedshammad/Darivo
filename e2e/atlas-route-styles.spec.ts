import { expect, test } from '@playwright/test';

for (const locale of ['en', 'ar']) {
  test(`missing property has a standalone localized landmark in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}/properties/missing-property`);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('main').locator(`a[href="/${locale}/search"]`)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  });

  test(`legacy navigation preserves Atlas typography and controls in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}`);
    await page.evaluate(() => document.fonts.ready);
    const heading = page.locator('h1');
    const appearance = () =>
      heading.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          font: style.fontFamily,
          size: style.fontSize,
          lineHeight: style.lineHeight,
          color: style.color,
          width: rect.width,
          height: rect.height,
        };
      });
    const before = await appearance();
    await page.locator('.arrival-access').click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/login`));
    await expect(page.locator('.shell.nav')).toBeVisible();
    await page.locator('.shell.nav .brand').click();
    await expect(page.locator('#arrival-intent')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(appearance).toEqual(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
