import { optionalUser, failure, json } from '@/src/server/security';
import { getProperty } from '@/src/server/db/properties';
import { z } from 'zod';
export async function GET(req: Request) {
  try {
    const ids = z
      .array(z.string().max(100))
      .min(1)
      .max(4)
      .parse(new URL(req.url).searchParams.get('ids')?.split(','));
    const user = await optionalUser(),
      properties = [];
    for (const id of ids) {
      const p = await getProperty(id, user);
      if (!p) return json({ error: 'not_found' }, 404);
      properties.push(p);
    }
    return json(properties);
  } catch (e) {
    return failure(e);
  }
}
