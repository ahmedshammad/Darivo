import { expect, it } from 'vitest';
import type { AtlasProject } from '@/src/lib/atlas';
import { placeMatches } from '@/src/server/concierge/tools';

const project = (community: string, city = 'Dubai') =>
  ({
    country: 'UAE',
    city,
    community,
    nameEn: 'Palm Jumeirah Villa',
    nameAr: 'فيلا النخلة',
  }) as AtlasProject;

it('uses canonical stored communities rather than broad Palm aliases or misleading project titles', () => {
  expect(placeMatches(project('Palm Jumeirah'), 'palm')).toBe(true);
  expect(placeMatches(project('Palm Jumeirah (Crescent)'), 'palm')).toBe(true);
  expect(placeMatches(project('Palm Jebel Ali'), 'palm')).toBe(false);
  expect(placeMatches(project('Palm Jebel Ali'), 'jebel-ali')).toBe(true);
  expect(placeMatches(project('The Oasis (Dubailand)'), 'palm')).toBe(false);
  expect(placeMatches(project('Unknown'), 'palm')).toBe(false);
});

it('keeps Saadiyat and city/country scopes distinct without inventing boundaries', () => {
  expect(placeMatches(project('Saadiyat Cultural District', 'Abu Dhabi'), 'saadiyat')).toBe(true);
  expect(placeMatches(project('Saadiyat Island', 'Abu Dhabi'), 'dubai')).toBe(false);
  expect(placeMatches(project('Palm Jebel Ali'), 'dubai')).toBe(true);
  expect(placeMatches(project('Palm Jumeirah'), 'uae')).toBe(true);
  expect(placeMatches(project('Palm Jumeirah'), 'egypt')).toBe(false);
  expect(placeMatches(project('Palm Jumeirah'), 'invented-place')).toBe(false);
});
