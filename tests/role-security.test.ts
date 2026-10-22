import { afterAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db } from '../src/server/db/client';
import { getProperty, searchProperties } from '../src/server/db/properties';
import { changeGrant } from '../src/server/grants';
import { executeTool } from '../src/server/ai/tools';

afterAll(() => db.$disconnect());
describe('current database roles govern every inventory lookup', () => {
  it('revokes stale verified and staff snapshots; a partner never inherits old private grants', async () => {
    const id = `roles-${randomUUID()}`;
    const stale = await db.user.create({
      data: {
        id,
        email: `${id}@darivo.example`,
        role: 'VERIFIED_CLIENT',
        verification: 'VERIFIED',
      },
    });
    try {
      expect(await getProperty('property-017', stale)).not.toBeNull();
      await db.user.update({ where: { id }, data: { verification: 'PENDING' } });
      expect(await getProperty('property-017', stale)).toBeNull();
      await db.user.update({ where: { id }, data: { verification: 'VERIFIED', role: 'CLIENT' } });
      expect(await getProperty('property-017', stale)).toBeNull();
      await db.user.update({ where: { id }, data: { role: 'VERIFIED_CLIENT' } });
      await changeGrant(
        { id: 'demo-admin', role: 'ADMIN' },
        { userId: id, propertyId: 'property-020' },
      );
      expect(await getProperty('property-020', stale)).not.toBeNull();
      await db.user.update({ where: { id }, data: { role: 'DEVELOPER_PARTNER' } });
      expect(await getProperty('property-020', stale)).toBeNull();
      expect(await getProperty('property-017', { ...stale, role: 'ADMIN' })).toBeNull();
      expect(
        (await searchProperties({}, stale)).properties.every((p) => p.visibility === 'PUBLIC'),
      ).toBe(true);
      expect(
        (await executeTool({ name: 'get_property', arguments: { id: 'property-020' } }, stale))
          .properties,
      ).toEqual([]);
      await expect(
        changeGrant(
          { id: 'demo-admin', role: 'ADMIN' },
          { userId: id, propertyId: 'property-020' },
        ),
      ).rejects.toMatchObject({ status: 400 });
      await changeGrant(
        { id: 'demo-admin', role: 'ADMIN' },
        { userId: id, propertyId: 'property-020' },
        true,
      );
      expect(await db.offMarketGrant.count({ where: { userId: id } })).toBe(0);
    } finally {
      await db.user.delete({ where: { id } });
    }
    expect(await getProperty('property-020', { ...stale, role: 'ADMIN' })).toBeNull();
  });
  it('rejects a formerly privileged grant actor after database downgrade', async () => {
    const id = `actor-${randomUUID()}`;
    const actor = await db.user.create({
      data: { id, email: `${id}@darivo.example`, role: 'ADVISOR' },
    });
    try {
      await db.user.update({ where: { id }, data: { role: 'DEVELOPER_PARTNER' } });
      await expect(
        changeGrant(actor, { userId: 'demo-client', propertyId: 'property-020' }),
      ).rejects.toMatchObject({ status: 403 });
    } finally {
      await db.user.delete({ where: { id } });
    }
  });
});
