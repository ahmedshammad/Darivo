import { observed } from '@/src/server/observability';
import { z } from 'zod';
import { db } from '@/src/server/db/client';
import { readJson, requireUser, sameOrigin, rateLimit, failure, json } from '@/src/server/security';
import { consult, saveTurn } from '@/src/server/ai/consultant';
import { briefSchema } from '@/src/server/ai/schema';
import { getProperty } from '@/src/server/db/properties';
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const user = await requireUser();
    rateLimit(`chat:${user.id}`, 20);
    const input = z
      .object({ message: z.string().trim().min(1).max(4000), locale: z.enum(['en', 'ar']) })
      .strict()
      .parse(await readJson(req));
    const existing = await db.clientBrief.findUnique({ where: { userId: user.id } });
    const parsed = briefSchema.safeParse(existing?.data);
    const previous = parsed.success ? parsed.data : { filters: {} };
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) =>
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        try {
          send({ type: 'status', key: 'loading' });
          const reply = await observed('consultant.turn', () =>
            consult(input.message, user, input.locale, previous),
          );
          await saveTurn(user.id, input.message, reply);
          send({ type: 'brief', brief: reply.brief });
          for (const chunk of reply.text.match(/.{1,48}|\n/g) ?? [])
            send({ type: 'text', text: chunk });
          send({ type: 'properties', properties: reply.properties });
          send({
            type: 'results',
            results: reply.results.filter((r) => r.kind === 'insights' || r.kind === 'investment'),
          });
          send({ type: 'done', kind: reply.kind });
        } catch {
          send({ type: 'error', key: 'chatError' });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function GET() {
  try {
    const user = await requireUser();
    const conversation = await db.consultantConversation.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 100 } },
    });
    const messages = [];
    for (const m of conversation?.messages ?? []) {
      const content = z
        .object({
          text: z.string(),
          propertyIds: z.array(z.string()).optional(),
          results: z
            .array(
              z.object({
                kind: z.enum(['insights', 'investment']),
                data: z.record(z.string(), z.unknown()),
              }),
            )
            .optional(),
        })
        .parse(m.content);
      const properties = await Promise.all(
        (content.propertyIds ?? []).map((id) => getProperty(id, user)),
      );
      messages.push({
        id: m.id,
        role: m.role,
        text: content.text,
        properties: properties.filter(Boolean),
        results: !content.propertyIds?.length || properties.some(Boolean) ? content.results : [],
      });
    }
    const brief = await db.clientBrief.findUnique({ where: { userId: user.id } });
    return json({ messages, brief: brief?.data ?? { filters: {} } });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(req: Request) {
  try {
    sameOrigin(req);
    const user = await requireUser();
    await db.consultantConversation.deleteMany({ where: { userId: user.id } });
    return json({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
