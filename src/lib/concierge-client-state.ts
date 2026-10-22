import {
  emptyConciergeBrief,
  type ConciergeBrief,
  type ConciergeComponent,
  type ConciergeStreamEvent,
  type ConciergeReplay,
  type ConciergeEntityRef,
} from './concierge';

export type ClientTurn = Omit<ConciergeReplay['turns'][number], 'status'> & {
  status: 'complete' | 'cancelled' | 'failed' | 'streaming';
};
export interface ConciergeClientState {
  brief: ConciergeBrief;
  turns: ClientTurn[];
  sequence: number;
  activeRequest: string | null;
  phase?: 'interpreting' | 'retrieving' | 'composing';
  error?: { code: string; retryable: boolean };
}
export function initialConciergeState(): ConciergeClientState {
  return { brief: emptyConciergeBrief(), turns: [], sequence: -1, activeRequest: null };
}
/** Replayed follow-ups retain the last authorized cohort across a notice or chart. */
export function replaySelection(turns: ConciergeReplay['turns']): ConciergeEntityRef[] {
  for (const turn of [...turns].reverse()) {
    for (const component of [...turn.components].reverse()) {
      if (!('cards' in component)) continue;
      return component.cards
        .slice(0, 12)
        .map((card) =>
          card.kind === 'demo-unit'
            ? { kind: 'unit', id: card.unitId }
            : { kind: 'project', id: card.projectId },
        );
    }
  }
  return [];
}
export function reduceConciergeEvent(
  state: ConciergeClientState,
  event: ConciergeStreamEvent,
): ConciergeClientState {
  if (event.requestId !== state.activeRequest || event.sequence <= state.sequence) return state;
  const next = { ...state, sequence: event.sequence };
  if (event.type === 'brief.updated') next.brief = event.brief;
  if (event.type === 'status') next.phase = event.phase;
  if (event.type === 'turn.error') next.error = { code: event.code, retryable: event.retryable };
  next.turns = state.turns.map((turn) => {
    if (turn.requestId !== event.requestId) return turn;
    if (event.type === 'turn.started') return { ...turn, id: event.turnId };
    if (event.type === 'text.delta')
      return { ...turn, assistantText: turn.assistantText + event.text };
    if (event.type === 'component.upsert') {
      const components: ConciergeComponent[] = turn.components.filter(
        (item) => item.id !== event.component.id,
      );
      components.push(event.component);
      return { ...turn, components };
    }
    if (event.type === 'brief.updated')
      return {
        ...turn,
        briefRevision: event.brief.revision,
        responseLanguage:
          event.brief.responseLanguage === 'auto'
            ? turn.responseLanguage
            : event.brief.responseLanguage,
      };
    if (event.type === 'turn.completed')
      return { ...turn, status: 'complete' as const, briefRevision: event.briefRevision };
    if (event.type === 'turn.cancelled') return { ...turn, status: 'cancelled' as const };
    if (event.type === 'turn.error') return { ...turn, status: 'failed' as const };
    return turn;
  });
  return next;
}
