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
    if (fallback) {
      const initialCenter = await map.getAttribute('data-center');
      const initialZoom = Number(await map.getAttribute('data-zoom'));
      await map.getByRole('button', { name: 'Zoom out', exact: true }).click();
      await map.getByRole('button', { name: 'Zoom out', exact: true }).click();
      await map.getByTestId('atlas-fallback').focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await expect(map).not.toHaveAttribute('data-center', initialCenter!);
      await expect
        .poll(async () => Number(await map.getAttribute('data-zoom')))
        .toBeLessThan(initialZoom);
    }
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
    if (fallback) {
      const notice = map.locator('details.atlas-fallback-label');
      await expect(notice).not.toHaveAttribute('open');
      expect((await notice.boundingBox())!.height).toBeLessThanOrEqual(48);
      const june = map.locator('.atlas-fallback-point[data-project-id="june-sodic"]');
      // Pointer actionability catches notices or neighbouring markers covering the endpoint.
      await june.click({ trial: true });
      await notice.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(notice).toHaveAttribute('open');
      await expect(notice).toContainText('street and 3D detail unavailable');
      await page.keyboard.press('Enter');
      await expect(notice).not.toHaveAttribute('open');
    }
  }
});

test('active WebGL comparison refits after a width-only viewport resize', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/explore?q=North+Coast+and+Dubai');
  const map = page.locator('.living-map');
  await expect(map).toHaveAttribute('data-map-ready', 'true', { timeout: 30000 });
  await expect(map).toHaveAttribute('data-map-mode', 'webgl');
  for (const id of ['june-sodic', 'orla-palm-jumeirah'])
    await page.locator(`[data-project="${id}"] .atlas-compare-add`).click();
  await expect
    .poll(async () => {
      const points = JSON.parse((await map.getAttribute('data-comparison-points')) || '[]');
      return points.length === 2 && (await map.getAttribute('data-moving')) === 'false';
    })
    .toBe(true);
  const initialZoom = Number(await map.getAttribute('data-zoom'));
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect
    .poll(
      async () => {
        const points = JSON.parse((await map.getAttribute('data-comparison-points')) || '[]') as {
          x: number;
          y: number;
        }[];
        return (
          (await map.getAttribute('data-moving')) === 'false' &&
          Number(await map.getAttribute('data-zoom')) < initialZoom - 0.1 &&
          points.length === 2 &&
          points.every(
            (point) => point.x >= 430 && point.x <= 1024 - 70 && point.y >= 100 && point.y <= 800,
          )
        );
      },
      { timeout: 15000 },
    )
    .toBe(true);
});
