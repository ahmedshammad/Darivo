'use client';

import { useEffect, useRef, useState } from 'react';
import { Compass, Minus, Plus } from 'lucide-react';
import type { Map as LibreMap, GeoJSONSource, Popup as LibrePopup } from 'maplibre-gl';
import type { MapLibreOverlay } from '@deck.gl/maplibre';
import type { Color, Layer } from '@deck.gl/core';
import type { FeatureCollection, Geometry, Position } from 'geojson';
import type { AtlasPoint, AtlasProject, LivingMapProps } from '@/src/lib/atlas';
import { ATLAS_TRAVEL_SPEED_KMH } from '@/src/lib/atlas';
import { ATLAS_PLACES, atlasComparisonMetrics } from '@/src/lib/atlas-intent';
import { FX, FX_DATE } from '@/src/lib/catalog';
import {
  atlasCircle,
  atlasFitPoints,
  atlasOverviewStyle,
  atlasProjectPoint,
  atlasUnprojectPoint,
  loadAtlasStyle,
  openTileProvider,
} from '@/src/lib/tiles';
import './living-map.css';

const copy = {
  en: {
    map: 'Living map',
    loading: 'Finding our bearings',
    fallback: 'Regional 2D map',
    fallbackDetail: 'Offline geography · street and 3D detail unavailable',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    north: 'Face north',
    sources: 'Map sources & reading the map',
    legend: 'Height: relative price · glow: brief match',
    clusters:
      'Numbered circles group nearby project references and demos. Select a circle to explore its places.',
    reference: 'Reference · approximate location',
    demo: 'Demo project',
    price: 'Column height compares indicative prices in AED using static demo FX',
    unknown: 'No price: flat marker',
    approximation: 'Locations approximate. Columns are price symbols, not building heights.',
    poi: 'Demo POIs · fictional places, not verified amenities',
    hex: 'Demo unit price per m² · not a community average',
    ring: `Illustrative reach · ${ATLAS_TRAVEL_SPEED_KMH} km/h, no roads or traffic. Not a drive-time result.`,
    compare: `Straight-line distance · local illustration at ${ATLAS_TRAVEL_SPEED_KMH} km/h. Cross-border or over 150 km: distance only. Not a route.`,
    sun: 'Sun / view illustration · viewer-local time, not a property orientation study',
    view: 'Camera view direction · residence orientation unknown',
    sunFallback: 'Sun / view detail is unavailable in regional 2D mode.',
    terrainOff: 'Terrain unavailable · geographic map retained',
    overlayOff: '3D symbols unavailable · map markers retained',
    km: 'km',
    min: 'min',
    sourceData: 'Geography: OpenStreetMap · elevation: Mapterhorn',
    day: 'Daylight',
    evening: 'Golden hour',
    night: 'Night',
    reset: 'Reset regional view',
  },
  ar: {
    map: 'الخريطة الحيّة',
    loading: 'نرسم ملامح المكان',
    fallback: 'خريطة إقليمية ثنائية الأبعاد',
    fallbackDetail: 'جغرافيا محفوظة · تفاصيل الشوارع والأبعاد الثلاثية غير متاحة',
    zoomIn: 'تكبير الخريطة',
    zoomOut: 'تصغير الخريطة',
    north: 'الاتجاه نحو الشمال',
    sources: 'مصادر الخريطة وطريقة قراءتها',
    legend: 'الارتفاع: السعر النسبي · التوهّج: توافق الطلب',
    clusters:
      'الدوائر المرقّمة تجمع المشاريع المرجعية والتجريبية القريبة. اختر دائرة لاستكشاف أماكنها.',
    reference: 'مرجع · موقع تقريبي',
    demo: 'مشروع تجريبي',
    price: 'ارتفاع العمود يقارن أسعاراً استرشادية بالدرهم، بصرف تجريبي ثابت',
    unknown: 'دون سعر: علامة مسطّحة',
    approximation: 'المواقع تقريبية. الأعمدة ترمز للأسعار وليست ارتفاعات المباني.',
    poi: 'مرافق تجريبية · أماكن افتراضية وليست مرافق موثّقة',
    hex: 'سعر المتر لوحدة تجريبية · ليس متوسط المنطقة',
    ring: `نطاق توضيحي بسرعة ${new Intl.NumberFormat('ar-u-nu-arab').format(ATLAS_TRAVEL_SPEED_KMH)} كم/ساعة دون طرق أو ازدحام. ليس زمن قيادة فعلياً.`,
    compare: `مسافة بخط مستقيم · تقدير محلي بسرعة ${new Intl.NumberFormat('ar-u-nu-arab').format(ATLAS_TRAVEL_SPEED_KMH)} كم/ساعة. عبر الحدود أو أكثر من ١٥٠ كم: المسافة فقط، وليست مساراً.`,
    sun: 'الشمس والإطلالة للتوضيح · بحسب وقت جهازك، وليست دراسة لاتجاه العقار',
    view: 'اتجاه الكاميرا · اتجاه الوحدة غير معلوم',
    sunFallback: 'تفاصيل الشمس والإطلالة غير متاحة في العرض الإقليمي ثنائي الأبعاد.',
    terrainOff: 'التضاريس غير متاحة · الخريطة الجغرافية باقية',
    overlayOff: 'الرموز الثلاثية غير متاحة · علامات الخريطة باقية',
    km: 'كم',
    min: 'دقيقة',
    sourceData: 'الجغرافيا: OpenStreetMap · الارتفاعات: Mapterhorn',
    day: 'ضوء النهار',
    evening: 'الساعة الذهبية',
    night: 'الليل',
    reset: 'إعادة العرض الإقليمي',
  },
};

type DeckLayers = typeof import('@deck.gl/layers');
type MapRuntime = {
  map: LibreMap;
  overlay?: MapLibreOverlay;
  deck?: DeckLayers;
  popup?: LibrePopup;
  update: () => void;
  projects?: AtlasProject[];
  labelSignature?: string;
};
const initialCenter: AtlasPoint = [42, 27];
const bronze: Color = [176, 141, 87, 230];
const nameOf = (p: AtlasProject, locale: LivingMapProps['locale']) =>
  locale === 'ar' ? p.nameAr : p.nameEn;
const featureData = (projects: AtlasProject[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features: projects.map((p) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: p.center },
    properties: { id: p.id },
  })),
});
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const flightDuration = () => (reducedMotion() ? 0 : 600);
function priceHeight(project: AtlasProject) {
  if (!project.amount || !FX[project.currency]) return 0;
  return Math.max(
    70,
    Math.min(1800, Math.sqrt(project.amount / FX[project.currency] / 1_000_000) * 130),
  );
}
function timeOfDay() {
  const hour = new Date().getHours();
  return {
    hour,
    phase: hour < 6 || hour >= 20 ? 'night' : hour < 8 || hour >= 17 ? 'evening' : 'day',
  } as const;
}
function cameraFlight(map: LibreMap, props: LivingMapProps) {
  if (!props.camera) return;
  const camera = props.camera;
  map.stop();
  const comparison = (props.compareIds ?? [])
    .slice(0, 4)
    .flatMap((id) => props.projects.filter((p) => p.id === id));
  if (comparison.length > 1) {
    const xs = comparison.map((p) => p.center[0]);
    const ys = comparison.map((p) => p.center[1]);
    const padding = camera.padding ?? { top: 100, bottom: 100, left: 40, right: 40 };
    map.setProjection({ type: 'mercator' });
    map.fitBounds(
      [
        [Math.min(...xs), Math.min(...ys)],
        [Math.max(...xs), Math.max(...ys)],
      ],
      {
        padding: {
          top: padding.top + 35,
          bottom: padding.bottom + 35,
          left: padding.left + 35,
          right: padding.right + 35,
        },
        pitch: 0,
        bearing: 0,
        maxZoom: 13,
        duration: flightDuration(),
        essential: false,
      },
    );
    return;
  }
  for (const layer of map.getStyle().layers) {
    if (layer.id.startsWith('label-'))
      map.setLayoutProperty(
        layer.id,
        'visibility',
        props.mode === 'arrival' && camera.zoom < 5 ? 'none' : 'visible',
      );
  }
  // A local intent switches the arrival globe to the familiar local map projection.
  map.setProjection({ type: props.mode === 'arrival' && camera.zoom < 5 ? 'globe' : 'mercator' });
  map.flyTo({
    center: camera.center,
    zoom: camera.zoom,
    pitch: camera.pitch ?? 48,
    bearing: camera.bearing ?? -15,
    padding: camera.padding ?? { top: 60, bottom: 70, left: 20, right: 20 },
    duration: flightDuration(),
    essential: false,
    easing: (t) => 1 - (1 - t) ** 3,
  });
}

function renderLayers(runtime: MapRuntime, props: LivingMapProps) {
  const { map, overlay, deck } = runtime;
  const source = map.getSource('atlas-projects') as GeoJSONSource | undefined;
  if (runtime.projects !== props.projects) {
    source?.setData(featureData(props.projects));
    runtime.projects = props.projects;
  }
  if (!overlay || !deck) return;
  const { ColumnLayer, ScatterplotLayer, PathLayer, PolygonLayer } = deck;
  const dark = props.theme === 'dark';
  const highlighted = new Set(props.highlightedIds ?? []);
  const local = map.getZoom() >= 9;
  const projects = props.projects;
  const alpha = (p: AtlasProject) =>
    Math.round(45 + Math.max(0, Math.min(1, p.match > 1 ? p.match / 100 : p.match)) * 130);
  const select = ({ object }: { object?: AtlasProject }) => {
    if (object) props.onSelect?.(object.id);
  };
  const layers: Layer[] = [];
  const labels: FeatureCollection = { type: 'FeatureCollection', features: [] };
  const number = (value: number, decimals = 0) =>
    new Intl.NumberFormat(props.locale, {
      numberingSystem: props.arabicIndicDigits ? 'arab' : 'latn',
      maximumFractionDigits: decimals,
    }).format(value);
  if (local) {
    for (const [index, radius, opacity] of [
      [0, 19, 0.1],
      [1, 12, 0.19],
      [2, 6, 0.35],
    ]) {
      layers.push(
        new ScatterplotLayer<AtlasProject>({
          id: `atlas-glow-${index}`,
          data: projects,
          getPosition: (p) => p.center,
          radiusUnits: 'pixels',
          getRadius: (p) => radius + (p.id === props.selectedId ? 8 : 0),
          getFillColor: (p) => [176, 141, 87, alpha(p)],
          opacity,
          pickable: true,
          onClick: select,
          parameters: { depthWriteEnabled: false },
        }),
      );
    }
    layers.push(
      new ColumnLayer<AtlasProject>({
        id: 'atlas-light-columns',
        data: projects.filter((p) => p.amount !== null),
        diskResolution: 8,
        radius: 3.1,
        radiusUnits: 'pixels',
        extruded: true,
        getPosition: (p) => p.center,
        getElevation: priceHeight,
        getFillColor: (p) =>
          p.id === props.selectedId
            ? [247, 244, 238, 255]
            : highlighted.has(p.id)
              ? [211, 178, 121, 245]
              : bronze,
        material: false,
        pickable: true,
        onClick: select,
        updateTriggers: { getFillColor: [props.selectedId, props.highlightedIds] },
      }),
    );
    layers.push(
      new ScatterplotLayer<AtlasProject>({
        id: 'atlas-column-cores',
        data: projects,
        getPosition: (p) => [p.center[0], p.center[1], priceHeight(p)],
        getRadius: 3.5,
        radiusUnits: 'pixels',
        getFillColor: dark ? [247, 244, 238, 250] : [80, 60, 30, 255],
        pickable: true,
        onClick: select,
      }),
    );
  }
  const poiLayers = new Set(props.layers ?? []);
  const pois = (props.pois ?? []).filter((p) =>
    poiLayers.has(p.kind as NonNullable<LivingMapProps['layers']>[number]),
  );
  if (pois.length) {
    layers.push(
      new ScatterplotLayer({
        id: 'atlas-demo-pois',
        data: pois,
        getPosition: (d) => d.center,
        getRadius: 6,
        radiusUnits: 'pixels',
        getFillColor: dark ? [220, 219, 207, 200] : [75, 83, 74, 220],
        stroked: true,
        getLineColor: bronze,
        getLineWidth: 1,
        lineWidthUnits: 'pixels',
      }),
    );
    labels.features.push(
      ...pois.map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: p.center },
        properties: {
          name: `${props.locale === 'ar' ? p.nameAr : p.nameEn} · ${props.locale === 'ar' ? 'تجريبي' : 'Demo'}`,
        },
      })),
    );
  }
  if (poiLayers.has('hex')) {
    const hexes = projects
      .filter((p) => p.kind === 'DEMO' && p.demoPricePerSqmAED != null)
      .map((p) => ({ ...p, polygon: atlasCircle(p.center, 0.7, 6) }));
    layers.unshift(
      new PolygonLayer({
        id: 'atlas-demo-price-hexes',
        data: hexes,
        getPolygon: (d) => d.polygon,
        getFillColor: (d) => [176, 141, 87, Math.min(120, 25 + (d.demoPricePerSqmAED ?? 0) / 1000)],
        stroked: true,
        getLineColor: [176, 141, 87, 140],
        lineWidthMinPixels: 1,
        extruded: false,
      }),
    );
    labels.features.push(
      ...hexes.map((project) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: project.center },
        properties: {
          name: `${number(project.demoPricePerSqmAED ?? 0)} AED/m² · ${props.locale === 'ar' ? 'تجريبي' : 'Demo'}`,
        },
      })),
    );
  }
  if (props.isochrone) {
    const ring = atlasCircle(
      props.isochrone.center,
      (props.isochrone.minutes * ATLAS_TRAVEL_SPEED_KMH) / 60,
    );
    layers.unshift(
      new PolygonLayer({
        id: 'atlas-illustrative-reach',
        data: [ring],
        getPolygon: (d) => d,
        getFillColor: [176, 141, 87, 30],
        getLineColor: [176, 141, 87, 200],
        stroked: true,
        lineWidthMinPixels: 2,
      }),
    );
  }
  const comparison = (props.compareIds ?? [])
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is AtlasProject => Boolean(p))
    .slice(0, 4);
  if (comparison.length > 1) {
    const links = comparison.slice(1).map((p) => ({
      path: [comparison[0].center, p.center],
      midpoint: [
        (comparison[0].center[0] + p.center[0]) / 2,
        (comparison[0].center[1] + p.center[1]) / 2,
      ] as AtlasPoint,
      ...atlasComparisonMetrics(comparison[0], p),
    }));
    layers.push(
      new PathLayer({
        id: 'atlas-compare-lines',
        data: links,
        getPath: (d) => d.path,
        getColor: bronze,
        getWidth: 2,
        widthUnits: 'pixels',
        widthMinPixels: 2,
      }),
    );
    layers.push(
      new ScatterplotLayer({
        id: 'atlas-compare-endpoints',
        data: comparison,
        getPosition: (p) => p.center,
        getRadius: 7,
        radiusUnits: 'pixels',
        getFillColor: bronze,
        stroked: true,
        getLineColor: dark ? [247, 244, 238, 255] : [42, 43, 48, 255],
        lineWidthMinPixels: 2,
        pickable: true,
        onClick: select,
      }),
    );
    labels.features.push(
      ...links.map((link) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: link.midpoint },
        properties: {
          name: `${number(link.distanceKm, 1)} ${copy[props.locale].km}${link.estimatedMinutes === null ? '' : ` · ~${number(link.estimatedMinutes)} ${copy[props.locale].min}`}`,
        },
      })),
    );
  }
  const selected = projects.find((p) => p.id === props.selectedId);
  if (props.sun && selected) {
    const ring = atlasCircle(selected.center, 0.7, 48);
    const hour = timeOfDay().hour;
    const solarIndex = Math.round((((hour - 6 + 24) % 24) / 24) * 48);
    const ray = [selected.center, ring[solarIndex]];
    const viewIndex = Math.round((((map.getBearing() + 360) % 360) / 360) * 48);
    layers.push(
      new PathLayer({
        id: 'atlas-view-direction',
        data: [[selected.center, ring[viewIndex]]],
        getPath: (d) => d,
        getColor: dark ? [233, 226, 214, 220] : [42, 43, 48, 220],
        getWidth: 2,
        widthUnits: 'pixels',
      }),
    );
    labels.features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: ring[viewIndex] },
      properties: { name: copy[props.locale].view },
    });
    layers.push(
      new PathLayer({
        id: 'atlas-sun-illustration',
        data: [ring.slice(0, 25), ray],
        getPath: (d) => d,
        getColor: [208, 173, 111, 230],
        getWidth: 2,
        widthUnits: 'pixels',
      }),
    );
    layers.push(
      new ScatterplotLayer({
        id: 'atlas-sun-dot',
        data: [ring[solarIndex]],
        getPosition: (d) => d,
        getFillColor: [236, 198, 123, 255],
        getRadius: 7,
        radiusUnits: 'pixels',
      }),
    );
  }
  const labelSignature = JSON.stringify(labels);
  if (runtime.labelSignature !== labelSignature) {
    (map.getSource('atlas-overlay-labels') as GeoJSONSource | undefined)?.setData(labels);
    runtime.labelSignature = labelSignature;
  }
  overlay.setProps({ layers });
}

export function LivingMap(props: LivingMapProps) {
  const { theme, locale, mode = 'explore', forceFallback = false } = props;
  const host = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const runtime = useRef<MapRuntime | null>(null);
  const latest = useRef(props);
  const [status, setStatus] = useState<'loading' | 'webgl' | 'fallback'>(
    forceFallback ? 'fallback' : 'loading',
  );
  const [terrainOff, setTerrainOff] = useState(false);
  const [overlayOff, setOverlayOff] = useState(false);
  const [overview, setOverview] = useState(mode === 'arrival' && (props.camera?.zoom ?? 2.3) < 5);
  const [phase, setPhase] = useState<'day' | 'evening' | 'night'>('night');
  const text = copy[locale];
  useEffect(() => {
    latest.current = props;
  }, [props]);

  useEffect(() => {
    let disposed = false;
    let failed = false;
    const abort = new AbortController();
    let map: LibreMap | undefined;
    let observer: ResizeObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let arrivalTimer: ReturnType<typeof setTimeout> | undefined;
    let detachMeasurement: (() => void) | undefined;
    const fallback = () => {
      if (disposed || failed) return;
      failed = true;
      clearTimeout(timeout);
      clearTimeout(arrivalTimer);
      setStatus('fallback');
      latest.current.onReady?.('fallback');
      queueMicrotask(() => {
        if (disposed) return;
        detachMeasurement?.();
        observer?.disconnect();
        runtime.current?.overlay?.finalize();
        runtime.current?.popup?.remove();
        runtime.current = null;
        map?.remove();
        map = undefined;
      });
    };
    if (forceFallback) {
      queueMicrotask(fallback);
      return () => {
        disposed = true;
      };
    }
    queueMicrotask(() => {
      if (!disposed) {
        setStatus('loading');
        setTerrainOff(false);
        setOverlayOff(false);
      }
    });
    void (async () => {
      try {
        const arrival = mode === 'arrival';
        const startOverview = arrival && (latest.current.camera?.zoom ?? 2.3) < 5;
        setOverview(startOverview);
        const [{ Map, NavigationControl, Popup, setWorkerUrl }, style] = await Promise.all([
          import('maplibre-gl'),
          startOverview
            ? Promise.resolve(atlasOverviewStyle(theme))
            : loadAtlasStyle(theme, locale, abort.signal),
          import('maplibre-gl/dist/maplibre-gl.css'),
        ]);
        if (disposed || !host.current) return;
        setWorkerUrl('/vendor/maplibre-gl-worker.mjs');
        const camera = latest.current.camera;
        const currentTime = timeOfDay();
        setPhase(currentTime.phase);
        map = new Map({
          container: host.current,
          style,
          center: camera?.center ?? (arrival ? initialCenter : [55.17, 25.12]),
          zoom: camera?.zoom ?? (arrival ? 2.45 : 10.5),
          pitch: camera?.pitch ?? (arrival ? 0 : 48),
          bearing: camera?.bearing ?? (arrival ? 0 : -15),
          attributionControl: false,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 1.6),
          canvasContextAttributes: { antialias: false },
          locale: {
            'NavigationControl.ZoomIn': text.zoomIn,
            'NavigationControl.ZoomOut': text.zoomOut,
            'NavigationControl.ResetBearing': text.north,
          },
        });
        const activeMap = map;
        const instrumentedRoot = root.current;
        if (instrumentedRoot) {
          instrumentedRoot.dataset.tilesReady = 'false';
          instrumentedRoot.dataset.styleLoaded = 'false';
          let cancelMeasurement: (() => void) | undefined;
          const measure = (event: Event) => {
            const requested = (event as CustomEvent<{ durationMs?: unknown }>).detail?.durationMs;
            const durationMs =
              typeof requested === 'number' && Number.isFinite(requested)
                ? Math.max(1500, Math.min(5000, requested))
                : 1500;
            cancelMeasurement?.();
            const startedAt = performance.now();
            const timestamps: number[] = [];
            const moving: boolean[] = [];
            const recordRender = () => {
              timestamps.push(performance.now() - startedAt);
              moving.push(activeMap.isMoving());
            };
            activeMap.on('render', recordRender);
            const timer = setTimeout(() => {
              activeMap.off('render', recordRender);
              cancelMeasurement = undefined;
              if (disposed || failed) return;
              const intervals = timestamps
                .slice(1)
                .map((timestamp, index) => timestamp - timestamps[index]);
              instrumentedRoot.dispatchEvent(
                new CustomEvent('atlas:metrics', {
                  bubbles: true,
                  detail: {
                    renderer: 'maplibre',
                    durationMs: performance.now() - startedAt,
                    frameCount: timestamps.length,
                    timestamps,
                    intervals,
                    moving,
                    tilesReady: activeMap.areTilesLoaded(),
                  },
                }),
              );
            }, durationMs);
            cancelMeasurement = () => {
              clearTimeout(timer);
              activeMap.off('render', recordRender);
            };
          };
          instrumentedRoot.addEventListener('atlas:measure', measure);
          detachMeasurement = () => {
            instrumentedRoot.removeEventListener('atlas:measure', measure);
            cancelMeasurement?.();
          };
          activeMap.on('movestart', () => {
            instrumentedRoot.dataset.tilesReady = 'false';
          });
          activeMap.on('style.load', () => {
            instrumentedRoot.dataset.styleLoaded = 'true';
            instrumentedRoot.dataset.tilesReady = String(activeMap.areTilesLoaded());
          });
          activeMap.on('idle', () => {
            instrumentedRoot.dataset.tilesReady = String(activeMap.areTilesLoaded());
          });
        }
        const recordCamera = () => {
          if (!root.current) return;
          root.current.dataset.center = JSON.stringify(activeMap.getCenter().toArray());
          root.current.dataset.zoom = activeMap.getZoom().toFixed(3);
          root.current.dataset.pitch = activeMap.getPitch().toFixed(1);
          root.current.dataset.moving = String(activeMap.isMoving());
        };
        activeMap.on('movestart', recordCamera);
        activeMap.on('moveend', recordCamera);
        recordCamera();
        activeMap.getCanvas().setAttribute('aria-label', text.map);
        activeMap.getCanvas().addEventListener('webglcontextlost', fallback);
        if (arrival) activeMap.scrollZoom.disable();
        activeMap.addControl(
          new NavigationControl({ showCompass: true, visualizePitch: true }),
          locale === 'ar' ? 'top-left' : 'top-right',
        );
        observer = new ResizeObserver(() => activeMap.resize());
        observer.observe(host.current);
        timeout = setTimeout(fallback, 14000);
        let sourceFailures = 0;
        activeMap.on('error', (event) => {
          if (disposed) return;
          const sourceId = 'sourceId' in event ? event.sourceId : undefined;
          if (sourceId === 'atlas-terrain') {
            activeMap.setTerrain(null);
            setTerrainOff(true);
          } else if (sourceId === 'openmaptiles' && ++sourceFailures >= 6) fallback();
        });
        activeMap.on('load', () => {
          if (disposed || failed) return;
          clearTimeout(timeout);
          activeMap.setProjection({
            type: arrival && (!camera || camera.zoom < 5) ? 'globe' : 'mercator',
          });
          activeMap.setLight({
            anchor: 'viewport',
            color: currentTime.phase === 'day' ? '#fff6e4' : '#dfbd83',
            intensity: currentTime.phase === 'night' ? 0.25 : 0.55,
            position: [1.2, (currentTime.hour / 24) * 360, currentTime.phase === 'night' ? 80 : 40],
          });
          activeMap.addSource('atlas-projects', {
            type: 'geojson',
            data: featureData(latest.current.projects),
            cluster: true,
            clusterMaxZoom: 8,
            clusterRadius: 48,
          });
          activeMap.addLayer({
            id: 'atlas-clusters',
            type: 'circle',
            source: 'atlas-projects',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': theme === 'dark' ? '#E9E2D6' : '#2A2B30',
              'circle-radius': ['step', ['get', 'point_count'], 19, 8, 24, 30, 29],
              'circle-stroke-color': '#B08D57',
              'circle-stroke-width': 1,
            },
          });
          activeMap.addLayer({
            id: 'atlas-cluster-counts',
            type: 'symbol',
            source: 'atlas-projects',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': ['get', 'point_count_abbreviated'],
              'text-font': ['Noto Sans Regular'],
              'text-size': 12,
            },
            paint: { 'text-color': theme === 'dark' ? '#16171A' : '#F7F4EE' },
          });
          activeMap.addLayer({
            id: 'atlas-markers',
            type: 'circle',
            source: 'atlas-projects',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-radius': 5,
              'circle-color': '#B08D57',
              'circle-stroke-color': theme === 'dark' ? '#E9E2D6' : '#2A2B30',
              'circle-stroke-width': 1,
            },
          });
          activeMap.addSource('atlas-overlay-labels', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });
          activeMap.addLayer({
            id: 'atlas-overlay-text',
            type: 'symbol',
            source: 'atlas-overlay-labels',
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Noto Sans Regular'],
              'text-size': 12,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
              'text-max-width': 18,
            },
            paint: {
              'text-color': theme === 'dark' ? '#F7F4EE' : '#2A2B30',
              'text-halo-color': theme === 'dark' ? '#0B0B0C' : '#F7F4EE',
              'text-halo-width': 2,
            },
          });
          let basePainted = false;
          let detailReady = !startOverview;
          let detailLoading = false;
          let deckLoading = false;
          let terrainEnabled = false;
          let terrainFailed = false;
          const entry: MapRuntime = {
            map: activeMap,
            projects: latest.current.projects,
            update: () => {
              enhanceVisibleScene();
              renderLayers(entry, latest.current);
            },
          };
          // Enhancements follow visible scale and a completed basemap frame, not a delay or audit heuristic.
          const enhanceVisibleScene = () => {
            if (disposed || failed || !basePainted) return;
            const zoom = activeMap.getZoom();
            const local = zoom >= 9;
            if (!detailReady && !detailLoading && zoom >= 5) {
              detailLoading = true;
              void loadAtlasStyle(theme, locale, abort.signal)
                .then((detailStyle) => {
                  if (disposed || failed) return;
                  for (const [id, source] of Object.entries(detailStyle.sources))
                    if (!activeMap.getSource(id)) activeMap.addSource(id, source);
                  for (const layer of detailStyle.layers)
                    activeMap.addLayer(layer, 'atlas-clusters');
                  for (const id of ['overview-water', 'overview-land', 'overview-coastline'])
                    activeMap.setLayoutProperty(id, 'visibility', 'none');
                  detailReady = true;
                  setOverview(false);
                  if (root.current) root.current.dataset.mapDetail = 'local';
                })
                .catch(() => {
                  if (!disposed) setTerrainOff(true);
                });
            }
            // DEM geometry is invisible on the world globe and unnecessary in a flat overview.
            const needsTerrain = zoom >= 11 && activeMap.getPitch() > 20;
            if (needsTerrain && !terrainEnabled && !terrainFailed) {
              if (!activeMap.getSource('atlas-terrain'))
                activeMap.addSource('atlas-terrain', openTileProvider.terrain);
              activeMap.setTerrain({ source: 'atlas-terrain', exaggeration: 1 });
              terrainEnabled = true;
            } else if (!needsTerrain && terrainEnabled) {
              activeMap.setTerrain(null);
              terrainEnabled = false;
            }
            const current = latest.current;
            const needsDeck =
              local ||
              Boolean(
                current.layers?.length ||
                current.isochrone ||
                current.sun ||
                (current.compareIds?.length ?? 0) > 1,
              );
            if (root.current && !needsDeck && !entry.overlay)
              root.current.dataset.deckReady = 'not-required';
            if (!needsDeck || entry.overlay || deckLoading) return;
            deckLoading = true;
            void Promise.all([import('@deck.gl/maplibre'), import('@deck.gl/layers')])
              .then(([{ MapLibreOverlay }, layers]) => {
                if (disposed || failed || runtime.current !== entry) return;
                entry.deck = layers;
                entry.overlay = new MapLibreOverlay({
                  interleaved: true,
                  layers: [],
                  onError: () => {
                    if (!disposed) setOverlayOff(true);
                  },
                });
                activeMap.addControl(entry.overlay);
                entry.update();
                if (root.current) root.current.dataset.deckReady = 'true';
              })
              .catch(() => {
                if (!disposed) setOverlayOff(true);
              });
          };
          activeMap.on('error', (event) => {
            if ('sourceId' in event && event.sourceId === 'atlas-terrain') terrainFailed = true;
          });
          activeMap.once('idle', () => {
            if (disposed || failed) return;
            basePainted = true;
            if (root.current) root.current.dataset.basePainted = 'true';
            entry.update();
          });
          runtime.current = entry;
          activeMap.on('moveend', entry.update);
          activeMap.on('click', (event) => {
            const features = activeMap.queryRenderedFeatures(event.point, {
              layers: ['atlas-clusters', 'atlas-markers'],
            });
            const feature = features[0];
            if (feature?.properties.cluster_id != null && feature.geometry.type === 'Point') {
              const coordinates = feature.geometry.coordinates as AtlasPoint;
              void (activeMap.getSource('atlas-projects') as GeoJSONSource)
                .getClusterExpansionZoom(feature.properties.cluster_id)
                .then((zoom) => {
                  if (!disposed)
                    activeMap.flyTo({
                      center: coordinates,
                      zoom: Math.max(zoom, 9),
                      duration: flightDuration(),
                    });
                })
                .catch(() => {});
            } else if (feature?.properties.id) {
              latest.current.onSelect?.(String(feature.properties.id));
            } else if (
              !entry.overlay?.pickObject({ x: event.point.x, y: event.point.y, radius: 5 })
            ) {
              latest.current.onPoint?.([event.lngLat.lng, event.lngLat.lat]);
            }
          });
          activeMap.on('mouseenter', 'atlas-markers', () => {
            activeMap.getCanvas().style.cursor = 'pointer';
          });
          activeMap.on('mouseleave', 'atlas-markers', () => {
            activeMap.getCanvas().style.cursor = '';
          });
          setStatus('webgl');
          latest.current.onReady?.('webgl');
          cameraFlight(activeMap, latest.current);
          // Only an untouched arrival gets the short approach; user input always wins.
          const cancelArrival = () => clearTimeout(arrivalTimer);
          activeMap.on('dragstart', cancelArrival);
          activeMap.on('zoomstart', cancelArrival);
          if (arrival && !camera && !reducedMotion())
            arrivalTimer = setTimeout(() => {
              if (!disposed && !latest.current.camera)
                activeMap.flyTo({ center: [43.5, 26.5], zoom: 2.8, duration: 600 });
            }, 900);
          entry.popup = new Popup({
            closeButton: false,
            closeOnClick: false,
            focusAfterOpen: false,
            offset: 22,
            className: 'atlas-place-label',
            maxWidth: '240px',
          });
        });
      } catch {
        fallback();
      }
    })();
    return () => {
      disposed = true;
      abort.abort();
      clearTimeout(timeout);
      clearTimeout(arrivalTimer);
      detachMeasurement?.();
      observer?.disconnect();
      runtime.current?.overlay?.finalize();
      runtime.current?.popup?.remove();
      runtime.current = null;
      map?.remove();
    };
    // Locale/theme recreate only the map; current data and callbacks are read from latest.
  }, [theme, locale, mode, forceFallback, text.map, text.north, text.zoomIn, text.zoomOut]);

  const comparisonKey = (props.compareIds ?? []).join('|');
  const paddingKey = JSON.stringify(props.camera?.padding);
  useEffect(() => {
    const current = runtime.current;
    if (!current || status !== 'webgl') return;
    cameraFlight(current.map, props);
    // A new key represents an explicit navigation request. Unrelated state must not reset the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.camera?.key, comparisonKey, paddingKey, status]);
  useEffect(() => {
    const current = runtime.current;
    if (!current || status !== 'webgl') return;
    current.update();
    const selected = props.projects.find((p) => p.id === props.selectedId);
    if (selected && current.popup) {
      const label = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = nameOf(selected, locale);
      const detail = document.createElement('span');
      detail.textContent = selected.kind === 'DEMO' ? text.demo : text.reference;
      label.append(title, detail);
      current.popup.setLngLat(selected.center).setDOMContent(label).addTo(current.map);
    } else current.popup?.remove();
  }, [
    props.projects,
    props.pois,
    props.selectedId,
    props.highlightedIds,
    props.layers,
    props.compareIds,
    props.isochrone,
    props.sun,
    props.arabicIndicDigits,
    locale,
    status,
    text.demo,
    text.reference,
  ]);

  const fallback = forceFallback || status === 'fallback';
  return (
    <div
      ref={root}
      className={`living-map living-map--${theme}`}
      data-map-status={fallback ? 'fallback' : status}
      data-map-mode={fallback ? 'fallback' : 'webgl'}
      data-map-scene={mode}
      data-map-ready={fallback || status === 'webgl'}
      data-tiles-ready="false"
      data-camera-key={props.camera?.key ?? 'arrival'}
      data-map-phase={phase}
      data-map-detail={overview ? 'regional' : 'local'}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div ref={host} className="atlas-map-canvas" hidden={fallback} />
      {fallback && <FallbackMap key={props.camera?.key ?? 'regional'} {...props} />}
      {status === 'loading' && !forceFallback && (
        <div className="atlas-map-loading" role="status">
          <Compass size={26} strokeWidth={1} />
          <span>{text.loading}</span>
        </div>
      )}
      {mode === 'explore' && !fallback && <div className="atlas-map-legend">{text.legend}</div>}
      <div className="atlas-map-evidence">
        <details>
          <summary>{text.sources}</summary>
          <div className="atlas-map-source-panel">
            <p>
              {fallback
                ? text.fallbackDetail
                : overview
                  ? 'Natural Earth · 1:110m'
                  : text.sourceData}
            </p>
            <p>{text.approximation}</p>
            {!fallback && <p>{text.clusters}</p>}
            <p>
              {text.price} · <bdi>{FX_DATE}</bdi>. {text.unknown}.
            </p>
            {(props.layers?.length ?? 0) > 0 && <p>{text.poi}</p>}
            {props.layers?.includes('hex') && <p>{text.hex}</p>}
            {props.isochrone && <p>{text.ring}</p>}
            {(props.compareIds?.length ?? 0) > 1 && <p>{text.compare}</p>}
            {props.sun && <p>{text.sun}</p>}
            {terrainOff && <p>{text.terrainOff}</p>}
            {overlayOff && <p>{text.overlayOff}</p>}
          </div>
        </details>
        <div className="atlas-map-attribution">
          {fallback || overview ? (
            <a
              href="https://www.naturalearthdata.com/about/terms-of-use/"
              target="_blank"
              rel="noreferrer"
            >
              Natural Earth
            </a>
          ) : (
            openTileProvider.attribution.map((source) => (
              <a key={source.label} href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            ))
          )}
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {fallback ? text.fallback : status === 'webgl' ? text.map : text.loading}
      </div>
    </div>
  );
}

function FallbackMap(props: LivingMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1024, height: 720 });
  const [land, setLand] = useState<FeatureCollection<Geometry> | null>(null);
  const [offset, setOffset] = useState(0);
  const text = copy[props.locale];
  const padding = props.camera?.padding ?? { top: 80, bottom: 80, left: 30, right: 30 };
  const compared = (props.compareIds ?? [])
    .slice(0, 4)
    .flatMap((id) => props.projects.filter((p) => p.id === id));
  const fitted =
    compared.length > 1
      ? atlasFitPoints(
          compared.map((p) => p.center),
          size.width,
          size.height,
          {
            top: padding.top + 35,
            bottom: padding.bottom + 35,
            left: padding.left + 35,
            right: padding.right + 35,
          },
        )
      : null;
  const center = fitted?.center ?? props.camera?.center ?? initialCenter;
  const maxZoom = compared.length > 1 ? 12 : 7;
  const baseZoom = Math.max(1, Math.min(maxZoom, fitted?.zoom ?? props.camera?.zoom ?? 3));
  const zoom = Math.max(1, Math.min(maxZoom, baseZoom + offset));
  const origin = atlasProjectPoint(center, zoom);
  const centerX = (size.width + (padding?.left ?? 0) - (padding?.right ?? 0)) / 2;
  const centerY = (size.height + (padding?.top ?? 0) - (padding?.bottom ?? 0)) / 2;
  const project = (point: AtlasPoint) => {
    const position = atlasProjectPoint(point, zoom);
    return [position[0] - origin[0] + centerX, position[1] - origin[1] + centerY] as AtlasPoint;
  };
  useEffect(() => {
    const controller = new AbortController();
    void fetch(openTileProvider.offlineLand, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLand(data))
      .catch(() => {});
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({ width: rect.width, height: rect.height });
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      controller.abort();
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>('.living-map');
    if (!root) return;
    root.dataset.center = JSON.stringify(center);
    root.dataset.zoom = zoom.toFixed(3);
    root.dataset.pitch = '0';
    root.dataset.moving = 'false';
    root.dataset.tilesReady = String(Boolean(land));
  }, [center, zoom, land]);
  function polygonPath(rings: Position[][]) {
    return rings
      .map(
        (ring) =>
          ring
            .map((point, index) => {
              const [x, y] = project(point as AtlasPoint);
              return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ') + ' Z',
      )
      .join(' ');
  }
  const polygons =
    land?.features.flatMap((feature) =>
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.type === 'MultiPolygon'
          ? feature.geometry.coordinates
          : [],
    ) ?? [];
  const occupied: { x: number; y: number; width: number }[] = [];
  const visiblePlaces = ATLAS_PLACES.filter((place) =>
    ['dubai', 'abu-dhabi', 'north-coast', 'cairo', 'red-sea'].includes(place.id),
  ).filter((place) => {
    const [x, y] = project(place.center);
    const width = (props.locale === 'ar' ? place.nameAr : place.nameEn).length * 7 + 14;
    if (x < width / 2 || x > size.width - width / 2 || y < 50 || y > size.height - 40) return false;
    if (
      occupied.some(
        (other) => Math.abs(other.x - x) < (other.width + width) / 2 && Math.abs(other.y - y) < 28,
      )
    )
      return false;
    occupied.push({ x, y, width });
    return true;
  });
  return (
    <div ref={ref} className="atlas-fallback" data-testid="atlas-fallback">
      <svg
        viewBox={`0 0 ${size.width} ${size.height}`}
        role="img"
        aria-label={text.fallback}
        onClick={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          props.onPoint?.(
            atlasUnprojectPoint(
              [
                event.clientX - box.left + origin[0] - centerX,
                event.clientY - box.top + origin[1] - centerY,
              ],
              zoom,
            ),
          );
        }}
      >
        {polygons.map((rings, index) => (
          <path key={index} d={polygonPath(rings)} className="atlas-fallback-land" />
        ))}
        {props.layers?.includes('hex') &&
          props.projects
            .filter((p) => p.kind === 'DEMO' && p.demoPricePerSqmAED != null)
            .map((p) => (
              <path
                key={p.id}
                d={polygonPath([atlasCircle(p.center, 0.7, 6)])}
                className="atlas-fallback-ring"
              />
            ))}
        {(props.pois ?? [])
          .filter((p) => props.layers?.some((layer) => layer === p.kind))
          .map((p) => {
            const [x, y] = project(p.center);
            return (
              <g key={p.id}>
                <circle cx={x} cy={y} r="5" fill="#B08D57" />
                <text x={x} y={y + 18} textAnchor="middle" fill="currentColor" fontSize="12">
                  {props.locale === 'ar' ? p.nameAr : p.nameEn} ·{' '}
                  {props.locale === 'ar' ? 'تجريبي' : 'Demo'}
                </text>
              </g>
            );
          })}
        {props.isochrone && (
          <path
            d={polygonPath([
              atlasCircle(
                props.isochrone.center,
                (props.isochrone.minutes * ATLAS_TRAVEL_SPEED_KMH) / 60,
              ),
            ])}
            className="atlas-fallback-ring"
          />
        )}
        {(props.compareIds ?? []).slice(1, 4).map((id) => {
          const a = props.projects.find((p) => p.id === props.compareIds?.[0]);
          const b = props.projects.find((p) => p.id === id);
          if (!a || !b) return null;
          const start = project(a.center),
            end = project(b.center);
          return (
            <line
              key={id}
              x1={start[0]}
              y1={start[1]}
              x2={end[0]}
              y2={end[1]}
              className="atlas-fallback-line"
            />
          );
        })}
      </svg>
      {visiblePlaces.map((place) => {
        const [x, y] = project(place.center);
        return (
          <span key={place.id} className="atlas-fallback-city" style={{ left: x, top: y }}>
            {props.locale === 'ar' ? place.nameAr : place.nameEn}
          </span>
        );
      })}
      {props.projects.map((p) => {
        const [x, y] = project(p.center);
        if (x < -20 || y < -20 || x > size.width + 20 || y > size.height + 20) return null;
        return (
          <button
            key={p.id}
            className="atlas-fallback-point"
            style={{ left: x, top: y }}
            aria-label={`${nameOf(p, props.locale)} · ${p.kind === 'DEMO' ? text.demo : text.reference}`}
            aria-pressed={p.id === props.selectedId}
            onClick={() => props.onSelect?.(p.id)}
          >
            <span />
            {p.id === props.selectedId && <strong>{nameOf(p, props.locale)}</strong>}
          </button>
        );
      })}
      <div className="atlas-fallback-controls">
        <button
          aria-label={text.zoomIn}
          disabled={zoom >= maxZoom}
          onClick={() => setOffset((value) => Math.min(value + 1, maxZoom - baseZoom))}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label={text.zoomOut}
          disabled={zoom <= 1}
          onClick={() => setOffset((value) => Math.max(value - 1, 1 - baseZoom))}
        >
          <Minus size={18} />
        </button>
      </div>
      <div className="atlas-fallback-label">
        <strong>{text.fallback}</strong>
        <span>{text.fallbackDetail}</span>
        {props.sun && <span role="status">{text.sunFallback}</span>}
      </div>
    </div>
  );
}
