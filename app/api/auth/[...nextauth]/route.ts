import type { NextRequest } from 'next/server';
import { handlers } from '@/auth';
import { failure, rateLimit } from '@/src/server/security';
export async function GET(req: NextRequest) {
  try {
    if (new URL(req.url).pathname.includes('/callback/')) rateLimit('auth:callback', 30);
    return await handlers.GET(req);
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    rateLimit('auth', 30);
    if (Number(req.headers.get('content-length')) > 16384)
      return Response.json({ error: 'payload_too_large' }, { status: 413 });
    return await handlers.POST(req);
  } catch (e) {
    return failure(e);
  }
}
