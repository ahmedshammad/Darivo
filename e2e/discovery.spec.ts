import { test, expect } from '@playwright/test';
test('direct API never leaks private records to anonymous users', async ({ request }) => {
  for (const id of ['property-017', 'property-020'])
    expect((await request.get(`/api/v1/properties/${id}`)).status()).toBe(404);
  const r = await request.get('/api/v1/properties?limit=24');
  expect(r.ok()).toBeTruthy();
  const body = await r.json();
  expect(
    body.properties.every((p: { visibility: string }) => p.visibility === 'PUBLIC'),
  ).toBeTruthy();
});
test('filters, map and Arabic property details work at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/en/search');
  await page.locator('select[name=community]').selectOption('dubai-hills');
  await page.locator('select[name=type]').selectOption('villa');
  await page.locator('select[name=bedrooms]').selectOption('3');
  await page.locator('input[name=maxPrice]').fill('12000000');
  await page.getByRole('button', { name: 'Find your place', exact: true }).click();
  await expect(page.locator('[data-property-id=property-002]')).toBeVisible();
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  await page.goto('/ar/properties/property-002');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText('دار الأفق 002', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(0);
  await page.locator('.map-load').click();
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});

test('on-demand consultant preserves keyboard entry and closing focus in both languages', async ({
  page,
}) => {
  for (const locale of ['en', 'ar']) {
    await page.goto(`/${locale}/search`);
    await expect(page.locator('.dock-window')).toHaveCount(0);
    await expect(page.locator('.dock-toggle')).toBeEnabled();
    await page.locator('.dock-toggle').focus();
    await page.keyboard.press('Enter');
    const composer = page.locator('#dock-message');
    await expect(composer).toBeFocused();
    await composer.fill(locale === 'en' ? 'A family home near the sea' : 'بيت للعائلة قرب البحر');
    await expect(composer).not.toHaveValue('');
    await page.locator('.dock-heading button').click();
    await expect(page.locator('.dock-window')).toHaveCount(0);
    await expect(page.locator('.dock-toggle')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(composer).toBeFocused();
  }
});
