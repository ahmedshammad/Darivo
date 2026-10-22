import { getPortfolio, renamePortfolio, deletePortfolio } from '@/src/server/db/office';
import { readJson, HttpError } from '@/src/server/security';
import { officeResponse, officeRequest, officeQueryPreferences } from '@/src/server/office/http';
type Context = { params: Promise<{ id: string }> };
export async function GET(req: Request, ctx: Context) {
  return officeResponse(async () => {
    const result = await getPortfolio(
      (await ctx.params).id,
      await officeRequest(req),
      officeQueryPreferences(req),
    );
    if (!result) throw new HttpError(404, 'not_found');
    return result;
  });
}
export async function PATCH(req: Request, ctx: Context) {
  return officeResponse(async () =>
    renamePortfolio((await ctx.params).id, await readJson(req), await officeRequest(req, true)),
  );
}
export async function DELETE(req: Request, ctx: Context) {
  return officeResponse(async () =>
    deletePortfolio((await ctx.params).id, await officeRequest(req, true)),
  );
}
