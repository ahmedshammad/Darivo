import type { User } from '@prisma/client';
import type { AtlasProject } from '@/src/lib/atlas';
import { ATLAS_PLACES } from '@/src/lib/atlas-intent';
import { FX, FX_DATE } from '@/src/lib/catalog';
import { exploreReferenceArabic } from '@/messages/explore';
import {
  conciergeComponentSchema,
  conciergeCurrencySchema,
  groundedCardSchema,
  type ConciergeBrief,
  type ConciergeComponent,
  type ConciergeEntityRef,
  type GroundedCard,
  type GroundedFact,
  type GroundedSource,
  type MarketBrief,
} from '@/src/lib/concierge';
import { getAtlasData } from '@/src/server/db/atlas';
import { getProperty, type PropertyDTO } from '@/src/server/db/properties';
import { getReferenceProject } from '@/src/server/db/reference';

export const bilingual = (en: string, ar: string) => ({ en, ar });
export const unknownDate = { value: null, precision: 'UNKNOWN' as const };
export function evidenceDate(value: string | null): GroundedFact['asOf'] {
  if (!value) return unknownDate;
  return {
    value: value.slice(0, 10),
    precision: value.length === 4 ? 'YEAR' : value.length === 7 ? 'MONTH' : 'DAY',
  };
}
const labels: Record<string, ReturnType<typeof bilingual>> = {
  city: bilingual('City', 'المدينة'),
  headline_facts: bilingual('Reported project feature', 'ميزة المشروع المذكورة في المصدر'),
  price_note: bilingual('Original price qualification', 'توضيح السعر الأصلي'),
  amenities: bilingual('Demo amenities', 'المرافق التجريبية'),
  view: bilingual('Demo view', 'الإطلالة التجريبية'),
  country: bilingual('Country', 'الدولة'),
  community: bilingual('Community', 'المنطقة'),
  price: bilingual('Published price basis', 'أساس السعر المنشور'),
  completion: bilingual('Reported completion', 'التسليم المذكور'),
  status: bilingual('Reported status', 'الحالة المذكورة'),
  bedrooms: bilingual('Bedrooms', 'غرف النوم'),
  area: bilingual('Area', 'المساحة'),
  payment_plan: bilingual('Reported payment plan', 'خطة السداد المذكورة'),
  type: bilingual('Property type', 'نوع العقار'),
};
const sourceTranslations: Record<string, string> = {
  ...exploreReferenceArabic,
  UAE: 'الإمارات',
  Egypt: 'مصر',
  Dubai: 'دبي',
  'Abu Dhabi': 'أبوظبي',
  'North Coast': 'الساحل الشمالي',
  'Red Sea': 'البحر الأحمر',
  Villas: 'فلل',
  Apartments: 'شقق',
  'Under construction': 'قيد الإنشاء',
  'Off-plan': 'على المخطط',
  'Portal shows developer stock sold out': 'تُظهر البوابة نفاد مخزون المطوّر',
  Launching: 'قيد الإطلاق',
  'Off-plan phases selling': 'بيع مراحل على المخطط',
  'Branded apartments': 'شقق بعلامة تجارية',
  'Saadiyat Island': 'جزيرة السعديات',
  'Masterplanned district incl. luxury villas': 'منطقة ذات مخطط شامل تضم فللاً فاخرة',
  'Beachfront apartments (1–5 bed)': 'شقق على الشاطئ من غرفة إلى خمس غرف نوم',
  'Apartments (studio–3 bed)': 'شقق من استوديو إلى ثلاث غرف نوم',
  'Beach apartments': 'شقق شاطئية',
  'Sky Palace': 'سكاي بالاس',
  Lodges: 'وحدات لودج',
  Penthouses: 'بنتهاوس',
  'Beachfront villas (5–7 bed)': 'فلل على الشاطئ من 5 إلى 7 غرف نوم',
  'Beachfront villas': 'فلل على الشاطئ',
  'Waterfront villas (4 bed)': 'فلل على الواجهة المائية من 4 غرف نوم',
  'Branded waterfront villas (4–6 bed)': 'فلل بعلامة تجارية على الواجهة المائية من 4 إلى 6 غرف نوم',
  Townhouses: 'تاون هاوس',
  Chalets: 'شاليهات',
  Mansions: 'قصور',
  'Standalone villas': 'فلل مستقلة',
  'Twin houses': 'توين هاوس',
  villa: 'فيلا',
  apartment: 'شقة',
  townhouse: 'تاون هاوس',
  penthouse: 'بنتهاوس',
  mansion: 'قصر',
  plot: 'قطعة أرض',
};
const translatedSource = (value: string) =>
  sourceTranslations[value] ?? `النص الأصلي للمصدر: ${value}`;
const demoSource = (id: string): GroundedSource => ({
  id: `${id}:demo`,
  kind: 'demo',
  title: bilingual('Fictional demo inventory', 'مخزون تجريبي خيالي').en,
  url: null,
  publisher: null,
  basis: 'DEMO_ESTIMATE',
  asOf: unknownDate,
  retrieved: unknownDate,
  confidence: 'UNASSESSED',
});
export function createFact(
  entity: ConciergeEntityRef,
  key: string,
  value: GroundedFact['value'],
  sourceIds: string[],
  provenance: GroundedFact['provenance'],
  asOf = unknownDate as GroundedFact['asOf'],
): GroundedFact {
  return {
    id: `${entity.id}:${key}`,
    entity,
    key,
    label: labels[key] ?? bilingual('Source detail', 'تفصيل من المصدر'),
    value,
    unit: null,
    currency: null,
    sourceIds,
    asOf,
    provenance,
    qualifier: null,
    originalText: typeof value === 'string' ? value : null,
    ...(typeof value === 'string' && sourceTranslations[value]
      ? { displayValue: bilingual(value, sourceTranslations[value]) }
      : {}),
  };
}
function cardPrice(fact: GroundedFact | undefined, brief: ConciergeBrief): GroundedCard['price'] {
  if (!fact || typeof fact.value !== 'number' || !fact.currency) return null;
  const native = { amount: fact.value, currency: fact.currency };
  return {
    native,
    factId: fact.id,
    qualifier: fact.qualifier,
    paymentCurrency: brief.paymentCurrency,
    converted: brief.displayCurrencies
      .filter((currency) => currency !== native.currency)
      .map((currency) => ({
        money: {
          amount: Math.round((native.amount / FX[native.currency]) * FX[currency] * 100) / 100,
          currency,
        },
        rate: FX[currency] / FX[native.currency],
        asOf: evidenceDate(FX_DATE),
        method: 'STATIC_DEMO_FX' as const,
      })),
  };
}
/** Upper bound only: a quarter/month/year never masquerades as a known delivery day. */
export function completionUpperBound(completion: string | null): Date | null {
  if (!completion || /unknown|unconfirmed|tbc/i.test(completion)) return null;
  const exact = completion.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (exact) {
    const date = new Date(`${exact[1]}T23:59:59.999Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const years = completion.match(/20\d{2}/g);
  if (!years?.length) return null;
  const year = Number(years.at(-1));
  const quarter = completion.match(/q([1-4])\s*(20\d{2})/i);
  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];
  const month = monthNames.findIndex((name) => completion.toLowerCase().includes(name));
  return new Date(
    Date.UTC(year, quarter ? Number(quarter[1]) * 3 : month >= 0 ? month + 1 : 12, 1) - 1,
  );
}
export function deadlineBoundary(
  deadline: NonNullable<MarketBrief['deadline']>,
): { date: Date; exclusive: boolean } | null {
  if (deadline.kind === 'flexible') return null;
  if (deadline.kind === 'year')
    return {
      date: new Date(
        deadline.boundary === 'before'
          ? Date.UTC(deadline.year, 0, 1)
          : Date.UTC(deadline.year + 1, 0, 1) - 1,
      ),
      exclusive: deadline.boundary === 'before',
    };
  if (deadline.kind === 'date')
    return {
      date: new Date(
        `${deadline.date}T${deadline.boundary === 'before' ? '00:00:00.000' : '23:59:59.999'}Z`,
      ),
      exclusive: deadline.boundary === 'before',
    };
  const start = new Date(`${deadline.relativeTo}T23:59:59.999Z`),
    day = start.getUTCDate();
  start.setUTCDate(1);
  start.setUTCMonth(start.getUTCMonth() + deadline.months);
  const lastDay = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  ).getUTCDate();
  start.setUTCDate(Math.min(day, lastDay));
  return { date: start, exclusive: false };
}
/** Stable constraint IDs identify editable rows; only current wording defines their meaning. */
export function constraintKindFromText(text: string): string | null {
  const normalized = text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[–—-]/g, ' ')
    .replace(/[.!،؛؟?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Deliberately bounded: compound, negated and unsupported wording remains unknown.
  // Polarity belongs to mustHaves/exclusions, never to an old semantic-looking ID.
  const kinds: [string, RegExp][] = [
    ['private-pool', /^(?:private pools?|مسبح خاص|حمام السباح[هة])$/],
    ['beachfront', /^(?:beachfront|on the beach|علي البحر|علي الشاطئ)$/],
    ['high-rise', /^(?:high rise|towers?|برج|ابراج|الابراج)$/],
    ['unknown-completion', /^(?:unknown (?:completion|date)|موعد مجهول)$/],
    ['property-villa', /^(?:villas?|فيلا|فيلات|فلل)$/],
    ['property-apartment', /^(?:apartments?|شق[هة]|شقق)$/],
    ['property-penthouse', /^(?:penthouses?|بنتهاوس)$/],
    ['property-townhouse', /^(?:townhouses?|تاون هاوس)$/],
    ['property-mansion', /^(?:mansions?|قصر|قصور)$/],
    ['property-plot', /^(?:plots?|قطع[هة] ارض)$/],
  ];
  return kinds.find(([, pattern]) => pattern.test(normalized))?.[0] ?? null;
}
export function constraintEvidence(
  card: Pick<GroundedCard, 'facts'>,
  constraint: Pick<ConciergeBrief['mustHaves'][number], 'text'>,
): { value: boolean | null; facts: GroundedFact[] } {
  const constraintId = constraintKindFromText(constraint.text);
  if (!constraintId) return { value: null, facts: [] };
  const facts = card.facts;
  const types = facts.filter((fact) => fact.key === 'type' || fact.key.startsWith('type.'));
  const text = facts
    .filter((fact) => !['name', 'developer_id', 'approx_coords', 'price_note'].includes(fact.key))
    .map((fact) => String(fact.value ?? '').toLowerCase())
    .join(' ');
  if (constraintId.startsWith('property-'))
    return {
      value: types.length
        ? types.some((fact) => String(fact.value).toLowerCase().includes(constraintId.slice(9)))
        : null,
      facts: types,
    };
  if (constraintId === 'unknown-completion') {
    const completion = facts.find((fact) => fact.key === 'completion');
    return {
      value: !completion?.value || /unknown|unconfirmed|tbc/i.test(String(completion.value)),
      facts: completion ? [completion] : [],
    };
  }
  if (constraintId === 'high-rise') {
    const towers = facts.filter((fact) => /high.rise|tower|برج/i.test(String(fact.value)));
    if (towers.length) return { value: true, facts: towers };
    if (
      types.length &&
      types.every(
        (fact) =>
          /villa|townhouse|mansion/i.test(String(fact.value)) &&
          !/apartment|penthouse/i.test(String(fact.value)),
      )
    )
      return { value: false, facts: types };
    return { value: null, facts: [] };
  }
  const pattern =
    constraintId === 'beachfront'
      ? /beachfront|on the beach|علي البحر/
      : constraintId === 'private-pool'
        ? /private[_ ]pools?|مسبح خاص/
        : null;
  if (pattern) {
    const matched = facts.filter((fact) => pattern.test(String(fact.value).toLowerCase()));
    return { value: pattern.test(text) ? true : null, facts: matched };
  }
  return { value: null, facts: [] };
}
const tasteLabels: Record<string, ReturnType<typeof bilingual>> = {
  'prefers-contemporary': bilingual('contemporary architecture', 'العمارة المعاصرة'),
  'prefers-low-rise': bilingual('low-rise buildings', 'المباني المنخفضة'),
  'dislikes-high-rise': bilingual('avoiding towers', 'تجنّب الأبراج'),
};
/** Only known, explicitly consented tastes. Absence of evidence never excludes a card. */
export function groundedTasteEvidence(facts: GroundedFact[], brief: ConciergeBrief) {
  if (brief.tasteMemory.consent !== 'granted' || brief.privacy.doNotSave) return [];
  const eligible = facts.filter(
    (fact) =>
      fact.sourceIds.length &&
      ['REAL_REFERENCE', 'DEMO'].includes(fact.provenance) &&
      (fact.key === 'type' ||
        fact.key.startsWith('type.') ||
        fact.key.startsWith('type[') ||
        fact.key.startsWith('headline_facts') ||
        fact.key === 'architecture'),
  );
  const seen = new Set<string>();
  return brief.tasteMemory.items.flatMap((item) => {
    const label = tasteLabels[item.id];
    if (!label || seen.has(item.id)) return [];
    seen.add(item.id);
    const types = eligible.filter(
      (fact) => fact.key === 'type' || fact.key.startsWith('type.') || fact.key.startsWith('type['),
    );
    const matched =
      item.id === 'dislikes-high-rise'
        ? types.length &&
          types.every(
            (fact) =>
              /villa|townhouse|mansion/i.test(String(fact.value)) &&
              !/apartment|penthouse|tower|high.rise/i.test(String(fact.value)),
          )
          ? types
          : []
        : eligible.filter((fact) =>
            (item.id === 'prefers-contemporary'
              ? /^(?:contemporary|modern) (?:architecture|design)$/i
              : /^low[- ]rise(?: (?:buildings?|homes?|apartments?))?$/i
            ).test(String(fact.value).trim()),
          );
    return [{ id: item.id, label, facts: matched }];
  });
}
export function rankByConsentedTaste(cards: GroundedCard[], brief: ConciergeBrief) {
  if (!groundedTasteEvidence([], brief).length) return cards;
  const score = (card: GroundedCard) =>
    groundedTasteEvidence(card.facts, brief).filter((item) => item.facts.length).length;
  // Source-backed reference projects keep priority over fictional project examples.
  // Stable ties retain the authorized DAL's original ordering.
  return [...cards].sort(
    (a, b) =>
      Number(b.kind === 'reference-project') - Number(a.kind === 'reference-project') ||
      score(b) - score(a),
  );
}
function explanations(
  facts: GroundedFact[],
  brief: ConciergeBrief,
  country: string,
  demo: boolean,
): Pick<GroundedCard, 'reasons' | 'tradeoff'> {
  const market = brief.markets.find((row) => row.country === country);
  const prefix = market ? `markets.${market.id}` : 'markets';
  const location =
    facts.find((fact) => fact.key === 'community') ?? facts.find((fact) => fact.key === 'country');
  const price = facts.find((fact) => fact.key === 'price');
  const completion = facts.find((fact) => fact.key === 'completion');
  const types = facts.filter((fact) => fact.key === 'type' || fact.key.startsWith('type.'));
  const reasons: GroundedCard['reasons'] = [
    {
      text: location?.value
        ? bilingual(
            `Recorded location: ${String(location.value)}. Compare this with your requested areas.`,
            `الموقع المسجل: ${translatedSource(String(location.value))}. قارنه بالمناطق المطلوبة.`,
          )
        : bilingual('The location is not established by this record.', 'لا يثبت هذا السجل الموقع.'),
      briefFieldIds: [market ? `${prefix}.placeIds` : 'markets'],
      factIds: location ? [location.id] : [],
      status: location?.value ? 'supported' : 'unknown',
    },
  ];
  if (price && typeof price.value === 'number' && price.currency) {
    const budget = market?.budget;
    const value = budget ? (price.value / FX[price.currency]) * FX[budget.currency] : price.value;
    const within =
      !budget ||
      ((budget.min === null || value >= budget.min) &&
        (budget.max === null || value <= budget.max));
    reasons.push({
      text:
        budget?.association === 'explicit'
          ? bilingual(
              `The recorded price basis is ${within ? 'within' : 'outside'} your budget range${price.currency !== budget.currency ? '; comparison uses disclosed static demo FX' : ' in the same currency'}. This is not confirmation of a matching unit.`,
              `أساس السعر المسجل ${within ? 'ضمن' : 'خارج'} نطاق الميزانية${price.currency !== budget.currency ? '؛ تستخدم المقارنة سعر صرف تجريبياً ثابتاً معلناً' : ' بالعملة نفسها'}. هذا لا يؤكد توافر وحدة مطابقة.`,
            )
          : bilingual(
              `Original ${price.currency} price basis retained; your budget still needs confirmation.`,
              `احتُفظ بأساس السعر الأصلي بعملة ${price.currency}؛ لا تزال ميزانيتك بحاجة إلى تأكيد.`,
            ),
      briefFieldIds: [market ? `${prefix}.budget` : 'unassignedBudget'],
      factIds: [price.id],
      status: budget?.association === 'explicit' && !within ? 'conflict' : 'supported',
    });
  } else
    reasons.push({
      text: bilingual(
        'No numeric price basis is available to test your budget.',
        'لا يتوفر أساس سعر رقمي لاختبار الميزانية.',
      ),
      briefFieldIds: [market ? `${prefix}.budget` : 'unassignedBudget'],
      factIds: [],
      status: 'unknown',
    });
  if (market?.propertyTypes.length)
    reasons.push({
      text: types.length
        ? bilingual(
            `Recorded types: ${types.map((fact) => fact.value).join(', ')}. Unit-level availability needs confirmation.`,
            `الأنواع المسجلة: ${types.map((fact) => translatedSource(String(fact.value))).join('، ')}. يجب تأكيد توافر الوحدة.`,
          )
        : bilingual(
            'The requested property type is not established for this record.',
            'نوع العقار المطلوب غير مثبت في هذا السجل.',
          ),
      briefFieldIds: [`${prefix}.propertyTypes`],
      factIds: types.map((fact) => fact.id),
      status: types.length ? 'supported' : 'unknown',
    });
  else if (market?.deadline)
    reasons.push({
      text: completion?.value
        ? bilingual(
            `Reported completion: ${String(completion.value)}. This is a source indication, not a guaranteed deadline.`,
            `التسليم المذكور: ${translatedSource(String(completion.value))}. هذا بيان من المصدر وليس موعداً مضموناً.`,
          )
        : bilingual(
            'Completion is unknown, so your deadline cannot be verified.',
            'موعد التسليم مجهول، لذلك لا يمكن التحقق من الموعد المطلوب.',
          ),
      briefFieldIds: [`${prefix}.deadline`],
      factIds: completion?.value ? [completion.id] : [],
      status: completion?.value ? 'supported' : 'unknown',
    });
  const constraints = [...brief.mustHaves, ...brief.exclusions].filter(
    (constraint) =>
      !constraint.marketIds.length || (market && constraint.marketIds.includes(market.id)),
  );
  const unknown = constraints.find(
    (constraint) => constraintEvidence({ facts }, constraint).value === null,
  );
  const conflict = constraints.find((constraint) => {
    const evidence = constraintEvidence({ facts }, constraint);
    return brief.exclusions.includes(constraint)
      ? evidence.value === true
      : evidence.value === false;
  });
  let tradeoff: GroundedCard['tradeoff'];
  if (
    market?.propertyTypes.length &&
    types.length &&
    !types.some((fact) =>
      market.propertyTypes.some((type) => String(fact.value).toLowerCase().includes(type)),
    )
  )
    tradeoff = {
      text: bilingual(
        'The recorded property types conflict with the type requested in your Brief.',
        'تتعارض أنواع العقارات المسجلة مع النوع المطلوب في طلبك.',
      ),
      briefFieldIds: [`${prefix}.propertyTypes`],
      factIds: types.map((fact) => fact.id),
      status: 'conflict',
    };
  else if (brief.household.curriculum || brief.household.schoolRequirement === 'verified_required')
    tradeoff = {
      text: bilingual(
        'The requested school curriculum and family suitability are unverified. Demo school points do not establish either.',
        'المنهج المدرسي المطلوب والملاءمة للأسرة غير موثقين. نقاط المدارس التجريبية لا تثبت أياً منهما.',
      ),
      briefFieldIds: ['household.curriculum', 'household.schoolRequirement'],
      factIds: [],
      status: 'unknown',
    };
  else if (conflict) {
    const evidence = constraintEvidence({ facts }, conflict);
    tradeoff = {
      text: bilingual(
        `This record conflicts with your requirement: ${conflict.text.slice(0, 350)}.`,
        `يتعارض هذا السجل مع شرطك: ${conflict.text.slice(0, 350)}.`,
      ),
      briefFieldIds: [
        `${brief.exclusions.includes(conflict) ? 'exclusions' : 'mustHaves'}.${conflict.id}`,
      ],
      factIds: evidence.facts.map((fact) => fact.id),
      status: evidence.facts.length ? 'conflict' : 'unknown',
    };
  } else if (unknown)
    tradeoff = {
      text: bilingual(
        `Not verified from this record: ${unknown.text.slice(0, 350)}. Ask for evidence before relying on it.`,
        `غير موثق في هذا السجل: ${unknown.text.slice(0, 350)}. اطلب دليلاً قبل الاعتماد عليه.`,
      ),
      briefFieldIds: [
        `${brief.exclusions.includes(unknown) ? 'exclusions' : 'mustHaves'}.${unknown.id}`,
      ],
      factIds: [],
      status: 'unknown',
    };
  else if (market?.deadline)
    tradeoff = {
      text: completion?.value
        ? bilingual(
            `Delivery is reported as ${String(completion.value)}; the requested deadline still needs current confirmation.`,
            `التسليم مذكور كالتالي: ${translatedSource(String(completion.value))}؛ لا يزال الموعد المطلوب بحاجة إلى تأكيد حديث.`,
          )
        : bilingual(
            'No completion date is available to verify your deadline.',
            'لا يتوفر موعد تسليم للتحقق من الموعد المطلوب.',
          ),
      briefFieldIds: [`${prefix}.deadline`],
      factIds: completion?.value ? [completion.id] : [],
      status: completion?.value ? 'supported' : 'unknown',
    };
  else
    tradeoff = {
      text: demo
        ? bilingual(
            'Fictional demo inventory; this is not a real availability offer.',
            'مخزون تجريبي خيالي؛ ليس عرض توافر حقيقياً.',
          )
        : bilingual(
            'Public project evidence is not live availability; request current details from an advisor.',
            'معلومات المشروع العامة ليست توافراً مباشراً؛ اطلب التفاصيل الحالية من مستشار.',
          ),
      briefFieldIds: ['mustHaves'],
      factIds: [],
      status: 'unknown',
    };
  const tastes = groundedTasteEvidence(facts, brief);
  if (tastes.length) {
    const supported = tastes.filter((taste) => taste.facts.length);
    const unsupported = tastes.filter((taste) => !taste.facts.length);
    const tasteReason: GroundedCard['reasons'][number] = {
      text: supported.length
        ? bilingual(
            `Recorded features support your saved preference: ${supported.map((taste) => taste.label.en).join(', ')}. This is a soft ordering signal; building height and unit suitability are not verified.`,
            `تدعم السمات المسجلة تفضيلك المحفوظ: ${supported.map((taste) => taste.label.ar).join('، ')}. هذه إشارة لترتيب النتائج فقط؛ ارتفاع المبنى وملاءمة الوحدة غير موثقين.`,
          )
        : bilingual(
            'This record does not establish a match for your saved architectural tastes. They have not changed its ranking or excluded it.',
            'لا يثبت هذا السجل تطابقاً مع ذوقك المعماري المحفوظ. لم يغيّر ترتيبه ولم يُستبعد بسببه.',
          ),
      briefFieldIds: tastes.map((taste) => `tasteMemory.items.${taste.id}`),
      factIds: [...new Set(supported.flatMap((taste) => taste.facts.map((fact) => fact.id)))].slice(
        0,
        12,
      ),
      status: supported.length ? 'supported' : 'unknown',
    };
    if (reasons.length === 3) reasons.shift(); // Preserve budget and explicit type/deadline reasons.
    reasons.push(tasteReason);
    if (unsupported.length && tradeoff.text.en.length < 300 && tradeoff.text.ar.length < 300) {
      tradeoff = {
        ...tradeoff,
        text: bilingual(
          `${tradeoff.text.en} Some saved tastes lack supporting evidence and do not affect ordering.`,
          `${tradeoff.text.ar} لا تتوفر أدلة تدعم بعض تفضيلاتك المحفوظة، لذلك لا تؤثر في الترتيب.`,
        ),
      };
    }
  }
  return { reasons, tradeoff };
}
export async function groundProject(
  project: AtlasProject,
  brief: ConciergeBrief,
): Promise<GroundedCard | null> {
  const entity: ConciergeEntityRef = { kind: 'project', id: project.id };
  const facts: GroundedFact[] = [];
  const sources = new Map<string, GroundedSource>();
  if (project.kind === 'REAL_REFERENCE') {
    const record = await getReferenceProject(project.id);
    if (!record) return null;
    for (const fact of record.facts) {
      if (
        !/^(country|city|community|completion|status|price_from|price_note|payment_plan|type\[\d+\]|headline_facts\[\d+\])$/.test(
          fact.key,
        )
      )
        continue;
      for (const source of fact.sources)
        sources.set(source.id, {
          id: source.id,
          kind: 'published',
          url: source.url,
          publisher: source.publisher,
          basis: source.basis,
          title: null,
          asOf: evidenceDate(fact.asOf),
          retrieved: evidenceDate(source.retrievedAt),
          confidence: source.confidence,
        });
      const key = fact.key.replace(/\[(\d+)\]/g, '.$1');
      const value =
        typeof fact.value === 'object' && fact.value !== null
          ? JSON.stringify(fact.value)
          : fact.value;
      const grounded = createFact(
        entity,
        key,
        value,
        fact.sources.map((row) => row.id),
        'REAL_REFERENCE',
        evidenceDate(fact.asOf),
      );
      grounded.id = fact.id;
      grounded.label =
        labels[key.split('.')[0]] ?? bilingual('Original source detail', 'تفصيل المصدر الأصلي');
      grounded.originalText = typeof value === 'string' ? value : JSON.stringify(fact.value);
      if (fact.key !== 'price_from') {
        if (typeof value === 'string' && !grounded.displayValue)
          grounded.qualifier = bilingual('Original source wording', 'النص الأصلي للمصدر');
        facts.push(grounded);
      }
      if (fact.key === 'price_from' && record.priceFromAmount !== null) {
        const price = createFact(
          entity,
          'price',
          Number(record.priceFromAmount),
          grounded.sourceIds,
          'REAL_REFERENCE',
          grounded.asOf,
        );
        price.currency = conciergeCurrencySchema.parse(record.priceFromCurrency);
        price.qualifier = bilingual(
          [record.priceFromLabel, record.priceNote].filter(Boolean).join(' · ') ||
            'Published project price; availability on request',
          [record.priceFromLabel, record.priceNote]
            .filter((value): value is string => Boolean(value))
            .map(translatedSource)
            .join(' · ') || 'سعر منشور للمشروع؛ التوافر عند الطلب',
        );
        price.originalText = [
          record.priceFromLabel,
          record.priceFromAmount,
          record.priceFromCurrency,
          record.priceNote,
        ]
          .filter(Boolean)
          .join(' · ');
        facts.push(price);
      }
    }
  } else {
    const source = demoSource(project.id);
    sources.set(source.id, source);
    for (const [key, value] of [
      ['country', project.country],
      ['community', project.community],
      ['completion', project.completion],
    ] as const)
      facts.push(createFact(entity, key, value, [source.id], 'DEMO'));
    if (project.amount !== null) {
      const price = createFact(entity, 'price', project.amount, [source.id], 'DEMO');
      price.currency = conciergeCurrencySchema.parse(project.currency);
      price.qualifier = bilingual(
        'Lowest currently visible fictional unit; demo estimate',
        'أقل وحدة خيالية ظاهرة حالياً؛ تقدير تجريبي',
      );
      facts.push(price);
    }
  }
  const priority = [
    'price',
    'community',
    'city',
    'country',
    'type',
    'completion',
    'status',
    'payment_plan',
    'price_note',
    'headline_facts',
  ];
  facts.sort(
    (a, b) => priority.indexOf(a.key.split('.')[0]) - priority.indexOf(b.key.split('.')[0]),
  );
  const card = groundedCardSchema.parse({
    id: `card:${project.id}`,
    storyPath: `/p/project-${project.slug}`,
    kind: project.kind === 'REAL_REFERENCE' ? 'reference-project' : 'demo-project',
    projectId: project.id,
    developerId: project.developerId,
    availability: project.kind === 'REAL_REFERENCE' ? 'ON_REQUEST' : 'DEMO_ONLY',
    name: bilingual(project.nameEn, project.nameAr),
    center: project.center,
    coordinatesApproximate: project.approximate,
    price: cardPrice(
      facts.find((fact) => fact.key === 'price'),
      brief,
    ),
    facts,
    sources: [...sources.values()],
    ...explanations(facts, brief, project.country, project.kind === 'DEMO'),
  });
  validateCardReferences(card);
  return card;
}
export function groundUnit(unit: PropertyDTO, brief: ConciergeBrief): GroundedCard | null {
  if (!unit.projectId || unit.developer.kind !== 'DEMO') return null;
  const entity: ConciergeEntityRef = { kind: 'unit', id: unit.id };
  const source = demoSource(unit.id);
  const facts = Object.entries({
    price: Number(unit.priceMinor) / 100,
    area: unit.areaSqm,
    bedrooms: unit.bedrooms,
    type: unit.type,
    amenities: unit.amenities.join(', '),
    view: unit.view,
    country: unit.community.city.countryId === 'AE' ? 'UAE' : 'Egypt',
    community: unit.community.nameEn,
    completion: unit.status === 'ready' ? 'ready' : unit.handoverDate,
  }).map(([key, value]) => createFact(entity, key, value, [source.id], 'DEMO'));
  facts.find((fact) => fact.key === 'price')!.currency = conciergeCurrencySchema.parse(
    unit.currency,
  );
  facts.find((fact) => fact.key === 'area')!.unit = 'sqm';
  if (unit.paymentPlan) {
    const plan = unit.paymentPlan;
    const value = `${plan.bookingPercent}% booking / ${plan.constructionPercent}% during construction / ${plan.handoverPercent}% on handover`;
    const fact = createFact(entity, 'payment_plan', value, [source.id], 'DEMO');
    fact.label = bilingual('Exact fictional unit payment plan', 'خطة سداد الوحدة الخيالية المحددة');
    fact.displayValue = bilingual(
      value,
      `${plan.bookingPercent}% عند الحجز / ${plan.constructionPercent}% أثناء الإنشاء / ${plan.handoverPercent}% عند التسليم`,
    );
    fact.qualifier = bilingual(
      'Seeded demo schedule for this unit only; not a real offer.',
      'خطة تجريبية لهذه الوحدة فقط؛ ليست عرضاً حقيقياً.',
    );
    facts.push(fact);
  }
  const card = groundedCardSchema.parse({
    id: `card:${unit.id}`,
    storyPath: `/p/unit-${unit.slug}`,
    kind: 'demo-unit',
    unitId: unit.id,
    projectId: unit.projectId,
    availability: 'DEMO_ONLY',
    name: bilingual(
      unit.translations.find((row) => row.locale === 'en')?.title ?? unit.slug,
      unit.translations.find((row) => row.locale === 'ar')?.title ?? unit.slug,
    ),
    center: [unit.lng, unit.lat],
    coordinatesApproximate: true,
    price: cardPrice(facts[0], brief),
    facts,
    sources: [source],
    ...explanations(facts, brief, unit.community.city.countryId === 'AE' ? 'UAE' : 'Egypt', true),
  });
  validateCardReferences(card);
  return card;
}
export function cardEntity(card: GroundedCard): ConciergeEntityRef {
  return card.kind === 'demo-unit'
    ? { kind: 'unit', id: card.unitId }
    : { kind: 'project', id: card.projectId };
}
export function validateCardReferences(card: GroundedCard): void {
  const entity = cardEntity(card),
    sourceIds = new Set(card.sources.map((source) => source.id)),
    factIds = new Set(card.facts.map((fact) => fact.id));
  if (sourceIds.size !== card.sources.length || factIds.size !== card.facts.length)
    throw new Error('Duplicate evidence identity');
  for (const fact of card.facts)
    if (
      fact.entity.id !== entity.id ||
      fact.entity.kind !== entity.kind ||
      fact.sourceIds.some((id) => !sourceIds.has(id))
    )
      throw new Error('Ungrounded fact reference');
  for (const reason of [...card.reasons, card.tradeoff])
    if (reason.factIds.some((id) => !factIds.has(id)))
      throw new Error('Ungrounded reason reference');
  if (card.price) {
    const price = card.facts.find((fact) => fact.id === card.price!.factId);
    if (
      !price ||
      price.value !== card.price.native.amount ||
      price.currency !== card.price.native.currency
    )
      throw new Error('Ungrounded price');
  }
}
export async function resolveCard(
  ref: ConciergeEntityRef,
  viewer: User | null,
  brief: ConciergeBrief,
): Promise<GroundedCard | null> {
  if (ref.kind === 'unit') {
    const unit = await getProperty(ref.id, viewer);
    return unit ? groundUnit(unit, brief) : null;
  }
  if (ref.kind !== 'project') return null;
  const project = (await getAtlasData(viewer)).projects.find((row) => row.id === ref.id);
  return project ? groundProject(project, brief) : null;
}
/** Replay rebuilds evidence from fresh authorized DAL data; never emits actions. */
export async function rehydrateConciergeComponents(
  components: ConciergeComponent[],
  viewer: User | null,
  brief: ConciergeBrief,
): Promise<ConciergeComponent[]> {
  const output: ConciergeComponent[] = [];
  for (const candidate of components) {
    const parsed = conciergeComponentSchema.safeParse(candidate);
    if (!parsed.success) continue;
    const component = parsed.data;
    if ('cards' in component) {
      const cards = await Promise.all(
        component.cards.map(async (card) => {
          const current = await resolveCard(cardEntity(card), viewer, brief);
          if (
            current?.kind !== 'demo-unit' ||
            !card.facts.some((fact) => fact.key === 'area-average-aed-sqm')
          )
            return current;
          const unit = await getProperty(current.unitId, viewer);
          if (!unit) return null;
          const { appendAreaInsights } = await import('./area-guide');
          return appendAreaInsights(current, unit);
        }),
      );
      if (cards.some((card) => !card)) continue;
      const current = { ...component, cards: cards as GroundedCard[] };
      if (
        current.kind === 'price-area-chart' &&
        current.points.some(
          (point) =>
            !current.cards.some(
              (card) =>
                cardEntity(card).id === point.entity.id &&
                card.facts.some((fact) => fact.id === point.priceFactId) &&
                card.facts.some((fact) => fact.id === point.areaFactId),
            ),
        )
      )
        continue;
      output.push(conciergeComponentSchema.parse(current));
    } else if (component.kind === 'notice') output.push(component);
    else if (component.kind === 'mini-map') {
      const anchors = await Promise.all(
        component.entities.map(async (entity) =>
          entity.kind === 'place'
            ? ATLAS_PLACES.find((place) => place.id === entity.id)?.center
            : (await resolveCard(entity, viewer, brief))?.center,
        ),
      );
      if (anchors.length && anchors.every(Boolean))
        output.push({ ...component, camera: { ...component.camera, center: anchors[0]! } });
    } else if (component.kind === 'developer-card') {
      const data = await getAtlasData(viewer);
      const developer = data.developers.find((row) => row.id === component.developerId);
      if (
        developer &&
        component.projectIds.every((id) =>
          data.projects.some(
            (project) => project.id === id && project.developerId === developer.id,
          ),
        )
      ) {
        const { executeConciergeTool } = await import('./tools');
        const refreshed = await executeConciergeTool(
          { name: 'get_developer', arguments: { developerId: developer.id } },
          {
            brief,
            viewer,
            turnId: component.turnId,
            requestId: 'history-replay',
            callId: 'history-developer',
            message: '',
          },
        );
        const current = refreshed.components.find((item) => item.kind === 'developer-card');
        if (current) output.push({ ...current, id: component.id });
      }
    } else if (
      (component.kind === 'payment-timeline' &&
        (component.entity.kind === 'project' || component.entity.kind === 'unit')) ||
      component.kind === 'itinerary'
    ) {
      // Re-run only these read-only tools. Saved arithmetic/text, including a timeline
      // subjectName, is not authoritative. Fresh authorization refreshes its name or drops it.
      const { executeConciergeTool } = await import('./tools');
      const call =
        component.kind === 'itinerary'
          ? {
              name: 'ui.showItinerary' as const,
              arguments: { placeIds: component.steps.map((step) => step.placeId) },
            }
          : {
              name: 'ui.showTimeline' as const,
              arguments:
                component.entity.kind === 'unit'
                  ? { unitId: component.entity.id }
                  : { projectId: component.entity.id },
            };
      const refreshed = await executeConciergeTool(call, {
        brief,
        viewer,
        turnId: component.turnId,
        requestId: 'history-replay',
        callId: 'history-refresh',
        message: '',
      });
      const current = refreshed.components.find((item) => item.kind === component.kind);
      if (current) output.push({ ...current, id: component.id });
    }
  }
  return output;
}
