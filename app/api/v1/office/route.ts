import { getOfficeOverview } from '@/src/server/db/office';
import { officeResponse, officeRequest, officeQueryPreferences } from '@/src/server/office/http';
export async function GET(req: Request) {
  return officeResponse(async () =>
    getOfficeOverview(await officeRequest(req), officeQueryPreferences(req)),
  );
}
