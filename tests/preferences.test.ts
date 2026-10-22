import { describe, expect, it } from 'vitest';
import { formatAmount, formatNumber } from '../src/lib/format';
import { money } from '../src/lib/catalog';
import { displayPreferencesSchema, profileSchema } from '../src/lib/preferences';

describe('display preferences preserve financial meaning', () => {
  it('changes only glyphs while preserving the original AED and EGP amounts', () => {
    const source = { amount: 91200000, currency: 'EGP' };
    const latin = formatAmount(source.amount, source.currency, 'ar', false);
    const arabic = formatAmount(source.amount, source.currency, 'ar', true);
    expect(latin).toContain('91,200,000');
    expect(arabic).toContain('٩١٬٢٠٠٬٠٠٠');
    expect(latin).toContain('EGP');
    expect(arabic).toContain('EGP');
    expect(source).toEqual({ amount: 91200000, currency: 'EGP' });
    expect(formatAmount(1234.67, 'AED', 'en', false)).toContain('1,234.67');
    expect(formatAmount(1234.67, 'EGP', 'ar', true)).toContain('١٬٢٣٤٫٦٧');
    expect(formatAmount(57300000, 'AED', 'en', true)).toContain('٥٧٬٣٠٠٬٠٠٠');
  });
  it('isolates mixed-script amounts and keeps FX conversion explicit', () => {
    const source = formatAmount(13500000, 'EGP', 'ar', false);
    expect(source.startsWith('\u2068')).toBe(true);
    expect(source.endsWith('\u2069')).toBe(true);
    expect(source).toContain('13,500,000');
    expect(money(1000000, 'EGP', 'en', false)).toContain('13,500,000');
    expect(formatNumber(1200, 'en', true)).toContain('١٬٢٠٠');
  });
  it('accepts numeral choice and rejects role, verification and consent injection', () => {
    expect(displayPreferencesSchema.parse({ arabicIndicDigits: true })).toEqual({
      arabicIndicDigits: true,
    });
    for (const key of ['role', 'verification', 'consentAt', 'userId']) {
      expect(
        displayPreferencesSchema.safeParse({ arabicIndicDigits: true, [key]: 'ADMIN' }).success,
      ).toBe(false);
    }
    expect(displayPreferencesSchema.safeParse({}).success).toBe(false);
    expect(displayPreferencesSchema.safeParse({ arabicIndicDigits: 'true' }).success).toBe(false);
    expect(
      profileSchema.safeParse({
        language: 'ar',
        currency: 'EGP',
        areaUnit: 'sqm',
        timezone: 'Europe/London',
        notifications: false,
        consent: true,
        arabicIndicDigits: true,
      }).success,
    ).toBe(true);
  });
});
