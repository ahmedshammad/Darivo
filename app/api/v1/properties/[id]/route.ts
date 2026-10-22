import { getProperty } from '@/src/server/db/properties';
import { optionalUser, failure, json, rateLimit } from '@/src/server/security';
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await optionalUser();
    rateLimit(`property:${user?.id ?? 'anonymous'}`, 120);
    const p = await getProperty((await params).id, user);
    return p ? json(p) : json({ error: 'not_found' }, 404);
  } catch (e) {
    return failure(e);
  }
}
