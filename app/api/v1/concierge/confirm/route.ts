import { confirmConciergeProposal } from '@/src/server/concierge/confirm';
import { failure, json, rateLimit, readJson, requireUser, sameOrigin } from '@/src/server/security';

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    rateLimit(`concierge-confirm:${user.id}`, 10);
    return json(await confirmConciergeProposal(user.id, await readJson(request)));
  } catch (error) {
    return failure(error);
  }
}
