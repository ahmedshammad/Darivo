import { describe, expect, it } from 'vitest';
import {
  conciergeComponentSchema,
  conciergeToolCallSchema,
  emptyConciergeBrief,
  marketBriefSchema,
  providerPlanSchema,
  type ConciergeComponent,
  type DeadlineAssumptionContext,
} from '@/src/lib/concierge';
import {
  deadlineAssumptionKey,
  getDeadlineAssumptionContexts,
  isRepeatedDeadlineAssumption,
  type DeadlineContextTurn,
} from '@/src/lib/concierge-context';

const brief = () => {
  const value = emptyConciergeBrief();
  value.uncertainties = ['deadline_year_boundary'];
  value.markets = [
    marketBriefSchema.parse({
      id: 'market-egypt',
      country: 'Egypt',
      purpose: 'holiday',
      placeIds: ['north-coast'],
      placeMatch: 'any',
      budget: null,
      deadline: { kind: 'year', year: 2028, boundary: 'by', rawText: 'by 2028' },
      readiness: 'unspecified',
      propertyTypes: [],
      bedrooms: null,
      rawText: 'North Coast holiday home',
    }),
  ];
  return value;
};
const context = () => getDeadlineAssumptionContexts(brief())[0];
const notice = (
  turnId: string,
  value: DeadlineAssumptionContext | undefined = context(),
): ConciergeComponent => ({
  id: `notice-${turnId}`,
  turnId,
  kind: 'notice',
  code: 'NEEDS_CLARIFICATION',
  context: value,
  text: { en: 'Full original English notice.', ar: 'نص الملاحظة الكامل.' },
});
const turn = (
  id: string,
  components: ConciergeComponent[] = [notice(id)],
  status: DeadlineContextTurn['status'] = 'complete',
): DeadlineContextTurn => ({ id, components, status });
const repeats = (previous: DeadlineContextTurn, current = turn('current')) =>
  isRepeatedDeadlineAssumption(current.components[0], [previous, current], 1);

describe('Scoped deadline context and conservative adjacent disclosure', () => {
  it('derives only active year/by assumptions without mutating the Brief', () => {
    const value = brief();
    value.markets.push({
      ...value.markets[0],
      id: 'market-uae',
      country: 'UAE',
      purpose: 'investment',
      placeIds: ['dubai'],
      deadline: { kind: 'year', year: 2029, boundary: 'by', rawText: 'بحلول 2029' },
    });
    const before = structuredClone(value);
    const contexts = getDeadlineAssumptionContexts(value);
    expect(contexts.map((item) => [item.marketId, item.country, item.year])).toEqual([
      ['market-egypt', 'Egypt', 2028],
      ['market-uae', 'UAE', 2029],
    ]);
    expect(contexts[0]).toEqual({
      kind: 'deadline-year-boundary',
      marketId: 'market-egypt',
      country: 'Egypt',
      year: 2028,
      boundary: 'by',
      interpretation: 'END_OF_YEAR',
      scope: {
        purpose: 'holiday',
        placeIds: ['north-coast'],
        placeMatch: 'any',
        marketMode: 'independent',
      },
    });
    expect(value).toEqual(before);
    value.markets[0].deadline = {
      kind: 'year',
      year: 2028,
      boundary: 'before',
      rawText: 'before 2028',
    };
    value.markets[1].deadline = {
      kind: 'date',
      date: '2029-01-01',
      boundary: 'by',
      rawText: '1 Jan 2029',
    };
    expect(getDeadlineAssumptionContexts(value)).toEqual([]);
    value.markets = before.markets;
    value.uncertainties = [];
    expect(getDeadlineAssumptionContexts(value)).toEqual([]);
  });

  it('compacts only a completed exact adjacent repeat, independent of locale or wording', () => {
    const previous = turn('previous');
    const current = turn('current');
    const snapshot = structuredClone([previous, current]);
    expect(repeats(previous, current)).toBe(true);
    if (current.components[0].kind !== 'notice') throw new Error('Expected notice');
    current.components[0].text = {
      en: 'Different authored English wording.',
      ar: 'صياغة عربية جديدة.',
    };
    expect(repeats(previous, current)).toBe(true);
    expect(previous).toEqual(snapshot[0]);
    expect(current.components[0].text.ar).toBe('صياغة عربية جديدة.');
    expect(isRepeatedDeadlineAssumption(current.components[0], [current], 0)).toBe(false);
    expect(isRepeatedDeadlineAssumption(current.components[0], [], 1)).toBe(false);
    expect(isRepeatedDeadlineAssumption(current.components[0], [previous, current], 1.5)).toBe(
      false,
    );
  });

  it.each(['streaming', 'cancelled', 'failed'] as const)(
    'keeps %s current or prior turns prominent',
    (status) => {
      expect(repeats(turn('previous', undefined, status))).toBe(false);
      expect(repeats(turn('previous'), turn('current', undefined, status))).toBe(false);
    },
  );

  it('does not scan past removal, legacy/missing context or a failed/cancelled turn on replay', () => {
    const current = turn('current');
    const legacy = notice('previous');
    if (legacy.kind !== 'notice') throw new Error('Expected notice');
    delete legacy.context;
    expect(conciergeComponentSchema.safeParse(legacy).success).toBe(true);
    expect(repeats(turn('previous', [legacy]), current)).toBe(false);
    const oldCurrent = structuredClone(current);
    if (oldCurrent.components[0].kind === 'notice') delete oldCurrent.components[0].context;
    expect(repeats(turn('previous'), oldCurrent)).toBe(false);
    for (const barrier of [
      turn('removed', []),
      turn('failed', [], 'failed'),
      turn('cancelled', [], 'cancelled'),
    ]) {
      expect(
        isRepeatedDeadlineAssumption(current.components[0], [turn('first'), barrier, current], 2),
      ).toBe(false);
    }
    const replay = JSON.parse(JSON.stringify([turn('previous'), current])) as DeadlineContextTurn[];
    expect(isRepeatedDeadlineAssumption(replay[1].components[0], replay, 1)).toBe(true);
    expect(repeats(turn('previous', [notice('wrong-turn')]))).toBe(false);
  });

  it.each([
    'year',
    'marketId',
    'country',
    'purpose',
    'placeIds',
    'placeMatch',
    'marketMode',
  ] as const)('keeps changed %s assumptions prominent', (field) => {
    const changed = context();
    switch (field) {
      case 'year':
        changed.year = 2029;
        break;
      case 'marketId':
        changed.marketId = 'market-egypt-second';
        break;
      case 'country':
        changed.country = 'UAE';
        break;
      case 'purpose':
        changed.scope.purpose = 'investment';
        break;
      case 'placeIds':
        changed.scope.placeIds = ['cairo'];
        break;
      case 'placeMatch':
        changed.scope.placeMatch = 'all';
        break;
      case 'marketMode':
        changed.scope.marketMode = 'alternatives';
        break;
    }
    expect(repeats(turn('previous'), turn('current', [notice('current', changed)]))).toBe(false);
  });

  it('compares place sets semantically and scopes independent markets separately', () => {
    const first = context();
    first.scope.placeIds = ['north-coast', 'cairo'];
    const reordered = structuredClone(first);
    reordered.scope.placeIds.reverse();
    expect(deadlineAssumptionKey(first)).toBe(deadlineAssumptionKey(reordered));
    const uae = { ...context(), marketId: 'market-uae', country: 'UAE' as const };
    const current = turn('current', [notice('current', uae)]);
    expect(repeats(turn('previous'), current)).toBe(false);
    expect(repeats(turn('previous', [notice('previous', uae)]), current)).toBe(true);
  });

  it('never compacts unknown payment facts or accepts foreign/provider-authored context', () => {
    const unknown = { ...notice('current'), code: 'UNKNOWN_FACT' } as ConciergeComponent;
    expect(
      isRepeatedDeadlineAssumption(unknown, [turn('previous'), turn('current', [unknown])], 1),
    ).toBe(false);
    expect(conciergeComponentSchema.safeParse(unknown).success).toBe(false);
    const malformed = { ...notice('current'), context: { ...context(), acknowledged: true } };
    expect(conciergeComponentSchema.safeParse(malformed).success).toBe(false);
    expect(
      conciergeComponentSchema.safeParse({
        ...notice('current'),
        context: { ...context(), interpretation: 'BEFORE_YEAR' },
      }).success,
    ).toBe(false);
    const validCall = { name: 'ui.showTimeline', arguments: { projectId: 'southmed' } };
    expect(conciergeToolCallSchema.safeParse(validCall).success).toBe(true);
    expect(
      conciergeToolCallSchema.safeParse({
        ...validCall,
        arguments: { ...validCall.arguments, context: context() },
      }).success,
    ).toBe(false);
    const validPlan = {
      version: 1,
      baseRevision: 0,
      briefPatch: null,
      calls: [],
      replyKey: 'RESULTS',
      clarificationFields: [],
      responseLanguage: 'en',
      continue: false,
    };
    expect(providerPlanSchema.safeParse(validPlan).success).toBe(true);
    expect(providerPlanSchema.safeParse({ ...validPlan, context: context() }).success).toBe(false);
    const payment = {
      ...notice('current'),
      code: 'UNKNOWN_FACT',
      context: undefined,
    } as ConciergeComponent;
    expect(conciergeComponentSchema.safeParse(payment).success).toBe(true);
    expect(
      isRepeatedDeadlineAssumption(payment, [turn('previous'), turn('current', [payment])], 1),
    ).toBe(false);
  });
});
