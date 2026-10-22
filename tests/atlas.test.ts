import { afterAll, describe, expect, it } from 'vitest';
import { getAtlasData } from '../src/server/db/atlas';
import { db } from '../src/server/db/client';
import { parseAtlasIntent, atlasDistanceKm } from '../src/lib/atlas-intent';
import { visibilityWhere } from '../src/server/db/properties';

afterAll(() => db.$disconnect());
describe('spatial preview grounding', () => {
  it('preserves both markets and Arabic alternatives without inventing IDs', async () => {
    const data = await getAtlasData();
    for (const [text, places] of [
      [
        'North Coast summer home ready by 2028, compare with a Dubai investment',
        ['north-coast', 'dubai'],
      ],
      ['فيلا على البحر في السعديات أو النخلة للعائلة', ['saadiyat', 'palm']],
    ] as const) {
      const result = parseAtlasIntent(text, data.projects);
      expect(result.places).toEqual(expect.arrayContaining([...places]));
      expect(result.projectIds.length).toBeGreaterThan(0);
      expect(result.projectIds.every((id) => data.projects.some((p) => p.id === id))).toBe(true);
    }
    const school = parseAtlasIntent('أبي مدرسة خلال ٢٠ دقيقة من وسط دبي', data.projects);
    expect(school.layers).toContain('school');
    expect(school.isochroneMinutes).toBe(20);
    expect(school.places).toContain('downtown');
    expect(parseAtlasIntent('الجونة', data.projects).places).toEqual(['red-sea']);
    expect(parseAtlasIntent('Palm Jebel Ali', data.projects).places).toEqual(['jebel-ali']);
    expect(parseAtlasIntent('Saadiyat or Palm', data.projects).places).toEqual(
      expect.arrayContaining(['saadiyat', 'palm']),
    );
    for (const [request, country] of [
      ['مصر', 'Egypt'],
      ['UAE', 'UAE'],
    ] as const) {
      const regional = parseAtlasIntent(request, data.projects);
      expect(regional.recognized).toBe(true);
      expect(regional.projectIds.length).toBeGreaterThan(0);
      expect(
        regional.projectIds.every(
          (id) => data.projects.find((p) => p.id === id)?.country === country,
        ),
      ).toBe(true);
    }
    expect(parseAtlasIntent('الساحل في مصر', data.projects).places).toEqual(['north-coast']);
    expect(parseAtlasIntent('Dubai in UAE', data.projects).places).toEqual(['dubai']);
    const unknown = parseAtlasIntent('an address on the moon', data.projects);
    expect(unknown.recognized).toBe(false);
    expect(unknown.projectIds).toEqual([]);
  });
  it('maps only visible unit summaries and keeps real references independent', async () => {
    const data = await getAtlasData();
    expect(data.projects.filter((p) => p.kind === 'REAL_REFERENCE')).toHaveLength(13);
    expect(data.developers).toHaveLength(9);
    for (const project of data.projects) {
      const stored = await db.project.findUniqueOrThrow({ where: { id: project.id } });
      expect(project.asOf).toBe(stored.asOf);
      if (project.kind === 'REAL_REFERENCE') {
        expect(project.unitId).toBeNull();
        expect(project.demoPricePerSqmAED).toBeUndefined();
        expect(project.amount).toBe(
          stored.priceFromAmount === null ? null : Number(stored.priceFromAmount),
        );
        expect(project.sources.length).toBeGreaterThan(0);
      } else {
        const unit = await db.property.findFirstOrThrow({
          where: { AND: [{ id: project.unitId! }, visibilityWhere(null)] },
        });
        expect(project.amount).toBe(Number(unit.priceMinor) / 100);
        expect(project.demoPricePerSqmAED).toBe(unit.priceAed / unit.areaSqm);
        expect(project.basis).toBe('DEMO_ESTIMATE');
      }
    }
    expect(JSON.stringify(data)).not.toContain('property-020');
    expect(data.pois.every((p) => p.demo)).toBe(true);
  });
  it('does not treat straight-line separation as a road route', () => {
    expect(atlasDistanceKm([55.276, 25.197], [55.276, 25.197])).toBe(0);
    expect(atlasDistanceKm([55.139, 25.118], [55.276, 25.197])).toBeGreaterThan(15);
    expect(atlasDistanceKm([55.139, 25.118], [55.276, 25.197])).toBeLessThan(17);
  });
});
