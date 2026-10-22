import { test, expect } from '@playwright/test';

test('cross-market comparison refits both endpoints after the mobile sheet collapses', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const fallback of [false, true]) {
    const query = new URLSearchParams({ q: 'North Coast summer home and Dubai investment' });
    if (fallback) query.set('fallback', '1');
    await page.goto(`/en/explore?${query}`);
    const map = page.locator('.living-map');
    await expect(map).toHaveAttribute('data-map-ready', 'true', { timeout: 30000 });
    await expect(map).toHaveAttribute('data-map-mode', fallback ? 'fallback' : 'webgl');
    await page.locator('.atlas-sheet-handle').click();
    for (const id of ['june-sodic', 'orla-palm-jumeirah'])
      await page.locator(`[data-project="${id}"] .atlas-compare-add`).click();
    await expect(page.locator('.atlas-comparison')).toContainText('Distance only');
    await page.getByRole('button', { name: 'Show connections on the map', exact: true }).click();
    await expect(page.locator('.atlas-explore')).toHaveAttribute('data-sheet', 'collapsed');
    await expect
      .poll(
        async () => {
          if ((await map.getAttribute('data-moving')) !== 'false') return false;
          const bounds = await map.boundingBox();
          const sheet = await page.getByTestId('explore-sheet').boundingBox();
          const points = JSON.parse((await map.getAttribute('data-comparison-points')) || '[]') as {
            id: string;
            x: number;
            y: number;
          }[];
          return (
            bounds !== null &&
            sheet !== null &&
            points.length === 2 &&
            points.every(
              (point) =>
                point.x >= 24 &&
                point.x <= bounds.width - 24 &&
                point.y >= 140 &&
                point.y + bounds.y < sheet.y - 24,
            )
          );
        },
        { timeout: 15000 },
      )
      .toBe(true);
  }
});
