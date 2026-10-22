import { describe, expect, it } from 'vitest';
import { initialConciergeState, reduceConciergeEvent } from '../src/lib/concierge-client-state';
import type { ConciergeStreamEvent } from '../src/lib/concierge';

const event = (sequence: number, requestId = 'current'): ConciergeStreamEvent => ({
  version: 1,
  id: `event-${sequence}`,
  conversationId: 'conversation',
  turnId: 'turn',
  requestId,
  sequence,
  createdAt: '2026-10-22T12:00:00Z',
  type: 'text.delta',
  text: 'Grounded copy.',
  origin: 'APPLICATION_COPY',
});
function activeState() {
  return {
    ...initialConciergeState(),
    activeRequest: 'current',
    turns: [
      {
        id: 'pending',
        requestId: 'current',
        userText: 'Compare my places',
        assistantText: '',
        components: [],
        responseLanguage: 'en' as const,
        status: 'streaming' as const,
        briefRevision: 0,
        createdAt: '2026-10-22T12:00:00Z',
      },
    ],
  };
}
describe('Concierge stream ordering', () => {
  it('rejects late events from a cancelled or superseded request', () => {
    const state = activeState();
    expect(reduceConciergeEvent(state, event(99, 'old'))).toBe(state);
    expect(
      reduceConciergeEvent({ ...state, activeRequest: null }, event(1)).turns[0].assistantText,
    ).toBe('');
  });
  it('applies a chunk once and rejects reordered duplicate data', () => {
    const state = reduceConciergeEvent(activeState(), event(4));
    expect(reduceConciergeEvent(state, event(4))).toBe(state);
    expect(reduceConciergeEvent(state, event(3))).toBe(state);
    expect(state.turns[0].assistantText).toBe('Grounded copy.');
  });
  it('keeps partial evidence on cancellation and reports failure independently', () => {
    const state = reduceConciergeEvent(activeState(), event(1));
    const base = event(2);
    const cancelled = reduceConciergeEvent(state, {
      ...base,
      type: 'turn.cancelled',
      reason: 'user',
    });
    expect(cancelled.turns[0].status).toBe('cancelled');
    expect(cancelled.turns[0].assistantText).toBe('Grounded copy.');
    const failed = reduceConciergeEvent(state, {
      ...base,
      type: 'turn.error',
      code: 'TOOL_FAILED',
      retryable: true,
    });
    expect(failed.error).toEqual({ code: 'TOOL_FAILED', retryable: true });
    expect(failed.turns[0].status).toBe('failed');
  });
});
