import { db } from '@/src/server/db/client';
import { searchProperties } from '@/src/server/db/properties';
import { readJson, requireUser, sameOrigin, failure, json, HttpError } from '@/src/server/security';
import { adminWrite, adminDelete } from '@/src/server/admin';
import { z } from 'zod';
export async function GET(req: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const user = await requireUser(['ADMIN']),
      { resource } = await params;
    switch (resource) {
      case 'properties':
        return json(
          await searchProperties(
            { limit: 24, q: new URL(req.url).searchParams.get('q') ?? '' },
            user,
          ),
        );
      case 'developers':
        return json(await db.developer.findMany({ where: { kind: 'DEMO' } }));
      case 'communities':
        return json(await db.community.findMany({ include: { city: true } }));
      case 'media':
        return json(await db.propertyMedia.findMany({ take: 500 }));
      case 'users':
        return json(
          await db.user.findMany({
            select: { id: true, name: true, email: true, role: true, verification: true },
          }),
        );
      case 'audit':
        return json(await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }));
      case 'analytics': {
        const [events, areas, properties, users] = await Promise.all([
          db.analyticsEvent.groupBy({ by: ['kind'], _count: true }),
          db.analyticsEvent.groupBy({
            by: ['areaId'],
            where: { areaId: { not: null } },
            _count: true,
            orderBy: { _count: { areaId: 'desc' } },
            take: 5,
          }),
          db.property.count(),
          db.user.count(),
        ]);
        return json({ events, areas, properties, users });
      }
      default:
        throw new HttpError(404, 'not_found');
    }
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    sameOrigin(req);
    const user = await requireUser(['ADMIN']);
    return json(await adminWrite((await params).resource, await readJson(req), user.id));
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    sameOrigin(req);
    const user = await requireUser(['ADMIN']);
    const id = z.string().min(1).max(100).parse(new URL(req.url).searchParams.get('id'));
    return json(await adminDelete((await params).resource, id, user.id));
  } catch (e) {
    return failure(e);
  }
}
