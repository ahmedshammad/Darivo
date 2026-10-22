import { Map, setWorkerUrl } from '/node_modules/maplibre-gl/dist/maplibre-gl.mjs';
setWorkerUrl('/node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs');
export async function createConceptMap(element, options = {}) {
  const dark = options.theme !== 'light';
  const locale = options.locale ?? 'en';
  const original = await fetch('/prototypes/shared/openfreemap-liberty.json').then((r) => r.json());
  const style = {
    ...original,
    name: 'Darivo concept cartography',
    layers: original.layers
      .filter(
        (l) =>
          l.type !== 'raster' && !/poi|aeroway|rail|ferry|aerial|pattern|housenumber/.test(l.id),
      )
      .map((layer) => {
        const l = structuredClone(layer);
        l.paint ??= {};
        if (l.type === 'background') l.paint['background-color'] = dark ? '#191b1c' : '#e9e2d6';
        if (l.type === 'fill') {
          l.paint['fill-color'] = /water/.test(l.id)
            ? dark
              ? '#090f15'
              : '#b3c4c5'
            : /park|wood|grass/.test(l.id)
              ? dark
                ? '#242b29'
                : '#d5d4c3'
              : dark
                ? '#252728'
                : '#e9e2d6';
          delete l.paint['fill-pattern'];
          delete l.paint['fill-outline-color'];
        }
        if (l.type === 'line') {
          l.paint['line-color'] = /boundary/.test(l.id)
            ? dark
              ? '#6c6557'
              : '#aaa28f'
            : dark
              ? '#494640'
              : '#c5bcaa';
          l.paint['line-opacity'] = 0.45;
        }
        if (l.type === 'symbol') {
          if (!/label_|water_name/.test(l.id)) l.layout = { ...l.layout, visibility: 'none' };
          l.layout = {
            ...l.layout,
            'text-field': [
              'coalesce',
              ['get', locale === 'ar' ? 'name:ar' : 'name:en'],
              ['get', 'name'],
            ],
            'text-font': ['Noto Sans Regular'],
            'text-size': 11,
            'text-letter-spacing': locale === 'ar' ? 0 : 0.08,
          };
          delete l.layout['icon-image'];
          l.paint = {
            'text-color': dark ? '#aea99d' : '#68675e',
            'text-halo-color': dark ? '#202425' : '#e9e2d6',
            'text-halo-width': 1,
          };
        }
        return l;
      }),
  };
  const map = new Map({
    container: element,
    style,
    center: options.center ?? [55.13, 25.12],
    zoom: options.zoom ?? 10.4,
    pitch: options.pitch ?? 48,
    bearing: options.bearing ?? -24,
    attributionControl: true,
    interactive: true,
    antialias: true,
  });
  map.scrollZoom.disable();
  await new Promise((resolve, reject) => {
    map.once('load', resolve);
    map.once('error', (e) => {
      if (!map.isStyleLoaded()) reject(e.error);
    });
  });
  map.addSource('concept-places', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: locale === 'ar' ? 'نخلة جميرا' : 'Palm Jumeirah', height: 900 },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [55.135, 25.111],
                [55.137, 25.111],
                [55.137, 25.113],
                [55.135, 25.113],
                [55.135, 25.111],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: locale === 'ar' ? 'جزيرة السعديات' : 'Saadiyat Island', height: 700 },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [54.42, 24.53],
                [54.422, 24.53],
                [54.422, 24.532],
                [54.42, 24.532],
                [54.42, 24.53],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: locale === 'ar' ? 'رأس الحكمة' : 'Ras El Hekma', height: 800 },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [27.88, 31.22],
                [27.882, 31.22],
                [27.882, 31.222],
                [27.88, 31.222],
                [27.88, 31.22],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: locale === 'ar' ? 'نخلة جبل علي' : 'Palm Jebel Ali', height: 850 },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [54.99, 24.995],
                [54.992, 24.995],
                [54.992, 24.997],
                [54.99, 24.997],
                [54.99, 24.995],
              ],
            ],
          },
        },
      ],
    },
  });
  map.addLayer({
    id: 'concept-columns',
    type: 'fill-extrusion',
    source: 'concept-places',
    paint: {
      'fill-extrusion-color': dark ? '#c7a76e' : '#8b683c',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-opacity': 0.8,
    },
  });
  map.addSource('concept-centroids', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        ['Palm Jumeirah', 'نخلة جميرا', [55.136, 25.112]],
        ['Saadiyat Island', 'جزيرة السعديات', [54.421, 24.531]],
        ['Ras El Hekma', 'رأس الحكمة', [27.881, 31.221]],
        ['Palm Jebel Ali', 'نخلة جبل علي', [54.991, 24.996]],
      ].map(([en, ar, coordinates]) => ({
        type: 'Feature',
        properties: { name: locale === 'ar' ? ar : en },
        geometry: { type: 'Point', coordinates },
      })),
    },
  });
  map.addLayer({
    id: 'concept-halo',
    type: 'circle',
    source: 'concept-centroids',
    paint: {
      'circle-radius': 18,
      'circle-color': '#c7a76e',
      'circle-opacity': 0.2,
      'circle-blur': 0.8,
    },
  });
  map.addLayer({
    id: 'concept-centers',
    type: 'circle',
    source: 'concept-centroids',
    paint: {
      'circle-radius': 4,
      'circle-color': '#d7bb86',
      'circle-stroke-color': dark ? '#a48d65' : '#80603b',
      'circle-stroke-width': 1,
    },
  });
  map.addLayer({
    id: 'concept-labels',
    type: 'symbol',
    source: 'concept-centroids',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Noto Sans Regular'],
      'text-size': 12,
      'text-anchor': 'top',
      'text-offset': [0, 1.1],
    },
    paint: {
      'text-color': dark ? '#e9e2d6' : '#403d35',
      'text-halo-color': dark ? '#10171a' : '#e9e2d6',
      'text-halo-width': 2,
    },
  });
  map.setLight({ anchor: 'viewport', color: '#fff0d9', intensity: 0.7, position: [1.15, 210, 38] });
  new ResizeObserver(() => map.resize()).observe(
    typeof element === 'string' ? document.getElementById(element) : element,
  );
  window.__map = map;
  return map;
}
