import { getPrivateCollection } from '@/src/server/db/office';
import { officeResponse, officeRequest, officeQueryPreferences } from '@/src/server/office/http';
export async function GET(req: Request) {
  return officeResponse(async () =>
    getPrivateCollection(await officeRequest(req), officeQueryPreferences(req)),
  );
}
