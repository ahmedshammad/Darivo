import { Prisma, type User } from '@prisma/client';
import { z } from 'zod';
import { db } from './client';
import { embedText, embeddingSource } from '../search/provider';
import { FX } from '@/src/lib/catalog';
import { canAccessVerifiedInventory, isClientRole, isStaffRole } from '../auth/roles';
export type Viewer = Pick<User, 'id' | 'role' | 'verification'> | null;
export function visibilityWhere(user: Viewer): Prisma.PropertyWhereInput {
  if (user && isStaffRole(user.role)) return {};
  if (!user || !isClientRole(user.role)) return { visibility: 'PUBLIC' };
  return {
    OR: [
      { visibility: 'PUBLIC' },
      ...(canAccessVerifiedInventory(user) ? [{ visibility: 'VERIFIED_ONLY' as const }] : []),
      ...(user
        ? [{ visibility: 'PRIVATE_INVITE' as const, grants: { some: { userId: user.id } } }]
        : []),
    ],
  };
}
export async function currentViewer(user: Viewer): Promise<Viewer> {
  return user
    ? db.user.findUnique({
        where: { id: user.id },
        select: { id: true, role: true, verification: true },
      })
    : null;
}
export const filterSchema = z
  .object({
    country: z.enum(['AE', 'EG']).optional(),
    city: z.string().max(60).optional(),
    community: z.string().max(60).optional(),
    type: z.enum(['apartment', 'villa', 'townhouse', 'penthouse', 'plot', 'mansion']).optional(),
    bedrooms: z.coerce.number().int().min(0).max(20).optional(),
    minPrice: z.coerce.number().min(0).max(1e10).optional(),
    maxPrice: z.coerce.number().min(0).max(1e10).optional(),
    minSize: z.coerce.number().min(0).max(1e6).optional(),
    maxSize: z.coerce.number().min(0).max(1e6).optional(),
    currency: z.enum(['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP']).default('AED'),
    status: z.enum(['ready', 'off_plan']).optional(),
    view: z.enum(['sea', 'garden', 'city']).optional(),
    furnishing: z.enum(['furnished', 'unfurnished']).optional(),
    branded: z.enum(['true', 'false']).optional(),
    goldenVisa: z.enum(['true', 'false']).optional(),
    amenities: z
      .array(z.enum(['private_pool', 'school', 'gym', 'beach', 'concierge', 'security']))
      .optional(),
    q: z.string().max(500).optional(),
    sort: z.enum(['curated', 'price_asc', 'price_desc', 'area_desc']).default('curated'),
    limit: z.coerce.number().int().min(1).max(24).default(12),
  })
  .strict();
export type Filters = z.infer<typeof filterSchema>;
export const propertyInclude = {
  translations: true,
  media: { orderBy: { position: 'asc' as const } },
  community: { include: { city: { include: { country: true } }, insight: true } },
  developer: true,
  paymentPlan: true,
} satisfies Prisma.PropertyInclude;
type RecordProperty = Prisma.PropertyGetPayload<{ include: typeof propertyInclude }>;
export function serializeProperty(p: RecordProperty) {
  return {
    ...p,
    priceMinor: p.priceMinor.toString(),
    lastVerifiedAt: p.lastVerifiedAt.toISOString(),
    handoverDate: p.handoverDate?.toISOString() ?? null,
    goldenVisa:
      p.community.city.countryId === 'AE' &&
      p.priceAed >= Number(process.env.GOLDEN_VISA_AED ?? 2000000),
  };
}
export type PropertyDTO = ReturnType<typeof serializeProperty>;
export async function getProperty(id: string, user: Viewer) {
  z.string().min(1).max(144).parse(id);
  const viewer = await currentViewer(user);
  const p = await db.property.findFirst({
    where: { AND: [{ OR: [{ id }, { slug: id }] }, visibilityWhere(viewer)] },
    include: propertyInclude,
  });
  if (p?.visibility !== 'PUBLIC' && p && viewer)
    await db.auditLog.create({
      data: { actorId: viewer.id, action: 'PRIVATE_PROPERTY_READ', targetId: p.id },
    });
  return p ? serializeProperty(p) : null;
}
export async function searchProperties(input: unknown, user: Viewer) {
  const viewer = await currentViewer(user);
  const f = filterSchema.parse(input),
    rate = FX[f.currency];
  const where: Prisma.PropertyWhereInput = {
    AND: [visibilityWhere(viewer)],
    ...(f.country || f.city
      ? {
          community: {
            city: {
              ...(f.country ? { countryId: f.country } : {}),
              ...(f.city ? { id: f.city } : {}),
            },
          },
        }
      : {}),
    ...(f.community ? { communityId: f.community } : {}),
    ...(f.type ? { type: f.type } : {}),
    ...(f.bedrooms !== undefined ? { bedrooms: f.bedrooms } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.view ? { view: f.view } : {}),
    ...(f.furnishing ? { furnishing: f.furnishing } : {}),
    ...(f.branded ? { branded: f.branded === 'true' } : {}),
    ...(f.amenities?.length ? { amenities: { hasEvery: f.amenities } } : {}),
    areaSqm: { gte: f.minSize, lte: f.maxSize },
    priceAed: {
      gte: f.minPrice === undefined ? undefined : f.minPrice / rate,
      lte: f.maxPrice === undefined ? undefined : f.maxPrice / rate,
    },
  };
  if (f.goldenVisa === 'true') {
    (where.AND as Prisma.PropertyWhereInput[]).push({
      community: { city: { countryId: 'AE' } },
      priceAed: { gte: Number(process.env.GOLDEN_VISA_AED ?? 2000000) },
    });
  }
  const rows = await db.property.findMany({
    where,
    include: propertyInclude,
    orderBy:
      f.sort === 'price_asc'
        ? { priceAed: 'asc' }
        : f.sort === 'price_desc'
          ? { priceAed: 'desc' }
          : f.sort === 'area_desc'
            ? { areaSqm: 'desc' }
            : { id: 'asc' },
    take: 500,
  });
  if (f.q && rows.length && f.sort === 'curated') {
    const ids = rows.map((p) => p.id),
      vector = JSON.stringify(await embedText(f.q));
    const ranked = await db.$queryRaw<{ id: string; score: number }[]>(
      Prisma.sql`SELECT p.id, CASE WHEN p."embeddingSource"=${embeddingSource()} THEN COALESCE(1-(p.embedding <=> ${vector}::vector),0) ELSE 0 END + COALESCE((SELECT max(ts_rank(to_tsvector('simple',t.title || ' ' || t.description),plainto_tsquery('simple',${f.q}))) FROM "PropertyTranslation" t WHERE t."propertyId"=p.id),0) AS score FROM "Property" p WHERE p.id IN (${Prisma.join(ids)}) ORDER BY score DESC, p.id ASC`,
    );
    const order = new Map(ranked.map((r, i) => [r.id, i]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }
  return { properties: rows.slice(0, f.limit).map(serializeProperty), total: rows.length };
}
