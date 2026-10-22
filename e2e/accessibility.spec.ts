import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const locale of ['en', 'ar'])
  test(`${locale} key pages meet automated AA checks at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of [
      `/${locale}`,
      `/${locale}/search`,
      `/${locale}/properties/property-002`,
      `/${locale}/login`,
    ]) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBeTruthy();
    }
    await page.goto(`/${locale}`);
    await page.screenshot({ path: `/tmp/darivo-${locale}-mobile.png`, fullPage: true });
  });
test('desktop landing visual and keyboard entry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/en');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.screenshot({ path: '/tmp/darivo-en-desktop.png', fullPage: true });
});
test('client and staff screens remain accessible at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const [account, paths] of [
    [
      'Private client',
      ['/en/consultant', '/en/shortlists', '/en/profile', '/en/viewings?property=property-002'],
    ],
    ['Advisor', ['/en/advisor']],
    ['Administrator', ['/en/admin']],
  ] as const) {
    await page.goto('/en/login');
    await page.getByRole('button', { name: account, exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBeTruthy();
    }
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/en$/);
  }
});
