import { test, expect } from '@playwright/test';

test('Arrival intent moves the geographic camera and carries the request into Explore', async ({
  page,
}) => {
  await page.goto('/en');
  const map = page.locator('.living-map');
  await expect(map).toHaveAttribute('data-map-ready', 'true', { timeout: 30000 });
  await page.locator('#arrival-intent').fill('Schools within 20 minutes of Downtown Dubai');
  await expect(map).toHaveAttribute('data-camera-key', /Downtown Dubai/);
  await expect
    .poll(async () => {
      const center = JSON.parse((await map.getAttribute('data-center')) || '[0,0]');
      return Math.abs(center[0] - 55.276) < 0.03 && Math.abs(center[1] - 25.197) < 0.03;
    })
    .toBe(true);
  await page.locator('#arrival-intent').press('Enter');
  await expect(page).toHaveURL(/\/en\/explore\?/);
  await expect(page.locator('#atlas-prompt')).toHaveValue(
    'Schools within 20 minutes of Downtown Dubai',
  );
  await expect(page.locator('.atlas-projects li').first()).toBeVisible();
  await page.locator('.atlas-compare-add').nth(0).click();
  await page.locator('.atlas-compare-add').nth(1).click();
  await expect(page.locator('.atlas-comparison h2')).toBeFocused();
  await expect(page.locator('.atlas-comparison h2')).toBeInViewport({ ratio: 1 });
});

test('Arabic mobile map remains usable without WebGL or external tiles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://tiles.**/*', (route) => route.abort());
  await page.goto('/ar/explore?fallback=1');
  await expect(page.locator('.living-map')).toHaveAttribute('data-map-mode', 'fallback');
  await expect(page.locator('[data-testid="atlas-fallback"] svg path').first()).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const sheet = page.locator('[data-testid="explore-sheet"]');
  const before = (await sheet.boundingBox())!.height;
  await page.locator('.atlas-sheet-handle').click();
  await expect(page.locator('.atlas-explore')).toHaveAttribute('data-sheet', 'expanded');
  await expect.poll(async () => (await sheet.boundingBox())!.height).toBeGreaterThan(before + 100);
  await page.locator('.atlas-compare-add').nth(0).click();
  await page.locator('.atlas-compare-add').nth(1).click();
  await expect(page.locator('.atlas-comparison')).toBeVisible();
  await expect(page.locator('.atlas-comparison h2')).toBeFocused();
  await expect(page.locator('.atlas-comparison h2')).toBeInViewport({ ratio: 1 });
  await page.locator('.atlas-project-select').first().click();
  await expect(page.locator('.atlas-evidence')).toBeVisible();
  await expect(page.locator('#atlas-evidence-title')).toBeFocused();
  await expect(page.locator('.atlas-evidence .atlas-text-button').first()).toBeInViewport({
    ratio: 1,
  });
  await page.keyboard.press('Escape');
  await expect(page.locator('.atlas-evidence')).toHaveCount(0);
  await page.locator('.atlas-sheet-handle').click();
  await expect(page.locator('.atlas-explore')).toHaveAttribute('data-sheet', 'collapsed');
  await page.locator('.atlas-tool-toggle').click();
  await expect(page.locator('#atlas-tools')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('known project sources and reported dates remain visible in the map evidence panel', async ({
  page,
}) => {
  await page.goto('/en/explore?developer=omniyat&fallback=1');
  await page.locator('.atlas-project-select').first().click();
  const panel = page.locator('.atlas-evidence');
  await expect(panel).toContainText('Orla');
  await expect(panel.locator('a.atlas-source').first()).toHaveAttribute('href', /^https:\/\//);
  await expect(panel).toContainText('2026-06');
  await expect(panel).toContainText(/4-bedroom/);
  await expect(panel).toContainText(/on request|advisor/i);
});

test('map handoff preserves project and request through sign-in without sending', async ({
  page,
}) => {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/v1/consultant'))
      posts.push(request.url());
  });
  await page.goto('/en/explore?developer=omniyat&fallback=1&q=Orla');
  await page.locator('.atlas-project-select').first().click();
  const handoff = page.locator('.atlas-evidence a[href*="/consultant?"]').first();
  await handoff.click();
  await expect(page.getByTestId('atlas-handoff-context')).toContainText('Orla');
  await expect(page.getByTestId('atlas-handoff-context')).toContainText('Nothing has been sent');
  await page.locator('a[href*="/login?returnTo="]').click();
  await page.getByRole('button', { name: 'Private client', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/consultant\?project=/);
  await expect(page.locator('#message')).toHaveValue(/Orla/);
  await expect(
    page
      .getByTestId('atlas-handoff-context')
      .getByRole('link', { name: /Original source/ })
      .first(),
  ).toHaveAttribute('href', /^https:\/\//);
  expect(posts).toEqual([]);
});

test('keyboard can place an office origin in WebGL and geographic fallback', async ({ page }) => {
  for (const fallback of [false, true]) {
    await page.goto(`/en/explore${fallback ? '?fallback=1' : ''}`);
    await expect(page.locator('.living-map')).toHaveAttribute('data-map-ready', 'true', {
      timeout: 30000,
    });
    await expect(page.locator('.living-map')).toHaveAttribute(
      'data-map-mode',
      fallback ? 'fallback' : 'webgl',
    );
    await page.locator('.atlas-tool-toggle').click();
    await page.locator('#atlas-origin').selectOption('office');
    await page.getByRole('button', { name: 'Choose on the map', exact: true }).click();
    const surface = page.locator(fallback ? '.atlas-fallback' : '.maplibregl-canvas');
    await expect(surface).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.locator('.atlas-tool-toggle').click();
    await expect(page.locator('.atlas-minute-options button[aria-pressed="true"]')).toContainText(
      '20',
    );
    if (fallback) await expect(page.locator('.atlas-fallback-ring').first()).toBeVisible();
  }
});
