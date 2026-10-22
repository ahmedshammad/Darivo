import { getClientPrivacy, replaceClientPrivacy } from '@/src/server/office/privacy';
import { readJson } from '@/src/server/security';
import { officeResponse, officeRequest } from '@/src/server/office/http';
export async function GET(req: Request) {
  return officeResponse(async () => getClientPrivacy((await officeRequest(req)).id));
}
export async function PATCH(req: Request) {
  return officeResponse(async () =>
    replaceClientPrivacy((await officeRequest(req, true)).id, await readJson(req)),
  );
}
