import { describe, expect, it } from 'vitest';
import { emptyConciergeBrief, providerPlanSchema } from '../src/lib/concierge';
import {
  MockConciergeProvider,
  extractConciergePrivacy,
  normalizeConciergeText,
  parseConciergeMessage,
} from '../src/server/concierge/mock-parser';
import { readParserCases, runParserCase } from '../evals/concierge-run';

describe('concierge semantic parser acceptance corpus', () => {
  for (const test of readParserCases()) it(test.id, () => expect(runParserCase(test)).toEqual([]));
});
it('normalizes Arabic and Persian digits while retaining decimal and grouped amounts', () => {
  expect(normalizeConciergeText('١٢٬٥٠٠٬٠٠٠ / ۱۲٫۵')).toBe('12500000 / 12.5');
});
it('does not mutate the caller Brief or grant taste-memory consent', () => {
  const before = emptyConciergeBrief();
  const frozen = JSON.stringify(before);
  const result = parseConciergeMessage('Remember my preferences; Dubai villa', before);
  expect(JSON.stringify(before)).toBe(frozen);
  expect(result.brief.tasteMemory.consent).toBe('not_asked');
  expect(result.plan.continue).toBe(false);
});
it('revokes and clears previously consented taste memory', () => {
  const before = emptyConciergeBrief();
  before.tasteMemory = {
    consent: 'granted',
    consentedAt: '2026-10-22T00:00:00Z',
    items: [{ id: 'taste-1', text: 'private pool', recordedAt: '2026-10-22T00:00:00Z' }],
  };
  const result = parseConciergeMessage('Do not remember my preferences', before);
  expect(result.brief.tasteMemory).toEqual({ consent: 'revoked', consentedAt: null, items: [] });
});
it('requires an explicit anchor for relative dates', () => {
  const result = parseConciergeMessage('Dubai within 12 months', emptyConciergeBrief());
  expect(result.brief.markets[0].deadline).toBeNull();
  expect(result.plan.clarificationFields).toContain('deadline.anchor');
});
it('provider obeys cancellation and returns strict plans without factual prose', async () => {
  const provider = new MockConciergeProvider({ now: '2026-10-22' });
  const input = {
    message: 'Compare Orla and SouthMED',
    brief: emptyConciergeBrief(),
    responseLanguage: 'en' as const,
    priorEntities: [],
    toolResults: [],
    round: 0,
  };
  expect(providerPlanSchema.safeParse(await provider.plan(input)).success).toBe(true);
  const controller = new AbortController();
  controller.abort();
  await expect(provider.plan({ ...input, signal: controller.signal })).rejects.toThrow();
});

it('keeps property-type refusal durable and removes it on a direct correction', () => {
  const first = parseConciergeMessage('Dubai, no villas', emptyConciergeBrief());
  expect(first.brief.exclusions.map((item) => item.id)).toContain('property-villa');
  const correction = parseConciergeMessage('A villa is okay', first.brief);
  expect(correction.brief.exclusions.map((item) => item.id)).not.toContain('property-villa');
});
it('does not turn a removed market constraint into a global requirement', () => {
  const first = parseConciergeMessage(
    'Dubai private pool, North Coast summer home',
    emptyConciergeBrief(),
  );
  first.brief.mustHaves[0].marketIds = ['market-uae'];
  const result = parseConciergeMessage('Remove Dubai', first.brief);
  expect(result.brief.mustHaves).toEqual([]);
});
it('retains privacy without treating a private-pool preference as a sharing refusal', async () => {
  const { extractConciergePrivacy } = await import('../src/server/concierge/mock-parser');
  expect(extractConciergePrivacy('Keep my request private')).toMatchObject({
    discreet: true,
    doNotShare: true,
  });
  expect(extractConciergePrivacy('I want a private pool')).toMatchObject({
    doNotShare: false,
    blockExternalProcessing: false,
  });
  expect(extractConciergePrivacy("Don't send this to an external AI provider")).toMatchObject({
    doNotShare: true,
    blockExternalProcessing: true,
  });
  expect(extractConciergePrivacy('Do not contact an advisor')).toMatchObject({
    doNotShare: true,
    blockExternalProcessing: false,
  });
});

it('associates an unassigned budget only after the user supplies one market', () => {
  const first = parseConciergeMessage('Budget AED 12 million', emptyConciergeBrief());
  expect(first.brief.unassignedBudget?.max).toBe(12000000);
  const second = parseConciergeMessage('Dubai', first.brief);
  expect(second.brief.unassignedBudget).toBeNull();
  expect(second.brief.markets[0].budget).toMatchObject({
    max: 12000000,
    currency: 'AED',
    association: 'explicit',
  });
});
it('asks tools for a prior selected project source and timeline without manufacturing facts', () => {
  const result = parseConciergeMessage('Show the source and payment plan', emptyConciergeBrief(), {
    priorEntities: [{ kind: 'project', id: 'orla-palm-jumeirah' }],
  });
  expect(result.plan.calls).toContainEqual({
    name: 'get_project',
    arguments: { projectId: 'orla-palm-jumeirah' },
  });
  expect(result.plan.calls).toContainEqual({
    name: 'ui.showTimeline',
    arguments: { projectId: 'orla-palm-jumeirah' },
  });
  expect(result.brief.markets).toEqual([]);
});

it.each(['mini map', 'show on map preview', 'خريطة مصغرة'])(
  'requests a grounded mini-map for %s',
  (message) => {
    const result = parseConciergeMessage(message, emptyConciergeBrief(), {
      priorEntities: [{ kind: 'project', id: 'orla-palm-jumeirah' }],
    });
    expect(result.plan.calls).toContainEqual({
      name: 'ui.showMiniMap',
      arguments: { entities: [{ kind: 'project', id: 'orla-palm-jumeirah' }] },
    });
  },
);
it.each(['price area chart', 'مخطط السعر والمساحة'])(
  'requests price-area facts instead of inventing values for %s',
  (message) => {
    const entities = [
      { kind: 'project' as const, id: 'june-sodic' },
      { kind: 'project' as const, id: 'orla-palm-jumeirah' },
    ];
    expect(
      parseConciergeMessage(message, emptyConciergeBrief(), { priorEntities: entities }).plan.calls,
    ).toContainEqual({ name: 'ui.showPriceAreaChart', arguments: { entities } });
  },
);
it.each(['Dubai viewing itinerary', 'برنامج الزيارة في دبي'])(
  'requests an illustrative itinerary without booking for %s',
  (message) => {
    const result = parseConciergeMessage(message, emptyConciergeBrief());
    expect(result.plan.calls).toContainEqual({
      name: 'ui.showItinerary',
      arguments: { placeIds: ['dubai'] },
    });
    expect(result.plan.calls.some((call) => call.name === 'request_viewing')).toBe(false);
  },
);
it('asks for entities when a chart has no selected pair and honors negated component commands', () => {
  const result = parseConciergeMessage('price area chart', emptyConciergeBrief());
  expect(result.plan.clarificationFields).toContain('chart.entities');
  expect(result.plan.calls).toEqual([]);
  expect(
    parseConciergeMessage('Dubai, no viewing itinerary', emptyConciergeBrief()).plan.calls.some(
      (call) => call.name === 'ui.showItinerary',
    ),
  ).toBe(false);
});

it('requests one authorized feedback round for the initial cross-market comparison', async () => {
  const provider = new MockConciergeProvider({ now: '2026-10-22' });
  const message = 'North Coast summer home ready by 2028, compare with a Dubai investment';
  const first = await provider.plan({
    message,
    brief: emptyConciergeBrief(),
    responseLanguage: 'en',
    priorEntities: [],
    toolResults: [],
    round: 0,
  });
  expect(first.continue).toBe(true);
  expect(
    first.calls
      .filter((call) => call.name === 'search_projects')
      .map((call) => call.arguments.marketIds),
  ).toEqual([['market-egypt'], ['market-uae']]);
  const parsed = parseConciergeMessage(message, emptyConciergeBrief());
  const second = await provider.plan({
    message,
    brief: parsed.brief,
    responseLanguage: 'en',
    priorEntities: [],
    toolResults: [],
    round: 1,
  });
  expect(second.continue).toBe(false);
  expect(second.briefPatch).toBeNull();
  expect(second.calls.some((call) => call.name === 'search_projects')).toBe(false);
  expect(second.replyKey).toBe('NO_MATCHES');
});
it('keeps the island alternatives explicit when refining an existing broad Dubai Brief', () => {
  const first = parseConciergeMessage('Dubai', emptyConciergeBrief());
  const second = parseConciergeMessage('A beachfront villa on Saadiyat or the Palm', first.brief);
  expect(second.brief.marketMode).toBe('alternatives');
  expect(second.brief.markets[0].placeIds).toEqual(['saadiyat', 'palm']);
});

it.each([
  'Show demo units in Dubai',
  'Show available units in Dubai',
  'اعرض وحدات تجريبية في دبي',
  'اعرض وحدات متاحة في دبي',
])('makes the fictional unit path explicit: %s', (message) => {
  const { plan } = parseConciergeMessage(message, emptyConciergeBrief());
  expect(plan.calls.some((call) => call.name === 'search_units')).toBe(true);
  expect(plan.calls.some((call) => call.name === 'search_projects')).toBe(false);
});
it('compares and proposes saving only returned unit identities, with ordinal scope preserved', () => {
  const priorEntities = [
    { kind: 'unit' as const, id: 'demo-unit-first' },
    { kind: 'unit' as const, id: 'demo-unit-second' },
  ];
  const initial = parseConciergeMessage('Show demo units in Dubai', emptyConciergeBrief());
  const compare = parseConciergeMessage('Compare these', initial.brief, { priorEntities });
  expect(compare.plan.calls).toContainEqual({
    name: 'compare',
    arguments: { entities: priorEntities },
  });
  expect(compare.plan.calls.some((call) => call.name === 'search_projects')).toBe(false);
  const save = parseConciergeMessage('Save the first one', compare.brief, { priorEntities });
  expect(save.plan.calls.find((call) => call.name === 'save_to_portfolio')).toMatchObject({
    arguments: { entities: [priorEntities[0]], mode: 'propose' },
  });
});
it.each(['Show the payment plan for the second one', 'اعرض خطة السداد للثاني'])(
  'targets the exact selected unit timeline: %s',
  (message) => {
    const result = parseConciergeMessage(message, emptyConciergeBrief(), {
      priorEntities: [
        { kind: 'unit', id: 'unit-one' },
        { kind: 'unit', id: 'unit-two' },
      ],
    });
    expect(result.plan.calls).toContainEqual({
      name: 'ui.showTimeline',
      arguments: { unitId: 'unit-two' },
    });
    expect(result.plan.calls.some((call) => call.name === 'search_projects')).toBe(false);
  },
);
it('keeps a named reference schedule targeted to the project and never invents its units', () => {
  expect(
    parseConciergeMessage('Show SouthMED payment plan', emptyConciergeBrief()).plan.calls,
  ).toContainEqual({ name: 'ui.showTimeline', arguments: { projectId: 'southmed' } });
  const units = parseConciergeMessage('Show available units in Orla', emptyConciergeBrief());
  expect(units.plan.calls.find((call) => call.name === 'search_units')).toMatchObject({
    arguments: { projectIds: ['orla-palm-jumeirah'] },
  });
  expect(units.plan.calls.some((call) => call.name === 'get_project')).toBe(false);
});

it.each(['Tell me about developer Emaar Misr', 'عرفني على المطور اعمار مصر'])(
  'uses exact canonical developer names without conflating the Egypt and UAE entities: %s',
  (message) => {
    expect(parseConciergeMessage(message, emptyConciergeBrief()).plan.calls).toContainEqual({
      name: 'get_developer',
      arguments: { developerId: 'emaar-misr' },
    });
  },
);
it('resolves a known reference-project developer but asks about opaque demo-unit ownership', () => {
  expect(
    parseConciergeMessage('Who is the developer?', emptyConciergeBrief(), {
      priorEntities: [{ kind: 'project', id: 'southmed' }],
    }).plan.calls,
  ).toContainEqual({ name: 'get_developer', arguments: { developerId: 'tmg' } });
  expect(
    parseConciergeMessage('Who is the developer?', emptyConciergeBrief(), {
      priorEntities: [{ kind: 'unit', id: 'opaque-unit' }],
    }).plan.clarificationFields,
  ).toContain('developer.entity');
});
it.each([
  'Calculate for the first one: annual rent 100000 AED, annual costs 10000 AED, vacancy 5%',
  'احسب للاول: ايجار سنوي ١٠٠٠٠٠ درهم، تكاليف سنوية ١٠٠٠٠ درهم، شغور ٥%',
])(
  'uses only explicitly supplied scenario assumptions and keeps acquisition budgets unchanged: %s',
  (message) => {
    const previous = parseConciergeMessage(
      'Dubai budget 5 million AED',
      emptyConciergeBrief(),
    ).brief;
    const result = parseConciergeMessage(message, previous, {
      priorEntities: [{ kind: 'unit', id: 'unit-first' }],
    });
    expect(result.plan.calls).toContainEqual({
      name: 'investment_calc',
      arguments: {
        unitId: 'unit-first',
        annualRent: { amount: 100000, currency: 'AED' },
        annualCosts: { amount: 10000, currency: 'AED' },
        vacancyPercent: 5,
      },
    });
    expect(result.brief.markets[0].budget).toEqual(previous.markets[0].budget);
    expect(result.brief.displayCurrencies).toEqual(previous.displayCurrencies);
    expect(result.plan.calls.some((call) => call.name === 'search_units')).toBe(false);
  },
);
it.each([
  'Calculate annual rent 100000 AED, annual costs 10000 AED',
  'Calculate annual rent 100000, annual costs 10000 AED, vacancy 5%',
  'Calculate annual rent 100000 AED, annual costs 10000 AED, vacancy 101%',
])('never supplies missing or invalid calculation assumptions: %s', (message) => {
  const result = parseConciergeMessage(message, emptyConciergeBrief(), {
    priorEntities: [{ kind: 'unit', id: 'unit-first' }],
  });
  expect(result.plan.calls.some((call) => call.name === 'investment_calc')).toBe(false);
  expect(result.plan.clarificationFields).toContain('calculation.assumptions');
});
it('keeps personal advice refusal even when numeric assumptions are supplied', () => {
  const result = parseConciergeMessage(
    'Financial advice: calculate annual rent 100000 AED, annual costs 10000 AED, vacancy 5%',
    emptyConciergeBrief(),
    { priorEntities: [{ kind: 'unit', id: 'unit-first' }] },
  );
  expect(result.plan.replyKey).toBe('ADVICE_HANDOFF');
  expect(result.plan.calls.some((call) => call.name === 'investment_calc')).toBe(false);
});

it('persists explicit external AI processing refusal across otherwise ordinary followups', () => {
  const refusal = 'No external AI processing';
  expect(extractConciergePrivacy(refusal)).toMatchObject({
    blockExternalProcessing: true,
    doNotShare: true,
  });
  const first = parseConciergeMessage(refusal, emptyConciergeBrief());
  expect(first.brief.privacy.doNotShare).toBe(true);
  const followup = parseConciergeMessage('Show Dubai', first.brief);
  expect(followup.brief.privacy.doNotShare).toBe(true);
  expect(extractConciergePrivacy('Show Dubai').blockExternalProcessing).toBe(false);
});
