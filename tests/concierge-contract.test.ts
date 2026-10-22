import { describe, expect, it } from 'vitest';
import {
  emptyConciergeBrief,
  providerBriefPatchSchema,
  sourceDateSchema,
  conciergeToolCallSchema,
} from '@/src/lib/concierge';
import { applyConciergeBriefPatch, StaleBriefError } from '@/src/server/concierge/brief';

const market = (id: string, country: 'UAE' | 'Egypt') => ({
  id,
  country,
  placeIds: [],
  placeMatch: 'any' as const,
  purpose: 'holiday' as const,
  budget: null,
  deadline: null,
  readiness: 'unspecified' as const,
  propertyTypes: [],
  bedrooms: null,
  rawText: 'Original request',
});

describe('Concierge revision and consent contract', () => {
  it('keeps project timelines compatible and accepts exactly one explicit unit or project target', () => {
    expect(
      conciergeToolCallSchema.safeParse({
        name: 'ui.showTimeline',
        arguments: { projectId: 'orla-palm-jumeirah' },
      }).success,
    ).toBe(true);
    expect(
      conciergeToolCallSchema.safeParse({
        name: 'ui.showTimeline',
        arguments: { unitId: 'property-001' },
      }).success,
    ).toBe(true);
    expect(
      conciergeToolCallSchema.safeParse({ name: 'ui.showTimeline', arguments: {} }).success,
    ).toBe(false);
    expect(
      conciergeToolCallSchema.safeParse({
        name: 'payment_plan_projection',
        arguments: { projectId: 'orla-palm-jumeirah', unitId: 'property-001', scheduleFactIds: [] },
      }).success,
    ).toBe(false);
  });
  it('edits one market without dropping the other and rejects a stale retry', () => {
    const initial = emptyConciergeBrief();
    initial.markets = [market('market-egypt', 'Egypt'), market('market-uae', 'UAE')];
    const patch = {
      baseRevision: 0,
      operations: [{ op: 'market.upsert' as const, value: { ...initial.markets[0], bedrooms: 4 } }],
    };
    const next = applyConciergeBriefPatch(initial, patch);
    expect(next.revision).toBe(1);
    expect(next.markets[1]).toEqual(initial.markets[1]);
    expect(initial.markets[0].bedrooms).toBeNull();
    expect(() => applyConciergeBriefPatch(next, patch)).toThrow(StaleBriefError);
  });
  it('removes scoped constraints instead of accidentally making them global', () => {
    const brief = emptyConciergeBrief();
    brief.markets = [market('market-egypt', 'Egypt'), market('market-uae', 'UAE')];
    brief.mustHaves = [
      {
        id: 'pool',
        text: 'Pool',
        marketIds: ['market-egypt'],
        category: 'amenity',
        verificationRequired: true,
      },
    ];
    const result = applyConciergeBriefPatch(brief, {
      baseRevision: 0,
      operations: [{ op: 'market.remove', id: 'market-egypt' }],
    });
    expect(result.mustHaves).toEqual([]);
    expect(result.markets.map((row) => row.id)).toEqual(['market-uae']);
  });
  it('allows a provider to revoke memory and restrict privacy but never grant or relax them', () => {
    const brief = emptyConciergeBrief();
    brief.tasteMemory = {
      consent: 'granted',
      consentedAt: '2026-10-22T10:00:00Z',
      items: [{ id: 'taste', text: 'Quiet architecture', recordedAt: '2026-10-22T10:00:00Z' }],
    };
    const result = applyConciergeBriefPatch(brief, {
      baseRevision: 0,
      operations: [
        { op: 'memory.restrict', consent: 'revoked' },
        { op: 'privacy.restrict', flags: ['doNotShare', 'doNotBook'] },
      ],
    });
    expect(result.tasteMemory.items).toEqual([]);
    expect(result.privacy.doNotShare).toBe(true);
    expect(
      providerBriefPatchSchema.safeParse({
        baseRevision: 1,
        operations: [{ op: 'memory.replace', value: brief.tasteMemory }],
      }).success,
    ).toBe(false);
    expect(
      providerBriefPatchSchema.safeParse({
        baseRevision: 1,
        operations: [{ op: 'privacy.replace', value: emptyConciergeBrief().privacy }],
      }).success,
    ).toBe(false);
  });
  it('preserves unknown dates and rejects impossible calendar dates', () => {
    expect(sourceDateSchema.parse({ value: null, precision: 'UNKNOWN' }).value).toBeNull();
    expect(sourceDateSchema.safeParse({ value: '2026-02-31', precision: 'DAY' }).success).toBe(
      false,
    );
    expect(sourceDateSchema.safeParse({ value: '2026-02', precision: 'DAY' }).success).toBe(false);
  });
});
