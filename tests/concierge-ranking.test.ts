import { describe, expect, it } from 'vitest';
import { emptyConciergeBrief, type GroundedCard } from '@/src/lib/concierge';
import {
  createFact,
  groundedTasteEvidence,
  rankByConsentedTaste,
} from '@/src/server/concierge/grounding';

const briefFor = (...ids: string[]) => {
  const brief = emptyConciergeBrief();
  brief.tasteMemory = {
    consent: 'granted',
    consentedAt: '2026-10-22T12:00:00Z',
    items: ids.map((id) => ({ id, text: id, recordedAt: '2026-10-22T12:00:00Z' })),
  };
  return brief;
};
const fact = (value: string, key = 'type') =>
  createFact(
    { kind: 'unit', id: value.replace(/[^a-z]/gi, '') || 'fixture' },
    key,
    value,
    ['fixture:demo'],
    'DEMO',
  );
// Ranking consumes only these fields; full cards are validated in engine/DAL tests.
const card = (id: string, value: string) =>
  ({ id, kind: 'demo-unit', facts: [fact(value)] }) as GroundedCard;

describe('Source-evidenced soft taste ranking', () => {
  it('promotes an evidenced villa-type preference without deleting unknown apartments or mutating original order', () => {
    const cards = [card('apartment', 'Apartment'), card('villa', 'Villa')];
    const ranked = rankByConsentedTaste(cards, briefFor('dislikes-high-rise'));
    expect(ranked.map((row) => row.id)).toEqual(['villa', 'apartment']);
    expect(cards.map((row) => row.id)).toEqual(['apartment', 'villa']);
  });
  it('does not rank on revoked consent or a no-save session', () => {
    const cards = [card('apartment', 'Apartment'), card('villa', 'Villa')];
    const brief = briefFor('dislikes-high-rise');
    brief.privacy.doNotSave = true;
    expect(rankByConsentedTaste(cards, brief)).toBe(cards);
    brief.privacy.doNotSave = false;
    brief.tasteMemory.consent = 'revoked';
    expect(rankByConsentedTaste(cards, brief)).toBe(cards);
  });
  it('does not invent style/height matches from villas, names or negated feature prose', () => {
    const brief = briefFor('prefers-contemporary', 'prefers-low-rise');
    const evidence = groundedTasteEvidence(
      [
        fact('Villa'),
        fact('Modern architecture', 'name'),
        fact('Not modern architecture', 'headline_facts.0'),
      ],
      brief,
    );
    expect(evidence.every((row) => row.facts.length === 0)).toBe(true);
    expect(
      groundedTasteEvidence([fact('Contemporary design', 'headline_facts.0')], brief)[0].facts,
    ).toHaveLength(1);
    expect(groundedTasteEvidence([fact('Low-rise apartments')], brief)[1].facts).toHaveLength(1);
  });
  it('ignores unknown IDs, duplicate taste IDs and unsourced assumptions', () => {
    const brief = briefFor('invented-match', 'dislikes-high-rise', 'dislikes-high-rise');
    const unsupported = fact('Villa');
    unsupported.provenance = 'USER_ASSUMPTION';
    expect(groundedTasteEvidence([unsupported], brief)).toHaveLength(1);
    expect(groundedTasteEvidence([unsupported], brief)[0].facts).toEqual([]);
    unsupported.provenance = 'DEMO';
    unsupported.sourceIds = [];
    expect(groundedTasteEvidence([unsupported], brief)[0].facts).toEqual([]);
  });
  it('keeps source-backed references ahead of fictional project examples', () => {
    const reference = {
      ...card('reference', 'Apartment'),
      kind: 'reference-project',
    } as GroundedCard;
    expect(
      rankByConsentedTaste([reference, card('demo', 'Villa')], briefFor('dislikes-high-rise'))[0],
    ).toBe(reference);
  });
});
