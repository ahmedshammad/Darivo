import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../src/server/errors';
import { db } from '../src/server/db/client';
const state = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock('@/src/server/security', () => ({
  HttpError,
  optionalUser: async () => state.user,
  requireUser: async () => {
    if (!state.user) throw new HttpError(401, 'unauthorized');
    return state.user;
  },
  sameOrigin: (request: Request) => {
    if (request.headers.get('origin') !== 'http://localhost')
      throw new HttpError(403, 'origin_rejected');
  },
  rateLimit: () => {},
  readJson: (request: Request) => request.json(),
  json: (value: unknown, status = 200) =>
    Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } }),
  failure: (error: unknown) =>
    Response.json(
      { error: error instanceof HttpError ? error.message : 'invalid_input' },
      { status: error instanceof HttpError ? error.status : 400 },
    ),
}));
import { GET as story } from '../app/api/v1/stories/[slug]/route';
import { GET as entity } from '../app/api/v1/office/entity/route';
import { POST as create } from '../app/api/v1/portfolios/route';
import { restrictClientPrivacy } from '../src/server/office/privacy';
afterAll(() => db.$disconnect());
async function fixture(run: (id: string) => Promise<void>) {
  const id = `office-api-${randomUUID()}`;
  await db.user.create({ data: { id, email: `${id}@darivo.example`, role: 'CLIENT' } });
  state.user = { id };
  try {
    await run(id);
  } finally {
    state.user = null;
    await db.user.delete({ where: { id } });
  }
}
const storyRequest = (slug: string) =>
  story(new Request(`http://localhost/api/v1/stories/${slug}`), {
    params: Promise.resolve({ slug }),
  });
describe('Story and Office direct API authorization', () => {
  it('accepts safe underscore legacy slugs without weakening private-route authorization', () =>
    fixture(async (id) => {
      const template = await db.property.findFirstOrThrow({ where: { visibility: 'PUBLIC' } });
      const unitId = `property-office-${randomUUID()}`;
      const slug = `${unitId}_PRIVATE_INVITE`;
      await db.property.create({
        data: {
          ...template,
          id: unitId,
          slug,
          visibility: 'PRIVATE_INVITE',
          translations: {
            create: [
              {
                locale: 'en',
                title: 'Private test unit',
                description: 'Fictional authorization fixture.',
              },
              {
                locale: 'ar',
                title: 'وحدة اختبار خاصة',
                description: 'سجل خيالي لاختبار الصلاحيات.',
              },
            ],
          },
        },
      });
      try {
        expect((await storyRequest(`unit-${slug}`)).status).toBe(404);
        await db.offMarketGrant.create({
          data: { userId: id, propertyId: unitId, grantedBy: 'demo-admin' },
        });
        const allowed = await storyRequest(`unit-${slug}`);
        expect(allowed.status).toBe(200);
        expect((await allowed.json()).storyPath).toBe(`/p/unit-${slug}`);
        await db.offMarketGrant.deleteMany({ where: { userId: id, propertyId: unitId } });
        expect((await storyRequest(`unit-${slug}`)).status).toBe(404);
      } finally {
        await db.property.delete({ where: { id: unitId } });
      }
    }));

  it('returns indistinguishable private/missing Story responses and rechecks a revoked grant', () =>
    fixture(async (id) => {
      const unit = await db.property.findFirstOrThrow({ where: { visibility: 'PRIVATE_INVITE' } });
      const slug = `unit-${unit.slug}`;
      const hidden = await storyRequest(slug),
        missing = await storyRequest('unit-unknown-record');
      expect(hidden.status).toBe(404);
      expect(missing.status).toBe(404);
      expect(await hidden.text()).toBe(await missing.text());
      await db.offMarketGrant.create({
        data: { userId: id, propertyId: unit.id, grantedBy: 'demo-admin' },
      });
      const allowed = await storyRequest(slug);
      expect(allowed.status).toBe(200);
      expect(allowed.headers.get('cache-control')).toBe('no-store');
      expect((await allowed.json()).entity).toEqual({ kind: 'unit', id: unit.id });
      await db.offMarketGrant.deleteMany({ where: { userId: id } });
      const revoked = await storyRequest(slug);
      expect(revoked.status).toBe(404);
      expect(await revoked.text()).not.toContain(unit.id);
      const office = await entity(
        new Request(`http://localhost/api/v1/office/entity?kind=demo-unit&id=${unit.id}`),
      );
      expect(office.status).toBe(404);
    }));
  it('blocks direct writes for active privacy and cross-origin requests', () =>
    fixture(async (id) => {
      const input = { name: 'Bypass attempt', clientRequestId: randomUUID() };
      const request = (origin: string) =>
        new Request('http://localhost/api/v1/portfolios', {
          method: 'POST',
          headers: { origin, 'content-type': 'application/json' },
          body: JSON.stringify(input),
        });
      expect((await create(request('https://untrusted.example'))).status).toBe(403);
      await restrictClientPrivacy(id, { doNotSave: true });
      const blocked = await create(request('http://localhost'));
      expect(blocked.status).toBe(409);
      expect(await blocked.json()).toEqual({ error: 'privacy_restricted' });
      expect(await db.shortlist.count({ where: { userId: id } })).toBe(0);
    }));
});
