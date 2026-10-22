import { z } from 'zod';
import { db } from '@/src/server/db/client';
import { readJson, requireUser, sameOrigin, failure, json } from '@/src/server/security';
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(req);
    const user = await requireUser();
    const { name } = z
      .object({ name: z.string().trim().min(1).max(80) })
      .strict()
      .parse(await readJson(req));
    const result = await db.shortlist.updateMany({
      where: { id: (await params).id, userId: user.id },
      data: { name },
    });
    return json({ updated: result.count }, result.count ? 200 : 404);
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(req);
    const user = await requireUser(),
      id = (await params).id,
      propertyId = new URL(req.url).searchParams.get('property');
    const result = propertyId
      ? await db.shortlistItem.deleteMany({
          where: { shortlistId: id, propertyId, shortlist: { userId: user.id } },
        })
      : await db.shortlist.deleteMany({ where: { id, userId: user.id } });
    return json({ deleted: result.count }, result.count ? 200 : 404);
  } catch (e) {
    return failure(e);
  }
}
