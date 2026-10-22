import { db } from '@/src/server/db/client';
import { readJson, requireUser, sameOrigin, failure, json } from '@/src/server/security';
import { briefSchema } from '@/src/server/ai/schema';
export async function GET() {
  try {
    const user = await requireUser();
    return json(
      (await db.clientBrief.findUnique({ where: { userId: user.id } }))?.data ?? { filters: {} },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(req: Request) {
  try {
    sameOrigin(req);
    const user = await requireUser();
    const brief = briefSchema.parse(await readJson(req)),
      data = JSON.parse(JSON.stringify(brief));
    await db.clientBrief.upsert({
      where: { userId: user.id },
      create: { userId: user.id, data },
      update: { data },
    });
    return json(brief);
  } catch (e) {
    return failure(e);
  }
}
