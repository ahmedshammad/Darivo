import { db } from '@/src/server/db/client';
import { getProperty } from '@/src/server/db/properties';
import { readJson, requireUser, sameOrigin, failure, json } from '@/src/server/security';
import { executeTool } from '@/src/server/ai/tools';
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    return json(
      await executeTool(
        { name: 'request_viewing', arguments: await readJson(req) },
        await requireUser(),
      ),
      201,
    );
  } catch (e) {
    return failure(e);
  }
}
export async function GET() {
  try {
    const user = await requireUser(),
      viewings = await db.viewingRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
      result = [];
    for (const viewing of viewings) {
      const property = await getProperty(viewing.propertyId, user);
      if (property) result.push({ ...viewing, property });
    }
    return json(result);
  } catch (e) {
    return failure(e);
  }
}
