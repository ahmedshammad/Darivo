import { resolveOfficeEntity, storySummary } from '@/src/server/db/story';
import { HttpError } from '@/src/server/security';
import { officeResponse, officeRequest, officeQueryPreferences } from '@/src/server/office/http';
import { officeEntityRefSchema } from '@/src/lib/office';
export async function GET(req: Request) {
  return officeResponse(async () => {
    const viewer = await officeRequest(req);
    const p = new URL(req.url).searchParams;
    const ref = officeEntityRefSchema.parse({ kind: p.get('kind'), id: p.get('id') });
    const result = await resolveOfficeEntity(ref, viewer, officeQueryPreferences(req));
    if (!result) throw new HttpError(404, 'not_found');
    return storySummary(result);
  });
}
