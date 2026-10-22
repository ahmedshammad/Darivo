import { test, expect } from '@playwright/test';
import { expectAtlasMode } from './atlas-capability';

for (const locale of ['en', 'ar']) {
  test(`WebGL comparison endpoints select from outside the visible glyph: ${locale}`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const query = new URLSearchParams({ q: 'North Coast and Dubai', theme: 'dark' });
    await page.goto(`/${locale}/explore?${query}`);
    const fallback = await expectAtlasMode(page);
    test.skip(fallback, 'Requires a real WebGL context; software fallback is separately covered.');
    const map = page.locator('.living-map');
    await page.locator('.atlas-sheet-handle').click();
    const projects = [
      { id: 'june-sodic', name: 'June' },
      { id: 'orla-palm-jumeirah', name: 'Orla, Dorchester Collection' },
    ];
    for (const { id } of projects)
      await page.locator(`[data-project="${id}"] .atlas-compare-add`).click();
    await page.locator('.atlas-comparison .atlas-action').click();
    await expect(map).toHaveAttribute('data-deck-ready', 'true');

    for (const project of projects) {
      // 20px is outside the ~8px visible radius and inside the 22px hit radius.
      // Cross-market zoom also excludes the larger local-project glow layer.
      for (const [dx, dy] of [
        [20, 0],
        [-20, 0],
        [0, 20],
        [0, -20],
      ]) {
        await expect(map).toHaveAttribute('data-moving', 'false');
        await expect(page.locator('.atlas-explore')).toHaveAttribute('data-sheet', 'collapsed');
        const point = await map.evaluate((element, id) => {
          const points = JSON.parse(element.getAttribute('data-comparison-points') || '[]') as {
            id: string;
            x: number;
            y: number;
          }[];
          const match = points.find((candidate) => candidate.id === id);
          if (!match) throw new Error(`Missing comparison endpoint: ${id}`);
          const bounds = element.getBoundingClientRect();
          return { x: bounds.x + match.x, y: bounds.y + match.y };
        }, project.id);
        // Exercise the actual pointer path, not a geometric clearance assertion.
        await page.mouse.click(point.x + dx, point.y + dy);
        const evidence = page.getByTestId('project-evidence');
        await expect(evidence).toBeVisible();
        await expect(evidence.locator('#atlas-evidence-title')).toHaveText(project.name);
        await page.keyboard.press('Escape');
        await expect(evidence).toHaveCount(0);
        const expandedPoints = await map.getAttribute('data-comparison-points');
        await page.locator('.atlas-sheet-handle').click();
        await expect(map).not.toHaveAttribute('data-comparison-points', expandedPoints!);
      }
    }
  });
}
