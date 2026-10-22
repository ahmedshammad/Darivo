import { ATLAS_PLACES } from '../../lib/atlas-intent';
import referenceDataset from '../../../data/reference/darivo_reference_dataset.json';
import {
  conciergeBriefSchema,
  providerPlanSchema,
  type ConciergeBrief,
  type ConciergeProvider,
  type ConciergeProviderPlan,
  type ConciergeToolCall,
  type MarketBrief,
  type ProviderBriefPatch,
} from '../../lib/concierge';

type Entity = Parameters<ConciergeProvider['plan']>[0]['priorEntities'][number];
type Currency = ConciergeBrief['displayCurrencies'][number];
type Span = { id: string; start: number; end: number; negative: boolean };
export type ConciergeParseOptions = {
  responseLanguage?: 'en' | 'ar';
  priorEntities?: Entity[];
  /** Caller supplies the calendar date for relative deadlines; never inferred from a market. */
  now?: string;
};

/** Matching normalization only. Original utterances are retained in the Brief. */
export function normalizeConciergeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[\u064B-\u065F\u0670ـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/٬/g, '')
    .replace(/٫/g, '.')
    .replace(/(?<=\d),(?=\d{3}(?:\D|$))/g, '');
}
const unique = <T>(values: T[]) => [...new Set(values)];
const negation =
  /(?:\b(?:not|no|without|remove|exclude|delete|don't|do not)\b|(?:^|\s)و?(?:مب|مش|مو|لا|ولا|ما ابي|ما ابغي|شيل|وشيل|احذف|بدون|من غير)\s)/;
function isNegative(text: string, start: number): boolean {
  const prefix =
    text
      .slice(0, start)
      .split(/[،,;؛.!?]|\bbut\b|\bi mean\b|اقصد|خلينا|\bkeep\b|خلي|خل /)
      .at(-1) ?? '';
  return negation.test(prefix.slice(-65));
}
function spans(text: string, catalogue: { id: string; keywords: string[] }[]): Span[] {
  const candidates: Span[] = [];
  for (const entry of catalogue)
    for (const raw of entry.keywords) {
      const keyword = normalizeConciergeText(raw);
      for (
        let start = text.indexOf(keyword);
        start !== -1;
        start = text.indexOf(keyword, start + 1)
      ) {
        if (/\p{L}/u.test(text[start - 1] ?? '') && !['و', 'ب', 'ل'].includes(text[start - 1]))
          continue;
        if (/\p{L}/u.test(text[start + keyword.length] ?? '')) continue;
        candidates.push({
          id: entry.id,
          start,
          end: start + keyword.length,
          negative: isNegative(text, start),
        });
      }
    }
  const kept: Span[] = [];
  for (const item of candidates.sort((a, b) => b.end - b.start - (a.end - a.start))) {
    if (!kept.some((other) => item.start < other.end && item.end > other.start)) kept.push(item);
  }
  return kept.sort((a, b) => a.start - b.start);
}
const places = ATLAS_PLACES.map((place) => ({
  ...place,
  keywords:
    place.id === 'palm'
      ? place.keywords.filter((word) => word !== 'palm').concat('نخله جميرا')
      : place.id === 'jebel-ali'
        ? [...place.keywords, 'palm jebel ali', 'نخلة جبل علي']
        : place.keywords,
}));
const egyptPlaces = new Set(['egypt', 'north-coast', 'cairo', 'red-sea']);
const countryFor = (placeId: string): MarketBrief['country'] =>
  egyptPlaces.has(placeId) ? 'Egypt' : 'UAE';
const marketId = (country: MarketBrief['country']) =>
  `market-${country === 'Egypt' ? 'egypt' : 'uae'}`;
const projectCatalogue = [
  { id: 'orla-palm-jumeirah', keywords: ['orla', 'اورلا'] },
  { id: 'southmed', keywords: ['southmed', 'south med', 'ساوث ميد'] },
  { id: 'june-sodic', keywords: ['june', 'جون'] },
  { id: 'silversands', keywords: ['silversands', 'silver sands', 'سيلفر ساندز'] },
  { id: 'saadiyat-lagoons', keywords: ['saadiyat lagoons', 'سعديات لاغونز', 'السعديات لاغونز'] },
  { id: 'sei-saadiyat', keywords: ['sei saadiyat', 'سي السعديات'] },
  { id: 'palm-jebel-ali-villas', keywords: ['palm jebel ali villas', 'فلل نخلة جبل علي'] },
  { id: 'marsa-al-saadiyat', keywords: ['marsa al saadiyat', 'مرسي السعديات'] },
  { id: 'oasis-palace-ostra', keywords: ['palace ostra', 'بالاس اوسترا'] },
  { id: 'oasis-palmiera-collective', keywords: ['palmiera collective', 'بالميرا كولكتيف'] },
  { id: 'palm-central-private-residences', keywords: ['palm central', 'بالم سنترال'] },
  { id: 'marassi-red-sea', keywords: ['marassi red sea', 'مراسي البحر الاحمر'] },
  { id: 'marassi-north-coast', keywords: ['marassi north coast', 'مراسي الساحل'] },
];
function newMarket(country: MarketBrief['country']): MarketBrief {
  return {
    id: marketId(country),
    country,
    placeIds: [],
    placeMatch: 'any',
    purpose: null,
    budget: null,
    deadline: null,
    readiness: 'unspecified',
    propertyTypes: [],
    bedrooms: null,
    rawText: '',
  };
}
const currencies: { code: Currency; pattern: string }[] = [
  { code: 'AED', pattern: 'aed|dirhams?|درهم|دراهم' },
  { code: 'EGP', pattern: 'egp|egyptian pounds?|جنيه|جنيها' },
  { code: 'GBP', pattern: 'gbp|sterling|british pounds?|استرليني|استرلينيه|الاسترليني' },
  { code: 'USD', pattern: 'usd|dollars?|دولار' },
  { code: 'EUR', pattern: 'eur|euros?|يورو' },
  { code: 'SAR', pattern: 'sar|riyals?|ريال' },
];
const currencyPattern = currencies.map((c) => c.pattern).join('|');
const developerCatalogue = [
  { id: 'omniyat', keywords: ['omniyat', 'امنيات'] },
  { id: 'emaar', keywords: ['emaar', 'اعمار'] },
  { id: 'emaar-misr', keywords: ['emaar misr', 'اعمار مصر'] },
  { id: 'nakheel', keywords: ['nakheel', 'نخيل'] },
  { id: 'aldar', keywords: ['aldar', 'الدار'] },
  { id: 'tmg', keywords: ['tmg', 'talaat moustafa', 'طلعت مصطفي'] },
  { id: 'palm-hills', keywords: ['palm hills', 'بالم هيلز'] },
  { id: 'ora', keywords: ['ora developers', 'ora', 'اورا'] },
  { id: 'sodic', keywords: ['sodic', 'سوديك'] },
];
function currencyOf(text: string): Currency | undefined {
  return currencies.find(({ pattern }) => new RegExp(`(?:${pattern})`, 'i').test(text))?.code;
}
function numericWord(text: string): number | null {
  const digit = text.match(/\d+/)?.[0];
  if (digit) return Number(digit);
  if (/two|طفلين|طفلان|للطفلين|اثنين/.test(text)) return 2;
  if (/four|اربع/.test(text)) return 4;
  if (/three|ثلاث/.test(text)) return 3;
  if (/five|خمس/.test(text)) return 5;
  return null;
}

/** Run before provider selection/network I/O. Explicit external processing refusal
 * also restricts sharing persistently; blockExternalProcessing identifies the current refusal.
 * This pure helper neither stores the prompt nor grants/revokes an authenticated UI consent. */
export function extractConciergePrivacy(message: string) {
  const text = normalizeConciergeText(message);
  const privateRequest = /keep.{0,20}(?:request|search).{0,10}private|طلبي.{0,15}سري/.test(text);
  const doNotSave =
    /(?:do not|don't|no|never).{0,25}(?:save|store|remember)|(?:لا|ولا|ما).{0,15}(?:تحفظ|تسجل)|ما تحفظش/.test(
      text,
    );
  const doNotShare =
    privateRequest ||
    /(?:do not|don't|no|never).{0,35}(?:share|contact|handoff|send)|(?:لا|ولا|ما).{0,25}(?:ترسل|تشارك|تبعت|تتواصل)|ما تبعتش/.test(
      text,
    );
  const doNotBook =
    /(?:do not|don't|no|never).{0,35}(?:book|viewing)|(?:لا|ولا|ما).{0,15}(?:تحجز|معاينه)/.test(
      text,
    );
  const blockExternalProcessing =
    /(?:do not|don't|never|no).{0,35}(?:send|share|process|external|cloud).{0,50}(?:ai|openai|provider)|(?:لا|ولا|ما).{0,30}(?:ترسل|تشارك|تبعت|معالجه).{0,50}(?:ذكاء|خارجي|openai)/.test(
      text,
    );
  return {
    doNotSave,
    doNotShare: doNotShare || blockExternalProcessing,
    doNotBook,
    discreet: privateRequest || /privacy|discreet|خصوصي|سريه|سرية/.test(text),
    restrictMemory: doNotSave && /memory|remember|ذاكره|ذاكرة|تفضيلات/.test(text),
    blockExternalProcessing,
  };
}
function semanticPatch(before: ConciergeBrief, after: ConciergeBrief): ProviderBriefPatch {
  const operations: ProviderBriefPatch['operations'] = [];
  const fields = {
    rawRequest: after.rawRequest,
    responseLanguage: after.responseLanguage,
    overallPurpose: after.overallPurpose,
    marketMode: after.marketMode,
    unassignedBudget: after.unassignedBudget,
    unassignedDeadline: after.unassignedDeadline,
    displayCurrencies: after.displayCurrencies,
    paymentCurrency: after.paymentCurrency,
    household: after.household,
    uncertainties: after.uncertainties,
    provenance: after.provenance,
  };
  operations.push({ op: 'fields.set', value: fields });
  for (const old of before.markets)
    if (!after.markets.some((m) => m.id === old.id))
      operations.push({ op: 'market.remove', id: old.id });
  for (const market of after.markets)
    if (JSON.stringify(market) !== JSON.stringify(before.markets.find((m) => m.id === market.id)))
      operations.push({ op: 'market.upsert', value: market });
  for (const list of ['mustHaves', 'exclusions'] as const) {
    for (const old of before[list])
      if (!after[list].some((c) => c.id === old.id))
        operations.push({ op: 'constraint.remove', list, id: old.id });
    for (const constraint of after[list])
      if (
        JSON.stringify(constraint) !==
        JSON.stringify(before[list].find((c) => c.id === constraint.id))
      )
        operations.push({ op: 'constraint.upsert', list, value: constraint });
  }
  const flags: ('doNotSave' | 'doNotShare' | 'doNotBook' | 'discreet')[] = [];
  for (const flag of ['doNotSave', 'doNotShare', 'doNotBook'] as const)
    if (after.privacy[flag] && !before.privacy[flag]) flags.push(flag);
  if (after.privacy.mode === 'discreet' && before.privacy.mode !== 'discreet')
    flags.push('discreet');
  if (flags.length) operations.push({ op: 'privacy.restrict', flags });
  // A provider may restrict memory, but cannot grant or repopulate it.
  if (
    after.tasteMemory.consent !== before.tasteMemory.consent &&
    ['declined', 'revoked'].includes(after.tasteMemory.consent)
  )
    operations.push({
      op: 'memory.restrict',
      consent: after.tasteMemory.consent as 'declined' | 'revoked',
    });
  return { baseRevision: before.revision, operations };
}

/** Deterministic intent parsing. This proposes actions; it never executes or authorizes them. */
export function parseConciergeMessage(
  message: string,
  previous: ConciergeBrief,
  options: ConciergeParseOptions = {},
): { brief: ConciergeBrief; plan: ConciergeProviderPlan } {
  const before = conciergeBriefSchema.parse(previous);
  const brief = structuredClone(before);
  const raw = message.trim().slice(0, 4000);
  const text = normalizeConciergeText(raw);
  const calculationIntent = /calculate|scenario|illustrative yield|احسب|حساب توضيحي/.test(text);
  const advice = /(?:tax|legal|invest my savings|financial advice|ضريب|قانوني|استثمر مدخراتي)/.test(
    text,
  );
  brief.rawRequest = raw;
  const clarification = new Set<string>();
  const uncertainty = (key: string) => {
    if (!brief.uncertainties.includes(key)) brief.uncertainties.push(key);
  };
  const placeSpans = spans(text, places);
  const affected = new Set<string>();
  // Removing a field associated with a location must not remove that location.
  const fieldRemoval =
    /(?:remove|clear|delete|شيل|احذف).{0,35}(?:deadline|budget|موعد|ميزاني|تسليم)/.test(text);
  for (const place of placeSpans) {
    const country = countryFor(place.id);
    let market = brief.markets.find((m) => m.country === country);
    if (place.negative && !fieldRemoval) {
      if (market) {
        market.placeIds = market.placeIds.filter((id) => id !== place.id);
        affected.add(market.id);
      }
      continue;
    }
    if (!market) {
      market = newMarket(country);
      brief.markets.push(market);
    }
    if (!market.placeIds.includes(place.id)) market.placeIds.push(place.id);
    market.rawText = raw.slice(0, 1500);
    affected.add(market.id);
  }
  for (const market of brief.markets) {
    const mentioned = placeSpans
      .filter((place) => !place.negative && countryFor(place.id) === market.country)
      .map((place) => place.id);
    if (mentioned.some((id) => !['uae', 'egypt', 'dubai', 'abu-dhabi'].includes(id)))
      market.placeIds = market.placeIds.filter(
        (id) => !['uae', 'egypt', 'dubai', 'abu-dhabi'].includes(id) || mentioned.includes(id),
      );
  }
  brief.markets = brief.markets.filter((market) => market.placeIds.length > 0);
  // Closest mentioned market ties subsequent attributes to their own geography.
  const targetsAt = (index?: number): MarketBrief[] => {
    const mentions = placeSpans.filter((p) => !p.negative || fieldRemoval);
    if (index !== undefined && mentions.length) {
      const preceding = mentions.filter((p) => p.start <= index).at(-1);
      const chosen = preceding ?? mentions[0];
      return brief.markets.filter((m) => m.country === countryFor(chosen.id));
    }
    const selected = brief.markets.filter((m) => affected.has(m.id));
    return selected.length ? selected : brief.markets;
  };
  if (/\bor\b|(?:^|\s)او(?:\s|$)/.test(text)) {
    for (const market of targetsAt()) market.placeMatch = 'any';
    brief.marketMode = 'alternatives';
  }
  if (/compare|قارن|قارنه|independent|استثمار/.test(text) && brief.markets.length > 1)
    brief.marketMode = 'independent';
  const purposePatterns: [MarketBrief['purpose'], RegExp][] = [
    ['investment', /investment|investing|استثمار/g],
    ['holiday', /summer home|holiday|vacation|مصيف|للمصيف|صيفي/g],
    ['residence', /family|residence|للعائله|للعائلة|عائلي|اسرتي/g],
    ['relocation', /relocat|انتقال/g],
    ['golden_visa', /golden visa|اقامه ذهبيه|اقامة ذهبية/g],
  ];
  const purposeMatches = purposePatterns
    .flatMap(([purpose, pattern]) =>
      [...text.matchAll(pattern)].map((match) => ({ purpose, match })),
    )
    .sort((a, b) => a.match.index - b.match.index);
  for (const { purpose, match } of purposeMatches)
    if (!isNegative(text, match.index)) {
      const following = placeSpans.find(
        (place) =>
          !place.negative &&
          place.start >= match.index + match[0].length &&
          /^(?:\s|in|في|a|an|home|بيت|لل)*$/.test(
            text.slice(match.index + match[0].length, place.start),
          ),
      );
      for (const market of targetsAt(following?.start ?? match.index)) market.purpose = purpose;
      if (brief.markets.length <= 1) brief.overallPurpose = purpose;
    }
  if (brief.markets.length > 1 && new Set(brief.markets.map((m) => m.purpose)).size > 1)
    brief.overallPurpose = null;
  const typePatterns: [MarketBrief['propertyTypes'][number], RegExp][] = [
    ['villa', /\bvillas?\b|فيلا|فلل/g],
    ['apartment', /\bapartments?\b|شقه|شقة/g],
    ['penthouse', /penthouse|بنتهاوس/g],
    ['townhouse', /townhouse|تاون هاوس/g],
    ['mansion', /mansion|قصر/g],
    ['plot', /\bplot\b|قطعه ارض/g],
  ];
  for (const [type, pattern] of typePatterns)
    for (const match of text.matchAll(pattern)) {
      const negative = isNegative(text, match.index);
      for (const market of targetsAt())
        market.propertyTypes = negative
          ? market.propertyTypes.filter((t) => t !== type)
          : unique([...market.propertyTypes, type]);
      brief.exclusions = brief.exclusions.filter(
        (constraint) => constraint.id !== `property-${type}`,
      );
      if (negative)
        brief.exclusions.push({
          id: `property-${type}`,
          text: match[0],
          marketIds: targetsAt().map((market) => market.id),
          category: 'other',
          verificationRequired: true,
        });
    }
  const bedrooms = text.match(
    /(?:\d+|four|three|two|five|اربع|ثلاث|خمس)\s*[- ]?(?:bedrooms?|beds?|غرف)/,
  );
  if (bedrooms) for (const market of targetsAt()) market.bedrooms = numericWord(bedrooms[0]);
  const children = text.match(/(?:two|three|\d+)\s*(?:kids|children)|طفلين|طفلان|للطفلين/);
  if (children) brief.household.children = numericWord(children[0]);
  if (/british|بريطاني/.test(text)) {
    brief.household.curriculum = 'British';
    brief.household.schoolRequirement = 'verified_required';
    uncertainty('school_curriculum_unverified');
  } else if (/school|مدرس/.test(text)) {
    brief.household.schoolRequirement = 'nearby';
    uncertainty('school_curriculum_unverified');
  }

  // Currency roles are independent: display preferences never alter the original budget.
  const currencyMatches = calculationIntent
    ? []
    : [...text.matchAll(new RegExp(currencyPattern, 'g'))];
  const display: Currency[] = [];
  let displayMode = false;
  for (const match of currencyMatches) {
    const code = currencyOf(match[0]);
    if (!code) continue;
    const prefix = text.slice(Math.max(0, match.index - 65), match.index);
    if (/(?:pay|payment|ها?دفع|بادفع|الدفع|سداد).{0,25}$/.test(prefix)) {
      brief.paymentCurrency = code;
      displayMode = false;
    } else if (
      /(?:show|display|think in|thinking in|بفكر|اعرض|بالجنيه كمان).{0,55}$/.test(prefix) ||
      displayMode
    ) {
      display.push(code);
      displayMode = true;
    }
  }
  if (display.length) brief.displayCurrencies = unique(display);
  const amountPattern = `(?:(?:${currencyPattern})\\s*)?(\\d+(?:\\.\\d+)?)(?:\\s*(?:million|m\\b|مليون))?(?:\\s*(?:[–—-]|to|الي|الى|لـ?|ل)\\s*(\\d+(?:\\.\\d+)?))?\\s*(million|m\\b|مليون)?\\s*(?:(${currencyPattern}))?`;
  for (const match of text.matchAll(new RegExp(amountPattern, 'g'))) {
    // Scenario assumptions are not acquisition budgets.
    if (calculationIntent) continue;
    const fragment = match[0];
    const code = currencyOf(fragment);
    const prefix = text.slice(Math.max(0, match.index - 30), match.index);
    if (!code && !/budget|ميزاني/.test(prefix)) continue;
    if (!code) {
      clarification.add('budget.currency');
      uncertainty('budget_currency_unspecified');
      continue;
    }
    if (/(?:pay|show|display|اعرض|دفع).{0,20}$/.test(prefix) && !/budget|ميزاني/.test(prefix))
      continue;
    const scale = /million|\bm\b|مليون/.test(fragment) ? 1e6 : 1;
    const first = Number(match[1]) * scale;
    const second = match[2] ? Number(match[2]) * scale : null;
    if (first > 1e12 || (second !== null && second > 1e12)) {
      clarification.add('budget.amount');
      continue;
    }
    const budget = {
      min: second === null ? null : Math.min(first, second),
      max: second === null ? first : Math.max(first, second),
      currency: code,
      association: 'explicit' as const,
      rawText: raw.slice(0, 500),
    };
    const targets = targetsAt(match.index);
    if (targets.length === 1) targets[0].budget = budget;
    else {
      brief.unassignedBudget = { ...budget, association: 'needs_clarification' };
      clarification.add('budget.market');
    }
  }
  for (const match of text.matchAll(
    /(?:before|by|قبل|بحلول)\s*(?:(?:the\s+)?end(?:\s+of)?|اخر|نهايه|نهاية)?\s*(20\d{2})/g,
  )) {
    if (isNegative(text, match.index)) continue;
    const end = /end|اخر|نهايه|نهاية/.test(match[0]);
    const boundary = /before|قبل/.test(match[0]) ? ('before' as const) : ('by' as const);
    const deadline: MarketBrief['deadline'] = end
      ? { kind: 'date', date: `${match[1]}-12-31`, boundary, rawText: raw.slice(0, 500) }
      : { kind: 'year', year: Number(match[1]), boundary, rawText: raw.slice(0, 500) };
    const targets = targetsAt(match.index);
    if (targets.length === 1) targets[0].deadline = deadline;
    else {
      brief.unassignedDeadline = deadline;
      clarification.add('deadline.market');
    }
    if (!end && boundary === 'by') {
      uncertainty('deadline_year_boundary');
    }
  }
  const within = text.match(/(?:within|خلال)\s*(\d+)\s*(?:months?|شهور|اشهر|شهر)/);
  if (within && Number(within[1]) > 0 && Number(within[1]) <= 240) {
    if (!options.now) {
      uncertainty('relative_deadline_anchor_required');
      clarification.add('deadline.anchor');
    } else {
      const deadline: MarketBrief['deadline'] = {
        kind: 'within_months',
        months: Number(within[1]),
        relativeTo: options.now,
        rawText: raw.slice(0, 500),
      };
      const targets = targetsAt(within.index);
      if (targets.length === 1) targets[0].deadline = deadline;
      else brief.unassignedDeadline = deadline;
    }
  }
  if (fieldRemoval) {
    const removalIndex = text.search(/remove|clear|delete|شيل|احذف/);
    const nextPlace = placeSpans.find((p) => p.start >= removalIndex);
    const targets = nextPlace
      ? brief.markets.filter((m) => m.country === countryFor(nextPlace.id))
      : targetsAt();
    for (const market of targets) {
      if (/deadline|موعد|تسليم/.test(text)) market.deadline = null;
      if (/budget|ميزاني/.test(text)) market.budget = null;
    }
  }
  if (brief.markets.length === 1 && placeSpans.some((place) => !place.negative)) {
    const market = brief.markets[0];
    if (!market.budget && brief.unassignedBudget) {
      market.budget = { ...brief.unassignedBudget, association: 'explicit' };
      brief.unassignedBudget = null;
      clarification.delete('budget.market');
    }
    if (!market.deadline && brief.unassignedDeadline) {
      market.deadline = brief.unassignedDeadline;
      brief.unassignedDeadline = null;
      clarification.delete('deadline.market');
    }
  }
  const ready = /ready now|completed now|جاهز الان|جاهزه الان/.exec(text);
  if (ready && !isNegative(text, ready.index))
    for (const market of targetsAt()) market.readiness = 'ready_now';
  if (/off.plan.{0,15}(?:okay|acceptable)|علي المخطط/.test(text))
    for (const market of targetsAt()) market.readiness = 'off_plan_acceptable';

  const constraints: {
    id: string;
    pattern: RegExp;
    category: ConciergeBrief['mustHaves'][number]['category'];
  }[] = [
    { id: 'beachfront', pattern: /beachfront|on the beach|علي البحر/, category: 'view' },
    {
      id: 'private-pool',
      pattern: /private pool|مسبح خاص|حمام السباحه|حمام السباحة/,
      category: 'amenity',
    },
    { id: 'high-rise', pattern: /high.rise|tower|برج/, category: 'architecture' },
    {
      id: 'unknown-completion',
      pattern: /unknown (?:completion|date)|موعد مجهول/,
      category: 'other',
    },
  ];
  for (const item of constraints) {
    const match = text.match(item.pattern);
    if (!match) continue;
    const prefix = text.slice(Math.max(0, match.index! - 45), match.index);
    const remove = /remove|delete|clear|شيل|احذف/.test(prefix);
    brief.mustHaves = brief.mustHaves.filter((c) => c.id !== item.id);
    brief.exclusions = brief.exclusions.filter((c) => c.id !== item.id);
    if (!remove) {
      const list = isNegative(text, match.index!) ? brief.exclusions : brief.mustHaves;
      if (item.id !== 'unknown-completion' || list === brief.exclusions)
        list.push({
          id: item.id,
          text: match[0],
          marketIds: targetsAt().map((m) => m.id),
          category: item.category,
          verificationRequired: true,
        });
    }
  }
  const restrictions = extractConciergePrivacy(raw);
  brief.privacy.doNotSave ||= restrictions.doNotSave;
  brief.privacy.doNotShare ||= restrictions.doNotShare;
  brief.privacy.doNotBook ||= restrictions.doNotBook;
  if (restrictions.discreet) brief.privacy.mode = 'discreet';
  if (restrictions.restrictMemory)
    brief.tasteMemory = {
      consent: ['granted', 'revoked'].includes(before.tasteMemory.consent) ? 'revoked' : 'declined',
      consentedAt: null,
      items: [],
    };
  if (/in english|reply in english|بالانجليزي|بالانجليزيه/.test(text))
    brief.responseLanguage = 'en';
  else if (/in arabic|reply in arabic|بالعربي|بالعربية/.test(text)) brief.responseLanguage = 'ar';
  const responseLanguage =
    brief.responseLanguage === 'auto'
      ? (options.responseLanguage ?? (/[\u0600-\u06ff]/.test(raw) ? 'ar' : 'en'))
      : brief.responseLanguage;
  for (const list of ['mustHaves', 'exclusions'] as const)
    brief[list] = brief[list].flatMap((constraint) => {
      const marketIds = constraint.marketIds.filter((id) => brief.markets.some((m) => m.id === id));
      return constraint.marketIds.length && !marketIds.length ? [] : [{ ...constraint, marketIds }];
    });
  if (
    ![...brief.markets.map((market) => market.deadline), brief.unassignedDeadline].some(
      (deadline) => deadline?.kind === 'year' && deadline.boundary === 'by',
    )
  )
    brief.uncertainties = brief.uncertainties.filter((code) => code !== 'deadline_year_boundary');
  brief.uncertainties = unique(brief.uncertainties).slice(-20);
  brief.provenance = [
    ...brief.provenance,
    { fieldId: 'rawRequest', rawText: raw.slice(0, 1000), origin: 'user' as const },
  ].slice(-100);
  brief.revision = before.revision + 1;
  conciergeBriefSchema.parse(brief);
  const patch = semanticPatch(before, brief);
  const calls: ConciergeToolCall[] = [];
  const projects: Entity[] = unique(
    spans(text, projectCatalogue)
      .filter((s) => !s.negative)
      .map((s) => s.id),
  ).map((id) => ({ kind: 'project', id }));
  const explicitUnitSearch =
    /(?:demo|available|fictional) units?|وحدات (?:تجريبيه|تجريبية|متاحه|متاحة)/.test(text);
  const unitMode =
    explicitUnitSearch ||
    (!projects.length && (options.priorEntities ?? []).some((entity) => entity.kind === 'unit'));
  let entities = explicitUnitSearch
    ? []
    : projects.length
      ? projects
      : (options.priorEntities ?? []);
  const ordinal = /\bfirst\b|الاول|الاولي|للاول|اول واحد/.test(text)
    ? 0
    : /\bsecond\b|الثاني|الثانيه|للثاني/.test(text)
      ? 1
      : null;
  if (ordinal !== null && !projects.length && !explicitUnitSearch) {
    entities = entities[ordinal] ? [entities[ordinal]] : [];
    if (!entities.length) clarification.add('selection.entity');
  }

  // These commands request grounded components, not factual prose or a reservation.
  const canonicalPlaces = unique(
    placeSpans.filter((place) => !place.negative).map((place) => place.id),
  );
  const miniMap = text.match(/mini map|show on map preview|خريطه مصغره|خريطة مصغرة/);
  if (miniMap && !isNegative(text, miniMap.index!)) {
    const anchors: Entity[] = entities.length
      ? entities
      : canonicalPlaces.map((id) => ({ kind: 'place', id }));
    if (anchors.length)
      calls.push({ name: 'ui.showMiniMap', arguments: { entities: anchors.slice(0, 12) } });
    else clarification.add('map.entities');
  }
  const chart = text.match(
    /price[ -]area chart|price and area chart|مخطط السعر والمساحه|مخطط السعر والمساحة/,
  );
  if (chart && !isNegative(text, chart.index!)) {
    if (entities.length >= 2)
      calls.push({ name: 'ui.showPriceAreaChart', arguments: { entities: entities.slice(0, 12) } });
    else clarification.add('chart.entities');
  }
  const itinerary = text.match(/viewing itinerary|برنامج الزياره|برنامج الزيارة/);
  if (itinerary && !isNegative(text, itinerary.index!)) {
    const itineraryPlaces = canonicalPlaces.length
      ? canonicalPlaces
      : unique(brief.markets.flatMap((market) => market.placeIds));
    if (itineraryPlaces.length)
      calls.push({
        name: 'ui.showItinerary',
        arguments: { placeIds: itineraryPlaces.slice(0, 4) },
      });
    else clarification.add('itinerary.places');
  }
  const teaching = /explain|neighbou?rhood|orient|اشرح|عرفني|وضح/.test(text);
  const developerIntent = /developer|المطور|مطور/.test(text);
  const areaTeaching = teaching && !developerIntent && !projects.length;
  const comparisonIntent = /compare|قارن/.test(text);
  const highlightResults = /highlight (?:the )?results|حدد النتائج|ابرز النتائج/.test(text);
  const explicitInventorySearch = [
    ...text.matchAll(
      /\b(?:find|search|recommend)\b|\bshow\s+(?:me\s+)?(?:some\s+)?(?:available\s+)?(?:homes|properties|projects|villas|apartments|units)\b|ابحث|دور|رشح|اقترح|اعرض.{0,20}(?:عقار|مشروع|فلل|فيلا|شقق|وحدات)/g,
    ),
  ].some((match) => !isNegative(text, match.index!));
  // An explanation requests orientation, not an inventory match. Explicit mixed
  // requests retain their search; prior unit selections alone do not add one.
  const explanationOnly =
    (areaTeaching || developerIntent) &&
    !explicitInventorySearch &&
    !explicitUnitSearch &&
    !comparisonIntent &&
    !highlightResults;
  const needsFeedback =
    (comparisonIntent && entities.length < 2) || (highlightResults && entities.length === 0);
  const selectionFollowup =
    entities.length > 0 &&
    !placeSpans.length &&
    !explicitUnitSearch &&
    /calculate|scenario|احسب|حساب توضيحي|developer|مطور|compare|قارن|save|احفظ|book|احجز|timeline|payment|schedule|سداد|دفعات|جدول|source|مصدر|chart|مخطط|mini map|خريطه مصغره|خريطة مصغرة/.test(
      text,
    );
  if (unitMode && !selectionFollowup && !explanationOnly) {
    calls.push({
      name: 'search_units',
      arguments: {
        marketIds: brief.markets.map((market) => market.id),
        projectIds: projects.map((entity) => entity.id),
        query: raw.slice(0, 500),
        limit: 6,
      },
    });
  } else if (
    !selectionFollowup &&
    brief.markets.length &&
    comparisonIntent &&
    needsFeedback &&
    brief.markets.length > 1
  ) {
    for (const market of brief.markets.slice(0, 4))
      calls.push({
        name: 'search_projects',
        arguments: { marketIds: [market.id], query: raw.slice(0, 500), limit: 3 },
      });
  } else if (!selectionFollowup && !explanationOnly && brief.markets.length)
    calls.push({
      name: 'search_projects',
      arguments: { marketIds: brief.markets.map((m) => m.id), query: raw.slice(0, 500), limit: 6 },
    });
  else if (projects.length)
    for (const entity of projects.slice(0, 2))
      calls.push({ name: 'get_project', arguments: { projectId: entity.id } });
  if (areaTeaching) {
    const place = placeSpans.find((p) => !p.negative)?.id ?? brief.markets[0]?.placeIds[0];
    if (place) calls.push({ name: 'area_insights', arguments: { placeId: place } });
  }
  if (/compare|قارن/.test(text) && entities.length >= 2) {
    calls.push({ name: 'compare', arguments: { entities: entities.slice(0, 4) } });
    calls.push({ name: 'ui.showComparison', arguments: { entities: entities.slice(0, 4) } });
  } else if (!unitMode && projects.length)
    calls.push({ name: 'get_project', arguments: { projectId: projects[0].id } });
  const selectedProject = entities.find((entity) => entity.kind === 'project');
  if (developerIntent) {
    const named = spans(text, developerCatalogue).find((item) => !item.negative)?.id;
    const knownProject =
      selectedProject &&
      referenceDataset.projects.find((project) => project.id === selectedProject.id);
    const priorDeveloper = entities.find((entity) => entity.kind === 'developer');
    const developerId = named ?? knownProject?.developer_id ?? priorDeveloper?.id;
    if (developerId) calls.push({ name: 'get_developer', arguments: { developerId } });
    else clarification.add('developer.entity');
  }
  if (calculationIntent && !advice) {
    const amountFor = (label: string) => {
      const match = text.match(
        new RegExp(
          `(?:${label})[^0-9]{0,25}([0-9]+(?:\\.[0-9]+)?)\\s*(${currencyPattern})(?![a-z])`,
          'i',
        ),
      );
      const currency = match && currencyOf(match[2]);
      return match && currency && Number(match[1]) <= 1e12
        ? { amount: Number(match[1]), currency }
        : null;
    };
    const annualRent = amountFor('annual rent|rent|ايجار');
    const annualCosts = amountFor('annual costs|costs|تكاليف');
    const vacancy = text.match(/(?:vacancy|شغور)[^0-9]{0,20}([0-9]+(?:\.[0-9]+)?)\s*%/);
    const vacancyPercent = vacancy ? Number(vacancy[1]) : null;
    const selectedUnit = entities.find((entity) => entity.kind === 'unit');
    if (!selectedUnit) clarification.add('calculation.unit');
    else if (!annualRent || !annualCosts || vacancyPercent === null || vacancyPercent > 100)
      clarification.add('calculation.assumptions');
    else
      calls.push({
        name: 'investment_calc',
        arguments: { unitId: selectedUnit.id, annualRent, annualCosts, vacancyPercent },
      });
  }
  if (
    selectedProject &&
    /source|evidence|مصدر|المصادر/.test(text) &&
    !calls.some((call) => call.name === 'get_project')
  )
    calls.push({ name: 'get_project', arguments: { projectId: selectedProject.id } });
  const timelineIntent = /timeline|payment plan|schedule|خط[ةه]\s+(?:ال)?سداد|جدول|دفعات/.test(
    text,
  );
  const selectedTimelineEntity = entities.find(
    (entity) => entity.kind === 'project' || entity.kind === 'unit',
  );
  if (timelineIntent && selectedTimelineEntity) {
    calls.push({
      name: 'ui.showTimeline',
      arguments:
        selectedTimelineEntity.kind === 'unit'
          ? { unitId: selectedTimelineEntity.id }
          : { projectId: selectedTimelineEntity.id },
    });
  } else if (timelineIntent) clarification.add('timeline.entity');
  const positivePlace = placeSpans.find((p) => !p.negative);
  if (positivePlace)
    calls.push({
      name: 'map.flyTo',
      arguments: { anchor: { kind: 'place', id: positivePlace.id } },
    });
  if (!unitMode && projects.length)
    calls.push({ name: 'map.highlight', arguments: { entities: projects.slice(0, 12) } });
  for (const [layer, pattern] of [
    ['school', /school|مدرس/],
    ['beach', /beach|بحر/],
    ['golf', /golf|جولف/],
    ['hospital', /hospital|مستشفي/],
    ['airport', /airport|مطار/],
    ['culture', /culture|museum|متحف|ثقاف/],
  ] as const) {
    const match = text.match(pattern);
    if (match)
      calls.push({
        name: 'map.showLayer',
        arguments: {
          layer,
          visible:
            (layer === 'school' && /not just any school/.test(text)) ||
            !isNegative(text, match.index!),
        },
      });
  }
  const minutes = text.match(/\b(10|20|30)\s*(?:minutes?|دقيقه|دقيقة)/);
  if (minutes && positivePlace)
    calls.push({
      name: 'map.drawIsochrone',
      arguments: {
        origin: { kind: 'place', id: positivePlace.id },
        minutes: Number(minutes[1]) as 10 | 20 | 30,
      },
    });
  let replyKey: ConciergeProviderPlan['replyKey'] = clarification.size
    ? 'CLARIFY'
    : calls.length
      ? 'RESULTS'
      : 'ACKNOWLEDGE';
  if (advice) replyKey = 'ADVICE_HANDOFF';
  // Read-only advice can offer a handoff. Only an explicit request can propose one.
  const handoff =
    /(?:contact|connect|handoff|send).{0,25}(?:advisor|adviser)|(?:تواصل|وصلني|ارسل).{0,25}(?:مستشار)/.test(
      text,
    );
  if (handoff && !brief.privacy.doNotShare && !restrictions.doNotShare) {
    calls.unshift({
      name: 'handoff_to_advisor',
      arguments: { reason: raw.slice(0, 500), mode: 'propose' },
    });
    replyKey = 'WRITE_CONFIRMATION';
  }
  if (
    /\bsave\b|احفظ/.test(text) &&
    entities.length &&
    !brief.privacy.doNotSave &&
    !restrictions.doNotSave
  ) {
    calls.unshift({
      name: 'save_to_portfolio',
      arguments: {
        entities: entities.slice(0, 24),
        mode: 'propose',
        name: responseLanguage === 'ar' ? 'اختياراتي' : 'My selections',
      },
    });
    replyKey = 'WRITE_CONFIRMATION';
  }
  if (
    /\bbook\b|احجز/.test(text) &&
    entities.length &&
    !brief.privacy.doNotBook &&
    !restrictions.doNotBook
  ) {
    calls.unshift({
      name: 'request_viewing',
      arguments: {
        entities: entities.slice(0, 24),
        mode: 'propose',
        preferredSlots: [],
        modeOfViewing: /video|فيديو/.test(text) ? 'video' : 'in_person',
        timezone: brief.markets[0]?.country === 'Egypt' ? 'Africa/Cairo' : 'Asia/Dubai',
      },
    });
    replyKey = 'WRITE_CONFIRMATION';
  }
  const plan = providerPlanSchema.parse({
    version: 1,
    baseRevision: before.revision,
    briefPatch: patch,
    calls: calls.slice(0, 8),
    replyKey,
    clarificationFields: [...clarification].slice(0, 5),
    responseLanguage,
    continue:
      needsFeedback &&
      calls.some((call) => call.name === 'search_projects' || call.name === 'search_units'),
  });
  return { brief, plan };
}

export class MockConciergeProvider implements ConciergeProvider {
  constructor(private readonly options: Pick<ConciergeParseOptions, 'now'> = {}) {}
  async plan(input: Parameters<ConciergeProvider['plan']>[0]): Promise<ConciergeProviderPlan> {
    input.signal?.throwIfAborted();
    if (input.round > 0) {
      const text = normalizeConciergeText(input.message);
      const cards = [
        ...new Map(
          input.toolResults
            .flatMap((component) => ('cards' in component ? component.cards : []))
            .map((card) => [card.kind === 'demo-unit' ? card.unitId : card.projectId, card]),
        ).values(),
      ];
      const entityOf = (card: (typeof cards)[number]): Entity =>
        card.kind === 'demo-unit'
          ? { kind: 'unit', id: card.unitId }
          : { kind: 'project', id: card.projectId };
      const candidates = cards.filter((card) =>
        input.priorEntities.some(
          (entity) => entity.id === entityOf(card).id && entity.kind === entityOf(card).kind,
        ),
      );
      const comparison = /compare|قارن/.test(text);
      const chosen =
        comparison && input.brief.markets.length > 1
          ? input.brief.markets
              .map((market) =>
                candidates.find((card) =>
                  card.facts.some(
                    (fact) => fact.key === 'country' && fact.value === market.country,
                  ),
                ),
              )
              .filter((card): card is (typeof cards)[number] => Boolean(card))
          : candidates.slice(0, comparison ? 4 : 12);
      const entities = chosen.map(entityOf);
      const calls: ConciergeToolCall[] = [];
      const missingMarket =
        comparison &&
        input.brief.markets.length > 1 &&
        chosen.length !== input.brief.markets.length;
      if (comparison && entities.length >= 2 && !missingMarket) {
        calls.push(
          { name: 'compare', arguments: { entities: entities.slice(0, 4) } },
          { name: 'ui.showComparison', arguments: { entities: entities.slice(0, 4) } },
        );
      }
      if (entities.length)
        calls.push({ name: 'map.highlight', arguments: { entities: entities.slice(0, 12) } });
      const clarificationFields: string[] = [];
      return providerPlanSchema.parse({
        version: 1,
        baseRevision: input.brief.revision,
        briefPatch: null,
        calls,
        responseLanguage: input.responseLanguage,
        continue: false,
        replyKey:
          missingMarket || !entities.length
            ? 'NO_MATCHES'
            : clarificationFields.length
              ? 'CLARIFY'
              : 'RESULTS',
        clarificationFields,
      });
    }
    return parseConciergeMessage(input.message, input.brief, {
      now: this.options.now ?? new Date().toISOString().slice(0, 10),
      responseLanguage: input.responseLanguage,
      priorEntities: input.priorEntities,
    }).plan;
  }
}
