import { describe, expect, it } from 'vitest';
import { safeLoginReturn } from '@/src/lib/login-return';

describe('explicit local sign-in continuation', () => {
  it.each([
    '/en/concierge?q=North+Coast&theme=dark',
    '/ar/consultant?q=%D8%AF%D8%A8%D9%8A',
    '/ar/office?intent=save&unit=property-001#portfolios',
    '/en/office/portfolios/board_123',
    '/en/office/viewings',
    '/ar/p/project-orla',
    '/en/p/unit-demo-residence-001',
  ])('preserves a permitted destination: %s', (path) => {
    expect(safeLoginReturn(path)).toBe(path);
  });
  it.each([
    'https://evil.example/en/office',
    '//evil.example/en/office',
    '/\\evil.example/en/office',
    '/en/office\n',
    '/en/office%2f..%2fadmin',
    '/en/admin',
    '/api/v1/portfolios',
    '/en/p/unqualified-project',
    '/fr/office',
    '/en/office/arbitrary',
    '/en/office?draft=' + 'x'.repeat(6000),
    undefined,
    ['en/office'],
  ])('rejects an untrusted destination', (path) => {
    expect(safeLoginReturn(path)).toBeUndefined();
  });
});
