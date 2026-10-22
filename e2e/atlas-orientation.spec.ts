import { test, expect, type Page } from '@playwright/test';
import { expectAtlasMode } from './atlas-capability';
import { readOrientationState } from './atlas-orientation';
import { ATLAS_PLACES } from '../src/lib/atlas-intent';
import { ORIENTATION_PLACE_IDS } from '../src/lib/map-orientation';

async function expectClearOrientation(page: Page) {
  await expect
    .poll(
      async () => {
        const state = await readOrientationState(page);
        if (!state) return ['missing test renderer'];
        if (state.moving || !state.tilesReady) return ['unsettled map'];
        const failures: string[] = [];
        for (const label of state.planned) {
          const r = label.rect;
          if (r.x < 0 || r.y < 0 || r.x + r.width > state.width || r.y + r.height > state.height)
            failures.push(`${label.id}: outside viewport`);
          for (const obstacle of [...state.controls, ...state.targets])
            if (
              r.x < obstacle.x + obstacle.width &&
              r.x + r.width > obstacle.x &&
              r.y < obstacle.y + obstacle.height &&
              r.y + r.height > obstacle.y
            )
              failures.push(`${label.id}: control or 44px target collision`);
        }
        return failures;
      },
      { timeout: 15000 },
    )
    .toEqual([]);
}

for (const locale of ['en', 'ar'] as const)
  for (const width of [1440, 390])
    test(`local orientation remains readable and yields to comparison: ${locale} ${width}`, async ({
      page,
    }) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${locale}/explore?theme=dark`);
      const fallback = await expectAtlasMode(page);
      test.skip(
        fallback,
        'Actual WebGL labels require hardware rendering; regional software fallback is separately covered.',
      );
      await expect
        .poll(
          async () => {
            const state = await readOrientationState(page);
            return !!state && !state.moving && state.tilesReady && state.rendered.length > 0;
          },
          { timeout: 30000 },
        )
        .toBe(true);
      const initial = (await readOrientationState(page))!;
      expect(initial.targets.length).toBeGreaterThan(0);
      expect(initial.planned.length).toBeLessThanOrEqual(width === 390 ? 3 : 5);
      for (const feature of initial.rendered) {
        expect(ORIENTATION_PLACE_IDS).toContain(feature.id);
        const place = ATLAS_PLACES.find((place) => place.id === feature.id)!;
        expect(feature.name).toBe(locale === 'ar' ? place.nameAr : place.nameEn);
      }
      await expectClearOrientation(page);

      await page.locator('.atlas-tool-toggle').click();
      await expect(page.locator('#atlas-tools')).toBeVisible();
      await expectClearOrientation(page);
      await page.locator('.atlas-tool-toggle').click();
      if (width === 390) {
        await page.locator('.atlas-sheet-handle').click();
        await expect(page.locator('.atlas-explore')).toHaveAttribute('data-sheet', 'expanded');
        await expectClearOrientation(page);
      }
      await page.locator('.atlas-compare-add').nth(0).click();
      await page.locator('.atlas-compare-add').nth(1).click();
      await expect(page.locator('.atlas-comparison')).toBeVisible();
      await expect
        .poll(async () => {
          const state = await readOrientationState(page);
          return (
            state && {
              visibility: state.visibility,
              planned: state.planned.length,
              rendered: state.rendered.length,
            }
          );
        })
        .toEqual({ visibility: 'none', planned: 0, rendered: 0 });
    });
