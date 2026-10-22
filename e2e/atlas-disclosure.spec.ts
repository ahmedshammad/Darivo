import { test, expect } from '@playwright/test';

for (const locale of ['en', 'ar']) {
  test(`comparison leaves the full source disclosure unobstructed in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/${locale}/explore?fallback=1&q=North+Coast+and+Dubai`);
    await page.locator('.atlas-sheet-handle').click();
    for (const id of ['june-sodic', 'orla-palm-jumeirah'])
      await page.locator(`[data-project="${id}"] .atlas-compare-add`).click();
    await page.locator('.atlas-comparison .atlas-action').click();
    const peek = page.locator('.atlas-comparison-peek');
    await expect(peek).toBeVisible();
    const summary = page.locator('.atlas-map-evidence summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(peek).toBeHidden();
    const panel = page.locator('.atlas-map-source-panel');
    await expect(panel).toBeVisible();
    for (const scrollToBottom of [false, true]) {
      const sample = () =>
        panel.evaluate((element, bottom) => {
          element.scrollTop = bottom ? element.scrollHeight : 0;
          const rect = element.getBoundingClientRect();
          const covered: string[] = [];
          for (const horizontal of [0.1, 0.5, 0.9])
            for (const vertical of [0.1, 0.5, 0.9]) {
              const x = rect.left + rect.width * horizontal;
              const y = rect.top + rect.height * vertical;
              const front = document.elementFromPoint(x, y);
              if (!front || !element.contains(front))
                covered.push(`${x},${y}: ${front?.className ?? 'outside viewport'}`);
            }
          return covered;
        }, scrollToBottom);
      // The sheet and its anchored disclosure finish their short transition together.
      await expect.poll(sample).toEqual([]);
    }
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeHidden();
    await expect(peek).toBeVisible();
  });
}
