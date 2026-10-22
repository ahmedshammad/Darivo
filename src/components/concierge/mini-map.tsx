'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { ArrowUpRight } from 'lucide-react';
import type { AtlasCamera, AtlasProject } from '@/src/lib/atlas';
import type { ConciergeComponent } from '@/src/lib/concierge';
import { ATLAS_PLACES } from '@/src/lib/atlas-intent';
import { conciergeCopy, type ConciergeLocale } from '@/messages/concierge';
import { usePreferences } from '@/src/components/preferences';

type MiniMapComponent = Extract<ConciergeComponent, { kind: 'mini-map' }>;
type Land = FeatureCollection<Polygon | MultiPolygon>;

/** A regional geographic preview, projected from the bundled real coastline; no second GL context. */
export function ConciergeMiniMap({
  component,
  projects,
  locale,
  onMap,
}: {
  component: MiniMapComponent;
  projects: AtlasProject[];
  locale: ConciergeLocale;
  onMap: (camera: AtlasCamera, ids: string[]) => void;
}) {
  const t = conciergeCopy[locale];
  const { arabicIndicDigits } = usePreferences();
  const number = (n: number) =>
    new Intl.NumberFormat(locale, { numberingSystem: arabicIndicDigits ? 'arab' : 'latn' }).format(
      n,
    );
  const [land, setLand] = useState<Land | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const titleId = useId();
  const anchors = component.entities.flatMap((entity) => {
    const project =
      entity.kind === 'project' ? projects.find((item) => item.id === entity.id) : undefined;
    if (project)
      return [
        {
          id: project.id,
          name: locale === 'ar' ? project.nameAr : project.nameEn,
          center: project.center,
          zoom: 12.5,
        },
      ];
    const place =
      entity.kind === 'place' ? ATLAS_PLACES.find((item) => item.id === entity.id) : undefined;
    return place
      ? [
          {
            id: place.id,
            name: locale === 'ar' ? place.nameAr : place.nameEn,
            center: place.center,
            zoom: place.zoom,
          },
        ]
      : [];
  });
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/map-styles/natural-earth-land.geojson', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('geography_unavailable');
        const result = (await response.json()) as Land;
        if (result.type !== 'FeatureCollection' || !Array.isArray(result.features))
          throw new Error('geography_unavailable');
        if (!controller.signal.aborted) setLand(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setUnavailable(true);
      });
    return () => controller.abort();
  }, []);
  const points = anchors.length
    ? anchors.map((anchor) => anchor.center)
    : [component.camera.center];
  const west = Math.min(...points.map((point) => point[0]));
  const east = Math.max(...points.map((point) => point[0]));
  const south = Math.min(...points.map((point) => point[1]));
  const north = Math.max(...points.map((point) => point[1]));
  const cx = (west + east) / 2;
  const cy = (south + north) / 2;
  const cosine = Math.cos((cy * Math.PI) / 180);
  const scale = Math.min(
    392 / Math.max((east - west) * cosine, 0.35),
    172 / Math.max(north - south, 0.25),
  );
  const project = (longitude: number, latitude: number) => [
    240 + (longitude - cx) * cosine * scale,
    120 - (latitude - cy) * scale,
  ];
  const path = useMemo(() => {
    if (!land) return '';
    const point = (p: number[]) =>
      `${(240 + (p[0] - cx) * cosine * scale).toFixed(1)},${(120 - (p[1] - cy) * scale).toFixed(1)}`;
    return land.features
      .flatMap((feature) => {
        const polygons =
          feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates]
            : feature.geometry.coordinates;
        return polygons.flatMap((polygon) =>
          polygon.map((ring) => `M${ring.map(point).join('L')}Z`),
        );
      })
      .join('');
  }, [land, cx, cy, cosine, scale]);
  return (
    <section className="cq-mini-map" data-component-kind="mini-map">
      <div className="cq-card-kicker">
        <h3>{t.mapPreview}</h3>
        <span className="cq-badge">{t.approximate}</span>
      </div>
      {land ? (
        <svg viewBox="0 0 480 240" role="img" aria-labelledby={titleId}>
          <title
            id={titleId}
          >{`${t.mapPreview}: ${anchors.map((anchor) => anchor.name).join(' · ')}`}</title>
          <rect width="480" height="240" className="cq-mini-water" />
          <path d={path} className="cq-mini-land" fillRule="evenodd" />
          {anchors.map((anchor, index) => {
            const [x, y] = project(...anchor.center);
            return (
              <g key={anchor.id} transform={`translate(${x},${y})`}>
                <circle r="13" />
                <text textAnchor="middle" dy=".35em">
                  {number(index + 1)}
                </text>
              </g>
            );
          })}
          <text className="cq-mini-north" x="459" y="21" textAnchor="middle">
            ↑
          </text>
        </svg>
      ) : (
        <p className="cq-notice" role="status">
          {unavailable ? t.previewUnavailable : t.previewLoading}
        </p>
      )}
      <p className="cq-fine">
        {t.regionalPreview} ·{' '}
        <a
          href="https://www.naturalearthdata.com/about/terms-of-use/"
          target="_blank"
          rel="noreferrer"
        >
          Natural Earth
        </a>
      </p>
      <ol className="cq-mini-places">
        {anchors.map((anchor, index) => (
          <li key={anchor.id}>
            <button
              type="button"
              onClick={() =>
                onMap(
                  {
                    center: anchor.center,
                    zoom: anchor.zoom,
                    pitch: 0,
                    key: `${component.id}-${anchor.id}`,
                  },
                  [anchor.id],
                )
              }
            >
              <span>{number(index + 1)}</span>
              {anchor.name}
              <ArrowUpRight aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="cq-action"
        onClick={() =>
          onMap(
            component.camera,
            component.entities.map((entity) => entity.id),
          )
        }
      >
        {t.showMap}
        <ArrowUpRight aria-hidden="true" />
      </button>
    </section>
  );
}
