import { listPortfolios, createPortfolio } from '@/src/server/db/office';
import { readJson } from '@/src/server/security';
import { officeResponse, officeRequest, officeQueryPreferences } from '@/src/server/office/http';
export async function GET(req: Request) {
  return officeResponse(async () =>
    listPortfolios(await officeRequest(req), officeQueryPreferences(req)),
  );
}
export async function POST(req: Request) {
  return officeResponse(
    async () => createPortfolio(await readJson(req), await officeRequest(req, true)),
    201,
  );
}
