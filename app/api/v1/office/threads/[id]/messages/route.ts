import { readThread, sendThreadMessage } from '@/src/server/db/office';
import { readJson, sameOrigin, requireUser, rateLimit } from '@/src/server/security';
import { officeResponse, officeQueryPreferences } from '@/src/server/office/http';
type Context = { params: Promise<{ id: string }> };
export async function GET(req: Request, ctx: Context) {
  return officeResponse(async () => {
    const viewer = await requireUser(['CLIENT', 'VERIFIED_CLIENT', 'ADVISOR']);
    rateLimit(`thread:read:${viewer.id}`, 180);
    return readThread(
      (await ctx.params).id,
      viewer,
      new URL(req.url).searchParams.get('cursor') ?? undefined,
      officeQueryPreferences(req),
    );
  });
}
export async function POST(req: Request, ctx: Context) {
  return officeResponse(async () => {
    sameOrigin(req);
    const viewer = await requireUser(['CLIENT', 'VERIFIED_CLIENT', 'ADVISOR']);
    rateLimit(`thread:write:${viewer.id}`, 40);
    return sendThreadMessage((await ctx.params).id, await readJson(req), viewer);
  }, 201);
}
