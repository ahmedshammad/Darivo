import { test } from '@playwright/test';
import { runKarimCurrencyJourney } from './helpers/karim-currency-journey';

for (const locale of ['en', 'ar'] as const) {
  test(`Karim keeps native prices and EGP payment through USD/GBP and exact schedule followups in ${locale}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 390, height: 844 });
    await runKarimCurrencyJourney(page, { locale, fallback: true });
  });
}
