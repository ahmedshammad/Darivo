import { expect, test, type Page } from '@playwright/test';

/** Unexpected startup/network failures must not silently turn WebGL coverage into fallback coverage. */
export async function expectAtlasMode(page: Page, forced = false): Promise<boolean> {
  const map = page.locator('.living-map');
  await expect(map).toHaveAttribute('data-map-ready', 'true', { timeout: 30000 });
  const mode = await map.getAttribute('data-map-mode');
  if (forced) {
    await expect(map).toHaveAttribute('data-map-mode', 'fallback');
    await expect(map).toHaveAttribute('data-fallback-reason', 'forced');
  } else if (mode === 'fallback') {
    await expect(map).toHaveAttribute('data-fallback-reason', 'software-renderer');
  } else {
    await expect(map).toHaveAttribute('data-map-mode', 'webgl');
  }
  test.info().annotations.push({
    type: 'map-mode',
    description: forced
      ? 'forced geographic fallback'
      : mode === 'fallback'
        ? 'browser software-renderer fallback'
        : 'WebGL context accepted',
  });
  return mode === 'fallback';
}
