import { expect, it } from 'vitest';
import { formatConciergeExpiry } from '../src/lib/concierge-presentation';
import { conciergeCopy } from '../messages/concierge';

it('shows the same expiry instant across offsets with an explicit UTC time and seconds', () => {
  const expiry = formatConciergeExpiry('2026-10-23T12:34:56+04:00', 'en');
  expect(expiry).toBe(formatConciergeExpiry('2026-10-23T08:34:56Z', 'en'));
  expect(expiry).toContain('08:34:56');
  expect(expiry).toMatch(/UTC$/);
});
it('honors Arabic digit preference without changing the represented UTC instant', () => {
  const value = '2026-10-23T08:34:56Z';
  const latin = formatConciergeExpiry(value, 'ar');
  const indic = formatConciergeExpiry(value, 'ar', true);
  expect(latin).toContain('08:34:56');
  expect(indic).toContain('٠٨:٣٤:٥٦');
  expect(indic.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))).toBe(latin);
});
it.each(['invalid', '2026-10-23T08:34:56'])('does not fabricate timezone for %s', (value) => {
  expect(formatConciergeExpiry(value, 'ar')).toBe(conciergeCopy.ar.unknown);
});
