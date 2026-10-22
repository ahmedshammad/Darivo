import { describe, it, expect } from 'vitest';
import { extractBrief, MockProvider, isAdvice } from '../src/server/ai/mock';
import { toolSchemas, toolCallSchema } from '../src/server/ai/schema';
describe('consultant parsing and guardrails', () => {
  it.each([
    '3-bedroom villa in Dubai Hills under 12 million dirhams',
    'فيلا ٣ غرف في دبي هيلز تحت ١٢ مليون درهم',
  ])('extracts the acceptance brief: %s', (message) => {
    expect(extractBrief(message).filters).toMatchObject({
      type: 'villa',
      bedrooms: 3,
      community: 'dubai-hills',
      maxPrice: 12000000,
      currency: 'AED',
    });
  });
  it('retains a budget in a follow-up', async () => {
    const p = await new MockProvider().plan('3 bedrooms', {
      filters: { maxPrice: 2000000, currency: 'USD' },
    });
    expect(p.brief.filters).toMatchObject({ bedrooms: 3, maxPrice: 2000000, currency: 'USD' });
  });
  it('has no admin tool and rejects unexpected fields', () => {
    expect(() => toolCallSchema.parse({ name: 'grant_access', arguments: {} })).toThrow();
    expect(() => toolSchemas.get_property.parse({ id: 'property-020', admin: true })).toThrow();
  });
  it.each(['What are my tax obligations?', 'اريد نصيحة قانونية', 'Should I invest my savings?'])(
    'routes advice to human expertise: %s',
    (m) => expect(isAdvice(m)).toBe(true),
  );
});
