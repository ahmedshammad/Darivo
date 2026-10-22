import { test, expect, type Page } from '@playwright/test';
async function login(page: Page, label: string) {
  await page.goto('/en/login');
  await page.getByRole('button', { name: label, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
}
const headers = { Origin: 'http://localhost:3000' };
test('admin grant is client-specific, audited and revocable; clients cannot use staff APIs', async ({
  browser,
  page,
}) => {
  await login(page, 'Administrator');
  await page.goto('/en/admin');
  await expect(
    page.getByRole('heading', { name: 'A collection, carefully managed.' }),
  ).toBeVisible();
  const grant = { userId: 'demo-client', propertyId: 'property-020' };
  expect((await page.request.post('/api/v1/grants', { headers, data: grant })).ok()).toBeTruthy();
  const clientContext = await browser.newContext(),
    otherContext = await browser.newContext();
  try {
    const client = await clientContext.newPage(),
      other = await otherContext.newPage();
    await login(client, 'Private client');
    await login(other, 'Verified client');
    expect((await client.request.get('/api/v1/properties/property-020')).status()).toBe(200);
    expect((await other.request.get('/api/v1/properties/property-020')).status()).toBe(404);
    expect((await client.request.get('/api/v1/admin/users')).status()).toBe(403);
    expect((await client.request.get('/api/v1/advisor')).status()).toBe(403);
    expect((await client.request.post('/api/v1/grants', { headers, data: grant })).status()).toBe(
      403,
    );
    const audit = await (await page.request.get('/api/v1/admin/audit')).json();
    expect(
      audit.some(
        (a: { action: string; targetId: string }) =>
          a.action === 'PRIVATE_GRANT_CREATED' && a.targetId === 'demo-client:property-020',
      ),
    ).toBeTruthy();
    expect(
      (await page.request.delete('/api/v1/grants', { headers, data: grant })).ok(),
    ).toBeTruthy();
    expect((await client.request.get('/api/v1/properties/property-020')).status()).toBe(404);
  } finally {
    await page.request.delete('/api/v1/grants', { headers, data: grant });
    await clientContext.close();
    await otherContext.close();
  }
});
test('advisor notes remain private and admin CRUD persists', async ({ page }) => {
  await login(page, 'Advisor');
  await page.goto('/en/advisor');
  await expect(page.getByRole('heading', { name: 'Every introduction matters.' })).toBeVisible();
  const note = await page.request.post('/api/v1/advisor', {
    headers,
    data: {
      action: 'note',
      clientId: 'demo-client',
      content: 'Fictional client prefers a quiet courtyard.',
    },
  });
  expect(note.ok()).toBeTruthy();
  const suggestion = await page.request.post('/api/v1/advisor', {
    headers,
    data: {
      action: 'suggest',
      clientId: 'demo-client',
      propertyId: 'property-002',
      shortlistName: 'Advisor selections',
    },
  });
  expect(suggestion.ok()).toBeTruthy();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/en$/);
  await login(page, 'Administrator');
  const developer = {
    nameEn: 'Test fictional studio',
    nameAr: 'استوديو اختباري افتراضي',
    descriptionEn: 'Synthetic test record',
    descriptionAr: 'سجل اختبار افتراضي',
  };
  const created = await page.request.post('/api/v1/admin/developers', { headers, data: developer });
  expect(created.ok()).toBeTruthy();
  const { id } = await created.json();
  try {
    expect(
      (
        await page.request.post('/api/v1/admin/developers', {
          headers,
          data: { ...developer, id, nameEn: 'Updated fictional studio' },
        })
      ).ok(),
    ).toBeTruthy();
    const list = await (await page.request.get('/api/v1/admin/developers')).json();
    expect(
      list.some(
        (x: { id: string; nameEn: string }) =>
          x.id === id && x.nameEn === 'Updated fictional studio',
      ),
    ).toBeTruthy();
  } finally {
    expect(
      (await page.request.delete(`/api/v1/admin/developers?id=${id}`, { headers })).ok(),
    ).toBeTruthy();
  }
});
