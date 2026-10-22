import { readJson, requireUser, sameOrigin, failure, json } from '@/src/server/security';
import { executeTool } from '@/src/server/ai/tools';
import { scopedShortlists } from '@/src/server/db/workflows';
export async function GET() {
  try {
    return json(await scopedShortlists(await requireUser()));
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const user = await requireUser();
    return json(
      await executeTool({ name: 'save_to_shortlist', arguments: await readJson(req) }, user),
      201,
    );
  } catch (e) {
    return failure(e);
  }
}
