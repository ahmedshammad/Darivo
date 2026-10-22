import { describe, expect, it } from 'vitest';
import { safeLoginReturn } from '@/src/lib/login-return';

describe('explicit local sign-in continuation', () => {
  it.each([
    '/en/concierge?q=North+Coast&theme=dark',
    '/ar/consultant?q=%D8%AF%D8%A8%D9%8A',
    '/ar/office?intent=save&unit=property-001#portfolios',
    '/en/office/viewings',
    '/ar/office/privacy',
    '/en/office/comparison',
    '/ar/office/private-collection',
    '/ar/p/project-orla',
    '/en/p/unit-demo-residence-001',
    '/en/p/unit-authorized_fixture-001',
    '/ar/p/project-' + 'a'.repeat(181),
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
    '/en/office/portfolios/board_123',
    '/en/p/unit-_leading-underscore',
    '/en/p/unit-' + 'a'.repeat(182),
    '/en/office?draft=' + 'x'.repeat(6000),
    undefined,
    ['en/office'],
  ])('rejects an untrusted destination', (path) => {
    expect(safeLoginReturn(path)).toBeUndefined();
  });
});
