import { displayPreferencesSchema } from '@/src/lib/preferences';
import { db } from '@/src/server/db/client';
import { failure, json, readJson, requireUser, sameOrigin } from '@/src/server/security';

export async function PATCH(req: Request) {
  try {
    sameOrigin(req);
    const user = await requireUser();
    const data = displayPreferencesSchema.parse(await readJson(req));
    const profile = await db.clientProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });
    return json({
      currency: profile.currency,
      areaUnit: profile.areaUnit,
      arabicIndicDigits: profile.arabicIndicDigits,
    });
  } catch (error) {
    return failure(error);
  }
}
