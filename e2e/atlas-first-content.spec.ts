import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

for (const locale of ['en', 'ar']) {
  for (const route of ['', '/explore']) {
    test(`Atlas first content is readable without waiting for hydration: ${locale}${route}`, async ({
      page,
    }) => {
      await page.goto(`/${locale}${route}`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).not.toBeEmpty();
      await expect(page.locator('.page.empty[role="status"]')).toHaveCount(0);
      await expect(page.locator(route ? '#atlas-prompt' : '#arrival-intent')).toBeVisible();
    });
  }
}
