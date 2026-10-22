import { describe, expect, it } from 'vitest';
import { storyCompletionDate } from '../src/components/story/presentation';
describe('Story completion date presentation', () => {
  it('localizes an exact UTC completion timestamp without altering its canonical value', () => {
    const original = '2026-08-31T00:00:00.000Z';
    expect(storyCompletionDate(original, 'en')).toBe('31 August 2026');
    expect(storyCompletionDate(original, 'ar', true)).toContain('٢٠٢٦');
    expect(original).toBe('2026-08-31T00:00:00.000Z');
  });
  it('leaves approximate and invalid reported dates to their original source wording', () => {
    for (const value of ['Expected 2027', 'Q4 2028', '2026-08', '2026-02-31T00:00:00Z', null])
      expect(storyCompletionDate(value, 'en')).toBeNull();
  });
});

import { exactStoryMapSubject } from '../src/components/story/map-subject';
import type { StoryDTO } from '../src/lib/story';
it('maps an exact unit with its own native price, identity and approximate point', () => {
  const name = { en: 'Fixture unit', ar: 'وحدة اختبار' };
  const story: StoryDTO = {
    version: 1,
    kind: 'DEMO_UNIT',
    unitId: 'unit-test',
    projectId: 'collection-test',
    entity: { kind: 'unit', id: 'unit-test' },
    name,
    storySlug: 'unit-fixture',
    storyPath: '/p/unit-fixture',
    country: 'Egypt',
    city: name,
    community: name,
    center: [28.4, 31.1],
    coordinatesApproximate: true,
    price: {
      native: { amount: 5000000, currency: 'EGP' },
      converted: [],
      factId: 'price-test',
      qualifier: null,
      paymentCurrency: 'EGP',
    },
    availability: 'DEMO',
    facts: [],
    sources: [],
    media: [],
    narrative: [],
    developer: { id: 'demo-developer', kind: 'DEMO', name, facts: [], sources: [] },
    metrics: [],
    timeline: { status: 'UNAVAILABLE', subjectName: name, reason: name },
    capabilities: [],
    residences: null,
  };
  const marker = exactStoryMapSubject(story);
  expect(marker).toMatchObject({
    id: 'unit-test',
    unitId: 'unit-test',
    amount: 5000000,
    currency: 'EGP',
    nameEn: name.en,
    nameAr: name.ar,
    center: [28.4, 31.1],
    approximate: true,
    kind: 'DEMO',
    basis: 'DEMO_ESTIMATE',
    match: 0,
  });
  expect(marker.id).not.toBe(story.projectId);
});
