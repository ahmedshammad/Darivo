import { describe, expect, it } from 'vitest';
import { replaySelection } from '../src/lib/concierge-client-state';
import type { ConciergeComponent, ConciergeReplay, GroundedCard } from '../src/lib/concierge';

const reason = {
  text: { en: 'Unknown', ar: 'غير معروف' },
  briefFieldIds: ['purpose'],
  factIds: [],
  status: 'unknown' as const,
};
const card: GroundedCard = {
  id: 'unit-card',
  kind: 'demo-unit',
  unitId: 'unit-1',
  projectId: 'demo-1',
  availability: 'DEMO_ONLY',
  name: { en: 'Example', ar: 'مثال' },
  center: null,
  coordinatesApproximate: true,
  price: null,
  facts: [],
  sources: [],
  reasons: [reason, reason],
  tradeoff: reason,
};
const cards: ConciergeComponent = {
  id: 'cards',
  turnId: 'one',
  kind: 'project-cards',
  cards: [card],
};
const notice: ConciergeComponent = {
  id: 'notice',
  turnId: 'two',
  kind: 'notice',
  code: 'UNKNOWN_FACT',
  text: { en: 'No schedule', ar: 'لا توجد خطة' },
};
const turn = (components: ConciergeComponent[]): ConciergeReplay['turns'][number] => ({
  id: 'turn',
  requestId: 'request',
  userText: 'Show these',
  assistantText: '',
  components,
  responseLanguage: 'en',
  status: 'complete',
  briefRevision: 0,
  createdAt: '2026-10-22T12:00:00Z',
});

describe('Replayed selection across informational follow-ups', () => {
  it('keeps exact unit identity after a schedule-unavailable notice and reload', () => {
    expect(replaySelection([turn([cards]), turn([notice])])).toEqual([
      { kind: 'unit', id: 'unit-1' },
    ]);
  });
  it('uses the latest cohort, including an explicitly emptied result', () => {
    expect(
      replaySelection([
        turn([cards]),
        turn([{ ...cards, cards: [{ ...card, unitId: 'unit-2' }] }]),
      ]),
    ).toEqual([{ kind: 'unit', id: 'unit-2' }]);
    expect(
      replaySelection([turn([cards]), turn([{ ...cards, cards: [] }]), turn([notice])]),
    ).toEqual([]);
  });
});
