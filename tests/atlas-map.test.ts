import { describe, expect, it } from 'vitest';
import {
  atlasCircle,
  atlasFitPoints,
  atlasOverviewStyle,
  atlasProjectPoint,
  atlasUnprojectPoint,
} from '../src/lib/tiles';
import { atlasDistanceKm, atlasComparisonMetrics } from '../src/lib/atlas-intent';
import type { AtlasPoint } from '../src/lib/atlas';
import { ATLAS_TRAVEL_SPEED_KMH } from '../src/lib/atlas';

describe('geographic map calculations', () => {
  it('preserves actual UAE and Egypt positions through the fallback Mercator projection', () => {
    const places: AtlasPoint[] = [
      [55.139, 25.112],
      [54.434, 24.538],
      [27.88, 31.22],
      [31.481, 30.017],
    ];
    for (const point of places)
      for (const zoom of [1, 3, 7]) {
        const restored = atlasUnprojectPoint(atlasProjectPoint(point, zoom), zoom);
        expect(restored[0]).toBeCloseTo(point[0], 8);
        expect(restored[1]).toBeCloseTo(point[1], 8);
      }
  });
  it('keeps every illustrative reach-ring point at the declared geodesic radius', () => {
    const center: AtlasPoint = [55.276, 25.194];
    for (const minutes of [10, 20, 30]) {
      const radius = (minutes * ATLAS_TRAVEL_SPEED_KMH) / 60;
      const ring = atlasCircle(center, radius);
      expect(ring).toHaveLength(65);
      for (const point of ring) expect(atlasDistanceKm(center, point)).toBeCloseTo(radius, 6);
      expect(ring[0][0]).toBeCloseTo(ring.at(-1)![0], 9);
      expect(ring[0][1]).toBeCloseTo(ring.at(-1)![1], 9);
    }
  });
  it('clamps polar coordinates to the finite Mercator domain', () => {
    expect(atlasProjectPoint([0, 90], 3).every(Number.isFinite)).toBe(true);
    expect(atlasProjectPoint([0, -90], 3).every(Number.isFinite)).toBe(true);
  });
});

describe('comparison truthfulness and framing', () => {
  const palm = { center: [55.139, 25.112] as AtlasPoint, country: 'UAE' };
  it('uses the shared speed for local straight-line illustrations', () => {
    const metrics = atlasComparisonMetrics(palm, { center: [55.27, 25.19], country: 'UAE' });
    expect(metrics.estimatedMinutes).toBe(
      Math.round((metrics.distanceKm / ATLAS_TRAVEL_SPEED_KMH) * 60),
    );
    expect(metrics.estimatedMinutes).toBeGreaterThan(0);
  });
  it('never presents cross-border or very long distances as drive minutes', () => {
    expect(
      atlasComparisonMetrics(palm, { center: [28.02, 31.1], country: 'Egypt' }).estimatedMinutes,
    ).toBeNull();
    expect(
      atlasComparisonMetrics(palm, { center: [55.14, 25.12], country: 'Egypt' }).estimatedMinutes,
    ).toBeNull();
    expect(
      atlasComparisonMetrics(palm, { center: [53, 24], country: 'UAE' }).estimatedMinutes,
    ).toBeNull();
  });
  it('keeps all four endpoints inside the padded fallback viewport', () => {
    const points: AtlasPoint[] = [
      [55.139, 25.112],
      [54.43, 24.54],
      [28.02, 31.1],
      [31.48, 30.017],
    ];
    const padding = { top: 120, bottom: 290, left: 35, right: 35 };
    const fitted = atlasFitPoints(points, 390, 844, padding);
    const origin = atlasProjectPoint(fitted.center, fitted.zoom);
    for (const point of points) {
      const p = atlasProjectPoint(point, fitted.zoom);
      const x = p[0] - origin[0] + (390 + padding.left - padding.right) / 2;
      const y = p[1] - origin[1] + (844 + padding.top - padding.bottom) / 2;
      expect(x).toBeGreaterThanOrEqual(padding.left - 0.001);
      expect(x).toBeLessThanOrEqual(390 - padding.right + 0.001);
      expect(y).toBeGreaterThanOrEqual(padding.top - 0.001);
      expect(y).toBeLessThanOrEqual(844 - padding.bottom + 0.001);
    }
  });
});

describe('progressive world geography', () => {
  it('opens a real globe without invisible street or terrain dependencies', () => {
    for (const theme of ['dark', 'light'] as const) {
      const style = atlasOverviewStyle(theme);
      expect(style.projection).toEqual({ type: 'globe' });
      expect(Object.keys(style.sources)).toEqual(['atlas-world-land']);
      const source = style.sources['atlas-world-land'];
      expect(source.type).toBe('geojson');
      if (source.type === 'geojson')
        expect(source.data).toBe('/map-styles/natural-earth-land.geojson');
      expect(style.terrain).toBeUndefined();
      expect(style.layers).toHaveLength(2);
      expect(
        style.layers.some(
          (layer) => layer.type === 'line' || layer.type === 'symbol' || layer.type === 'circle',
        ),
      ).toBe(false);
      const land = style.layers.find((layer) => layer.id === 'overview-land');
      expect(land?.type === 'fill' && land.paint?.['fill-outline-color']).toBeTruthy();
    }
  });
});
