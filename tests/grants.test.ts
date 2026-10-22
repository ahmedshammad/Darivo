import { describe, it, expect, afterAll } from 'vitest';
import { db } from '../src/server/db/client';
import { changeGrant } from '../src/server/grants';
import { getProperty } from '../src/server/db/properties';
const actor = { id: 'demo-admin', role: 'ADMIN' as const };
afterAll(() => db.$disconnect());
describe('private introductions', () => {
  it('grants only the named client, audits and immediately revokes', async () => {
    const id = `grant-test-${Date.now()}`,
      client = await db.user.create({ data: { id, email: `${id}@darivo.example` } });
    const other = {
      id: 'demo-verified',
      role: 'CLIENT' as const,
      verification: 'VERIFIED' as const,
    };
    try {
      expect(await getProperty('property-020', client)).toBeNull();
      await changeGrant(actor, { userId: id, propertyId: 'property-020' });
      expect(await getProperty('property-020', client)).not.toBeNull();
      expect(await getProperty('property-020', other)).toBeNull();
      expect(
        await db.auditLog.count({
          where: { action: 'PRIVATE_GRANT_CREATED', targetId: `${id}:property-020` },
        }),
      ).toBe(1);
      await changeGrant(actor, { userId: id, propertyId: 'property-020' }, true);
      expect(await getProperty('property-020', client)).toBeNull();
      expect(
        await db.auditLog.count({
          where: { action: 'PRIVATE_GRANT_REVOKED', targetId: `${id}:property-020` },
        }),
      ).toBe(1);
    } finally {
      await db.user.delete({ where: { id } });
    }
  });
  it('rejects a client acting as grant author', async () => {
    await expect(
      changeGrant(
        { id: 'demo-client', role: 'CLIENT' },
        { userId: 'demo-client', propertyId: 'property-020' },
      ),
    ).rejects.toMatchObject({ status: 403 });
  });
});
