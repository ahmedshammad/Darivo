import { describe, it, expect, afterAll } from 'vitest';
import { db } from '../src/server/db/client';
import { searchProperties, getProperty } from '../src/server/db/properties';
import { embed } from '../src/server/search/embedding';
const client = { id: 'demo-client', role: 'CLIENT' as const, verification: 'UNVERIFIED' as const };
afterAll(() => db.$disconnect());
describe('discovery and scope', () => {
  it('seeds 200 listings and the exact visibility mix', async () => {
    expect(await db.property.count()).toBe(200);
    expect(await db.property.count({ where: { visibility: 'VERIFIED_ONLY' } })).toBe(30);
    expect(await db.property.count({ where: { visibility: 'PRIVATE_INVITE' } })).toBe(10);
  });
  it('returns the acceptance villa while preserving filters', async () => {
    const r = await searchProperties(
      { community: 'dubai-hills', type: 'villa', bedrooms: 3, maxPrice: 12000000 },
      client,
    );
    expect(r.properties.some((p) => p.id === 'property-002')).toBe(true);
    expect(
      r.properties.every(
        (p) => p.visibility === 'PUBLIC' && p.priceAed <= 12000000 && p.bedrooms === 3,
      ),
    ).toBe(true);
  });
  it('denies hidden ID lookup even when guessed', async () => {
    expect(await getProperty('property-017', client)).toBeNull();
    expect(await getProperty('property-020', client)).toBeNull();
  });
  it('allows verified inventory but never an ungranted private invite', async () => {
    const verified = { ...client, id: 'demo-verified', verification: 'VERIFIED' as const };
    expect(await getProperty('property-017', verified)).not.toBeNull();
    expect(await getProperty('property-020', verified)).toBeNull();
  });
  it('produces deterministic normalized embeddings and runs hybrid search', async () => {
    const v = embed('garden villa');
    expect(v).toEqual(embed('garden villa'));
    expect(v.reduce((s, n) => s + n * n, 0)).toBeCloseTo(1);
    expect((await searchProperties({ q: 'garden villa' }, client)).properties.length).toBe(12);
  });
});
