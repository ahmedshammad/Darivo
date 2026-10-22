import { expect, test } from '@playwright/test';

test('a pending preference save survives navigation into Atlas, and Arrival signs out', async ({
  page,
}) => {
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Verified client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  const initial = (await (await page.request.get('/api/v1/profile')).json()).profile;
  const currency = initial.currency === 'USD' ? 'AED' : 'USD';
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let started!: () => void;
  const saving = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route('**/api/v1/preferences', async (route) => {
    started();
    await gate;
    await route.continue();
  });
  try {
    await page.getByLabel('Currency', { exact: true }).selectOption(currency);
    await expect(page.getByText('Saving display preferences…', { exact: true })).toBeVisible();
    await saving;
    await page.locator('.shell.nav .brand').click();
    await expect(page.locator('#arrival-intent')).toBeVisible();
    release();
    await expect
      .poll(async () => {
        const current = await (await page.request.get('/api/v1/profile')).json();
        return current.profile.currency;
      })
      .toBe(currency);
  } finally {
    release();
    await page.unroute('**/api/v1/preferences');
    await page.request.patch('/api/v1/preferences', {
      headers: { Origin: 'http://localhost:3000' },
      data: { currency: initial.currency },
    });
  }
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.locator('.arrival-access')).toHaveAccessibleName('Private access');
  expect((await page.request.get('/api/v1/profile')).status()).toBe(401);
});
