import { test, expect, chromium } from '@playwright/test';

test('actual software WebGL uses interactive geographic 2D with an honest explanation', async ({
  baseURL,
}) => {
  const browser = await chromium.launch({
    channel: 'chrome',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    // Verify the launch produced a real software context, without mocking the app or canvas API.
    const softwareContext = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      const info = gl?.getExtension('WEBGL_debug_renderer_info');
      const software = Boolean(
        info && /SwiftShader/i.test(gl!.getParameter(info.UNMASKED_RENDERER_WEBGL)),
      );
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      return software;
    });
    expect(softwareContext).toBe(true);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const locale of ['en', 'ar']) {
      await page.goto(`${baseURL}/${locale}`);
      const map = page.locator('.living-map');
      await expect(map).toHaveAttribute('data-map-ready', 'true', { timeout: 30000 });
      await expect(map).toHaveAttribute('data-fallback-reason', 'software-renderer');
      await expect(map).toHaveAttribute('data-map-mode', 'fallback');
      await expect(map.locator('.atlas-fallback-label')).toContainText(
        locale === 'ar' ? 'أكثر سلاسة لهذا الجهاز' : 'Smoother 2D map for this device',
      );
      await expect(map.locator('.atlas-fallback-land').first()).toBeVisible();
      await page.locator('#arrival-intent').fill('Downtown Dubai');
      await expect(map).toHaveAttribute('data-camera-key', /Downtown Dubai/);
      await expect
        .poll(async () => JSON.parse((await map.getAttribute('data-center')) || '[0]')[0])
        .toBeCloseTo(55.276, 2);
      await page.locator('#arrival-intent').press('Enter');
      await expect(page).toHaveURL(/\/explore\?/, { timeout: 15000 });
      await expect(map).toHaveAttribute('data-fallback-reason', 'software-renderer');
      await page.locator('.atlas-sheet-handle').click();
      await page.locator('.atlas-project-select').first().click();
      await expect(page.locator('.atlas-evidence')).toBeVisible();
    }
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
