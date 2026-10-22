import { readJson, requireUser, sameOrigin, failure, json } from '@/src/server/security';
import { changeGrant } from '@/src/server/grants';
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    return json(await changeGrant(await requireUser(['ADVISOR', 'ADMIN']), await readJson(req)));
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(req: Request) {
  try {
    sameOrigin(req);
    return json(
      await changeGrant(await requireUser(['ADVISOR', 'ADMIN']), await readJson(req), true),
    );
  } catch (e) {
    return failure(e);
  }
}
