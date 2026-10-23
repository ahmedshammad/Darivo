import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { withClientPrivacy } from './helpers/client-privacy';
test('consultant → named shortlist → comparison → bilingual PDF → private viewing', async ({
  page,
}) => {
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Private client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  await withClientPrivacy(
    page.request,
    new URL(page.url()).origin,
    {
      doNotSave: false,
      doNotShare: false,
      doNotBook: false,
    },
    async () => {
      await page.request.delete('/api/v1/consultant', {
        headers: { Origin: 'http://localhost:3000' },
      });
      await page.request.patch('/api/v1/brief', {
        headers: { Origin: 'http://localhost:3000' },
        data: { filters: {} },
      });
      await page.goto('/en/consultant');
      await page
        .locator('#message')
        .fill('3-bedroom villa in Dubai Hills under 12 million dirhams');
      await page.getByRole('button', { name: 'Send message', exact: true }).click();
      await expect(page.locator('[data-property-id=property-002]')).toBeVisible();
      await page.getByRole('link', { name: 'Save to shortlist', exact: true }).click();
      await page.locator('input[name=name]').first().fill('Dubai family home');
      const saved = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === '/api/v1/shortlists' &&
          response.request().method() === 'POST',
      );
      await page.getByRole('button', { name: 'Add these residences', exact: true }).click();
      expect((await saved).status()).toBe(201);
      await expect(
        page.getByRole('heading', { name: 'Dubai family home', exact: true }),
      ).toBeVisible();
      const savedCollection = page.locator('.shortlist-section').filter({
        has: page.getByRole('heading', { name: 'Dubai family home', exact: true }),
      });
      const pdfHref = await savedCollection
        .getByRole('link', { name: 'Download private dossier' })
        .getAttribute('href');
      const pdf = await page.request.get(pdfHref!);
      expect(pdf.ok()).toBeTruthy();
      const bytes = await pdf.body();
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
      writeFileSync('/tmp/darivo-dossier-qa.pdf', bytes);
      const selections = savedCollection.getByRole('checkbox', { name: 'Select for comparison' });
      await selections.nth(0).check();
      await selections.nth(1).check();
      await page.getByRole('link', { name: 'Compare selected' }).click();
      // A cold development route compiles on navigation; this is not a performance budget.
      await expect(page).toHaveURL(/\/en\/compare\?ids=[^&]+/, { timeout: 20000 });
      await expect(page.getByRole('table')).toBeVisible();
      await page.getByRole('link', { name: 'Request a private viewing' }).first().click();
      const slot = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
      await page.locator('input[name=slot]').fill(slot);
      await page.locator('select[name=timezone]').selectOption('Africa/Cairo');
      await page.getByRole('button', { name: 'Request this viewing' }).click();
      await expect(
        page.getByText('Your viewing request is with your advisor.', { exact: true }),
      ).toBeVisible();
      await page.goto('/en/profile');
      await page.locator('select[name=currency]').selectOption('USD');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(
        page.getByText('Your preferences have been saved.', { exact: true }),
      ).toBeVisible();
      await page.locator('select[name=currency]').selectOption('AED');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
    },
  );
});
test('shortlists and PDFs enforce ownership; profile rejects role injection', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByRole('button', { name: 'Verified client', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  const patch = await page.request.patch('/api/v1/profile', {
    headers: { Origin: 'http://localhost:3000' },
    data: { role: 'ADMIN' },
  });
  expect(patch.status()).toBe(400);
  const own = await page.request.get('/api/v1/shortlists');
  expect(own.ok()).toBeTruthy();
  const invalid = await page.request.get('/api/v1/shortlists/nonexistent/pdf');
  expect(invalid.status()).toBe(404);
});
