import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { db } from '@/src/server/db/client';
import { HttpError } from '@/src/server/errors';
import {
  conciergeReplaySchema,
  emptyConciergeBrief,
  type ConciergeReplay,
  type ConciergeBrief,
  type WriteProposal,
} from '@/src/lib/concierge';

const asJson = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export function emptyReplay(conversationId: string = randomUUID()): ConciergeReplay {
  return {
    version: 1,
    conversationId,
    mode: 'snapshot',
    applyActions: false,
    brief: emptyConciergeBrief(),
    turns: [],
    cursor: null,
  };
}
export async function loadConciergeSession(userId: string) {
  const initial = emptyReplay();
  const row = await db.conciergeSession.upsert({
    where: { userId },
    update: {},
    create: { id: initial.conversationId, userId, snapshot: asJson(initial) },
  });
  return { row, snapshot: conciergeReplaySchema.parse(row.snapshot) };
}
export async function reserveConciergeTurn(
  userId: string,
  conversationId: string,
  requestId: string,
  brief: ConciergeBrief,
) {
  const { row, snapshot } = await loadConciergeSession(userId);
  if (row.id !== conversationId) throw new HttpError(409, 'history_changed');
  if (snapshot.turns.some((turn) => turn.requestId === requestId))
    throw new HttpError(409, 'request_already_completed');
  // An unsaved private conversation can have a newer in-memory revision; it may
  // never roll stored state backwards. Preferences are not authorization claims.
  if (brief.revision < snapshot.brief.revision) throw new HttpError(409, 'stale_brief');
  const result = await db.$transaction(async (tx) => {
    const claimed = await tx.conciergeSession.updateMany({
      where: { id: row.id, userId, version: row.version },
      data: { version: { increment: 1 } },
    });
    if (!claimed.count) throw new HttpError(409, 'concurrent_turn');
    // A proposal belongs to the context in which it was reviewed. A new turn
    // invalidates outstanding drafts; confirmation cannot use stale privacy.
    await tx.conciergeProposal.deleteMany({ where: { sessionId: row.id, status: 'PENDING' } });
    return { sessionId: row.id, version: row.version + 1, snapshot };
  });
  return result;
}
export async function persistConciergeTurn(input: {
  userId: string;
  sessionId: string;
  version: number;
  snapshot: ConciergeReplay;
  proposals: WriteProposal[];
  signal?: AbortSignal;
}) {
  if (input.signal?.aborted || input.snapshot.brief.privacy.doNotSave) return false;
  const parsed = conciergeReplaySchema.parse(input.snapshot);
  return db.$transaction(async (tx) => {
    if (input.signal?.aborted) return false;
    const updated = await tx.conciergeSession.updateMany({
      where: { id: input.sessionId, userId: input.userId, version: input.version },
      data: { snapshot: asJson(parsed) },
    });
    input.signal?.throwIfAborted();
    if (!updated.count) return false;
    for (const proposal of input.proposals) {
      await tx.conciergeProposal.create({
        data: {
          id: proposal.id,
          sessionId: input.sessionId,
          data: asJson(proposal),
          expiresAt: new Date(proposal.expiresAt),
        },
      });
      input.signal?.throwIfAborted();
    }
    input.signal?.throwIfAborted();
    return true;
  });
}
export async function deleteConciergeHistory(userId: string) {
  // Cascades proposals. A late response updates by ID/version and cannot recreate it.
  await db.conciergeSession.deleteMany({ where: { userId } });
}

/** Explicit memory controls are independent of saving this conversation. */
export async function updateConciergeMemory(input: {
  userId: string;
  sessionId: string;
  version: number;
  snapshot: ConciergeReplay;
  memory: ConciergeBrief['tasteMemory'];
}) {
  const snapshot = conciergeReplaySchema.parse({
    ...input.snapshot,
    brief: { ...input.snapshot.brief, tasteMemory: input.memory },
  });
  const result = await db.conciergeSession.updateMany({
    where: { id: input.sessionId, userId: input.userId, version: input.version },
    data: { snapshot: asJson(snapshot) },
  });
  if (!result.count) throw new HttpError(409, 'context_changed');
  input.snapshot.brief.tasteMemory = snapshot.brief.tasteMemory;
}
