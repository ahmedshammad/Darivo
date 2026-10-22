import type {
  StyleSpecification,
  RasterDEMSourceSpecification,
  ExpressionSpecification,
} from 'maplibre-gl';
import type { AtlasLocale, AtlasPoint, AtlasTheme } from './atlas';

/** URLs and attribution are a provider boundary; no account or map vendor key is required. */
export interface TileProvider {
  id: string;
  style: (theme: AtlasTheme) => string;
  terrain: RasterDEMSourceSpecification;
  offlineLand: string;
  attribution: { label: string; url: string }[];
}

export const openTileProvider: TileProvider = {
  id: 'openfreemap-mapterhorn',
  style: (theme) => `/map-styles/${theme === 'dark' ? 'noir' : 'sand'}.json`,
  terrain: {
    type: 'raster-dem',
    tiles: ['https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'],
    tileSize: 512,
    encoding: 'terrarium',
    maxzoom: 12,
    attribution: '<a href="https://mapterhorn.com/attribution/">© Mapterhorn</a>',
  },
  offlineLand: '/map-styles/natural-earth-land.geojson',
  attribution: [
    { label: 'OpenFreeMap', url: 'https://openfreemap.org/' },
    { label: 'OpenMapTiles', url: 'https://openmaptiles.org/' },
    { label: '© OpenStreetMap', url: 'https://www.openstreetmap.org/copyright' },
    { label: 'Mapterhorn', url: 'https://mapterhorn.com/attribution/' },
  ],
};

export async function loadAtlasStyle(
  theme: AtlasTheme,
  locale: AtlasLocale,
  signal?: AbortSignal,
  provider = openTileProvider,
): Promise<StyleSpecification> {
  const response = await fetch(provider.style(theme), { signal });
  if (!response.ok) throw new Error('Map style unavailable');
  const style = (await response.json()) as StyleSpecification;
  const name: ExpressionSpecification = [
    'coalesce',
    ['get', `name:${locale}`],
    ['get', `name_${locale}`],
    ['get', 'name'],
    ['get', 'name:latin'],
  ];
  for (const layer of style.layers) {
    if (layer.type === 'symbol') {
      layer.layout = {
        ...layer.layout,
        'text-field': name,
        'text-letter-spacing': locale === 'ar' ? 0 : 0.04,
      };
    }
  }
  return style;
}

/** At world scale, the bundled real coastline is sufficient; street/terrain tiles add no visible information. */
export function atlasOverviewStyle(
  theme: AtlasTheme,
  provider = openTileProvider,
): StyleSpecification {
  const dark = theme === 'dark';
  return {
    version: 8,
    name: 'Darivo geographic overview',
    projection: { type: 'globe' },
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      'atlas-world-land': { type: 'geojson', data: provider.offlineLand, tolerance: 1, maxzoom: 5 },
    },
    layers: [
      {
        id: 'overview-water',
        type: 'background',
        paint: { 'background-color': dark ? '#111215' : '#d8dedb' },
      },
      {
        id: 'overview-land',
        type: 'fill',
        source: 'atlas-world-land',
        paint: {
          'fill-color': dark ? '#292b2e' : '#e9e2d6',
          'fill-outline-color': dark ? '#777267' : '#aba594',
        },
      },
    ],
  };
}

/** Web Mercator in CSS pixels, shared by the network-independent 2D renderer. */
export function atlasProjectPoint([longitude, latitude]: AtlasPoint, zoom: number): AtlasPoint {
  const size = 256 * 2 ** zoom;
  const sin = Math.sin((Math.max(-85.051129, Math.min(85.051129, latitude)) * Math.PI) / 180);
  return [
    ((longitude + 180) / 360) * size,
    (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  ];
}

export function atlasUnprojectPoint([x, y]: AtlasPoint, zoom: number): AtlasPoint {
  const size = 256 * 2 ** zoom;
  return [
    (x / size) * 360 - 180,
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / size))) * 180) / Math.PI,
  ];
}

/** Geodesic circle, not a routing result. Distance is explicit and testable. */
export function atlasCircle(center: AtlasPoint, kilometres: number, segments = 64): AtlasPoint[] {
  const [lng, lat] = center.map((n) => (n * Math.PI) / 180);
  const angular = kilometres / 6371;
  return Array.from({ length: segments + 1 }, (_, i) => {
    const bearing = (i / segments) * Math.PI * 2;
    const latitude = Math.asin(
      Math.sin(lat) * Math.cos(angular) + Math.cos(lat) * Math.sin(angular) * Math.cos(bearing),
    );
    const longitude =
      lng +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(lat),
        Math.cos(angular) - Math.sin(lat) * Math.sin(latitude),
      );
    return [(longitude * 180) / Math.PI, (latitude * 180) / Math.PI];
  });
}

/** Fit real geographic points inside the visible padded region of the 2D fallback. */
export function atlasFitPoints(
  points: AtlasPoint[],
  width: number,
  height: number,
  padding: { top: number; bottom: number; left: number; right: number },
) {
  const positions = points.map((point) => atlasProjectPoint(point, 0));
  const minX = Math.min(...positions.map((p) => p[0]));
  const maxX = Math.max(...positions.map((p) => p[0]));
  const minY = Math.min(...positions.map((p) => p[1]));
  const maxY = Math.max(...positions.map((p) => p[1]));
  const scale = Math.min(
    Math.max(40, width - padding.left - padding.right) / Math.max(0.001, maxX - minX),
    Math.max(40, height - padding.top - padding.bottom) / Math.max(0.001, maxY - minY),
  );
  return {
    center: atlasUnprojectPoint([(minX + maxX) / 2, (minY + maxY) / 2], 0),
    zoom: Math.log2(scale),
  };
}
