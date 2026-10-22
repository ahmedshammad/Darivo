import { z } from 'zod';
import { db } from '@/src/server/db/client';
import { readJson, requireUser, sameOrigin, failure, json, HttpError } from '@/src/server/security';
import { advisorInbox } from '@/src/server/advisor';
import { executeTool } from '@/src/server/ai/tools';
const input = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('note'),
      clientId: z.string(),
      content: z.string().trim().min(1).max(2000),
    })
    .strict(),
  z
    .object({
      action: z.literal('suggest'),
      clientId: z.string(),
      propertyId: z.string(),
      shortlistName: z.string().trim().min(1).max(80),
    })
    .strict(),
  z
    .object({
      action: z.literal('viewing'),
      id: z.string(),
      status: z.enum(['CONFIRMED', 'DECLINED', 'CANCELLED']),
    })
    .strict(),
  z
    .object({ action: z.literal('handoff'), id: z.string(), status: z.enum(['OPEN', 'RESOLVED']) })
    .strict(),
]);
export async function GET() {
  try {
    await requireUser(['ADVISOR', 'ADMIN']);
    return json(await advisorInbox());
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const user = await requireUser(['ADVISOR', 'ADMIN']),
      a = input.parse(await readJson(req));
    if (a.action === 'note' || a.action === 'suggest') {
      const client = await db.user.findFirst({
        where: { id: a.clientId, role: { in: ['CLIENT', 'VERIFIED_CLIENT'] } },
      });
      if (!client) throw new HttpError(404, 'not_found');
      if (a.action === 'note')
        await db.advisorNote.create({
          data: { clientId: client.id, authorId: user.id, content: a.content },
        });
      else
        await executeTool(
          {
            name: 'save_to_shortlist',
            arguments: { property_ids: [a.propertyId], shortlist_name: a.shortlistName },
          },
          client,
        );
    } else if (a.action === 'viewing')
      await db.viewingRequest.update({ where: { id: a.id }, data: { status: a.status } });
    else await db.handoff.update({ where: { id: a.id }, data: { status: a.status } });
    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: `ADVISOR_${a.action.toUpperCase()}`,
        targetId: 'clientId' in a ? a.clientId : a.id,
      },
    });
    return json({ saved: true });
  } catch (e) {
    return failure(e);
  }
}
