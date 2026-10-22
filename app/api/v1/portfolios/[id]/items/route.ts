import { changePortfolioItems } from '@/src/server/db/office';
import { readJson } from '@/src/server/security';
import { officeResponse, officeRequest } from '@/src/server/office/http';
type Context = { params: Promise<{ id: string }> };
export async function POST(req: Request, ctx: Context) {
  return officeResponse(async () =>
    changePortfolioItems(
      (await ctx.params).id,
      await readJson(req),
      await officeRequest(req, true),
    ),
  );
}
export async function DELETE(req: Request, ctx: Context) {
  return officeResponse(async () =>
    changePortfolioItems(
      (await ctx.params).id,
      await readJson(req),
      await officeRequest(req, true),
      true,
    ),
  );
}
