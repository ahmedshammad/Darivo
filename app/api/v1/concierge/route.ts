import { getClientPrivacy, restrictClientPrivacy } from '@/src/server/office/privacy';
import { HttpError } from '@/src/server/errors';
import { randomUUID } from 'node:crypto';
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { conciergeRequestSchema, type ConciergeUIMessage } from '@/src/lib/concierge-transport';
import { conciergeStreamEventSchema, type ConciergeStreamEvent } from '@/src/lib/concierge';
import {
  failure,
  json,
  optionalUser,
  rateLimit,
  readJson,
  requireUser,
  sameOrigin,
} from '@/src/server/security';
import { applyConciergeBriefPatch } from '@/src/server/concierge/brief';
import { runConciergeTurn } from '@/src/server/concierge/engine';
import { rehydrateConciergeComponents, resolveCard } from '@/src/server/concierge/grounding';
import { extractConciergePrivacy, MockConciergeProvider } from '@/src/server/concierge/mock-parser';
import {
  SDKConciergeProvider,
  permitsExternalConciergeProcessing,
} from '@/src/server/concierge/provider';
import { captureConsentedTaste } from '@/src/server/concierge/taste';
import {
  deleteConciergeHistory,
  emptyReplay,
  loadConciergeSession,
  persistConciergeTurn,
  reserveConciergeTurn,
  updateConciergeMemory,
} from '@/src/server/concierge/persistence';

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const viewer = await optionalUser();
    rateLimit(`concierge:${viewer?.id ?? 'public'}`, viewer ? 30 : 60);
    const input = conciergeRequestSchema.parse(await readJson(request, 65536));
    const restrictions = extractConciergePrivacy(input.message);
    // Persist restrictive policy before leases, cancellation, or external processing.
    // Never re-import stale snapshot flags after the owner explicitly clears settings.
    let policy = viewer ? await restrictClientPrivacy(viewer.id, restrictions) : null;
    if (viewer && input.patch) {
      const restrictive: Record<string, boolean> = {};
      for (const operation of input.patch.operations) {
        if (operation.op === 'privacy.restrict')
          for (const key of operation.flags) if (key !== 'discreet') restrictive[key] = true;
        if (operation.op === 'privacy.replace') {
          for (const key of ['doNotSave', 'doNotShare', 'doNotBook'] as const) {
            if (policy?.[key] && !operation.value[key])
              throw new HttpError(409, 'privacy_settings_required');
            if (operation.value[key]) restrictive[key] = true;
          }
        }
      }
      policy = await restrictClientPrivacy(viewer.id, restrictive);
    }
    const lease = viewer
      ? await reserveConciergeTurn(viewer.id, input.conversationId, input.requestId, input.brief)
      : null;
    const previous = lease?.snapshot ?? emptyReplay(input.conversationId);
    // A supplied Brief is preference data, never evidence of memory consent.
    let brief = { ...input.brief, tasteMemory: previous.brief.tasteMemory };
    if (policy)
      brief.privacy = {
        ...brief.privacy,
        doNotSave: policy.doNotSave,
        doNotShare: policy.doNotShare,
        doNotBook: policy.doNotBook,
      };
    if (input.patch) brief = applyConciergeBriefPatch(brief, input.patch, 'user');
    if (restrictions.restrictMemory)
      brief.tasteMemory = {
        consent: ['granted', 'revoked'].includes(brief.tasteMemory.consent)
          ? 'revoked'
          : 'declined',
        consentedAt: null,
        items: [],
      };
    if (
      viewer &&
      lease &&
      (restrictions.restrictMemory ||
        input.patch?.operations.some(
          (operation) => operation.op === 'memory.replace' || operation.op === 'memory.restrict',
        ))
    ) {
      await updateConciergeMemory({
        userId: viewer.id,
        sessionId: lease.sessionId,
        version: lease.version,
        snapshot: previous,
        memory: brief.tasteMemory,
      });
    }
    const priorEntities: typeof input.priorEntities = [];
    for (const entity of input.priorEntities)
      if (await resolveCard(entity, viewer, brief)) priorEntities.push(entity);
    const turnId = randomUUID();
    const controller = new AbortController();
    const disconnected = () => controller.abort(request.signal.reason);
    request.signal.addEventListener('abort', disconnected, { once: true });
    if (request.signal.aborted) disconnected();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(60000)]);
    const stream = createUIMessageStream<ConciergeUIMessage>({
      onError: () => 'concierge_failed',
      async execute({ writer }) {
        let sequence = -1;
        let completion: ConciergeStreamEvent | null = null;
        const write = (value: ConciergeStreamEvent) => {
          if (signal.aborted) return;
          const event = conciergeStreamEventSchema.parse(value);
          sequence = Math.max(sequence, event.sequence);
          writer.write({ type: 'data-concierge', id: event.id, data: event, transient: true });
        };
        writer.write({ type: 'start', messageId: turnId });
        try {
          const provider =
            process.env.AI_PROVIDER === 'openai' &&
            process.env.OPENAI_API_KEY &&
            permitsExternalConciergeProcessing(brief, restrictions)
              ? new SDKConciergeProvider()
              : new MockConciergeProvider();
          const result = await runConciergeTurn(
            {
              message: input.message,
              brief,
              viewer,
              locale: input.locale,
              conversationId: input.conversationId,
              turnId,
              requestId: input.requestId,
              signal,
              provider,
              priorEntities,
            },
            (event) => {
              if (event.type === 'turn.completed') completion = event;
              else write(event);
            },
          );
          if (viewer && lease && result.status === 'complete' && !signal.aborted) {
            const remembered = captureConsentedTaste(result.brief, input.message);
            if (
              JSON.stringify(remembered.tasteMemory) !== JSON.stringify(result.brief.tasteMemory)
            ) {
              result.brief = remembered;
              write({
                version: 1,
                id: randomUUID(),
                conversationId: input.conversationId,
                turnId,
                requestId: input.requestId,
                sequence: sequence + 1,
                createdAt: new Date().toISOString(),
                type: 'brief.updated',
                brief: result.brief,
              });
            }
            const saved = await persistConciergeTurn({
              userId: viewer.id,
              sessionId: lease.sessionId,
              version: lease.version,
              signal,
              proposals: result.proposals,
              snapshot: {
                ...previous,
                brief: result.brief,
                turns: [
                  ...previous.turns,
                  {
                    id: turnId,
                    requestId: input.requestId,
                    userText: input.message,
                    assistantText: result.text,
                    responseLanguage: result.responseLanguage,
                    components: result.components,
                    status: 'complete' as const,
                    briefRevision: result.brief.revision,
                    createdAt: new Date().toISOString(),
                  },
                ].slice(-100),
              },
            });
            if (!saved && !result.brief.privacy.doNotSave && !signal.aborted) {
              completion = null;
              write({
                version: 1,
                id: randomUUID(),
                conversationId: input.conversationId,
                turnId,
                requestId: input.requestId,
                sequence: sequence + 1,
                createdAt: new Date().toISOString(),
                type: 'turn.error',
                code: 'STALE_BRIEF',
                retryable: true,
              });
            }
          }
          if (completion)
            write({ ...(completion as ConciergeStreamEvent), sequence: sequence + 1 });
        } catch {
          if (!signal.aborted)
            write({
              version: 1,
              id: randomUUID(),
              conversationId: input.conversationId,
              turnId,
              requestId: input.requestId,
              sequence: sequence + 1,
              createdAt: new Date().toISOString(),
              type: 'turn.error',
              code: 'TOOL_FAILED',
              retryable: true,
            });
        } finally {
          request.signal.removeEventListener('abort', disconnected);
          writer.write({ type: 'finish' });
        }
      },
    });
    // Propagate a cancelled SSE reader even when the host does not abort Request.signal.
    const reader = stream.getReader();
    const cancellable = new ReadableStream({
      async pull(output) {
        const chunk = await reader.read();
        if (chunk.done) output.close();
        else output.enqueue(chunk.value);
      },
      async cancel(reason) {
        controller.abort(reason);
        await reader.cancel(reason);
      },
    });
    return createUIMessageStreamResponse({
      stream: cancellable,
      headers: { 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' },
    });
  } catch (error) {
    return failure(error);
  }
}

export async function GET() {
  try {
    const viewer = await requireUser();
    const { snapshot } = await loadConciergeSession(viewer.id);
    const policy = await getClientPrivacy(viewer.id);
    snapshot.brief.privacy = {
      ...snapshot.brief.privacy,
      doNotSave: policy.doNotSave,
      doNotShare: policy.doNotShare,
      doNotBook: policy.doNotBook,
    };
    const turns = [];
    for (const turn of snapshot.turns) {
      const components = await rehydrateConciergeComponents(
        turn.components,
        viewer,
        snapshot.brief,
      );
      turns.push({ ...turn, components });
    }
    return json({ ...snapshot, turns, applyActions: false });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const viewer = await requireUser();
    await deleteConciergeHistory(viewer.id);
    const { snapshot } = await loadConciergeSession(viewer.id);
    const policy = await getClientPrivacy(viewer.id);
    snapshot.brief.privacy = {
      ...snapshot.brief.privacy,
      doNotSave: policy.doNotSave,
      doNotShare: policy.doNotShare,
      doNotBook: policy.doNotBook,
    };
    return json(snapshot);
  } catch (error) {
    return failure(error);
  }
}
