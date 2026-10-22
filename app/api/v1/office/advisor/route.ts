import { getMyAdvisor } from '@/src/server/db/office';
import { officeResponse, officeRequest } from '@/src/server/office/http';
export async function GET(req: Request) {
  return officeResponse(async () => getMyAdvisor(await officeRequest(req)));
}
