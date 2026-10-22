import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/server/db/client';
import { adminDelete, adminWrite } from '../src/server/admin';

afterAll(() => db.$disconnect());

const input = {
  nameEn: 'Fictional test developer',
  nameAr: 'مطور افتراضي للاختبار',
  descriptionEn: 'Fictional test record.',
  descriptionAr: 'سجل افتراضي للاختبار.',
};

describe('legacy developer editor preserves reference provenance', () => {
  it.each(['REAL_REFERENCE', 'AGGREGATE'] as const)(
    'rejects edits and deletion of %s records even with a known ID',
    async (kind) => {
      const original = await db.developer.findFirstOrThrow({ where: { kind } });
      await expect(
        adminWrite('developers', { ...input, id: original.id }, 'demo-admin'),
      ).rejects.toMatchObject({ status: 403, message: 'reference_read_only' });
      await expect(adminDelete('developers', original.id, 'demo-admin')).rejects.toMatchObject({
        status: 403,
        message: 'reference_read_only',
      });
      expect(await db.developer.findUnique({ where: { id: original.id } })).toEqual(original);
    },
  );

  it('retains fictional developer CRUD and rejects kind injection', async () => {
    await expect(
      adminWrite('developers', { ...input, kind: 'REAL_REFERENCE' }, 'demo-admin'),
    ).rejects.toThrow();
    const { id } = await adminWrite('developers', input, 'demo-admin');
    try {
      expect((await db.developer.findUniqueOrThrow({ where: { id } })).kind).toBe('DEMO');
      await adminWrite(
        'developers',
        { ...input, id, nameEn: 'Updated fictional developer' },
        'demo-admin',
      );
      expect((await db.developer.findUniqueOrThrow({ where: { id } })).nameEn).toBe(
        'Updated fictional developer',
      );
      await adminDelete('developers', id, 'demo-admin');
      expect(await db.developer.findUnique({ where: { id } })).toBeNull();
    } finally {
      await db.developer.deleteMany({ where: { id } });
      await db.auditLog.deleteMany({ where: { targetId: id } });
    }
  });
});
