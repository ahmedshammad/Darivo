import { db } from '@/src/server/db/client';
import { advisorAvailabilitySchema } from '@/src/lib/office';
import { requireUser, sameOrigin, readJson, rateLimit, HttpError } from '@/src/server/security';
import { officeResponse } from '@/src/server/office/http';
import { z } from 'zod';
const input = z.object({ availability: advisorAvailabilitySchema }).strict();
export async function PATCH(req: Request) {
  return officeResponse(async () => {
    sameOrigin(req);
    const user = await requireUser(['ADVISOR']);
    rateLimit(`availability:${user.id}`, 20);
    const value = input.parse(await readJson(req));
    const result = await db.advisor.updateMany({
      where: { userId: user.id },
      data: { availability: value.availability, availabilityUpdatedAt: new Date() },
    });
    if (!result.count) throw new HttpError(404, 'not_found');
    return { updated: true };
  });
}
