import { ATLAS_TRAVEL_SPEED_KMH } from './atlas';
import type { AtlasCamera, AtlasLayer, AtlasPoint, AtlasProject } from './atlas';

export type AtlasPlace = {
  id: string;
  nameEn: string;
  nameAr: string;
  center: AtlasPoint;
  zoom: number;
  keywords: string[];
};
export const ATLAS_PLACES: AtlasPlace[] = [
  {
    id: 'palm',
    nameEn: 'Palm Jumeirah',
    nameAr: 'نخلة جميرا',
    center: [55.139, 25.118],
    zoom: 12.6,
    keywords: ['palm jumeirah', 'the palm', 'palm', 'نخلة جميرا', 'النخلة', 'orla'],
  },
  {
    id: 'jebel-ali',
    nameEn: 'Palm Jebel Ali',
    nameAr: 'نخلة جبل علي',
    center: [54.99, 24.99],
    zoom: 12,
    keywords: ['jebel ali', 'جبل علي'],
  },
  {
    id: 'jumeirah-bay',
    nameEn: 'Jumeirah Bay',
    nameAr: 'جميرا باي',
    center: [55.238, 25.209],
    zoom: 13,
    keywords: ['jumeirah bay', 'جميرا باي', 'bulgari', 'بولغري'],
  },
  {
    id: 'saadiyat',
    nameEn: 'Saadiyat Island',
    nameAr: 'جزيرة السعديات',
    center: [54.438, 24.541],
    zoom: 12,
    keywords: ['saadiyat', 'السعديات', 'السعديات', 'sei saadiyat'],
  },
  {
    id: 'abu-dhabi',
    nameEn: 'Abu Dhabi',
    nameAr: 'أبوظبي',
    center: [54.42, 24.48],
    zoom: 10,
    keywords: ['abu dhabi', 'أبوظبي', 'ابوظبي', 'أبو ظبي'],
  },
  {
    id: 'north-coast',
    nameEn: 'North Coast',
    nameAr: 'الساحل الشمالي',
    center: [28.02, 31.1],
    zoom: 9,
    keywords: [
      'north coast',
      'sahel',
      'ras el hekma',
      'southmed',
      'silversands',
      'june',
      'الساحل',
      'رأس الحكمة',
      'راس الحكمة',
      'ساوث ميد',
      'سيلفر ساندز',
      'جون',
    ],
  },
  {
    id: 'cairo',
    nameEn: 'Cairo',
    nameAr: 'القاهرة',
    center: [31.235, 30.045],
    zoom: 10,
    keywords: ['cairo', 'القاهرة', 'القاهره', 'zayed', 'زايد', 'new capital', 'العاصمة'],
  },
  {
    id: 'red-sea',
    nameEn: 'Red Sea',
    nameAr: 'البحر الأحمر',
    center: [33.68, 27.4],
    zoom: 9,
    keywords: ['red sea', 'gouna', 'sokhna', 'الجونة', 'السخنة', 'البحر الأحمر', 'البحر الاحمر'],
  },
  {
    id: 'dubai-hills',
    nameEn: 'Dubai Hills',
    nameAr: 'دبي هيلز',
    center: [55.259, 25.102],
    zoom: 12,
    keywords: ['dubai hills', 'دبي هيلز'],
  },
  {
    id: 'downtown',
    nameEn: 'Downtown Dubai',
    nameAr: 'وسط دبي',
    center: [55.276, 25.197],
    zoom: 13,
    keywords: ['downtown', 'داون تاون', 'وسط دبي'],
  },
  {
    id: 'dubai',
    nameEn: 'Dubai',
    nameAr: 'دبي',
    center: [55.19, 25.14],
    zoom: 10.3,
    keywords: ['dubai', 'دبي', 'دبى'],
  },
  {
    id: 'egypt',
    nameEn: 'Egypt',
    nameAr: 'مصر',
    center: [30.9, 29.6],
    zoom: 6.3,
    keywords: ['egypt', 'مصر'],
  },
  {
    id: 'uae',
    nameEn: 'United Arab Emirates',
    nameAr: 'الإمارات',
    center: [54.8, 24.7],
    zoom: 8.1,
    keywords: ['uae', 'united arab emirates', 'الإمارات', 'الامارات'],
  },
];
export const ATLAS_STORIES = [
  {
    id: 'islands',
    nameEn: 'The Islands',
    nameAr: 'حياة الجزر',
    places: ['palm', 'jebel-ali', 'jumeirah-bay'],
    captionEn: 'Three island settings along the Dubai coast.',
    captionAr: 'ثلاث إطلالات على حياة الجزر بمحاذاة ساحل دبي.',
  },
  {
    id: 'branded',
    nameEn: 'Branded Residences',
    nameAr: 'مساكن بعلامات عالمية',
    places: ['palm', 'dubai'],
    captionEn: 'Explore the setting. Review each project’s original sources.',
    captionAr: 'تعرّف على المكان، وراجع المصادر الأصلية لكل مشروع.',
  },
  {
    id: 'sahel',
    nameEn: 'Sahel Summer',
    nameAr: 'صيف الساحل',
    places: ['north-coast'],
    captionEn: 'A closer look at the Mediterranean coast.',
    captionAr: 'نظرة أقرب على ساحل البحر المتوسط.',
  },
  {
    id: 'saadiyat',
    nameEn: 'Saadiyat Culture',
    nameAr: 'السعديات والثقافة',
    places: ['saadiyat', 'abu-dhabi'],
    captionEn: 'Island and city, seen together. Lifestyle markers are demo data.',
    captionAr: 'الجزيرة والمدينة في مشهد واحد. علامات الخدمات بيانات تجريبية.',
  },
  {
    id: 'ready',
    nameEn: 'Ready Before 2028',
    nameAr: 'قبل ٢٠٢٨',
    places: ['dubai', 'north-coast'],
    captionEn: 'Compare reported timelines; confirm readiness with your advisor.',
    captionAr: 'قارن المواعيد المذكورة في المصادر، وأكّد الجاهزية مع مستشارك.',
  },
];

export function normalizeAtlasText(text: string) {
  return text
    .toLowerCase()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '');
}
export function projectInPlace(project: AtlasProject, place: AtlasPlace) {
  if (place.id === 'egypt') return project.country === 'Egypt';
  if (place.id === 'uae') return project.country === 'UAE';
  const [lng, lat] = project.center;
  const distance = Math.hypot(
    (lng - place.center[0]) * Math.cos((lat * Math.PI) / 180),
    lat - place.center[1],
  );
  const radius =
    place.id === 'north-coast'
      ? 2
      : place.id === 'cairo'
        ? 0.7
        : place.id === 'red-sea'
          ? 2.2
          : ['dubai', 'abu-dhabi'].includes(place.id)
            ? 0.5
            : 0.1;
  return distance < radius;
}
/** Deterministic spatial preview only. This does not assert availability or generate facts. */
export function parseAtlasIntent(
  text: string,
  projects: AtlasProject[],
): {
  camera?: AtlasCamera;
  projectIds: string[];
  layers: AtlasLayer[];
  isochroneMinutes?: 10 | 20 | 30;
  places: string[];
  recognized: boolean;
} {
  const value = normalizeAtlasText(text.slice(0, 1500));
  const containsPhrase = (phrase: string) =>
    new RegExp(
      `(?:^|[^\\p{L}\\p{N}])${normalizeAtlasText(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^\\p{L}\\p{N}])`,
      'u',
    ).test(value);
  let places = ATLAS_PLACES.filter((place) => place.keywords.some(containsPhrase));
  if (
    places.some((p) => p.id === 'jebel-ali') &&
    !containsPhrase('palm jumeirah') &&
    !containsPhrase('the palm')
  )
    places = places.filter((p) => p.id !== 'palm');
  if (
    places.some((p) =>
      ['palm', 'jebel-ali', 'jumeirah-bay', 'dubai-hills', 'downtown'].includes(p.id),
    )
  )
    places = places.filter((p) => p.id !== 'dubai');
  if (places.some((p) => p.id === 'saadiyat')) places = places.filter((p) => p.id !== 'abu-dhabi');
  if (places.some((p) => ['north-coast', 'cairo', 'red-sea'].includes(p.id)))
    places = places.filter((p) => p.id !== 'egypt');
  if (
    places.some((p) =>
      [
        'dubai',
        'palm',
        'jebel-ali',
        'jumeirah-bay',
        'dubai-hills',
        'downtown',
        'abu-dhabi',
        'saadiyat',
      ].includes(p.id),
    )
  )
    places = places.filter((p) => p.id !== 'uae');
  const layerWords: [AtlasLayer, RegExp][] = [
    ['beach', /beach|marina|sea view|بحر|شاط|مرسي/],
    ['golf', /golf|جولف|غولف/],
    ['school', /school|kids|children|مدرس|مدارس|اطفال|عيال/],
    ['hospital', /hospital|medical|مستشف|طب/],
    ['airport', /airport|مطار/],
    ['culture', /dining|culture|museum|restaurant|مطعم|مطاعم|ثقاف|متحف/],
    ['hex', /price per|sqft|sqm|square|سعر المتر|قدم مرب/],
  ];
  const layers = layerWords.filter(([, regex]) => regex.test(value)).map(([layer]) => layer);
  const minutes = value.match(/\b(10|20|30)\s*(?:min|minutes|دقيق|دقائق)/)?.[1];
  const first = places[0];
  const direct = projects.filter((p) => containsPhrase(p.nameEn) || containsPhrase(p.nameAr));
  const matches = direct.length
    ? direct
    : places.length
      ? projects.filter((p) => places.some((place) => projectInPlace(p, place)))
      : [];
  const camera = direct.length
    ? { center: direct[0].center, zoom: 13, pitch: 50, bearing: -15, key: text }
    : first
      ? { center: first.center, zoom: first.zoom, pitch: 48, bearing: -15, key: text }
      : undefined;
  return {
    camera,
    projectIds: matches.slice(0, 12).map((p) => p.id),
    layers,
    isochroneMinutes: minutes ? (Number(minutes) as 10 | 20 | 30) : undefined,
    places: places.map((p) => p.id),
    recognized: Boolean(places.length || direct.length || layers.length || minutes),
  };
}

export function atlasDistanceKm(a: AtlasPoint, b: AtlasPoint) {
  const radians = (n: number) => (n * Math.PI) / 180;
  const dlat = radians(b[1] - a[1]),
    dlng = radians(b[0] - a[0]);
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(radians(a[1])) * Math.cos(radians(b[1])) * Math.sin(dlng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Straight-line illustration only. Cross-border and long journeys need actual routing. */
export function atlasComparisonMetrics(
  a: Pick<AtlasProject, 'center' | 'country'>,
  b: Pick<AtlasProject, 'center' | 'country'>,
) {
  const distanceKm = atlasDistanceKm(a.center, b.center);
  const sameCountry =
    Boolean(a.country.trim()) && a.country.trim().toLowerCase() === b.country.trim().toLowerCase();
  return {
    distanceKm,
    estimatedMinutes:
      sameCountry && distanceKm <= 150
        ? Math.round((distanceKm / ATLAS_TRAVEL_SPEED_KMH) * 60)
        : null,
  };
}
