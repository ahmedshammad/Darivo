import { expect, it } from 'vitest';
import { officeMoneyTokens } from '../src/components/office/money';
import { formatAmount } from '../src/lib/format';

it('preserves exact canonical money text, spacing and bidi isolates across both locales and all display currencies', () => {
  for (const locale of ['en', 'ar'])
    for (const digits of [false, true])
      for (const currency of ['AED', 'EGP', 'GBP', 'USD', 'EUR', 'SAR'])
        for (const amount of [57300000, 42980000.75, 0, 1e12]) {
          const tokens = officeMoneyTokens(amount, currency, locale, digits);
          expect(tokens.map((token) => token.value).join('')).toBe(
            formatAmount(amount, currency, locale, digits),
          );
          expect(
            tokens.filter((token) => token.kind === 'currency').map((token) => token.value),
          ).toEqual([currency]);
          expect(tokens.filter((token) => token.kind === 'amount')).toHaveLength(1);
        }
});

it('keeps Arabic Indic digits together with their group and decimal separators', () => {
  const tokens = officeMoneyTokens(57300000.5, 'AED', 'ar', true);
  expect(tokens.find((token) => token.kind === 'amount')?.value).toBe('٥٧٬٣٠٠٬٠٠٠٫٥٠');
  expect(tokens.find((token) => token.kind === 'currency')?.value).toBe('AED');
});
