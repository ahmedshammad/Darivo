import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { runDeadlineJourney } from './helpers/concierge-deadline-journey';

for (const locale of ['en', 'ar'] as const) {
  test(`deadline disclosures stay full across changed scope/cancel/history and expand repeats in ${locale}`, async ({
    page,
  }) => {
    test.setTimeout(150000);
    await page.setViewportSize({ width: 390, height: 844 });
    await runDeadlineJourney(page, {
      locale,
      fallback: true,
      cancellation: true,
      checkpoint: async () => {
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      },
    });
  });
}
