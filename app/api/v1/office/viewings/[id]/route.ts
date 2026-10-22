import { cancelViewing } from '@/src/server/db/office';
import { officeResponse, officeRequest } from '@/src/server/office/http';
type Context = { params: Promise<{ id: string }> };
export async function DELETE(req: Request, ctx: Context) {
  return officeResponse(async () =>
    cancelViewing((await ctx.params).id, await officeRequest(req, true)),
  );
}
