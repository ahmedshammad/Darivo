import { ATLAS_PLACES } from '@/src/lib/atlas-intent';
import type { GroundedCard } from '@/src/lib/concierge';
import { searchProperties, type PropertyDTO } from '@/src/server/db/properties';
import { bilingual, createFact, groundUnit, unknownDate } from './grounding';
import type { ToolContext, ToolResult } from './tools';

const communityFor: Record<string, string> = {
  palm: 'palm-jumeirah',
  'dubai-hills': 'dubai-hills',
  downtown: 'downtown',
  saadiyat: 'saadiyat',
  'jumeirah-bay': 'jumeirah-bay',
  'north-coast': 'north-coast',
};

/** These are seeded community estimates, never facts about a real developer project. */
export function appendAreaInsights(card: GroundedCard, unit: PropertyDTO): GroundedCard {
  const insight = unit.community.insight;
  if (!insight || card.kind !== 'demo-unit') return card;
  const sourceId = `${unit.communityId}:area-demo`;
  const source = {
    id: sourceId,
    kind: 'demo' as const,
    url: null,
    publisher: null,
    title: 'Seeded fictional community estimates',
    basis: 'DEMO_ESTIMATE' as const,
    asOf: unknownDate,
    retrieved: unknownDate,
    confidence: 'UNASSESSED' as const,
  };
  const entity = { kind: 'unit' as const, id: unit.id };
  const fields = [
    [
      'area-average-aed-sqm',
      insight.averageAedSqm,
      bilingual('Community average · Demo estimate', 'متوسط المنطقة · تقدير تجريبي'),
      'AED/sqm',
    ],
    [
      'area-yield-low',
      insight.yieldLow,
      bilingual('Community yield low · Demo estimate', 'الحد الأدنى لعائد المنطقة · تقدير تجريبي'),
      '%',
    ],
    [
      'area-yield-high',
      insight.yieldHigh,
      bilingual('Community yield high · Demo estimate', 'الحد الأعلى لعائد المنطقة · تقدير تجريبي'),
      '%',
    ],
  ] as const;
  return {
    ...card,
    sources: [...card.sources.filter((row) => row.id !== sourceId), source],
    facts: [
      ...card.facts.filter((fact) => !fields.some(([key]) => key === fact.key)),
      ...fields.map(([key, value, label, unitLabel]) => ({
        ...createFact(entity, key, value, [sourceId], 'DEMO'),
        label,
        unit: unitLabel,
        qualifier: bilingual(
          'Fictional community scenario, not a market quotation or promised return. As-of date unknown.',
          'سيناريو خيالي للمنطقة، وليس سعراً سوقياً أو عائداً مضموناً. تاريخ البيانات غير معروف.',
        ),
      })),
    ],
  };
}

export async function buildAreaGuide(placeId: string, context: ToolContext): Promise<ToolResult> {
  const root = ATLAS_PLACES.find((place) => place.id === placeId);
  if (!root) return { components: [], actions: [], proposals: [] };
  const ids = placeId === 'dubai' ? ['palm', 'dubai-hills', 'downtown'] : [placeId];
  const places = ids.flatMap((id) => {
    const place = ATLAS_PLACES.find((row) => row.id === id);
    return place ? [place] : [];
  });
  const result: ToolResult = { components: [], actions: [], proposals: [] };
  result.components.push({
    id: `${context.callId}:orientation`,
    turnId: context.turnId,
    kind: 'notice',
    code: 'DEMO_LIMITATION',
    text:
      placeId === 'dubai'
        ? bilingual(
            'Start with three locations on the approximate map: Palm Jumeirah to the west, Dubai Hills inland to the south, and Downtown farther northeast. The examples below show fictional homes and community estimates so you can compare the records. They do not establish school suitability.',
            'ابدأ بثلاثة مواقع على الخريطة التقريبية: نخلة جميرا غرباً، ودبي هيلز إلى الداخل جنوباً، ووسط دبي أبعد إلى الشمال الشرقي. تعرض الأمثلة أدناه منازل خيالية وتقديرات للمناطق للمقارنة بين السجلات. وهي لا تثبت ملاءمة المدارس.',
          )
        : bilingual(
            'Use the approximate map and a fictional local example to understand this area. Community figures are Demo estimates, not current market evidence.',
            'استخدم الخريطة التقريبية ومثالاً محلياً خيالياً للتعرّف على المنطقة. أرقام المنطقة تقديرات تجريبية، وليست بيانات سوقية حالية.',
          ),
  });
  result.components.push({
    id: `${context.callId}:map`,
    turnId: context.turnId,
    kind: 'mini-map',
    entities: places.map((place) => ({ kind: 'place' as const, id: place.id })),
    camera: { center: root.center, zoom: root.zoom, key: `${context.callId}:${root.id}` },
    renderMode: 'SHARED_MAP_PREVIEW',
  });
  const cards: GroundedCard[] = [];
  for (const place of places) {
    context.signal?.throwIfAborted();
    const community = communityFor[place.id];
    if (!community) continue;
    const { properties } = await searchProperties({ community, limit: 1 }, context.viewer);
    const unit = properties[0];
    const grounded = unit && groundUnit(unit, context.brief);
    if (!grounded) continue;
    const card = appendAreaInsights(grounded, unit);
    const location = card.facts.find((fact) => fact.key === 'community')!;
    card.reasons = [
      {
        text: bilingual(
          `A fictional example in ${unit.community.nameEn} for your neighbourhood comparison.`,
          `مثال خيالي في ${unit.community.nameAr} للمقارنة بين المناطق.`,
        ),
        briefFieldIds: ['markets'],
        factIds: [location.id],
        status: 'supported',
      },
      {
        text: bilingual(
          'Your household and school requirements remain separate checks; this example does not verify them.',
          'تبقى متطلبات الأسرة والمدرسة بحاجة إلى تحقق مستقل؛ هذا المثال لا يثبتها.',
        ),
        briefFieldIds: ['household'],
        factIds: [],
        status: 'unknown',
      },
    ];
    card.tradeoff = {
      text: bilingual(
        'School points are fictional Demo POIs. British curriculum, admissions and real commute times are unverified.',
        'المدارس نقاط تجريبية خيالية. المنهج البريطاني والقبول وأزمنة التنقل الفعلية غير متحقق منها.',
      ),
      briefFieldIds: ['household.curriculum'],
      factIds: [],
      status: 'unknown',
    };
    cards.push(card);
  }
  if (cards.length)
    result.components.push({
      id: `${context.callId}:examples`,
      turnId: context.turnId,
      kind: 'project-cards',
      cards,
    });
  result.actions.push({
    id: `${context.callId}:school-layer`,
    turnId: context.turnId,
    requestId: context.requestId,
    briefRevision: context.brief.revision,
    type: 'map.showLayer',
    layer: 'school',
    visible: true,
  });
  return result;
}
