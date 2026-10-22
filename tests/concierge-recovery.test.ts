import { expect, it } from 'vitest';
import { emptyConciergeBrief, type GroundedCard, type MarketBrief } from '@/src/lib/concierge';
import { createFact } from '@/src/server/concierge/grounding';
import { conditionalEvidenceGap, matchesCardConstraints } from '@/src/server/concierge/tools';

const card = (features: string) =>
  ({
    facts: [
      createFact({ kind: 'unit', id: 'fixture' }, 'type', 'Villa', ['demo'], 'DEMO'),
      createFact({ kind: 'unit', id: 'fixture' }, 'amenities', features, ['demo'], 'DEMO'),
    ],
  }) as GroundedCard;
const brief = () => {
  const value = emptyConciergeBrief();
  value.mustHaves = [
    {
      id: 'stable-beach',
      text: 'beachfront',
      category: 'amenity',
      marketIds: [],
      verificationRequired: true,
    },
  ];
  return value;
};
it('explains unknown evidence conditionally without treating absence of proof as false or relaxing the Brief', () => {
  const value = brief();
  const before = structuredClone(value);
  const gap = conditionalEvidenceGap([card('garden')], null, value);
  expect(gap?.en).toContain('Among records satisfying your other requirements');
  expect(gap?.en).toContain('not proof that the feature is absent');
  expect(gap?.ar).toContain('ليس إثباتاً لغياب الميزة');
  expect(matchesCardConstraints(card('garden'), [], value)).toBe(false);
  expect(value).toEqual(before);
});
it('does not diagnose an individual requirement from an empty or jointly unsupported cohort', () => {
  const value = brief();
  value.mustHaves.push({ ...value.mustHaves[0], id: 'pool', text: 'private pool' });
  expect(conditionalEvidenceGap([], null, value)).toBeNull();
  expect(conditionalEvidenceGap([card('garden')], null, value)).toBeNull();
  const gap = conditionalEvidenceGap([card('private_pool'), card('beachfront')], null, value);
  expect(gap?.en).toContain('Among records satisfying your other requirements');
  expect(gap?.en).not.toContain('No records have');
});
it('does not diagnose optional, unrelated-market or already supported requirements', () => {
  const value = brief();
  expect(conditionalEvidenceGap([card('beachfront')], null, value)).toBeNull();
  value.mustHaves[0].verificationRequired = false;
  expect(conditionalEvidenceGap([card('garden')], null, value)).toBeNull();
  value.mustHaves[0].verificationRequired = true;
  value.mustHaves[0].marketIds = ['market-egypt'];
  expect(
    conditionalEvidenceGap([card('garden')], { id: 'market-uae' } as MarketBrief, value),
  ).toBeNull();
});
