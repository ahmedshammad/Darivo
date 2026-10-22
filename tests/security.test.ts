import { describe, it, expect, vi } from 'vitest';
import { contentSecurityPolicy } from '../src/server/csp';
import { filterSchema } from '../src/server/db/properties';
import { toolSchemas } from '../src/server/ai/schema';
import { MemoryRateLimiter } from '../src/server/rate-limit';
describe('security contracts', () => {
  it('limits repeated calls and resets its window', () => {
    vi.useFakeTimers();
    try {
      const limiter = new MemoryRateLimiter();
      limiter.check('client', 2, 1000);
      limiter.check('client', 2, 1000);
      expect(() => limiter.check('client', 2, 1000)).toThrow('rate_limited');
      limiter.check('other', 2, 1000);
      vi.advanceTimersByTime(1000);
      expect(() => limiter.check('client', 2, 1000)).not.toThrow();
    } finally {
      vi.useRealTimers();
    }
  });
  it('uses per-request nonces without production eval permission', () => {
    const policy = contentSecurityPolicy('abc', true);
    expect(policy).toContain("'nonce-abc'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain('unsafe-eval');
    expect(policy.split('style-src')[0]).not.toContain('unsafe-inline');
  });
  it('rejects visibility override and excessively large result requests', () => {
    expect(() => filterSchema.parse({ visibility: 'PRIVATE_INVITE' })).toThrow();
    expect(() => filterSchema.parse({ limit: 1000 })).toThrow();
  });
  it('bounds investment assumptions and comparison cardinality', () => {
    expect(() =>
      toolSchemas.calculate_investment.parse({
        property_id: 'property-002',
        assumptions: { annual_rent: 1, vacancy_percent: 101 },
      }),
    ).toThrow();
    expect(() =>
      toolSchemas.compare_properties.parse({ ids: Array(5).fill('property-002') }),
    ).toThrow();
  });
});
