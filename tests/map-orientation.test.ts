import { describe, expect, it } from 'vitest';
import { ATLAS_PLACES } from '../src/lib/atlas-intent';
import {
  mapLabelIntersects,
  ORIENTATION_PLACE_IDS,
  placeMapOrientationLabels,
} from '../src/lib/map-orientation';

describe('map orientation placement', () => {
  const label = { id: 'palm', x: 195, y: 300, width: 150, height: 28 };
  const base = { width: 390, height: 844, limit: 3, candidates: [label], obstacles: [] };
  it('only names six existing bilingual places with existing approximate coordinates', () => {
    expect(ORIENTATION_PLACE_IDS).toHaveLength(6);
    for (const id of ORIENTATION_PLACE_IDS) {
      const place = ATLAS_PLACES.find((p) => p.id === id);
      expect(place?.nameEn).toBeTruthy();
      expect(place?.nameAr).toBeTruthy();
      expect(place?.center.every(Number.isFinite)).toBe(true);
    }
  });
  it('keeps an actual 44px target free while choosing another anchor around a toolbar', () => {
    const target = { x: 173, y: 278, width: 44, height: 44 };
    const toolbar = { x: 100, y: 235, width: 190, height: 40 };
    const placed = placeMapOrientationLabels({ ...base, obstacles: [target, toolbar] });
    expect(placed).toHaveLength(1);
    expect(placed[0].offset[1]).toBeGreaterThan(0);
    expect(mapLabelIntersects(placed[0].rect, target)).toBe(false);
    expect(mapLabelIntersects(placed[0].rect, toolbar)).toBe(false);
  });
  it('omits labels rather than overlapping a sheet or source panel', () => {
    expect(
      placeMapOrientationLabels({ ...base, obstacles: [{ x: 0, y: 0, width: 390, height: 844 }] }),
    ).toEqual([]);
    expect(placeMapOrientationLabels({ ...base, width: 100 })).toEqual([]);
  });
  it('avoids a rendered cluster centroid even when it is not a project position', () => {
    const bubble = { x: 165, y: 226, width: 60, height: 60 };
    const placed = placeMapOrientationLabels({ ...base, obstacles: [bubble] });
    expect(placed).toHaveLength(1);
    expect(placed[0].offset[1]).toBeGreaterThan(0);
    expect(mapLabelIntersects(placed[0].rect, bubble)).toBe(false);
  });
  it('honors the count bound, input priority and mutual clearance', () => {
    const candidates = Array.from({ length: 6 }, (_, i) => ({
      ...label,
      id: `${i}`,
      x: 100 + i * 180,
      y: 350,
    }));
    const placed = placeMapOrientationLabels({ ...base, width: 1440, candidates, limit: 5 });
    expect(placed.map((p) => p.id)).toEqual(['0', '1', '2', '3', '4']);
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++)
        expect(mapLabelIntersects(placed[i].rect, placed[j].rect)).toBe(false);
  });
  it('uses actual candidate widths and rejects offscreen/nonfinite geometry', () => {
    const placed = placeMapOrientationLabels({
      ...base,
      candidates: [
        { ...label, id: 'invalid', x: NaN },
        { ...label, id: 'outside', x: -5 },
        { ...label, id: 'arabic', width: 210 },
      ],
    });
    expect(placed.map((p) => p.id)).toEqual(['arabic']);
    expect(placed[0].rect.width).toBe(210);
  });
});
