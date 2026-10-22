'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PropertyDTO } from '@/src/server/db/properties';
export function MapView({
  properties,
  defer = false,
}: {
  properties: PropertyDTO[];
  defer?: boolean;
}) {
  const [active, setActive] = useState(!defer);
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const t = useTranslations(),
    locale = useLocale();
  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let map: import('maplibre-gl').Map | undefined;
    Promise.all([import('maplibre-gl'), import('maplibre-gl/dist/maplibre-gl.css')])
      .then(([{ Map, NavigationControl, setWorkerUrl }]) => {
        if (!container.current || disposed) return;
        try {
          setWorkerUrl('/vendor/maplibre-gl-worker.mjs');
          map = new Map({
            container: container.current,
            locale: {
              'NavigationControl.ZoomIn': t('zoomIn'),
              'NavigationControl.ZoomOut': t('zoomOut'),
              'NavigationControl.ResetBearing': t('resetBearing'),
            },
            center: properties.length ? [properties[0].lng, properties[0].lat] : [44, 27],
            zoom: properties.length ? 10 : 3,
            style: {
              version: 8,
              sources: {
                land: {
                  type: 'geojson',
                  data: {
                    type: 'FeatureCollection',
                    features: [
                      {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                          type: 'Polygon',
                          coordinates: [
                            [
                              [24, 33],
                              [34, 33],
                              [35, 29],
                              [43, 30],
                              [48, 29],
                              [51, 25],
                              [56, 25],
                              [57, 23],
                              [51, 16],
                              [42, 13],
                              [35, 22],
                              [24, 22],
                              [24, 33],
                            ],
                          ],
                        },
                      },
                    ],
                  },
                },
                homes: {
                  type: 'geojson',
                  cluster: true,
                  clusterMaxZoom: 13,
                  clusterRadius: 40,
                  data: {
                    type: 'FeatureCollection',
                    features: properties.map((p) => ({
                      type: 'Feature' as const,
                      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
                      properties: { id: p.id },
                    })),
                  },
                },
              },
              layers: [
                { id: 'water', type: 'background', paint: { 'background-color': '#c7d8d1' } },
                { id: 'land', source: 'land', type: 'fill', paint: { 'fill-color': '#e7e4d4' } },
                {
                  id: 'clusters',
                  type: 'circle',
                  source: 'homes',
                  filter: ['has', 'point_count'],
                  paint: {
                    'circle-color': '#9b7949',
                    'circle-radius': ['step', ['get', 'point_count'], 20, 5, 26, 15, 34],
                    'circle-stroke-color': '#fffefa',
                    'circle-stroke-width': 3,
                  },
                },
                {
                  id: 'homes',
                  type: 'circle',
                  source: 'homes',
                  filter: ['!', ['has', 'point_count']],
                  paint: {
                    'circle-color': '#173a35',
                    'circle-radius': 10,
                    'circle-stroke-color': '#fffefa',
                    'circle-stroke-width': 3,
                  },
                },
              ],
            },
          });
          map.addControl(new NavigationControl(), 'top-right');
          map.on('click', 'homes', (e) => {
            const id = e.features?.[0]?.properties?.id;
            if (id && properties.some((p) => p.id === id))
              router.push(`/${locale}/properties/${id}`);
          });
          map.on('click', 'clusters', (e) => {
            if (e.features?.[0]?.geometry.type === 'Point')
              map?.easeTo({
                center: e.features[0].geometry.coordinates as [number, number],
                zoom: (map?.getZoom() ?? 10) + 2,
              });
          });
          if (properties.length > 1) {
            const lngs = properties.map((p) => p.lng),
              lats = properties.map((p) => p.lat);
            map.fitBounds(
              [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)],
              ],
              { padding: 65, maxZoom: 12, duration: 0 },
            );
          }
        } catch {
          setUnavailable(true);
        }
      })
      .catch(() => {
        if (!disposed) setUnavailable(true);
      });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [properties, locale, router, active, t]);
  return (
    <section className="map-panel">
      <div className="map-wrap">
        <div ref={container} className="map-canvas" role="region" aria-label={t('map')} />
        {!active && (
          <button className="button button-primary map-load" onClick={() => setActive(true)}>
            {t('openMap')}
          </button>
        )}
      </div>
      <p className="small muted">{t(unavailable ? 'mapUnavailable' : 'mapNote')}</p>
      <div className="map-legend">
        {properties.map((p) => (
          <Link key={p.id} href={`/${locale}/properties/${p.id}`}>
            <span className="map-dot" />
            {p.translations.find((tr) => tr.locale === locale)?.title} ·{' '}
            {locale === 'ar' ? p.community.nameAr : p.community.nameEn}
          </Link>
        ))}
      </div>
    </section>
  );
}
