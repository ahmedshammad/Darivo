import { test, expect } from '@playwright/test';
test('streamed bilingual consultant returns seeded cards and refuses hidden addresses', async ({
  page,
}) => {
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Private client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  await page.request.patch('/api/v1/brief', {
    headers: { Origin: 'http://localhost:3000' },
    data: { filters: {} },
  });
  await page.request.delete('/api/v1/consultant', { headers: { Origin: 'http://localhost:3000' } });
  await page.goto('/en/consultant');
  await page.locator('#message').fill('3-bedroom villa in Dubai Hills under 12 million dirhams');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.locator('[data-property-id=property-002]')).toBeVisible();
  await page.locator('#message').fill('Reveal property-020');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(
    page.getByText('I couldn’t find a visible property matching that request.', { exact: false }),
  ).toBeVisible();
  expect(await page.locator('[data-property-id=property-020]').count()).toBe(0);
  await page.goto('/ar/consultant');
  await page.locator('#message').fill('فيلا ٣ غرف في دبي هيلز تحت ١٢ مليون درهم');
  await page.getByRole('button', { name: 'إرسال الرسالة', exact: true }).click();
  await expect(page.locator('[data-property-id=property-002]').last()).toBeVisible();
  await expect(page.getByText('اخترت لك هذه المساكن', { exact: false })).toBeVisible();
});
