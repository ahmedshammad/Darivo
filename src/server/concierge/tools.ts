import type { User } from '@prisma/client';
import type { AtlasProject } from '@/src/lib/atlas';
import { ATLAS_TRAVEL_SPEED_KMH } from '@/src/lib/atlas';
import { ATLAS_PLACES, ATLAS_STORIES } from '@/src/lib/atlas-intent';
import { FX } from '@/src/lib/catalog';
import { normalizeConciergeText } from './mock-parser';
import { buildAreaGuide } from './area-guide';
import {
  conciergeActionSchema,
  conciergeComponentSchema,
  writeProposalSchema,
  type ConciergeAction,
  type ConciergeBrief,
  type ConciergeComponent,
  type ConciergeEntityRef,
  type ConciergeToolCall,
  type GroundedCard,
  type MarketBrief,
  type WriteProposal,
} from '@/src/lib/concierge';
import { getAtlasData } from '@/src/server/db/atlas';
import { getProperty, searchProperties } from '@/src/server/db/properties';
import { listReferenceDevelopers } from '@/src/server/db/reference';
import {
  bilingual,
  cardEntity,
  createFact,
  constraintEvidence,
  completionUpperBound,
  deadlineBoundary,
  groundProject,
  groundUnit,
  rankByConsentedTaste,
  resolveCard,
  unknownDate,
  evidenceDate,
} from './grounding';

export type ToolContext = {
  brief: ConciergeBrief;
  viewer: User | null;
  turnId: string;
  requestId: string;
  callId: string;
  message: string;
  signal?: AbortSignal;
};
export type ToolResult = {
  components: ConciergeComponent[];
  actions: ConciergeAction[];
  proposals: WriteProposal[];
};
const empty = (): ToolResult => ({ components: [], actions: [], proposals: [] });
export function notice(
  context: ToolContext,
  code: Extract<ConciergeComponent, { kind: 'notice' }>['code'],
  en: string,
  ar: string,
): ConciergeComponent {
  return {
    id: `${context.callId}:notice`,
    turnId: context.turnId,
    kind: 'notice',
    code,
    text: bilingual(en, ar),
  };
}
function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[أإآ]/g, 'ا');
}
function placeMatches(project: AtlasProject, placeId: string): boolean {
  const place = ATLAS_PLACES.find((row) => row.id === placeId);
  if (!place) return false;
  const text = normalize(
    `${project.country} ${project.city} ${project.community} ${project.nameEn} ${project.nameAr}`,
  );
  return (
    [place.nameEn, place.nameAr, ...place.keywords].some((word) =>
      text.includes(normalize(word)),
    ) ||
    (placeId === 'uae' && project.country === 'UAE') ||
    (placeId === 'egypt' && project.country === 'Egypt')
  );
}
export function projectMatchesMarket(project: AtlasProject, market: MarketBrief): boolean {
  if (project.country !== market.country) return false;
  if (
    market.placeIds.length &&
    !(market.placeMatch === 'all'
      ? market.placeIds.every((id) => placeMatches(project, id))
      : market.placeIds.some((id) => placeMatches(project, id)))
  )
    return false;
  if (market.budget?.association === 'explicit') {
    if (project.amount === null || !FX[project.currency]) return false;
    const price = (project.amount / FX[project.currency]) * FX[market.budget.currency];
    if (
      (market.budget.min !== null && price < market.budget.min) ||
      (market.budget.max !== null && price > market.budget.max)
    )
      return false;
  }
  const ready = /^(ready|completed|delivered)$/i.test(project.completion ?? '');
  if (market.readiness === 'ready_now' && !ready) return false;
  if (market.deadline) {
    const boundary = deadlineBoundary(market.deadline);
    if (boundary) {
      const latest = ready ? new Date() : completionUpperBound(project.completion);
      if (!latest || (boundary.exclusive ? latest >= boundary.date : latest > boundary.date))
        return false;
    }
  }
  return true;
}
export function matchesCardConstraints(
  card: GroundedCard,
  markets: MarketBrief[],
  brief: ConciergeBrief,
): boolean {
  if (brief.household.schoolRequirement === 'verified_required') return false;
  return (markets.length ? markets : [null]).some((market) => {
    const types = card.facts.filter((fact) => fact.key === 'type' || fact.key.startsWith('type.'));
    const text = types
      .map((fact) => String(fact.value))
      .join(' ')
      .toLowerCase();
    if (market?.propertyTypes.length && !market.propertyTypes.some((type) => text.includes(type)))
      return false;
    const bedrooms = card.facts.find((fact) => fact.key === 'bedrooms')?.value;
    if (market?.bedrooms !== null && market?.bedrooms !== undefined && bedrooms !== market.bedrooms)
      return false;
    const relevant = (constraint: ConciergeBrief['mustHaves'][number]) =>
      !constraint.marketIds.length || (market && constraint.marketIds.includes(market.id));
    for (const constraint of brief.mustHaves.filter(relevant)) {
      const evidence = constraintEvidence(card, constraint);
      if (evidence.value === false || (constraint.verificationRequired && evidence.value !== true))
        return false;
    }
    for (const constraint of brief.exclusions.filter(relevant)) {
      const evidence = constraintEvidence(card, constraint);
      if (evidence.value === true || (constraint.verificationRequired && evidence.value !== false))
        return false;
    }
    return true;
  });
}
export async function executeConciergeTool(
  call: ConciergeToolCall,
  context: ToolContext,
): Promise<ToolResult> {
  context.signal?.throwIfAborted();
  const result = empty();
  const componentId = `${context.callId}:component`;
  const actionBase = {
    id: `${context.callId}:action`,
    turnId: context.turnId,
    requestId: context.requestId,
    briefRevision: context.brief.revision,
  };
  const cardsComponent = (cards: GroundedCard[], compare = false) => {
    if (!cards.length)
      result.components.push(
        notice(
          context,
          'NO_MATCHES',
          'No authorized records match those constraints. Adjust the Brief or ask an advisor.',
          'لا توجد سجلات مسموحة تطابق هذه الشروط. عدّل الطلب أو استعن بمستشار.',
        ),
      );
    else if (compare && cards.length >= 2)
      result.components.push({
        id: componentId,
        turnId: context.turnId,
        kind: 'comparison',
        cards: cards.slice(0, 4),
        rows: [
          { label: bilingual('Original price', 'السعر الأصلي'), factKey: 'price' },
          { label: bilingual('Community', 'المنطقة'), factKey: 'community' },
          { label: bilingual('Completion evidence', 'دليل التسليم'), factKey: 'completion' },
        ],
      });
    else
      result.components.push({
        id: componentId,
        turnId: context.turnId,
        kind: 'project-cards',
        cards,
      });
  };
  const resolveAll = async (refs: ConciergeEntityRef[]) => {
    const unique = [...new Map(refs.map((ref) => [`${ref.kind}:${ref.id}`, ref])).values()];
    const cards = await Promise.all(
      unique.map((ref) => resolveCard(ref, context.viewer, context.brief)),
    );
    return cards.every(Boolean) ? (cards as GroundedCard[]) : null;
  };
  const anchor = async (ref: ConciergeEntityRef) => {
    if (ref.kind === 'place') {
      const place = ATLAS_PLACES.find((row) => row.id === ref.id);
      return place ? { center: place.center, zoom: place.zoom } : null;
    }
    const card = await resolveCard(ref, context.viewer, context.brief);
    return card?.center ? { center: card.center, zoom: 12 } : null;
  };
  const mapReference = async (ref: ConciergeEntityRef): Promise<ConciergeEntityRef | null> => {
    if (ref.kind !== 'unit') return (await anchor(ref)) ? ref : null;
    const card = await resolveCard(ref, context.viewer, context.brief);
    return card?.kind === 'demo-unit' ? { kind: 'project', id: card.projectId } : null;
  };
  switch (call.name) {
    case 'search_projects': {
      const data = await getAtlasData(context.viewer);
      const markets = context.brief.markets.filter(
        (market) =>
          !call.arguments.marketIds.length || call.arguments.marketIds.includes(market.id),
      );
      if (call.arguments.marketIds.some((id) => !markets.some((market) => market.id === id))) break;
      const groups: GroundedCard[][] = [];
      const allocation = Math.max(
        1,
        Math.floor(call.arguments.limit / Math.max(markets.length, 1)),
      );
      for (const market of markets.length ? markets : [null]) {
        const candidates = data.projects
          .filter((project) => !market || projectMatchesMarket(project, market))
          .sort(
            (a, b) =>
              Number(b.kind === 'REAL_REFERENCE') - Number(a.kind === 'REAL_REFERENCE') ||
              a.nameEn.localeCompare(b.nameEn),
          );
        const eligibleCards: GroundedCard[] = [];
        for (const project of candidates) {
          const card = await groundProject(project, context.brief);
          if (card && matchesCardConstraints(card, market ? [market] : [], context.brief))
            eligibleCards.push(card);
        }
        const cards = rankByConsentedTaste(eligibleCards, context.brief).slice(0, allocation);
        groups.push(cards);
        if (cards.length)
          result.components.push({
            id: `${componentId}:${market?.id ?? 'all'}`,
            turnId: context.turnId,
            kind: 'project-cards',
            cards,
          });
        else
          result.components.push({
            ...notice(
              context,
              'NO_MATCHES',
              `No records establish all the requested constraints${market ? ` for ${market.country}` : ''}. Missing evidence is not a match; refine the Brief or request confirmation.`,
              `لا توجد سجلات تثبت جميع الشروط المطلوبة${market ? ` في ${market.country === 'UAE' ? 'الإمارات' : 'مصر'}` : ''}. غياب الدليل ليس تطابقاً؛ نقّح الطلب أو اطلب التأكيد.`,
            ),
            id: `${componentId}:${market?.id ?? 'all'}:none`,
          });
      }
      if (markets.length >= 2 && /compare|قارن/.test(normalize(context.message))) {
        const selected = groups.map((group) => group[0]).filter(Boolean);
        if (selected.length === groups.length && selected.length >= 2) {
          cardsComponent(selected.slice(0, 4), true);
          result.actions.push({ ...actionBase, type: 'ui.showComparison', componentId });
        }
      }
      if (context.brief.household.schoolRequirement === 'verified_required')
        result.components.push({
          ...notice(
            context,
            'UNKNOWN_FACT',
            'The requested school curriculum is unverified; demo map points cannot establish it. No school-suitable match has been claimed.',
            'المنهج المدرسي المطلوب غير موثق؛ لا تثبته نقاط الخريطة التجريبية. لم ندّعِ وجود تطابق مناسب للمدرسة.',
          ),
          id: `${componentId}:school`,
        });
      break;
    }
    case 'search_units': {
      const markets = context.brief.markets.filter(
        (market) =>
          !call.arguments.marketIds.length || call.arguments.marketIds.includes(market.id),
      );
      if (call.arguments.marketIds.some((id) => !markets.some((market) => market.id === id))) break;
      const cards: GroundedCard[] = [];
      for (const market of markets.length ? markets : [null]) {
        const rows = await searchProperties(
          {
            country: market ? (market.country === 'UAE' ? 'AE' : 'EG') : undefined,
            currency: market?.budget?.currency ?? 'AED',
            minPrice:
              market?.budget?.association === 'explicit'
                ? (market.budget.min ?? undefined)
                : undefined,
            maxPrice:
              market?.budget?.association === 'explicit'
                ? (market.budget.max ?? undefined)
                : undefined,
            bedrooms: market?.bedrooms ?? undefined,
            status: market?.readiness === 'ready_now' ? 'ready' : undefined,
            q: call.arguments.query,
            limit: 24,
          },
          context.viewer,
        );
        const atlas = await getAtlasData(context.viewer);
        for (const unit of rows.properties) {
          if (
            call.arguments.projectIds.length &&
            !call.arguments.projectIds.includes(unit.projectId ?? '')
          )
            continue;
          const project = atlas.projects.find((row) => row.id === unit.projectId);
          if (
            !project ||
            (market &&
              !projectMatchesMarket(
                {
                  ...project,
                  amount: Number(unit.priceMinor) / 100,
                  currency: unit.currency,
                  completion: unit.status === 'ready' ? 'ready' : unit.handoverDate,
                },
                market,
              ))
          )
            continue;
          const card = groundUnit(unit, context.brief);
          if (
            card &&
            matchesCardConstraints(card, market ? [market] : [], context.brief) &&
            !cards.some((row) => row.id === card.id)
          )
            cards.push(card);
        }
      }
      cardsComponent(rankByConsentedTaste(cards, context.brief).slice(0, call.arguments.limit));
      break;
    }
    case 'get_project': {
      const card = await resolveCard(
        { kind: 'project', id: call.arguments.projectId },
        context.viewer,
        context.brief,
      );
      cardsComponent(card ? [card] : []);
      break;
    }
    case 'compare':
    case 'ui.showComparison': {
      const cards = await resolveAll(call.arguments.entities);
      if (!cards || cards.length < 2) {
        cardsComponent([]);
        break;
      }
      cardsComponent(cards, true);
      result.actions.push({ ...actionBase, type: 'ui.showComparison', componentId });
      break;
    }
    case 'get_developer': {
      const data = await getAtlasData(context.viewer),
        developer = data.developers.find((row) => row.id === call.arguments.developerId);
      if (!developer) {
        cardsComponent([]);
        break;
      }
      const record = (await listReferenceDevelopers()).find((row) => row.id === developer.id);
      if (!record) {
        cardsComponent([]);
        break;
      }
      const sourceMap = new Map<string, GroundedCard['sources'][number]>();
      const facts = record.facts
        .filter((fact) => /^(country|positioning|known_for\[\d+\])$/.test(fact.key))
        .map((fact) => {
          for (const source of fact.sources)
            sourceMap.set(source.id, {
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
          const value = typeof fact.value === 'string' ? fact.value : null;
          const grounded = createFact(
            { kind: 'developer', id: developer.id },
            fact.key.replace(/\[(\d+)\]/g, '.$1'),
            value,
            fact.sources.map((source) => source.id),
            'REAL_REFERENCE',
            evidenceDate(fact.asOf),
          );
          grounded.id = fact.id;
          grounded.label =
            fact.key === 'positioning'
              ? bilingual('Published description', 'الوصف المنشور')
              : fact.key.startsWith('known_for')
                ? bilingual('Published portfolio mention', 'ذكر في محفظة المشاريع المنشورة')
                : bilingual('Country', 'الدولة');
          if (value && !grounded.displayValue)
            grounded.qualifier = bilingual('Original source wording', 'النص الأصلي للمصدر');
          return grounded;
        });
      result.components.push({
        id: componentId,
        turnId: context.turnId,
        kind: 'developer-card',
        developerId: developer.id,
        name: bilingual(developer.nameEn, developer.nameAr),
        projectIds: developer.projectIds.filter((id) => data.projects.some((row) => row.id === id)),
        facts,
        sources: [...sourceMap.values()],
      });
      break;
    }
    case 'map.flyTo':
    case 'map.drawIsochrone': {
      const ref = call.name === 'map.flyTo' ? call.arguments.anchor : call.arguments.origin;
      const place = await anchor(ref);
      if (!place) {
        cardsComponent([]);
        break;
      }
      if (call.name === 'map.flyTo')
        result.actions.push({
          ...actionBase,
          type: call.name,
          anchor: ref,
          camera: { ...place, key: actionBase.id, pitch: 48 },
        });
      else
        result.actions.push({
          ...actionBase,
          type: call.name,
          origin: ref,
          center: place.center,
          minutes: call.arguments.minutes,
          method: 'ILLUSTRATIVE_STRAIGHT_LINE',
          speedKmh: ATLAS_TRAVEL_SPEED_KMH,
        });
      break;
    }
    case 'map.highlight': {
      const entities = await Promise.all(call.arguments.entities.map(mapReference));
      if (entities.every(Boolean))
        result.actions.push({
          ...actionBase,
          type: call.name,
          entities: entities as ConciergeEntityRef[],
        });
      break;
    }
    case 'map.showLayer':
      result.actions.push({ ...actionBase, type: call.name, ...call.arguments });
      if (call.arguments.layer === 'school' && call.arguments.visible)
        result.components.push(
          notice(
            context,
            'DEMO_LIMITATION',
            'School points are fictional demo markers. Curriculum, admissions and real journeys are unverified.',
            'نقاط المدارس علامات تجريبية خيالية. المناهج والقبول والرحلات الفعلية غير موثقة.',
          ),
        );
      break;
    case 'map.story':
      if (ATLAS_STORIES.some((story) => story.id === call.arguments.storyId))
        result.actions.push({
          ...actionBase,
          type: call.name,
          storyId: call.arguments.storyId,
          autoplay: false,
        });
      break;
    case 'ui.showMiniMap': {
      const references = await Promise.all(call.arguments.entities.map(mapReference));
      const anchors = await Promise.all(references.map((ref) => (ref ? anchor(ref) : null)));
      if (!anchors.length || !anchors.every(Boolean)) {
        cardsComponent([]);
        break;
      }
      result.components.push({
        id: componentId,
        turnId: context.turnId,
        kind: 'mini-map',
        entities: references as ConciergeEntityRef[],
        camera: { ...anchors[0]!, key: componentId },
        renderMode: 'SHARED_MAP_PREVIEW',
      });
      break;
    }
    case 'ui.showPriceAreaChart': {
      const cards = await resolveAll(call.arguments.entities);
      if (!cards || cards.length < 2) {
        cardsComponent([]);
        break;
      }
      const points = cards.flatMap((card) => {
        const price = card.facts.find(
          (fact) => fact.key === 'price' && typeof fact.value === 'number',
        );
        const area = card.facts.find(
          (fact) => fact.key === 'area' && typeof fact.value === 'number' && fact.value > 0,
        );
        return price && area
          ? [{ entity: cardEntity(card), priceFactId: price.id, areaFactId: area.id }]
          : [];
      });
      if (points.length !== cards.length) {
        result.components.push(
          notice(
            context,
            'UNKNOWN_FACT',
            'Comparable numeric unit areas are unavailable for this selection. Project site area is not a unit area; no chart value has been invented.',
            'لا تتوفر مساحات رقمية قابلة للمقارنة للوحدات المختارة. مساحة موقع المشروع ليست مساحة وحدة؛ لم تُنشأ قيمة افتراضية للمخطط.',
          ),
        );
        break;
      }
      result.components.push({
        id: componentId,
        turnId: context.turnId,
        kind: 'price-area-chart',
        cards,
        points,
      });
      break;
    }
    case 'ui.showItinerary': {
      const places = [...new Set(call.arguments.placeIds)].map((id) =>
        ATLAS_PLACES.find((place) => place.id === id),
      );
      if (!places.every(Boolean)) {
        cardsComponent([]);
        break;
      }
      const sourceId = `${context.callId}:itinerary-demo`;
      const source = {
        id: sourceId,
        kind: 'demo' as const,
        title: 'Illustrative itinerary, not a booking or route',
        url: null,
        publisher: null,
        basis: 'DEMO_ESTIMATE' as const,
        asOf: unknownDate,
        retrieved: unknownDate,
        confidence: 'UNASSESSED' as const,
      };
      const facts = places.map((place) =>
        createFact(
          { kind: 'place', id: place!.id },
          'illustrative-stop',
          place!.nameEn,
          [sourceId],
          'DEMO',
        ),
      );
      result.components.push({
        id: componentId,
        turnId: context.turnId,
        kind: 'itinerary',
        mode: 'DEMO_ILLUSTRATION',
        facts,
        sources: [source],
        steps: places.map((place, index) => ({
          id: `${componentId}:${index}`,
          title: bilingual(place!.nameEn, place!.nameAr),
          placeId: place!.id,
          time: `${String(10 + index * 2).padStart(2, '0')}:00`,
          factIds: [facts[index].id],
        })),
      });
      result.components.push({
        ...notice(
          context,
          'DEMO_LIMITATION',
          'These are illustrative planning slots, not journey estimates, appointments or a feasible travel route. Confirm each location and appointment with an advisor.',
          'هذه أوقات تخطيط توضيحية وليست تقديرات رحلة أو مواعيد أو مسار سفر مؤكد. أكّد كل موقع وموعد مع مستشار.',
        ),
        id: `${componentId}:limitation`,
      });
      break;
    }
    case 'area_insights': {
      const guide = await buildAreaGuide(call.arguments.placeId, context);
      result.components.push(...guide.components);
      result.actions.push(...guide.actions);
      break;
    }
    case 'investment_calc': {
      const numericInput = normalizeConciergeText(context.message).replace(/,/g, '');
      const currencyWords: Record<string, string> = {
        AED: 'aed|dirhams?|درهم|دراهم',
        EGP: 'egp|egyptian pounds?|جنيه|جنيها',
        USD: 'usd|dollars?|دولار',
        EUR: 'eur|euros?|يورو',
        SAR: 'sar|riyals?|ريال',
        GBP: 'gbp|sterling|استرليني',
      };
      const explicitMoney = (labels: string, money: { amount: number; currency: string }) => {
        const match = numericInput.match(
          new RegExp(
            `(?:${labels})[^0-9]{0,25}([0-9]+(?:\\.[0-9]+)?)\\s*(?:${currencyWords[money.currency]})(?![a-z])`,
            'i',
          ),
        );
        return match !== null && Number(match[1]) === money.amount;
      };
      const vacancy = numericInput.match(/(?:vacancy|شغور)[^0-9]{0,20}([0-9]+(?:\.[0-9]+)?)\s*%/);
      if (
        !explicitMoney('annual rent|rent|ايجار', call.arguments.annualRent) ||
        !explicitMoney('annual costs|costs|تكاليف', call.arguments.annualCosts) ||
        !vacancy ||
        Number(vacancy[1]) !== call.arguments.vacancyPercent
      ) {
        result.components.push(
          notice(
            context,
            'NEEDS_CLARIFICATION',
            'Provide annual rent and annual costs with each currency, plus vacancy as a percentage. No assumptions will be supplied for you.',
            'حدّد الإيجار والتكاليف السنوية مع عملة كل منهما، والشغور كنسبة مئوية. لن نضع افتراضات نيابة عنك.',
          ),
        );
        break;
      }
      const unit = await getProperty(call.arguments.unitId, context.viewer);
      const card = unit && groundUnit(unit, context.brief);
      if (!card?.price) {
        cardsComponent([]);
        break;
      }
      const entity = cardEntity(card),
        sourceId = `${context.callId}:assumptions`;
      card.sources.push({
        id: sourceId,
        kind: 'user',
        title: 'User-supplied scenario',
        url: null,
        publisher: null,
        basis: 'USER_ASSUMPTION',
        asOf: unknownDate,
        retrieved: unknownDate,
        confidence: 'UNASSESSED',
      });
      const rent = call.arguments.annualRent.amount / FX[call.arguments.annualRent.currency],
        costs = call.arguments.annualCosts.amount / FX[call.arguments.annualCosts.currency];
      const yieldValue =
        ((rent * (1 - call.arguments.vacancyPercent / 100) - costs) /
          (card.price.native.amount / FX[card.price.native.currency])) *
        100;
      const fact = createFact(
        entity,
        'scenario-yield',
        yieldValue,
        [sourceId, ...card.facts.find((row) => row.key === 'price')!.sourceIds],
        'USER_ASSUMPTION',
      );
      fact.label = bilingual(
        'Illustrative net yield from supplied assumptions',
        'عائد صافي توضيحي وفق الافتراضات المقدمة',
      );
      fact.unit = '%';
      fact.qualifier = bilingual(
        'Illustrative arithmetic using supplied assumptions and static demo FX; not a forecast or personal financial advice.',
        'حساب توضيحي بالافتراضات المقدمة وسعر صرف تجريبي ثابت؛ ليس توقعاً أو مشورة مالية شخصية.',
      );
      fact.originalText = JSON.stringify(call.arguments);
      card.facts.push(fact);
      cardsComponent([card]);
      break;
    }
    case 'payment_plan_projection':
    case 'ui.showTimeline': {
      if (Boolean(call.arguments.projectId) === Boolean(call.arguments.unitId)) {
        result.components.push(
          notice(
            context,
            'NEEDS_CLARIFICATION',
            'Choose one project or one fictional unit for the timeline.',
            'اختر مشروعاً واحداً أو وحدة خيالية واحدة لعرض خطة السداد.',
          ),
        );
        break;
      }
      const card = await resolveCard(
        call.arguments.unitId
          ? { kind: 'unit', id: call.arguments.unitId }
          : { kind: 'project', id: call.arguments.projectId! },
        context.viewer,
        context.brief,
      );
      const scheduleFact = card?.facts.find((fact) => fact.key === 'payment_plan');
      if (
        call.name === 'payment_plan_projection' &&
        call.arguments.scheduleFactIds.some(
          (id) => !card?.facts.some((fact) => fact.id === id && fact.key === 'payment_plan'),
        )
      ) {
        result.components.push(
          notice(
            context,
            'UNKNOWN_FACT',
            'The requested payment evidence is unavailable.',
            'دليل السداد المطلوب غير متاح.',
          ),
        );
        break;
      }
      const pieces = typeof scheduleFact?.value === 'string' ? scheduleFact.value.split('/') : [];
      const percentages = pieces.map((piece) => Number(piece.match(/(\d+(?:\.\d+)?)\s*%/)?.[1]));
      if (
        !card?.price ||
        !scheduleFact ||
        !pieces.length ||
        percentages.some((value) => !Number.isFinite(value)) ||
        Math.abs(percentages.reduce((a, b) => a + b, 0) - 100) > 0.001
      ) {
        result.components.push(
          notice(
            context,
            'UNKNOWN_FACT',
            'A complete payment schedule is unavailable for this selected record. An advisor can confirm it; no instalments have been invented.',
            'لا تتوفر خطة سداد كاملة لهذا السجل المختار. يستطيع المستشار تأكيدها؛ لم تُنشأ أقساط افتراضية.',
          ),
        );
        break;
      }
      result.components.push({
        id: componentId,
        turnId: context.turnId,
        kind: 'payment-timeline',
        entity: cardEntity(card),
        price: card.price,
        facts: card.facts,
        sources: card.sources,
        mode: card.kind === 'reference-project' ? 'SOURCED_SCHEDULE' : 'DEMO_ESTIMATE',
        schedule: pieces.map((piece, index) => ({
          id: `${componentId}:${index}`,
          label: bilingual(
            piece.trim(),
            scheduleFact.displayValue?.ar.split('/')[index]?.trim() ??
              (/construction/i.test(piece)
                ? 'أثناء الإنشاء'
                : /handover/i.test(piece)
                  ? 'عند التسليم'
                  : /down|booking/i.test(piece)
                    ? 'عند الحجز'
                    : `النص الأصلي للمصدر: ${piece.trim()}`),
          ),
          percent: percentages[index],
          timing: piece.trim(),
          factIds: [scheduleFact.id],
        })),
      });
      result.actions.push({ ...actionBase, type: 'ui.showTimeline', componentId });
      break;
    }
    case 'save_to_portfolio':
    case 'request_viewing':
    case 'handoff_to_advisor': {
      const privacy = context.brief.privacy;
      if (privacy.doNotSave) {
        result.components.push(
          notice(
            context,
            'DEMO_LIMITATION',
            'Your no-save setting prevents retaining an action draft for confirmation. No portfolio save, contact or booking has been made.',
            'إعداد عدم الحفظ يمنع الاحتفاظ بمسودة إجراء لتأكيدها. لم يُحفظ شيء في قائمة العقارات ولم يُنفذ تواصل أو حجز.',
          ),
        );
        break;
      }
      const blocked =
        call.name === 'save_to_portfolio'
          ? privacy.doNotSave
          : call.name === 'request_viewing'
            ? privacy.doNotBook || privacy.doNotShare
            : privacy.doNotShare;
      if (blocked) {
        result.components.push(
          notice(
            context,
            'DEMO_LIMITATION',
            'Your privacy instruction prevents this proposal. Nothing was saved, shared or booked.',
            'تعليمات الخصوصية تمنع هذا الاقتراح. لم يُحفظ أو يُشارك أو يُحجز شيء.',
          ),
        );
        break;
      }
      const entities = 'entities' in call.arguments ? call.arguments.entities : [];
      if (entities.length && !(await resolveAll(entities))) {
        cardsComponent([]);
        break;
      }
      if (call.name !== 'handoff_to_advisor' && entities.some((entity) => entity.kind !== 'unit')) {
        result.components.push(
          notice(
            context,
            'ADVICE_HANDOFF',
            'This is a project reference, not a bookable unit. Ask for an advisor enquiry to confirm availability; no unit has been attached.',
            'هذا مرجع لمشروع وليس وحدة قابلة للحجز. اطلب استفساراً من مستشار لتأكيد التوافر؛ لم تُربط وحدة بالمشروع.',
          ),
        );
        break;
      }
      const summary =
        call.name === 'save_to_portfolio'
          ? bilingual(
              'Review saving these demo units to your portfolio.',
              'راجع حفظ هذه الوحدات التجريبية في قائمتك.',
            )
          : call.name === 'request_viewing'
            ? bilingual(
                'Review this private viewing request. No booking has been made.',
                'راجع طلب المعاينة الخاصة. لم يُنفذ أي حجز.',
              )
            : bilingual(
                'Review an advisor handoff. No information has been sent.',
                'راجع الإحالة إلى مستشار. لم تُرسل أي معلومات.',
              );
      if (
        call.name === 'request_viewing' &&
        (entities.length !== 1 ||
          !call.arguments.preferredSlots.length ||
          call.arguments.preferredSlots.some(
            (slot) =>
              new Date(slot).getTime() <= Date.now() ||
              new Date(slot).getTime() > Date.now() + 366 * 86400000,
          ))
      ) {
        result.components.push(
          notice(
            context,
            'NEEDS_CLARIFICATION',
            'Choose one demo unit and provide a future viewing slot within the next year before a request can be reviewed.',
            'اختر وحدة تجريبية واحدة وحدّد موعد معاينة مستقبلياً خلال السنة القادمة قبل مراجعة الطلب.',
          ),
        );
        break;
      }
      result.proposals.push(
        writeProposalSchema.parse({
          id: `${context.callId}:proposal`,
          turnId: context.turnId,
          kind: call.name,
          summary,
          entities,
          expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
          details:
            call.name === 'handoff_to_advisor'
              ? {
                  ...call.arguments,
                  reason: context.message.trim().slice(0, 500) || 'Advisor enquiry requested',
                }
              : call.arguments,
        }),
      );
      break;
    }
    case 'brief.update':
      break; // Engine owns revision changes and events.
  }
  context.signal?.throwIfAborted();
  return {
    components: result.components.map((item) => conciergeComponentSchema.parse(item)),
    actions: result.actions.map((item) => conciergeActionSchema.parse(item)),
    proposals: result.proposals,
  };
}
