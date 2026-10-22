import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '@/src/server/db/client';
import {
  emptyConciergeBrief,
  type ConciergeProvider,
  type ConciergeProviderPlan,
  type ConciergeStreamEvent,
  type ConciergeToolCall,
} from '@/src/lib/concierge';
import { runConciergeTurn } from '@/src/server/concierge/engine';
import {
  rehydrateConciergeComponents,
  resolveCard,
  validateCardReferences,
  completionUpperBound,
  deadlineBoundary,
} from '@/src/server/concierge/grounding';
import {
  executeConciergeTool,
  matchesCardConstraints,
  projectMatchesMarket,
} from '@/src/server/concierge/tools';
import { getAtlasData } from '@/src/server/db/atlas';
import { MockConciergeProvider } from '@/src/server/concierge/mock-parser';
import type { MarketBrief } from '@/src/lib/concierge';

const providerFor = (
  calls: ConciergeToolCall[],
  extra: Partial<ConciergeProviderPlan> = {},
): ConciergeProvider => ({
  plan: async ({ brief }) => ({
    version: 1,
    baseRevision: brief.revision,
    responseLanguage: 'en',
    continue: false,
    briefPatch: null,
    calls,
    replyKey: 'RESULTS',
    clarificationFields: [],
    ...extra,
  }),
});
const input = (provider: ConciergeProvider) => ({
  message: 'Show available records',
  brief: emptyConciergeBrief(),
  viewer: null,
  locale: 'en' as const,
  conversationId: randomUUID(),
  turnId: randomUUID(),
  requestId: randomUUID(),
  provider,
});
const context = () => ({
  brief: emptyConciergeBrief(),
  viewer: null,
  turnId: randomUUID(),
  requestId: randomUUID(),
  callId: randomUUID(),
  message: 'Review this',
});
afterAll(() => db.$disconnect());

describe('Concierge authorized engine and grounded replay', () => {
  it('asks one concrete clarification in the requested response language', async () => {
    for (const responseLanguage of ['en', 'ar'] as const) {
      const result = await runConciergeTurn(
        input(
          providerFor([], {
            replyKey: 'CLARIFY',
            responseLanguage,
            clarificationFields: ['budget.currency', 'budget.market'],
          }),
        ),
        () => {},
      );
      expect(result.status).toBe('complete');
      expect(result.text).toContain(responseLanguage === 'en' ? 'currency' : 'عملة');
      expect(result.text.match(/[?؟]/g)).toHaveLength(1);
      expect(result.text).not.toContain('budget.currency');
    }
  });
  it('discloses retained school uncertainty even when a provider calls no tools', async () => {
    const brief = emptyConciergeBrief();
    brief.household.curriculum = 'British';
    const result = await runConciergeTurn({ ...input(providerFor([])), brief }, () => {});
    expect(result.status).toBe('complete');
    expect(
      result.components.some(
        (component) =>
          component.kind === 'notice' &&
          component.code === 'DEMO_LIMITATION' &&
          component.text.en.includes('curriculum'),
      ),
    ).toBe(true);
  });
  it('leads teaching with a map and consolidates retained and tool school qualifications', async () => {
    const brief = emptyConciergeBrief();
    brief.household.curriculum = 'British';
    for (const responseLanguage of ['en', 'ar'] as const) {
      const result = await runConciergeTurn(
        {
          ...input(
            providerFor(
              [
                { name: 'map.showLayer', arguments: { layer: 'school', visible: true } },
                { name: 'area_insights', arguments: { placeId: 'dubai' } },
                { name: 'map.showLayer', arguments: { layer: 'school', visible: true } },
              ],
              { responseLanguage },
            ),
          ),
          brief,
        },
        () => {},
      );
      expect(result.status).toBe('complete');
      expect(result.components[0].kind).toBe('mini-map');
      const notices = result.components.filter((component) => component.kind === 'notice');
      expect(notices).toHaveLength(1);
      expect(notices[0].text.en).toContain('Curriculum');
      expect(notices[0].text.en).toContain('fictional');
      expect(result.text).toContain(
        responseLanguage === 'en' ? 'neighbourhood map' : 'خريطة المناطق',
      );
    }
  });
  it('matches the Palm only to stored Palm Jumeirah geography in actual bilingual results', async () => {
    for (const message of ['Show projects on the Palm', 'اعرض مشاريع في النخلة']) {
      const result = await runConciergeTurn(
        { ...input(new MockConciergeProvider()), message },
        () => {},
      );
      expect(result.status).toBe('complete');
      const cards = result.components.flatMap((component) =>
        'cards' in component ? component.cards : [],
      );
      expect(cards.length).toBeGreaterThan(0);
      for (const card of cards) {
        const projectId = card.projectId;
        const project = await db.project.findUniqueOrThrow({ where: { id: projectId } });
        expect(project.communityName).toMatch(/^Palm Jumeirah(?: \(Crescent\))?$/);
        expect(project.id).not.toContain('jebel');
      }
    }
  });
  it('keeps taste as soft source-backed ordering and preserves explicit type filters', async () => {
    const ctx = context();
    ctx.brief.tasteMemory = {
      consent: 'granted',
      consentedAt: '2026-10-22T12:00:00Z',
      items: [
        { id: 'dislikes-high-rise', text: 'I dislike towers', recordedAt: '2026-10-22T12:00:00Z' },
      ],
    };
    const result = await executeConciergeTool(
      { name: 'search_projects', arguments: { marketIds: [], query: '', limit: 12 } },
      ctx,
    );
    const cards = result.components.flatMap((component) =>
      'cards' in component ? component.cards : [],
    );
    expect(
      cards[0].reasons.some(
        (reason) =>
          reason.briefFieldIds.includes('tasteMemory.items.dislikes-high-rise') &&
          reason.factIds.length > 0,
      ),
    ).toBe(true);
    const orla = await resolveCard({ kind: 'project', id: 'orla-palm-jumeirah' }, null, ctx.brief);
    expect(
      orla!.reasons.some(
        (reason) =>
          reason.briefFieldIds.includes('tasteMemory.items.dislikes-high-rise') &&
          reason.status === 'unknown',
      ),
    ).toBe(true);
    for (const card of cards) validateCardReferences(card);
    ctx.brief.markets = [
      {
        id: 'market-uae',
        country: 'UAE',
        placeIds: [],
        placeMatch: 'any',
        purpose: null,
        budget: null,
        deadline: null,
        readiness: 'unspecified',
        propertyTypes: ['apartment'],
        bedrooms: null,
        rawText: 'Apartments only',
      },
    ];
    const filtered = await executeConciergeTool(
      { name: 'search_projects', arguments: { marketIds: [], query: '', limit: 12 } },
      ctx,
    );
    const filteredCards = filtered.components.flatMap((component) =>
      'cards' in component ? component.cards : [],
    );
    expect(filteredCards.length).toBeGreaterThan(0);
    expect(
      filteredCards.every((card) =>
        card.facts.some(
          (fact) => fact.key.startsWith('type') && /apartment/i.test(String(fact.value)),
        ),
      ),
    ).toBe(true);
  });
  it('streams grounded ORLA evidence, exact price qualifier and unknown retrieval dates', async () => {
    const events: ConciergeStreamEvent[] = [];
    const result = await runConciergeTurn(
      input(providerFor([{ name: 'get_project', arguments: { projectId: 'orla-palm-jumeirah' } }])),
      (event) => {
        events.push(event);
      },
    );
    expect(result.status).toBe('complete');
    const component = result.components[0];
    expect(component.kind).toBe('project-cards');
    if (component.kind !== 'project-cards') throw new Error('Missing cards');
    const card = component.cards[0];
    expect(card.kind).toBe('reference-project');
    expect(card.availability).toBe('ON_REQUEST');
    expect(card.price?.native.amount).toBe(57300000);
    expect(card.price?.qualifier?.en).toContain('4-bedroom');
    expect(card.price?.qualifier?.ar).toContain('أربع غرف');
    expect(
      card.facts.some((fact) => ['developer_id', 'approx_coords', 'price_from'].includes(fact.key)),
    ).toBe(false);
    expect(
      card.facts
        .filter((fact) => typeof fact.value === 'string')
        .some((fact) => String(fact.value).startsWith('{')),
    ).toBe(false);
    expect(card.facts.find((fact) => fact.key === 'completion')?.displayValue?.ar).toBe(
      'متوقع في 2027',
    );
    expect(card.sources.every((source) => source.retrieved.value === null)).toBe(true);
    expect(
      card.sources.every(
        (source) => source.asOf.value === '2026-06' && source.asOf.precision === 'MONTH',
      ),
    ).toBe(true);
    expect(events.map((event) => event.sequence)).toEqual(events.map((_, index) => index));
    expect(events.findIndex((event) => event.type === 'component.upsert')).toBeLessThan(
      events.findIndex((event) => event.type === 'text.delta'),
    );
    expect(events.filter((event) => event.type === 'text.delta')).toHaveLength(1);
    expect(result.text).not.toMatch(/\d/);
  });
  it('never leaks guessed private or verified-only unit IDs to a guest', async () => {
    for (const id of ['property-017', 'property-020', 'invented-project']) {
      const result = await runConciergeTurn(
        input(
          providerFor([
            {
              name: 'compare',
              arguments: {
                entities: [
                  { kind: 'unit', id },
                  { kind: 'unit', id: 'property-002' },
                ],
              },
            },
          ]),
        ),
        () => {},
      );
      expect(result.status).toBe('complete');
      expect(JSON.stringify(result.components)).not.toContain(id);
      expect(result.actions).toEqual([]);
    }
  });
  it('replaces tampered historical prices and discards mixed-authority components', async () => {
    const card = await resolveCard(
      { kind: 'project', id: 'orla-palm-jumeirah' },
      null,
      emptyConciergeBrief(),
    );
    expect(card).not.toBeNull();
    card!.price!.native.amount = 1;
    expect(() => validateCardReferences(card!)).toThrow('Ungrounded price');
    const component = {
      id: 'history-cards',
      turnId: 'history-turn',
      kind: 'project-cards' as const,
      cards: [card!],
    };
    const replay = await rehydrateConciergeComponents([component], null, emptyConciergeBrief());
    expect(replay[0].kind === 'project-cards' && replay[0].cards[0].price?.native.amount).toBe(
      57300000,
    );
    const hidden = {
      ...card!,
      kind: 'demo-unit' as const,
      id: 'card:hidden',
      unitId: 'property-020',
      projectId: 'demo-project',
      availability: 'DEMO_ONLY' as const,
    };
    expect(
      await rehydrateConciergeComponents(
        [{ ...component, cards: [card!, hidden] }],
        null,
        emptyConciergeBrief(),
      ),
    ).toEqual([]);
  });
  it('rechecks verification rather than trusting a saved viewer or card', async () => {
    const id = `concierge-auth-${randomUUID()}`;
    const user = await db.user.create({
      data: {
        id,
        email: `${id}@darivo.example`,
        role: 'VERIFIED_CLIENT',
        verification: 'VERIFIED',
      },
    });
    try {
      const card = await resolveCard(
        { kind: 'unit', id: 'property-017' },
        user,
        emptyConciergeBrief(),
      );
      expect(card).not.toBeNull();
      await db.user.update({ where: { id }, data: { verification: 'UNVERIFIED' } });
      const replay = await rehydrateConciergeComponents(
        [{ id: 'saved-card', turnId: 'saved-turn', kind: 'project-cards', cards: [card!] }],
        user,
        emptyConciergeBrief(),
      );
      expect(replay).toEqual([]);
    } finally {
      await db.auditLog.deleteMany({ where: { actorId: id } });
      await db.user.delete({ where: { id } });
    }
  });
  it('enforces raw privacy restrictions even when the provider omits them', async () => {
    const result = await runConciergeTurn(
      {
        ...input(
          providerFor([
            {
              name: 'save_to_portfolio',
              arguments: {
                entities: [{ kind: 'unit', id: 'property-002' }],
                name: 'Draft',
                mode: 'propose',
              },
            },
            {
              name: 'handoff_to_advisor',
              arguments: { reason: 'Please contact me', mode: 'propose' },
            },
          ]),
        ),
        message: 'Do not save or share my request',
      },
      () => {},
    );
    expect(result.brief.privacy.doNotSave).toBe(true);
    expect(result.brief.privacy.doNotShare).toBe(true);
    expect(result.proposals).toEqual([]);
  });
  it('keeps reference enquiries separate from unit booking and preserves full proposal details', async () => {
    const project = await executeConciergeTool(
      {
        name: 'request_viewing',
        arguments: {
          entities: [{ kind: 'project', id: 'orla-palm-jumeirah' }],
          preferredSlots: [],
          modeOfViewing: 'video',
          timezone: 'Asia/Dubai',
          mode: 'propose',
        },
      },
      context(),
    );
    expect(project.proposals).toEqual([]);
    expect(project.components[0].kind === 'notice' && project.components[0].code).toBe(
      'ADVICE_HANDOFF',
    );
    const unit = await executeConciergeTool(
      {
        name: 'request_viewing',
        arguments: {
          entities: [{ kind: 'unit', id: 'property-002' }],
          preferredSlots: ['2027-01-01T12:00:00Z'],
          modeOfViewing: 'video',
          timezone: 'Asia/Dubai',
          mode: 'propose',
        },
      },
      context(),
    );
    expect(
      unit.proposals[0].kind === 'request_viewing' && unit.proposals[0].details.preferredSlots,
    ).toEqual(['2027-01-01T12:00:00Z']);
  });
  it('uses explicit parser language, passes prior entities and stops a continuing provider at three rounds', async () => {
    let calls = 0;
    const provider: ConciergeProvider = {
      plan: async (parameters) => {
        expect(parameters.priorEntities).toContainEqual({
          kind: 'project',
          id: 'orla-palm-jumeirah',
        });
        calls++;
        return {
          version: 1,
          baseRevision: parameters.brief.revision,
          responseLanguage: 'ar',
          continue: true,
          briefPatch: null,
          calls: [],
          replyKey: 'ACKNOWLEDGE',
          clarificationFields: [],
        };
      },
    };
    const result = await runConciergeTurn(
      { ...input(provider), priorEntities: [{ kind: 'project', id: 'orla-palm-jumeirah' }] },
      () => {},
    );
    expect(calls).toBe(3);
    expect(result.responseLanguage).toBe('ar');
    expect(result.text).toMatch(/[\u0600-\u06ff]/);
  });
  it('retains completed components but does not issue later actions after cancellation', async () => {
    const controller = new AbortController();
    const events: ConciergeStreamEvent[] = [];
    const result = await runConciergeTurn(
      {
        ...input(
          providerFor([
            { name: 'get_project', arguments: { projectId: 'orla-palm-jumeirah' } },
            {
              name: 'map.flyTo',
              arguments: { anchor: { kind: 'project', id: 'orla-palm-jumeirah' } },
            },
          ]),
        ),
        signal: controller.signal,
      },
      (event) => {
        events.push(event);
        if (event.type === 'component.upsert') controller.abort();
      },
    );
    expect(result.status).toBe('cancelled');
    expect(result.components).toHaveLength(1);
    expect(result.actions).toEqual([]);
    expect(events.at(-1)?.type).toBe('turn.cancelled');
  });
  it('rejects fabricated provider prose and nonexistent map anchors without echoing them', async () => {
    const malicious = {
      plan: async () => ({
        version: 1,
        baseRevision: 0,
        responseLanguage: 'en',
        continue: false,
        briefPatch: null,
        calls: [],
        replyKey: 'RESULTS',
        clarificationFields: [],
        text: 'Guaranteed 99% return',
      }),
    } as ConciergeProvider;
    const result = await runConciergeTurn(input(malicious), () => {});
    expect(result.status).toBe('failed');
    expect(JSON.stringify(result)).not.toContain('Guaranteed');
    const missing = await executeConciergeTool(
      { name: 'map.flyTo', arguments: { anchor: { kind: 'project', id: 'invented-property' } } },
      context(),
    );
    expect(missing.actions).toEqual([]);
  });
  it('only builds a complete sourced payment schedule and refuses site-area charts', async () => {
    const sourced = await executeConciergeTool(
      { name: 'ui.showTimeline', arguments: { projectId: 'palm-jebel-ali-villas' } },
      context(),
    );
    expect(sourced.components[0].kind).toBe('payment-timeline');
    if (sourced.components[0].kind === 'payment-timeline')
      expect(sourced.components[0].schedule.reduce((sum, row) => sum + row.percent, 0)).toBe(100);
    const missing = await executeConciergeTool(
      { name: 'ui.showTimeline', arguments: { projectId: 'orla-palm-jumeirah' } },
      context(),
    );
    expect(missing.components[0].kind).toBe('notice');
    const chart = await executeConciergeTool(
      {
        name: 'ui.showPriceAreaChart',
        arguments: {
          entities: [
            { kind: 'project', id: 'orla-palm-jumeirah' },
            { kind: 'project', id: 'palm-jebel-ali-villas' },
          ],
        },
      },
      context(),
    );
    expect(chart.components[0].kind).toBe('notice');
  });
  it('grounds every public reference and all required numeric/chart/map components', async () => {
    const all = await executeConciergeTool(
      { name: 'search_projects', arguments: { marketIds: [], query: '', limit: 12 } },
      context(),
    );
    expect(all.components[0].kind).toBe('project-cards');
    const refs = [
      { kind: 'unit' as const, id: 'property-001' },
      { kind: 'unit' as const, id: 'property-002' },
    ];
    const chart = await executeConciergeTool(
      { name: 'ui.showPriceAreaChart', arguments: { entities: refs } },
      context(),
    );
    expect(chart.components[0].kind).toBe('price-area-chart');
    const mini = await executeConciergeTool(
      { name: 'ui.showMiniMap', arguments: { entities: [{ kind: 'place', id: 'palm' }] } },
      context(),
    );
    expect(mini.components[0].kind).toBe('mini-map');
    const itinerary = await executeConciergeTool(
      { name: 'ui.showItinerary', arguments: { placeIds: ['palm', 'dubai-hills'] } },
      context(),
    );
    expect(itinerary.components[0].kind === 'itinerary' && itinerary.components[0].mode).toBe(
      'DEMO_ILLUSTRATION',
    );
    expect(itinerary.proposals).toEqual([]);
  });
  it('requires explicitly associated user assumptions and prevents currency substitution', async () => {
    const call = {
      name: 'investment_calc' as const,
      arguments: {
        unitId: 'property-002',
        annualRent: { amount: 100000, currency: 'AED' as const },
        annualCosts: { amount: 10000, currency: 'AED' as const },
        vacancyPercent: 5,
      },
    };
    const valid = await executeConciergeTool(call, {
      ...context(),
      message: 'Annual rent 100000 AED, annual costs 10000 AED, vacancy 5%',
    });
    expect(valid.components[0].kind).toBe('project-cards');
    const invalid = await executeConciergeTool(call, {
      ...context(),
      message: 'Annual rent 100000 EGP, annual costs 10000 AED, vacancy 5%',
    });
    expect(invalid.components[0].kind === 'notice' && invalid.components[0].code).toBe(
      'NEEDS_CLARIFICATION',
    );
  });
  it('suppresses every proposal when no-save prevents retaining a confirmation draft', async () => {
    const ctx = context();
    ctx.brief.privacy.doNotSave = true;
    const result = await executeConciergeTool(
      { name: 'handoff_to_advisor', arguments: { reason: 'Contact an advisor', mode: 'propose' } },
      ctx,
    );
    expect(result.proposals).toEqual([]);
    expect(result.components[0].kind).toBe('notice');
  });
  it('uses actual type/constraint facts and never treats a villa exclusion or unverified school as a match', async () => {
    const brief = emptyConciergeBrief();
    const market: MarketBrief = {
      id: 'market-uae',
      country: 'UAE',
      placeIds: [],
      placeMatch: 'any',
      purpose: 'residence',
      budget: {
        min: null,
        max: 1000000,
        currency: 'AED',
        association: 'explicit',
        rawText: 'under one million',
      },
      deadline: null,
      readiness: 'unspecified',
      propertyTypes: ['villa'],
      bedrooms: null,
      rawText: 'Villa, no high-rise',
    };
    brief.markets = [market];
    brief.exclusions = [
      {
        id: 'high-rise',
        text: 'high-rise',
        marketIds: [market.id],
        category: 'architecture',
        verificationRequired: true,
      },
    ];
    const orla = await resolveCard({ kind: 'project', id: 'orla-palm-jumeirah' }, null, brief);
    expect(matchesCardConstraints(orla!, [market], brief)).toBe(false);
    expect(orla!.tradeoff.status).toBe('conflict');
    expect(orla!.reasons[0].text.en).toContain('Palm Jumeirah');
    expect(orla!.reasons[1].status).toBe('conflict');
    expect(orla!.reasons[1].text.en).toContain('outside');
    const palm = await resolveCard({ kind: 'project', id: 'palm-jebel-ali-villas' }, null, brief);
    expect(matchesCardConstraints(palm!, [market], brief)).toBe(true);
    brief.mustHaves = [
      {
        id: 'beachfront',
        text: 'beachfront',
        marketIds: [market.id],
        category: 'view',
        verificationRequired: true,
      },
    ];
    expect(matchesCardConstraints(palm!, [market], brief)).toBe(true);
    const lagoons = await resolveCard({ kind: 'project', id: 'saadiyat-lagoons' }, null, brief);
    expect(matchesCardConstraints(lagoons!, [market], brief)).toBe(false);
    brief.household = {
      adults: 2,
      children: 2,
      curriculum: 'British',
      schoolRequirement: 'verified_required',
    };
    const family = await resolveCard({ kind: 'project', id: 'palm-jebel-ali-villas' }, null, brief);
    expect(matchesCardConstraints(family!, [market], brief)).toBe(false);
    expect(family!.tradeoff.text.en).toContain('curriculum');
  });
  it('uses conservative quarter/month/day and relative deadline boundaries', async () => {
    const project = (await getAtlasData(null)).projects.find(
      (project) => project.id === 'oasis-palmiera-collective',
    )!;
    const market: MarketBrief = {
      id: 'market-uae',
      country: 'UAE',
      placeIds: [],
      placeMatch: 'any',
      purpose: null,
      budget: null,
      deadline: {
        kind: 'date',
        date: '2029-02-01',
        boundary: 'before',
        rawText: 'before February 1',
      },
      readiness: 'unspecified',
      propertyTypes: [],
      bedrooms: null,
      rawText: '',
    };
    expect(projectMatchesMarket(project, market)).toBe(false);
    market.deadline = {
      kind: 'date',
      date: '2029-03-01',
      boundary: 'before',
      rawText: 'before March 1',
    };
    expect(projectMatchesMarket(project, market)).toBe(true);
    expect(completionUpperBound('Q3 2029')?.toISOString()).toBe('2029-09-30T23:59:59.999Z');
    expect(completionUpperBound(null)).toBeNull();
    expect(
      deadlineBoundary({
        kind: 'within_months',
        months: 1,
        relativeTo: '2028-01-31',
        rawText: 'within one month',
      })?.date.toISOString(),
    ).toBe('2028-02-29T23:59:59.999Z');
    market.deadline = {
      kind: 'within_months',
      months: 1,
      relativeTo: '2029-01-15',
      rawText: 'within one month',
    };
    expect(projectMatchesMarket(project, market)).toBe(false);
    market.deadline = { kind: 'year', year: 2029, boundary: 'before', rawText: 'before 2029' };
    expect(projectMatchesMarket(project, market)).toBe(false);
  });
  it('curates both Karim markets and compares sourced examples without a UAE-only demo dump', async () => {
    const result = await runConciergeTurn(
      {
        ...input(new MockConciergeProvider()),
        message: 'North Coast summer home ready by 2028, compare with a Dubai investment.',
      },
      () => {},
    );
    expect(result.status).toBe('complete');
    expect(result.text).not.toMatch(/[?؟]/);
    expect(
      result.components.some(
        (component) =>
          component.kind === 'notice' &&
          component.text.en.includes('end of 2028') &&
          component.text.en.includes('Egypt'),
      ),
    ).toBe(true);
    expect(
      result.components.some(
        (component) =>
          component.kind === 'notice' &&
          component.text.en.includes('end of 2028') &&
          component.text.en.includes('UAE'),
      ),
    ).toBe(false);
    const groups = result.components.filter((component) => component.kind === 'project-cards');
    expect(groups).toHaveLength(2);
    expect(
      groups.every(
        (component) =>
          component.kind === 'project-cards' && component.cards[0].kind === 'reference-project',
      ),
    ).toBe(true);
    const comparison = result.components.find((component) => component.kind === 'comparison');
    expect(comparison).toBeDefined();
    if (comparison?.kind === 'comparison')
      expect(
        comparison.cards
          .map((card) => card.facts.find((fact) => fact.key === 'country')?.value)
          .sort(),
      ).toEqual(['Egypt', 'UAE']);
  });
  it('keeps developer descriptions sourced and refreshes their facts on replay', async () => {
    const result = await executeConciergeTool(
      { name: 'get_developer', arguments: { developerId: 'omniyat' } },
      context(),
    );
    const component = result.components[0];
    expect(component.kind).toBe('developer-card');
    if (component.kind !== 'developer-card') throw new Error('Missing developer');
    expect(component.sources.length).toBeGreaterThan(0);
    expect(
      component.facts.some((fact) => fact.key === 'positioning' && fact.sourceIds.length > 0),
    ).toBe(true);
    component.facts[0].value = 'fabricated history value';
    const replay = await rehydrateConciergeComponents([component], null, emptyConciergeBrief());
    expect(JSON.stringify(replay)).not.toContain('fabricated history value');
    expect(replay[0].kind).toBe('developer-card');
  });
  it('uses the exact authorized fictional unit price and seeded payment schedule, including replay', async () => {
    const unit = await db.property.findFirstOrThrow({
      where: { visibility: 'PUBLIC', paymentPlan: { isNot: null } },
      include: { paymentPlan: true },
    });
    const result = await executeConciergeTool(
      { name: 'ui.showTimeline', arguments: { unitId: unit.id } },
      context(),
    );
    const timeline = result.components.find((component) => component.kind === 'payment-timeline');
    expect(timeline).toBeDefined();
    if (timeline?.kind !== 'payment-timeline') throw new Error('Missing timeline');
    expect(timeline.entity).toEqual({ kind: 'unit', id: unit.id });
    expect(timeline.mode).toBe('DEMO_ESTIMATE');
    expect(timeline.price.native).toEqual({
      amount: Number(unit.priceMinor) / 100,
      currency: unit.currency,
    });
    expect(timeline.schedule.map((step) => step.percent)).toEqual([
      unit.paymentPlan!.bookingPercent,
      unit.paymentPlan!.constructionPercent,
      unit.paymentPlan!.handoverPercent,
    ]);
    expect(
      timeline.sources.every(
        (source) => source.kind === 'demo' && source.basis === 'DEMO_ESTIMATE',
      ),
    ).toBe(true);
    expect(
      timeline.facts.every(
        (fact) =>
          fact.entity.kind === 'unit' && fact.entity.id === unit.id && fact.provenance === 'DEMO',
      ),
    ).toBe(true);
    const replay = await rehydrateConciergeComponents([timeline], null, emptyConciergeBrief());
    expect(replay[0].kind === 'payment-timeline' && replay[0].entity).toEqual({
      kind: 'unit',
      id: unit.id,
    });
    const projection = await executeConciergeTool(
      {
        name: 'payment_plan_projection',
        arguments: { unitId: unit.id, scheduleFactIds: [`${unit.id}:payment_plan`] },
      },
      context(),
    );
    expect(projection.components[0].kind).toBe('payment-timeline');
    const mismatched = await executeConciergeTool(
      {
        name: 'payment_plan_projection',
        arguments: { unitId: unit.id, scheduleFactIds: ['another-unit:payment_plan'] },
      },
      context(),
    );
    expect(mismatched.components[0].kind).toBe('notice');
  });
  it('does not expose a private unit timeline or manufacture a plan for a real project passed as unit', async () => {
    for (const unitId of ['property-017', 'property-020', 'orla-palm-jumeirah']) {
      const result = await executeConciergeTool(
        { name: 'ui.showTimeline', arguments: { unitId } },
        context(),
      );
      expect(result.components.some((component) => component.kind === 'payment-timeline')).toBe(
        false,
      );
      expect(result.actions).toEqual([]);
      expect(JSON.stringify(result.components)).not.toContain(unitId);
    }
  });
  it('refreshes seeded neighborhood figures and retains their demo provenance in history', async () => {
    const guide = await executeConciergeTool(
      { name: 'area_insights', arguments: { placeId: 'dubai' } },
      context(),
    );
    const component = guide.components.find((component) => component.kind === 'project-cards');
    expect(component?.kind).toBe('project-cards');
    if (component?.kind !== 'project-cards') throw new Error('Missing neighborhood examples');
    expect(component.cards).toHaveLength(3);
    const original = component.cards[0].facts.find((fact) => fact.key === 'area-average-aed-sqm')!;
    const amount = original.value;
    original.value = -999;
    const replay = await rehydrateConciergeComponents([component], null, emptyConciergeBrief());
    if (replay[0].kind !== 'project-cards') throw new Error('Missing replay examples');
    const refreshed = replay[0].cards[0].facts.find((fact) => fact.key === 'area-average-aed-sqm')!;
    expect(refreshed.value).toBe(amount);
    expect(refreshed.provenance).toBe('DEMO');
    expect(refreshed.asOf.value).toBeNull();
  });
});
