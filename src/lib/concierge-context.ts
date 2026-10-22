import type {
  ConciergeBrief,
  ConciergeComponent,
  ConciergeHistoryTurn,
  DeadlineAssumptionContext,
} from './concierge';

/** The engine and Brief editor use the same scoped assumptions. No wording or Brief mutation. */
export function getDeadlineAssumptionContexts(brief: ConciergeBrief): DeadlineAssumptionContext[] {
  if (!brief.uncertainties.includes('deadline_year_boundary')) return [];
  return brief.markets.flatMap((market) => {
    if (market.deadline?.kind !== 'year' || market.deadline.boundary !== 'by') return [];
    return [
      {
        kind: 'deadline-year-boundary' as const,
        marketId: market.id,
        country: market.country,
        year: market.deadline.year,
        boundary: 'by' as const,
        interpretation: 'END_OF_YEAR' as const,
        scope: {
          purpose: market.purpose,
          placeIds: [...new Set(market.placeIds)].sort(),
          placeMatch: market.placeMatch,
          marketMode: brief.marketMode,
        },
      },
    ];
  });
}

/** Canonical semantic identity, independent of locale, component ID or wording. */
export function deadlineAssumptionKey(context: DeadlineAssumptionContext): string {
  return JSON.stringify([
    context.kind,
    context.marketId,
    context.country,
    context.year,
    context.boundary,
    context.interpretation,
    context.scope.purpose,
    [...new Set(context.scope.placeIds)].sort(),
    context.scope.placeMatch,
    context.scope.marketMode,
  ]);
}

export type DeadlineContextTurn = Pick<ConciergeHistoryTurn, 'id' | 'components'> & {
  status: ConciergeHistoryTurn['status'] | 'streaming';
};

/** A presentation decision only: every notice retains its full text in stream/history.
 * Never scan past an absent, failed or cancelled adjacent disclosure to mark it as repeated.
 */
export function isRepeatedDeadlineAssumption(
  component: ConciergeComponent,
  turns: readonly DeadlineContextTurn[],
  turnIndex: number,
): boolean {
  if (
    component.kind !== 'notice' ||
    component.code !== 'NEEDS_CLARIFICATION' ||
    !component.context ||
    !Number.isInteger(turnIndex) ||
    turnIndex <= 0
  )
    return false;
  const current = turns[turnIndex];
  const previous = turns[turnIndex - 1];
  if (
    !current ||
    current.status !== 'complete' ||
    current.id !== component.turnId ||
    !current.components.some((item) => item.id === component.id) ||
    previous?.status !== 'complete'
  )
    return false;
  const key = deadlineAssumptionKey(component.context);
  return previous.components.some(
    (item) =>
      item.turnId === previous.id &&
      item.kind === 'notice' &&
      item.code === 'NEEDS_CLARIFICATION' &&
      item.context !== undefined &&
      deadlineAssumptionKey(item.context) === key,
  );
}
