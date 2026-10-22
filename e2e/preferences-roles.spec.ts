import { expect, test } from '@playwright/test';
const headers = { Origin: 'http://localhost:3000' };

test('developer partner sees public inventory and cannot enter staff APIs', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Developer partner', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  for (const path of ['admin/users', 'advisor'])
    expect((await page.request.get(`/api/v1/${path}`)).status()).toBe(403);
  for (const id of ['property-017', 'property-020'])
    expect((await page.request.get(`/api/v1/properties/${id}`)).status()).toBe(404);
  expect((await page.request.get('/api/v1/properties/property-002')).status()).toBe(200);
  expect(
    (
      await page.request.patch('/api/v1/preferences', {
        headers,
        data: { role: 'ADMIN', arabicIndicDigits: true },
      })
    ).status(),
  ).toBe(400);
});

test('Arabic-Indic preference persists and formats unchanged source prices', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Verified client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  const original = await (await page.request.get('/api/v1/properties/property-002')).json();
  try {
    await page.goto('/en/profile');
    await page.locator('input[name=arabicIndicDigits]').check();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(
      page.getByText('Your preferences have been saved.', { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator('input[name=arabicIndicDigits]')).toBeChecked();
    await page.goto('/ar/properties/property-002');
    await expect(page.locator('.detail-price')).toContainText(/[٠-٩]/);
    const current = await (await page.request.get('/api/v1/properties/property-002')).json();
    expect(current.priceMinor).toBe(original.priceMinor);
    expect(current.currency).toBe(original.currency);
    await page.getByRole('checkbox', { name: 'الأرقام العربية الهندية', exact: true }).uncheck();
    await expect(page.getByText('تم حفظ تفضيلات العرض.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator('.detail-price')).not.toContainText(/[٠-٩]/);
    expect(
      (await (await page.request.get('/api/v1/profile')).json()).profile.arabicIndicDigits,
    ).toBe(false);
  } finally {
    await page.request.patch('/api/v1/preferences', {
      headers,
      data: { arabicIndicDigits: false },
    });
  }
});

test('later display save repairs a failed earlier change without losing either preference', async ({
  page,
}) => {
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Verified client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  const initial = (await (await page.request.get('/api/v1/profile')).json()).profile;
  let requests = 0;
  await page.route('**/api/v1/preferences', async (route) => {
    if (++requests === 1)
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"error":"test_transient_failure"}',
      });
    else await route.continue();
  });
  try {
    await page.goto('/en/properties/property-002');
    await page.getByLabel('Currency', { exact: true }).selectOption('USD');
    await page.getByLabel('Area unit', { exact: true }).selectOption('sqft');
    await expect(page.getByText('Display preferences saved.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Currency', { exact: true })).toHaveValue('USD');
    await expect(page.getByLabel('Area unit', { exact: true })).toHaveValue('sqft');
    const saved = (await (await page.request.get('/api/v1/profile')).json()).profile;
    expect(saved.currency).toBe('USD');
    expect(saved.areaUnit).toBe('sqft');
  } finally {
    await page.unroute('**/api/v1/preferences');
    await page.request.patch('/api/v1/preferences', {
      headers,
      data: {
        currency: initial.currency,
        areaUnit: initial.areaUnit,
        arabicIndicDigits: initial.arabicIndicDigits,
      },
    });
  }
});
