import { test, expect } from '@playwright/test';
import { conciergeCopy } from '../messages/concierge';
import { expectAtlasMode } from './atlas-capability';

for (const locale of ['en', 'ar'] as const) {
  test(`Concierge retains regional context until local geography loads in ${locale}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    let requested = false;
    await page.route('**/map-styles/noir.json', async (route) => {
      requested = true;
      await held;
      await route.continue();
    });
    try {
      await page.goto(`/${locale}/concierge?theme=dark`);
      const fallback = await expectAtlasMode(page);
      test.skip(fallback, 'Local vector source transition requires a real WebGL context.');
      const map = page.locator('.living-map');
      await expect(map).toHaveAttribute('data-map-detail', 'regional');
      const copy = conciergeCopy[locale];
      await page.getByRole('button', { name: new RegExp(copy.examples[1].name) }).click();
      await expect.poll(() => requested).toBe(true);
      await expect(map).toHaveAttribute('data-tiles-ready', 'false');
      await expect(map).toHaveAttribute('data-map-detail', 'regional');
      await expect(map.locator('.atlas-map-legend')).toContainText(
        locale === 'en' ? 'Loading local geography' : 'جارٍ تحميل',
      );
      await expect(map.locator('.atlas-map-attribution')).toContainText('Natural Earth');
      release();
      await expect(map).toHaveAttribute('data-map-detail', 'local', { timeout: 30000 });
      await expect(map).toHaveAttribute('data-tiles-ready', 'true', { timeout: 30000 });
      await expect(map.locator('.atlas-map-attribution')).toContainText('OpenFreeMap');
      await expect(map).toHaveAttribute('data-map-mode', 'webgl');
    } finally {
      release();
    }
  });
}

test('A failed local detail source preserves geographic fallback instead of a blank ready map', async ({
  page,
}) => {
  await page.route('https://tiles.openfreemap.org/planet', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.goto('/en/concierge?theme=dark');
  const fallback = await expectAtlasMode(page);
  test.skip(fallback, 'Progressive vector failure requires an initial real WebGL context.');
  await page.getByRole('button', { name: new RegExp(conciergeCopy.en.examples[1].name) }).click();
  const map = page.locator('.living-map');
  await expect(map).toHaveAttribute('data-map-mode', 'fallback');
  await expect(map).toHaveAttribute('data-fallback-reason', 'unavailable');
  await expect(map).toHaveAttribute('data-tiles-ready', 'true');
  await expect(map.locator('.atlas-fallback-land').first()).toBeVisible();
  await expect(map.locator('.atlas-map-attribution')).toContainText('Natural Earth');
});
