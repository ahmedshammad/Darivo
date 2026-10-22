import { z } from 'zod';
import { db } from '@/src/server/db/client';
import { readJson, requireUser, sameOrigin, failure, json, HttpError } from '@/src/server/security';
const profileSchema = z
  .object({
    language: z.enum(['en', 'ar']),
    currency: z.enum(['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP']),
    areaUnit: z.enum(['sqm', 'sqft']),
    timezone: z.enum(['Asia/Dubai', 'Africa/Cairo']),
    notifications: z.boolean(),
    consent: z.literal(true),
  })
  .strict();
export async function GET() {
  try {
    const user = await requireUser();
    return json({ email: user.email, verification: user.verification, profile: user.profile });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(req: Request) {
  try {
    sameOrigin(req);
    const user = await requireUser();
    const { consent, ...data } = profileSchema.parse(await readJson(req));
    if (!consent) throw new HttpError(400, 'consent_required');
    const profile = await db.clientProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data, consentAt: new Date() },
      update: { ...data, consentAt: user.profile?.consentAt ?? new Date() },
    });
    return json(profile);
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(req: Request) {
  try {
    sameOrigin(req);
    const user = await requireUser();
    await db.$transaction([
      db.auditLog.updateMany({ where: { actorId: user.id }, data: { actorId: 'deleted-account' } }),
      db.advisorNote.deleteMany({ where: { authorId: user.id } }),
      db.user.delete({ where: { id: user.id } }),
    ]);
    return json({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
