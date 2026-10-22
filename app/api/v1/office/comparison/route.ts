import { compareOfficeEntities } from '@/src/server/db/office';
import { readJson, sameOrigin } from '@/src/server/security';
import { officeResponse, officeRequest, officeQueryPreferences } from '@/src/server/office/http';
import { comparisonInputSchema } from '@/src/lib/office';
export async function POST(req: Request) {
  return officeResponse(async () => {
    sameOrigin(req);
    const viewer = await officeRequest(req);
    const { refs } = comparisonInputSchema.parse(await readJson(req));
    return compareOfficeEntities(refs, viewer, officeQueryPreferences(req));
  });
}
