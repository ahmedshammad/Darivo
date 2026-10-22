import { describe, expect, it } from 'vitest';
import { formatAmount, formatNumber } from '../src/lib/format';
import { money } from '../src/lib/catalog';
import { displayPreferencesSchema, profileSchema } from '../src/lib/preferences';
import { decodeDisplayPreferences } from '../src/lib/display-preferences-client';

describe('display preferences preserve financial meaning', () => {
  it('keeps the small storage decoder equivalent to the API schema for every valid combination', () => {
    for (const currency of [undefined, 'AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP'])
      for (const areaUnit of [undefined, 'sqm', 'sqft'])
        for (const arabicIndicDigits of [undefined, false, true]) {
          const value = JSON.parse(JSON.stringify({ currency, areaUnit, arabicIndicDigits }));
          const expected = displayPreferencesSchema.safeParse(value);
          expect(decodeDisplayPreferences(value)).toEqual(expected.success ? expected.data : null);
        }
  });
  it('rejects malformed stored preferences and privileged extra fields exactly as the API does', () => {
    const invalidValues: unknown[] = [null, [], '', false, 0, {}, ['AED']];
    for (const field of ['currency', 'areaUnit', 'arabicIndicDigits'])
      for (const invalid of [null, [], {}, 0, 1, 'true', 'aed', 'JPY', 'acre'])
        invalidValues.push({ currency: 'AED', areaUnit: 'sqm', [field]: invalid });
    for (const key of ['role', 'verification', 'consentAt', 'userId', '__proto__'])
      invalidValues.push(JSON.parse(`{"arabicIndicDigits":true,"${key}":"ADMIN"}`));
    for (const value of invalidValues) {
      expect(displayPreferencesSchema.safeParse(value).success).toBe(false);
      expect(decodeDisplayPreferences(value)).toBeNull();
    }
    const stored = Object.freeze({ currency: 'AED', arabicIndicDigits: false });
    const decoded = decodeDisplayPreferences(stored);
    expect(decoded).toEqual(stored);
    expect(decoded).not.toBe(stored);
  });
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
