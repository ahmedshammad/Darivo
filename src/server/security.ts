import { z } from 'zod';
import { auth } from '@/auth';
import { db } from './db/client';
import type { Role } from '@prisma/client';
import { HttpError } from './errors';
export { HttpError } from './errors';
export async function requireUser(roles?: Role[]) {
  const session = await auth();
  const user = session?.user?.email
    ? await db.user.findUnique({ where: { email: session.user.email }, include: { profile: true } })
    : null;
  if (!user) throw new HttpError(401, 'unauthorized');
  if (roles && !roles.includes(user.role)) throw new HttpError(403, 'forbidden');
  return user;
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  const expected = new URL(process.env.AUTH_URL ?? req.url).origin;
  if (!origin || origin !== expected) throw new HttpError(403, 'origin_rejected');
}
export { rateLimit } from './rate-limit';
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error instanceof Error && error.message === 'not_found')
    return json({ error: 'not_found' }, 404);
  if (error instanceof Error && ['invalid_slots', 'intent_required'].includes(error.message))
    return json({ error: error.message }, 400);
  if (error instanceof SyntaxError) return json({ error: 'invalid_json' }, 400);
  if (error instanceof z.ZodError)
    return json({ error: 'invalid_input', fields: error.issues.map((i) => i.path.join('.')) }, 400);
  console.error(
    JSON.stringify({
      event: 'request_error',
      type: error instanceof Error ? error.name : 'unknown',
    }),
  );
  return json({ error: 'internal_error' }, 500);
}
export async function optionalUser() {
  const session = await auth();
  return session?.user?.email ? db.user.findUnique({ where: { email: session.user.email } }) : null;
}

export async function readJson(req: Request, maxBytes = 32768): Promise<unknown> {
  if (Number(req.headers.get('content-length')) > maxBytes)
    throw new HttpError(413, 'payload_too_large');
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, 'empty_body');
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, 'payload_too_large');
    }
    chunks.push(value);
  }
  const data = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(data));
}
