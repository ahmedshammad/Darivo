'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { z } from 'zod';
import {
  briefPatchSchema,
  conciergeReplaySchema,
  conciergeStreamEventSchema,
  writeProposalSchema,
  type BriefPatch,
  type ConciergeAction,
  type ConciergeEntityRef,
} from '@/src/lib/concierge';
import {
  initialConciergeState,
  reduceConciergeEvent,
  replaySelection,
  type ClientTurn,
} from '@/src/lib/concierge-client-state';
import type { ConciergeRequest, ConciergeUIMessage } from '@/src/lib/concierge-transport';

const transport = new DefaultChatTransport<ConciergeUIMessage>({
  api: '/api/v1/concierge',
  prepareSendMessagesRequest: ({ body }) => ({ body: body ?? {} }),
});
export type ConciergeStatus = 'loading-history' | 'idle' | 'submitted' | 'streaming' | 'error';
export function useConcierge({
  locale,
  guest,
  onAction,
  initialSelection,
}: {
  locale: 'en' | 'ar';
  guest: boolean;
  initialDraft?: string;
  initialSelection?: ConciergeEntityRef;
  onAction?: (action: ConciergeAction) => void;
}) {
  const [state, setState] = useState(initialConciergeState);
  const [loadingHistory, setLoadingHistory] = useState(!guest);
  const [historyAttempt, setHistoryAttempt] = useState(0);
  const [proposals, setProposals] = useState<z.infer<typeof writeProposalSchema>[]>([]);
  const briefRef = useRef(state.brief);
  const conversation = useRef<string | null>(null);
  const active = useRef<string | null>(null);
  const sequence = useRef(-1);
  const epoch = useRef(0);
  const submissions = useRef(0);
  const lastRequest = useRef<{ message: string; patch?: BriefPatch } | null>(null);
  const actions = useRef(new Set<string>());
  const initialSelectionRef = useRef(initialSelection);
  const priorEntities = useRef<ConciergeRequest['priorEntities']>(
    initialSelection ? [initialSelection] : [],
  );
  const outcome = useRef<'pending' | 'complete' | 'failed'>('pending');
  const chat = useChat<ConciergeUIMessage>({
    transport,
    dataPartSchemas: { concierge: conciergeStreamEventSchema },
    onData(part) {
      if (part.type !== 'data-concierge') return;
      const event = conciergeStreamEventSchema.parse(part.data);
      if (event.requestId !== active.current || event.sequence <= sequence.current) return;
      sequence.current = event.sequence;
      if (event.type === 'turn.completed') outcome.current = 'complete';
      if (event.type === 'turn.error' || event.type === 'turn.cancelled')
        outcome.current = 'failed';
      if (event.type === 'brief.updated') {
        briefRef.current = event.brief;
        if (
          lastRequest.current?.patch &&
          event.brief.revision > lastRequest.current.patch.baseRevision
        )
          lastRequest.current = { message: lastRequest.current.message };
      }
      if (event.type === 'turn.error' || event.type === 'turn.cancelled') setProposals([]);
      if (event.type === 'component.upsert' && 'cards' in event.component)
        priorEntities.current = event.component.cards
          .map((card) =>
            card.kind === 'demo-unit'
              ? { kind: 'unit' as const, id: card.unitId }
              : { kind: 'project' as const, id: card.projectId },
          )
          .slice(0, 12);
      if (
        event.type === 'ui.action' &&
        event.action.briefRevision === briefRef.current.revision &&
        !actions.current.has(event.action.id)
      ) {
        actions.current.add(event.action.id);
        onAction?.(event.action);
      }
      if (event.type === 'write.proposed')
        setProposals((items) => [
          ...items.filter((item) => item.id !== event.proposal.id),
          event.proposal,
        ]);
      setState((current) => reduceConciergeEvent(current, event));
    },
    onError() {
      if (!active.current) return;
      outcome.current = 'failed';
      setProposals([]);
      const requestId = active.current;
      setState((current) => ({
        ...current,
        error: { code: 'CONNECTION_FAILED', retryable: true },
        turns: current.turns.map((turn) =>
          turn.requestId === requestId ? { ...turn, status: 'failed' } : turn,
        ),
      }));
    },
    onFinish({ isAbort, isDisconnect, isError }) {
      const requestId = active.current;
      if (!requestId) return;
      if (outcome.current !== 'complete') setProposals([]);
      setState((current) => {
        const unfinished = current.turns.some(
          (turn) => turn.requestId === requestId && turn.status === 'streaming',
        );
        if (!unfinished) return current;
        return {
          ...current,
          phase: undefined,
          error: isAbort
            ? undefined
            : {
                code: isDisconnect || isError ? 'CONNECTION_FAILED' : 'INCOMPLETE_RESPONSE',
                retryable: true,
              },
          turns: current.turns.map((turn) =>
            turn.requestId === requestId && turn.status === 'streaming'
              ? { ...turn, status: isAbort ? 'cancelled' : 'failed' }
              : turn,
          ),
        };
      });
    },
  });

  useEffect(() => {
    if (guest) return;
    const controller = new AbortController();
    const loadingEpoch = epoch.current;
    void fetch('/api/v1/concierge', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('history_failed');
        const replay = conciergeReplaySchema.parse(await response.json());
        if (epoch.current !== loadingEpoch || controller.signal.aborted) return;
        conversation.current = replay.conversationId;
        briefRef.current = replay.brief;
        priorEntities.current = initialSelectionRef.current
          ? [initialSelectionRef.current]
          : replaySelection(replay.turns);
        setState({ ...initialConciergeState(), brief: replay.brief, turns: replay.turns });
      })
      .catch(() => {
        if (!controller.signal.aborted && epoch.current === loadingEpoch)
          setState((current) => ({
            ...current,
            error: { code: 'HISTORY_FAILED', retryable: true },
          }));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingHistory(false);
      });
    return () => controller.abort();
  }, [guest, historyAttempt]);

  const { stop: stopChat, sendMessage, clearError, setMessages } = chat;
  useEffect(
    () => () => {
      active.current = null;
      epoch.current += 1;
      submissions.current += 1;
      void stopChat();
    },
    [stopChat],
  );
  const stop = useCallback(async () => {
    const requestId = active.current;
    active.current = null;
    epoch.current += 1;
    submissions.current += 1;
    setProposals([]);
    await stopChat();
    setState((current) => ({
      ...current,
      activeRequest: null,
      phase: undefined,
      turns: current.turns.map((turn) =>
        turn.requestId === requestId && turn.status === 'streaming'
          ? { ...turn, status: 'cancelled' }
          : turn,
      ),
    }));
  }, [stopChat]);

  const submit = useCallback(
    async (message: string, patch?: BriefPatch) => {
      if (!message.trim()) return;
      const stopped = stop();
      const ticket = submissions.current;
      await stopped;
      if (ticket !== submissions.current) return;
      clearError();
      setLoadingHistory(false);
      const requestId = crypto.randomUUID();
      conversation.current ??= crypto.randomUUID();
      active.current = requestId;
      outcome.current = 'pending';
      sequence.current = -1;
      actions.current.clear();
      lastRequest.current = { message, patch };
      const body: ConciergeRequest = {
        message,
        patch,
        requestId,
        conversationId: conversation.current,
        locale,
        brief: briefRef.current,
        priorEntities: priorEntities.current,
      };
      // The explicit Story selection takes precedence over old history only for this visit.
      // The API resolves it afresh; it conveys context, never inventory permission.
      initialSelectionRef.current = undefined;
      const turn: ClientTurn = {
        id: requestId,
        requestId,
        userText: message,
        assistantText: '',
        components: [],
        responseLanguage: locale,
        status: 'streaming',
        briefRevision: briefRef.current.revision,
        createdAt: new Date().toISOString(),
      };
      setState((current) => ({
        ...current,
        activeRequest: requestId,
        sequence: -1,
        error: undefined,
        phase: 'interpreting',
        turns: [...current.turns, turn].slice(-100),
      }));
      setProposals([]);
      // Only the explicit request body is sent. SDK message history is not trusted as server state.
      await sendMessage({ text: message }, { body });
      if (active.current !== requestId || !['complete'].includes(outcome.current))
        throw new Error('turn_incomplete');
    },
    [locale, stop, clearError, sendMessage],
  );

  const applyBriefPatch = useCallback(
    async (patch: BriefPatch) => {
      const parsed = briefPatchSchema.parse(patch);
      await submit(
        locale === 'ar'
          ? 'حدّث الخيارات حسب تعديل الموجز.'
          : 'Update the options using my Brief edit.',
        parsed,
      );
    },
    [submit, locale],
  );
  const retry = useCallback(async () => {
    if (lastRequest.current) await submit(lastRequest.current.message, lastRequest.current.patch);
    else if (!guest) {
      setLoadingHistory(true);
      setState((current) => ({ ...current, error: undefined }));
      setHistoryAttempt((value) => value + 1);
    }
  }, [submit, guest]);
  const clearHistory = useCallback(async () => {
    await stop();
    let nextConversationId = crypto.randomUUID() as string;
    if (!guest) {
      const response = await fetch('/api/v1/concierge', { method: 'DELETE' });
      if (!response.ok) throw new Error('history_delete_failed');
      nextConversationId = conciergeReplaySchema.parse(await response.json()).conversationId;
    }
    const clean = initialConciergeState();
    briefRef.current = clean.brief;
    conversation.current = nextConversationId;
    lastRequest.current = null;
    priorEntities.current = [];
    initialSelectionRef.current = undefined;
    setState(clean);
    setMessages([]);
    setProposals([]);
    clearError();
  }, [guest, stop, setMessages, clearError]);
  const confirmProposal = useCallback(
    async (proposalId: string, decision: 'confirm' | 'reject') => {
      const response = await fetch('/api/v1/concierge/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, decision, requestId: crypto.randomUUID() }),
      });
      if (!response.ok) throw new Error('confirmation_failed');
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== 'object' ||
        !('status' in result) ||
        (result.status !== 'CONFIRMED' && result.status !== 'REJECTED')
      )
        throw new Error('confirmation_failed');
      setProposals((items) => items.filter((item) => item.id !== proposalId));
      return { status: result.status };
    },
    [],
  );
  const status: ConciergeStatus = loadingHistory
    ? 'loading-history'
    : chat.status === 'submitted' || chat.status === 'streaming'
      ? chat.status
      : state.error || chat.status === 'error'
        ? 'error'
        : 'idle';
  return {
    brief: state.brief,
    turns: state.turns,
    status,
    phase: state.phase,
    error: state.error,
    submit,
    applyBriefPatch,
    stop,
    retry,
    clearHistory,
    guest,
    proposals,
    confirmProposal,
  };
}
