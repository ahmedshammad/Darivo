import { observed } from '@/src/server/observability';
import { searchProperties } from '@/src/server/db/properties';
import { db } from '@/src/server/db/client';
import { optionalUser, failure, json, rateLimit } from '@/src/server/security';
export async function GET(req: Request) {
  try {
    const user = await optionalUser();
    rateLimit(`search:${user?.id ?? 'anonymous'}`, 120);
    const filters = Object.fromEntries(new URL(req.url).searchParams);
    const result = await observed('search.query', () => searchProperties(filters, user));
    await db.analyticsEvent.create({ data: { kind: 'search', areaId: filters.community } });
    return json(result);
  } catch (e) {
    return failure(e);
  }
}
