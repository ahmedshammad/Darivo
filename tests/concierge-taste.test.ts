import { describe, expect, it } from 'vitest';
import { emptyConciergeBrief } from '../src/lib/concierge';
import { captureConsentedTaste } from '../src/server/concierge/taste';

describe('Explicit taste memory', () => {
  it('does not retain tastes without current consent or in a no-save session', () => {
    const brief = emptyConciergeBrief();
    expect(
      captureConsentedTaste(brief, 'I prefer contemporary architecture').tasteMemory.items,
    ).toEqual([]);
    brief.tasteMemory = { consent: 'granted', consentedAt: '2026-10-22T12:00:00Z', items: [] };
    brief.privacy.doNotSave = true;
    expect(captureConsentedTaste(brief, 'I dislike high-rise buildings').tasteMemory.items).toEqual(
      [],
    );
  });
  it('retains only the explicit preference fragment and stable identity', () => {
    const brief = emptyConciergeBrief();
    brief.tasteMemory = { consent: 'granted', consentedAt: '2026-10-22T12:00:00Z', items: [] };
    const next = captureConsentedTaste(
      brief,
      'My private phone is 12345. I prefer contemporary architecture.',
    );
    expect(next.tasteMemory.items[0].text).toBe('I prefer contemporary architecture');
    expect(
      captureConsentedTaste(next, 'I prefer contemporary architecture').tasteMemory.items,
    ).toHaveLength(1);
    expect(captureConsentedTaste(brief, 'ما أبي الأبراج').tasteMemory.items[0].id).toBe(
      'dislikes-high-rise',
    );
  });
});
