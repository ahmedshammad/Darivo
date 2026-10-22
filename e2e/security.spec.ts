import { test, expect } from '@playwright/test';
test('security headers, CSRF, payload validation and private HTML', async ({ page, request }) => {
  const pageResponse = await request.get('/en');
  expect(pageResponse.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(pageResponse.headers()['x-content-type-options']).toBe('nosniff');
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Private client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  expect(
    (
      await page.request.patch('/api/v1/profile', {
        headers: { Origin: 'https://attacker.example' },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post('/api/v1/consultant', {
        headers: { Origin: 'http://localhost:3000' },
        data: { message: 'x'.repeat(40000), locale: 'en' },
      })
    ).status(),
  ).toBe(413);
  const html = await (await page.request.get('/en/properties/property-020')).text();
  expect(html).not.toContain('SYN-AE-00020');
  expect(html).not.toContain('The Horizon 020');
});
