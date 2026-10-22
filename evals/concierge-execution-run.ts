import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import type { User } from '@prisma/client';
import { db } from '../src/server/db/client';
import { getAtlasData } from '../src/server/db/atlas';
import { getProperty } from '../src/server/db/properties';
import { getReferenceProject, listReferenceDevelopers } from '../src/server/db/reference';
import { ATLAS_PLACES, ATLAS_STORIES } from '../src/lib/atlas-intent';
import { FX, FX_DATE } from '../src/lib/catalog';
import {
  emptyConciergeBrief,
  conciergeComponentSchema,
  conciergeActionSchema,
  type ConciergeBrief,
  type ConciergeComponent,
  type ConciergeEntityRef,
  type ConciergeProvider,
  type ConciergeProviderPlan,
  type ConciergeStreamEvent,
  type GroundedCard,
} from '../src/lib/concierge';
import { runConciergeTurn, type ConciergeTurnResult } from '../src/server/concierge/engine';
import {
  cardEntity,
  resolveCard,
  validateCardReferences,
  rehydrateConciergeComponents,
} from '../src/server/concierge/grounding';
import { MockConciergeProvider, normalizeConciergeText } from '../src/server/concierge/mock-parser';
import { SDKConciergeProvider } from '../src/server/concierge/provider';
import { readParserCases, type ParserEvalCase } from './concierge-run';

type Counter =
  | 'executionErrors'
  | 'semanticFailures'
  | 'hallucinatedIds'
  | 'hallucinatedValues'
  | 'invalidSourceReferences'
  | 'privateLeaks'
  | 'currencyErrors'
  | 'mapErrors'
  | 'toneViolations'
  | 'refusalFailures'
  | 'schoolDisclosureFailures'
  | 'unconfirmedWrites'
  | 'streamErrors';
type Report = {
  provider: string;
  cases: number;
  turns: number;
  cards: number;
  facts: number;
  actions: number;
  counters: Record<Counter, number>;
  failures: { case: string; category: Counter; detail: string }[];
  durationMs: number;
};
const equal = isDeepStrictEqual;
function report(provider: string): Report {
  return {
    provider,
    cases: 0,
    turns: 0,
    cards: 0,
    facts: 0,
    actions: 0,
    durationMs: 0,
    counters: {
      executionErrors: 0,
      semanticFailures: 0,
      hallucinatedIds: 0,
      hallucinatedValues: 0,
      invalidSourceReferences: 0,
      privateLeaks: 0,
      currencyErrors: 0,
      mapErrors: 0,
      toneViolations: 0,
      refusalFailures: 0,
      schoolDisclosureFailures: 0,
      unconfirmedWrites: 0,
      streamErrors: 0,
    },
    failures: [],
  };
}
function fail(out: Report, label: string, category: Counter, detail: string) {
  out.counters[category]++;
  out.failures.push({ case: label, category, detail });
}
function atPath(value: unknown, path: string): unknown {
  for (const key of path.split('.'))
    value =
      Array.isArray(value) && key !== 'length' && !/^\d+$/.test(key)
        ? value.find((row) => row?.id === key)
        : value != null
          ? (value as Record<string, unknown>)[key]
          : undefined;
  return value;
}
function checkSemantics(
  test: ParserEvalCase,
  result: ConciergeTurnResult,
  plan: ConciergeProviderPlan | undefined,
  calls: string[],
  out: Report,
  label: string,
) {
  for (const check of test.checks) {
    const actual = atPath({ brief: result.brief, plan }, check.path);
    const values = Array.isArray(actual)
      ? actual.map((item) => (typeof item === 'object' && item && 'id' in item ? item.id : item))
      : [];
    if (
      ('equals' in check && !equal(actual, check.equals)) ||
      ('includes' in check && !values.includes(check.includes)) ||
      ('excludes' in check && values.includes(check.excludes))
    )
      fail(
        out,
        label,
        'semanticFailures',
        `${check.path}: ${JSON.stringify(actual)} does not satisfy ${JSON.stringify(check)}`,
      );
  }
  if (test.id === 'P02' || test.id === 'P21') {
    for (const name of ['compare', 'ui.showComparison', 'map.highlight'])
      if (!calls.includes(name) && !result.actions.some((action) => action.type === name))
        fail(
          out,
          label,
          'semanticFailures',
          `Initial multi-market journey omitted authorized feedback tool ${name}`,
        );
  }
  for (const name of test.requiredCalls)
    if (!calls.includes(name) && !result.actions.some((action) => action.type === name))
      fail(out, label, 'semanticFailures', `Required tool was not executed: ${name}`);
  if (test.id === 'P02' || test.id === 'P21') {
    const comparison = result.components.find((component) => component.kind === 'comparison');
    const countries =
      comparison?.kind === 'comparison'
        ? comparison.cards.flatMap((card) =>
            card.facts.filter((fact) => fact.key === 'country').map((fact) => fact.value),
          )
        : [];
    if (!countries.includes('Egypt') || !countries.includes('UAE'))
      fail(out, label, 'semanticFailures', 'Initial comparison did not contain both market goals');
  }
  for (const name of test.forbiddenCalls)
    if (calls.includes(name))
      fail(out, label, 'refusalFailures', `Forbidden tool executed: ${name}`);
}
function cardRefs(components: ConciergeComponent[]): ConciergeEntityRef[] {
  return [
    ...new Map(
      components
        .flatMap((component) => ('cards' in component ? component.cards.map(cardEntity) : []))
        .map((entity) => [`${entity.kind}:${entity.id}`, entity]),
    ).values(),
  ].slice(0, 12);
}
async function verifyReturnedGeography(
  test: ParserEvalCase,
  result: ConciergeTurnResult,
  viewer: User | null,
  out: Report,
  label: string,
) {
  for (const component of result.components)
    if (component.kind === 'notice' && test.forbiddenNoticeCodes?.includes(component.code))
      fail(
        out,
        label,
        'semanticFailures',
        `Unexpected ${component.code} in an explanation-only response`,
      );
  if (!test.resultPlaces?.length) return;
  const refs = cardRefs(result.components);
  if (
    !refs.length &&
    !result.components.some(
      (component) => component.kind === 'notice' && component.code === 'NO_MATCHES',
    )
  )
    fail(
      out,
      label,
      'semanticFailures',
      'Geographic search returned no records and no explicit no-match disclosure',
    );
  for (const ref of refs) {
    const unit = ref.kind === 'unit' ? await getProperty(ref.id, viewer) : null;
    const project =
      ref.kind === 'project'
        ? await db.project.findUnique({
            where: { id: ref.id },
            select: { country: true, city: true, communityName: true },
          })
        : null;
    // Deliberately independent of tool matching and card prose: inspect the
    // stored community, not broad project-name keywords such as "Palm".
    const community = normalizeConciergeText(
      unit?.community.nameEn ?? project?.communityName ?? '',
    );
    const country = unit ? unit.community.city.countryId : project?.country;
    const matches = (place: NonNullable<ParserEvalCase['resultPlaces']>[number]) =>
      place === 'palm'
        ? /\bpalm jumeirah\b|نخله جميرا|نخلة جميرا/.test(community) &&
          !/jebel ali|جبل علي/.test(community)
        : place === 'saadiyat'
          ? /\bsaadiyat\b|سعديات/.test(community)
          : /\bpalm jebel ali\b|نخله جبل علي|نخلة جبل علي/.test(community);
    if (!['AE', 'UAE'].includes(country ?? '') || !test.resultPlaces.some(matches))
      fail(
        out,
        label,
        'semanticFailures',
        `Returned ${ref.kind}:${ref.id} is in stored community ${community}, outside ${test.resultPlaces.join(' or ')}`,
      );
  }
}
async function verifyCard(
  card: GroundedCard,
  viewer: User | null,
  brief: ConciergeBrief,
  out: Report,
  label: string,
) {
  out.cards++;
  out.facts += card.facts.length;
  try {
    validateCardReferences(card);
  } catch (error) {
    fail(out, label, 'invalidSourceReferences', String(error));
  }
  const entity = cardEntity(card);
  const fresh = await resolveCard(entity, viewer, brief);
  if (!fresh) {
    fail(
      out,
      label,
      'privateLeaks',
      `Emitted card is absent from fresh authorized DAL: ${entity.kind}:${entity.id}`,
    );
    return;
  }
  if (!equal(card.name, fresh.name) || !equal(card.center, fresh.center))
    fail(out, label, 'hallucinatedValues', `Name/coordinates drift: ${entity.id}`);
  const unitForArea = card.kind === 'demo-unit' ? await getProperty(card.unitId, viewer) : null;
  const areaValues: Record<string, number | undefined> = {
    'area-average-aed-sqm': unitForArea?.community.insight?.averageAedSqm,
    'area-yield-low': unitForArea?.community.insight?.yieldLow,
    'area-yield-high': unitForArea?.community.insight?.yieldHigh,
  };
  const areaSourceId = unitForArea ? `${unitForArea.communityId}:area-demo` : null;
  const canonical = new Map(fresh.facts.map((fact) => [fact.id, fact]));
  const scenarioSources = new Set<string>();
  for (const fact of card.facts) {
    const source = canonical.get(fact.id);
    if (!source && fact.key === 'scenario-yield') {
      const input = fact.originalText ? JSON.parse(fact.originalText) : null;
      const numeric = normalizeConciergeText(brief.rawRequest);
      const currencies: Record<string, string> = {
        AED: 'aed|dirhams?|درهم|دراهم',
        EGP: 'egp|egyptian pounds?|جنيه|جنيها',
        USD: 'usd|dollars?|دولار',
        EUR: 'eur|euros?|يورو',
        SAR: 'sar|riyals?|ريال',
        GBP: 'gbp|sterling|استرليني',
      };
      const explicit = (labels: string, money: { amount: number; currency: string }) => {
        const match = numeric.match(
          new RegExp(
            `(?:${labels})[^0-9]{0,25}([0-9]+(?:\\.[0-9]+)?)\\s*(?:${currencies[money.currency]})(?![a-z])`,
            'i',
          ),
        );
        return match && Number(match[1]) === money.amount;
      };
      const vacancy = numeric.match(/(?:vacancy|شغور)[^0-9]{0,20}([0-9]+(?:\.[0-9]+)?)\s*%/);
      const expected =
        input && fresh.price
          ? (((input.annualRent.amount / FX[input.annualRent.currency as keyof typeof FX]) *
              (1 - input.vacancyPercent / 100) -
              input.annualCosts.amount / FX[input.annualCosts.currency as keyof typeof FX]) /
              (fresh.price.native.amount / FX[fresh.price.native.currency])) *
            100
          : NaN;
      const assumptionSource = card.sources.find(
        (row) => fact.sourceIds.includes(row.id) && row.kind === 'user',
      );
      if (
        !input ||
        input.unitId !== entity.id ||
        !explicit('annual rent|rent|ايجار', input.annualRent) ||
        !explicit('annual costs|costs|تكاليف', input.annualCosts) ||
        !vacancy ||
        Number(vacancy[1]) !== input.vacancyPercent ||
        typeof fact.value !== 'number' ||
        !Number.isFinite(expected) ||
        Math.abs(fact.value - expected) > 1e-9 ||
        fact.provenance !== 'USER_ASSUMPTION' ||
        fact.unit !== '%' ||
        !fact.qualifier ||
        assumptionSource?.basis !== 'USER_ASSUMPTION' ||
        assumptionSource.url !== null
      )
        fail(
          out,
          label,
          'hallucinatedValues',
          `Scenario is not exact arithmetic from explicit user assumptions: ${fact.id}`,
        );
      if (assumptionSource) scenarioSources.add(assumptionSource.id);
      continue;
    }
    if (!source && fact.key in areaValues) {
      if (
        areaValues[fact.key] === undefined ||
        fact.value !== areaValues[fact.key] ||
        fact.id !== `${entity.id}:${fact.key}` ||
        fact.provenance !== 'DEMO' ||
        fact.asOf.value !== null ||
        !equal(fact.sourceIds, [areaSourceId]) ||
        !fact.qualifier
      )
        fail(
          out,
          label,
          'hallucinatedValues',
          `Community estimate differs from actual seeded insight: ${fact.id}`,
        );
      continue;
    }
    if (!source) {
      fail(out, label, 'hallucinatedIds', `Unknown fact ${fact.id}`);
      continue;
    }
    if (!equal(fact, source))
      fail(out, label, 'hallucinatedValues', `Fact differs from fresh DAL: ${fact.id}`);
  }
  const areaSource = card.sources.find((source) => source.id === areaSourceId);
  if (
    areaSource &&
    (areaSource.kind !== 'demo' ||
      areaSource.basis !== 'DEMO_ESTIMATE' ||
      areaSource.url !== null ||
      areaSource.asOf.value !== null ||
      areaSource.retrieved.value !== null)
  )
    fail(
      out,
      label,
      'invalidSourceReferences',
      'Community estimate source is not honestly marked Demo/unknown date',
    );
  if (
    !equal(
      card.sources.filter(
        (source) => source.id !== areaSourceId && !scenarioSources.has(source.id),
      ),
      fresh.sources,
    )
  )
    fail(out, label, 'invalidSourceReferences', `Source bundle drift: ${entity.id}`);
  // Independent raw-record comparisons, in addition to the normal grounding function.
  if (card.kind === 'reference-project') {
    const raw = await getReferenceProject(card.projectId);
    if (!raw) {
      fail(out, label, 'hallucinatedIds', card.projectId);
      return;
    }
    for (const fact of card.facts) {
      if (fact.key === 'price') {
        if (fact.value !== Number(raw.priceFromAmount) || fact.currency !== raw.priceFromCurrency)
          fail(out, label, 'currencyErrors', `Reference native price changed: ${fact.id}`);
      } else {
        const original = raw.facts.find((item) => item.id === fact.id);
        const expected =
          original && typeof original.value === 'object' && original.value !== null
            ? JSON.stringify(original.value)
            : original?.value;
        if (!original || !equal(expected, fact.value))
          fail(out, label, 'hallucinatedValues', `Raw reference mismatch: ${fact.id}`);
        if (
          original &&
          !equal(
            fact.sourceIds,
            original.sources.map((source) => source.id),
          )
        )
          fail(out, label, 'invalidSourceReferences', `Raw source links mismatch: ${fact.id}`);
      }
    }
    if (card.availability !== 'ON_REQUEST')
      fail(out, label, 'hallucinatedValues', 'Reference represented as live availability');
  } else if (card.kind === 'demo-unit') {
    const unit = await getProperty(card.unitId, viewer);
    if (!unit) {
      fail(out, label, 'privateLeaks', card.unitId);
      return;
    }
    const expected: Record<string, unknown> = {
      price: Number(unit.priceMinor) / 100,
      area: unit.areaSqm,
      bedrooms: unit.bedrooms,
      type: unit.type,
      amenities: unit.amenities.join(', '),
      view: unit.view,
      country: unit.community.city.countryId === 'AE' ? 'UAE' : 'Egypt',
      community: unit.community.nameEn,
      completion: unit.status === 'ready' ? 'ready' : unit.handoverDate,
      'area-average-aed-sqm': unit.community.insight?.averageAedSqm,
      'area-yield-low': unit.community.insight?.yieldLow,
      'area-yield-high': unit.community.insight?.yieldHigh,
      payment_plan: unit.paymentPlan
        ? `${unit.paymentPlan.bookingPercent}% booking / ${unit.paymentPlan.constructionPercent}% during construction / ${unit.paymentPlan.handoverPercent}% on handover`
        : undefined,
    };
    for (const fact of card.facts)
      if (fact.key !== 'scenario-yield' && !equal(expected[fact.key], fact.value))
        fail(out, label, 'hallucinatedValues', `Raw unit mismatch: ${fact.id}`);
    if (card.price?.native.currency !== unit.currency || card.availability !== 'DEMO_ONLY')
      fail(out, label, 'currencyErrors', `Unit currency/availability mismatch: ${unit.id}`);
  }
  if (card.price) {
    if (
      !equal(card.price.native, fresh.price?.native) ||
      card.price.paymentCurrency !== brief.paymentCurrency
    )
      fail(out, label, 'currencyErrors', `Native/payment mismatch ${entity.id}`);
    for (const converted of card.price.converted) {
      const rate = FX[converted.money.currency] / FX[card.price.native.currency];
      const amount = Math.round(card.price.native.amount * rate * 100) / 100;
      if (
        converted.method !== 'STATIC_DEMO_FX' ||
        converted.asOf.value !== FX_DATE ||
        Math.abs(converted.rate - rate) > 1e-10 ||
        Math.abs(converted.money.amount - amount) > 0.011
      )
        fail(
          out,
          label,
          'currencyErrors',
          `Conversion provenance/arithmetic mismatch ${entity.id}`,
        );
    }
  }
}
async function verifyResult(
  result: ConciergeTurnResult,
  events: ConciergeStreamEvent[],
  viewer: User | null,
  out: Report,
  label: string,
) {
  if (result.status !== 'complete')
    fail(out, label, 'executionErrors', `Engine status ${result.status}`);
  if (
    /guaranteed (?:return|yield)|perfect investment|buy now|عائد مضمون|استثمار مضمون|فرصه لا تعوض|فرصة لا تعوض|[!！]|\p{Extended_Pictographic}/u.test(
      result.text,
    )
  )
    fail(out, label, 'toneViolations', result.text);
  const allowedNumbers = new Set<string>();
  const collectNumbers = (value: unknown, key = '') => {
    if (['rawRequest', 'rawText', 'provenance', 'id', 'text', 'items'].includes(key)) return;
    if (typeof value === 'number') allowedNumbers.add(String(value));
    else if (typeof value === 'string' && ['date', 'relativeTo'].includes(key))
      for (const token of value.match(/\d+/g) ?? []) allowedNumbers.add(token);
    else if (Array.isArray(value)) value.forEach((item) => collectNumbers(item));
    else if (value && typeof value === 'object')
      Object.entries(value).forEach(([field, item]) => collectNumbers(item, field));
  };
  collectNumbers(result.brief);
  for (const token of normalizeConciergeText(result.text).match(/\d+(?:\.\d+)?/g) ?? [])
    if (!allowedNumbers.has(token))
      fail(
        out,
        label,
        'hallucinatedValues',
        `Application prose number lacks a typed Brief basis: ${token}`,
      );
  if (
    events.some((event, index) => event.sequence !== index) ||
    events.filter((event) => event.type === 'turn.completed').length !== 1
  )
    fail(out, label, 'streamErrors', 'Non-monotonic sequence or missing/duplicate completion');
  const data = await getAtlasData(viewer);
  const validRef = async (entity: ConciergeEntityRef) =>
    entity.kind === 'place'
      ? ATLAS_PLACES.some((p) => p.id === entity.id)
      : entity.kind === 'developer'
        ? data.developers.some((d) => d.id === entity.id)
        : Boolean(await resolveCard(entity, viewer, result.brief));
  const center = async (entity: ConciergeEntityRef) =>
    entity.kind === 'place'
      ? ATLAS_PLACES.find((p) => p.id === entity.id)?.center
      : (await resolveCard(entity, viewer, result.brief))?.center;
  for (const component of result.components) {
    if (!conciergeComponentSchema.safeParse(component).success) {
      fail(out, label, 'hallucinatedValues', 'Component failed wire schema');
      continue;
    }
    if ('cards' in component)
      for (const card of component.cards) await verifyCard(card, viewer, result.brief, out, label);
    if (component.kind === 'price-area-chart')
      for (const point of component.points) {
        const card = component.cards.find((c) => cardEntity(c).id === point.entity.id);
        if (
          !card?.facts.some(
            (f) => f.id === point.priceFactId && f.key === 'price' && typeof f.value === 'number',
          ) ||
          !card?.facts.some(
            (f) =>
              f.id === point.areaFactId &&
              f.key === 'area' &&
              typeof f.value === 'number' &&
              f.value > 0,
          )
        )
          fail(
            out,
            label,
            'invalidSourceReferences',
            'Chart point lacks actual numeric unit facts',
          );
      }
    if (component.kind === 'mini-map') {
      for (const entity of component.entities)
        if (!(await validRef(entity)))
          fail(out, label, 'privateLeaks', `Mini-map unauthorized anchor ${entity.id}`);
      const dubaiOrientation =
        equal(
          component.entities,
          ['palm', 'dubai-hills', 'downtown'].map((id) => ({ kind: 'place', id })),
        ) &&
        equal(component.camera.center, ATLAS_PLACES.find((place) => place.id === 'dubai')?.center);
      if (!dubaiOrientation && !equal(component.camera.center, await center(component.entities[0])))
        fail(out, label, 'mapErrors', 'Mini-map center differs from canonical first anchor');
    }
    if ('facts' in component) {
      const sourceIds = new Set(component.sources.map((source) => source.id));
      for (const fact of component.facts)
        if (fact.sourceIds.some((id) => !sourceIds.has(id)))
          fail(out, label, 'invalidSourceReferences', `Component fact source missing ${fact.id}`);
    }
    if (component.kind === 'itinerary') {
      if (
        component.mode !== 'DEMO_ILLUSTRATION' ||
        component.sources.some((source) => source.kind !== 'demo')
      )
        fail(out, label, 'hallucinatedValues', 'Itinerary not labelled illustrative');
      for (const step of component.steps) {
        const place = ATLAS_PLACES.find((p) => p.id === step.placeId);
        if (!place) fail(out, label, 'hallucinatedIds', step.placeId);
        if (!equal(step.title, { en: place?.nameEn, ar: place?.nameAr }))
          fail(out, label, 'hallucinatedValues', 'Invented itinerary place');
        if (step.factIds.some((id) => !component.facts.some((fact) => fact.id === id)))
          fail(out, label, 'invalidSourceReferences', 'Itinerary step lacks fact');
      }
    }
    if (component.kind === 'payment-timeline') {
      const fresh = await resolveCard(component.entity, viewer, result.brief);
      if (!fresh) fail(out, label, 'privateLeaks', component.entity.id);
      else
        for (const fact of component.facts)
          if (!fresh.facts.some((f) => equal(f, fact)))
            fail(out, label, 'hallucinatedValues', `Timeline fact drift ${fact.id}`);
      if (
        fresh &&
        (!equal(component.sources, fresh.sources) || !equal(component.price, fresh.price))
      )
        fail(
          out,
          label,
          'invalidSourceReferences',
          'Timeline source/price bundle differs from current authorized record',
        );
      const scheduleFact = fresh?.facts.find((fact) => fact.key === 'payment_plan');
      const sourcePercentages =
        typeof scheduleFact?.value === 'string'
          ? scheduleFact.value
              .split('/')
              .map((part) => Number(part.match(/(\d+(?:\.\d+)?)\s*%/)?.[1]))
          : [];
      if (
        !equal(
          component.schedule.map((row) => row.percent),
          sourcePercentages,
        )
      )
        fail(
          out,
          label,
          'hallucinatedValues',
          'Timeline percentages differ from the exact payment-plan source',
        );
      if (component.entity.kind === 'unit') {
        const unit = await getProperty(component.entity.id, viewer);
        const plan = unit?.paymentPlan;
        if (
          !plan ||
          component.mode !== 'DEMO_ESTIMATE' ||
          !equal(
            component.schedule.map((row) => row.percent),
            [plan.bookingPercent, plan.constructionPercent, plan.handoverPercent],
          ) ||
          component.price.native.amount !== Number(unit?.priceMinor) / 100 ||
          component.price.native.currency !== unit?.currency
        )
          fail(
            out,
            label,
            'hallucinatedValues',
            'Unit timeline differs from exact authorized unit paymentPlan/native price',
          );
      }
      if (
        Math.abs(component.schedule.reduce((n, row) => n + row.percent, 0) - 100) > 0.001 ||
        component.schedule.some((row) =>
          row.factIds.some(
            (id) => !component.facts.some((fact) => fact.id === id && fact.key === 'payment_plan'),
          ),
        )
      )
        fail(
          out,
          label,
          'invalidSourceReferences',
          'Timeline schedule lacks complete payment evidence',
        );
    }
    if (
      component.kind === 'developer-card' &&
      (!data.developers.some((d) => d.id === component.developerId) ||
        component.projectIds.some(
          (id) =>
            !data.projects.some((p) => p.id === id && p.developerId === component.developerId),
        ))
    )
      fail(out, label, 'hallucinatedIds', 'Unknown developer/project relationship');
    if (component.kind === 'developer-card') {
      const developer = (await listReferenceDevelopers()).find(
        (row) => row.id === component.developerId,
      );
      for (const fact of component.facts) {
        const original = developer?.facts.find((row) => row.id === fact.id);
        if (
          !original ||
          fact.value !== original.value ||
          !equal(
            fact.sourceIds,
            original.sources.map((row) => row.id),
          )
        )
          fail(
            out,
            label,
            'hallucinatedValues',
            `Developer fact differs from raw sourced record: ${fact.id}`,
          );
      }
      for (const source of component.sources) {
        const raw = developer?.facts
          .flatMap((fact) => fact.sources)
          .find((row) => row.id === source.id);
        if (
          !raw ||
          source.url !== raw.url ||
          source.basis !== raw.basis ||
          source.publisher !== raw.publisher
        )
          fail(out, label, 'invalidSourceReferences', `Developer source drift: ${source.id}`);
      }
    }
  }
  for (const action of result.actions) {
    out.actions++;
    if (
      !conciergeActionSchema.safeParse(action).success ||
      action.briefRevision !== result.brief.revision
    )
      fail(out, label, 'mapErrors', 'Action schema/revision invalid');
    if (action.type === 'map.flyTo') {
      if (!(await validRef(action.anchor)))
        fail(out, label, 'privateLeaks', `Camera unauthorized anchor ${action.anchor.id}`);
      if (!equal(action.camera.center, await center(action.anchor)))
        fail(out, label, 'mapErrors', 'Camera moved to a noncanonical coordinate');
    } else if (action.type === 'map.highlight') {
      for (const entity of action.entities)
        if (!(await validRef(entity)))
          fail(out, label, 'privateLeaks', `Highlight unauthorized ${entity.id}`);
    } else if (action.type === 'map.drawIsochrone') {
      if (
        !(await validRef(action.origin)) ||
        !equal(action.center, await center(action.origin)) ||
        action.method !== 'ILLUSTRATIVE_STRAIGHT_LINE'
      )
        fail(out, label, 'mapErrors', 'Isochrone origin/method invalid');
    } else if (
      action.type === 'map.story' &&
      !ATLAS_STORIES.some((story) => story.id === action.storyId)
    )
      fail(out, label, 'mapErrors', 'Unknown story');
    else if (
      'componentId' in action &&
      !result.components.some((component) => component.id === action.componentId)
    )
      fail(out, label, 'mapErrors', 'Action references absent component');
  }
  for (const proposal of result.proposals) {
    if (
      (result.brief.privacy.doNotSave && proposal.kind === 'save_to_portfolio') ||
      (result.brief.privacy.doNotShare && proposal.kind !== 'save_to_portfolio') ||
      (result.brief.privacy.doNotBook && proposal.kind === 'request_viewing')
    )
      fail(out, label, 'refusalFailures', 'Proposal violates privacy restriction');
    for (const entity of proposal.entities)
      if (!(await validRef(entity)))
        fail(out, label, 'privateLeaks', 'Proposal contains unauthorized entity');
  }
}

type Actor = { label: string; user: User | null };
async function runCorpus(actors: Actor[], provider: ConciergeProvider, out: Report) {
  const started = Date.now();
  for (const actor of actors) {
    for (const test of readParserCases()) {
      out.cases++;
      let brief = emptyConciergeBrief(),
        priorEntities: ConciergeEntityRef[] = [],
        last: ConciergeTurnResult | undefined,
        plan: ConciergeProviderPlan | undefined;
      let lastCalls: string[] = [];
      const seen: ConciergeComponent[] = [];
      for (const [index, message] of test.turns.entries()) {
        out.turns++;
        const label = `${actor.label}/${test.id}/turn-${index + 1}`;
        const events: ConciergeStreamEvent[] = [];
        const recording: ConciergeProvider = {
          plan: async (input) => {
            plan = await provider.plan(input);
            return plan;
          },
        };
        try {
          last = await runConciergeTurn(
            {
              message,
              brief,
              viewer: actor.user,
              locale: test.responseLanguage,
              conversationId: randomUUID(),
              turnId: randomUUID(),
              requestId: randomUUID(),
              provider: recording,
              priorEntities,
            },
            (event) => {
              events.push(event);
            },
          );
          await verifyResult(last, events, actor.user, out, label);
          brief = last.brief;
          seen.push(...last.components);
          const refs = cardRefs(last.components);
          // Persist only independently re-authorized selections between turns.
          if (refs.length) priorEntities = [];
          for (const entity of refs)
            if (await resolveCard(entity, actor.user, brief)) priorEntities.push(entity);
          lastCalls = events.flatMap((event) =>
            event.type === 'tool.started' ? [event.toolName] : [],
          );
        } catch (error) {
          fail(out, label, 'executionErrors', String(error));
        }
      }
      if (last) {
        checkSemantics(test, last, plan, lastCalls, out, `${actor.label}/${test.id}`);
        await verifyReturnedGeography(test, last, actor.user, out, `${actor.label}/${test.id}`);
      }
      if (
        brief.household.schoolRequirement !== 'unspecified' &&
        !seen.some(
          (component) =>
            component.kind === 'notice' &&
            component.code === 'DEMO_LIMITATION' &&
            /school|curriculum/i.test(component.text.en),
        )
      )
        fail(
          out,
          `${actor.label}/${test.id}`,
          'schoolDisclosureFailures',
          'School requirement has no explicit unavailable-curriculum/demo disclosure',
        );
      if (test.id === 'P10' || test.id === 'C65')
        if (!last?.text.includes('qualified advice') || last.proposals.length)
          fail(
            out,
            `${actor.label}/${test.id}`,
            'refusalFailures',
            'Advice request did not refuse unsupported personal advice without auto handoff',
          );
    }
    process.stderr.write(
      `Execution corpus completed for ${actor.label}: ${out.cases} cases, ${out.turns} turns.\n`,
    );
  }
  out.durationMs = Date.now() - started;
}

async function fixtures() {
  const prefix = `cq-eval-${randomUUID()}`;
  const users: User[] = [];
  const unitIds: string[] = [];
  const cleanup = async () => {
    await db.auditLog.deleteMany({ where: { actorId: { in: users.map((u) => u.id) } } });
    await db.property.deleteMany({ where: { id: { in: unitIds } } });
    await db.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
  };
  try {
    for (const role of ['CLIENT', 'VERIFIED_CLIENT', 'DEVELOPER_PARTNER'] as const)
      users.push(
        await db.user.create({
          data: {
            id: `${prefix}-${role}`,
            email: `${prefix}-${role}@darivo.example`,
            role,
            verification: role === 'CLIENT' ? 'UNVERIFIED' : 'VERIFIED',
          },
        }),
      );
    const template = await db.property.findFirstOrThrow({
      where: { developer: { kind: 'DEMO' }, project: { kind: 'DEMO' }, visibility: 'PUBLIC' },
    });
    for (const visibility of ['PUBLIC', 'VERIFIED_ONLY', 'PRIVATE_INVITE'] as const) {
      const id = `${prefix}-${visibility}`;
      unitIds.push(id);
      await db.property.create({
        data: {
          ...template,
          id,
          slug: id,
          visibility,
          permitNumber: `DEMO-${visibility}`,
          translations: {
            create: [
              {
                locale: 'en',
                title: `Execution fixture ${visibility}`,
                description: 'Fictional execution safety fixture.',
              },
              {
                locale: 'ar',
                title: 'وحدة تجريبية للاختبار',
                description: 'بيانات خيالية لاختبار صلاحيات العرض.',
              },
            ],
          },
        },
      });
    }
    await db.paymentPlan.createMany({
      data: unitIds.map((propertyId) => ({
        propertyId,
        bookingPercent: 20,
        constructionPercent: 60,
        handoverPercent: 20,
      })),
    });
    return {
      users,
      unitIds,
      cleanup,
      actors: [
        { label: 'guest', user: null },
        ...users.map((user) => ({ label: user.role.toLowerCase(), user })),
      ] satisfies Actor[],
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
}
async function accessProbes(fixture: Awaited<ReturnType<typeof fixtures>>, out: Report) {
  const [publicId, verifiedId, privateId] = fixture.unitIds;
  const provider = new MockConciergeProvider({ now: '2026-10-22' });
  const probe = async (label: string, viewer: User | null, id: string, allowed: boolean) => {
    out.cases++;
    out.turns++;
    const events: ConciergeStreamEvent[] = [];
    const result = await runConciergeTurn(
      {
        message: 'Show a mini map, payment plan and compare these selections',
        brief: emptyConciergeBrief(),
        viewer,
        locale: 'en',
        conversationId: randomUUID(),
        turnId: randomUUID(),
        requestId: randomUUID(),
        provider,
        priorEntities: [...new Set([publicId, id])].map((unitId) => ({
          kind: 'unit' as const,
          id: unitId,
        })),
      },
      (event) => {
        events.push(event);
      },
    );
    await verifyResult(result, events, viewer, out, label);
    const present = result.components.some(
      (component) =>
        ('cards' in component &&
          component.cards.some((card) => card.kind === 'demo-unit' && card.unitId === id)) ||
        (component.kind === 'payment-timeline' &&
          component.entity.kind === 'unit' &&
          component.entity.id === id),
    );
    if (present !== allowed)
      fail(
        out,
        label,
        allowed ? 'semanticFailures' : 'privateLeaks',
        `Expected access=${allowed}, emitted=${present}`,
      );
    if (!allowed && JSON.stringify(result).includes(id))
      fail(out, label, 'privateLeaks', 'Denied unit identity escaped in result');
    return result;
  };
  for (const actor of fixture.actors)
    for (const [id, allowed] of [
      [publicId, true],
      [verifiedId, actor.user?.role === 'VERIFIED_CLIENT'],
      [privateId, false],
    ] as const)
      await probe(`${actor.label}/access/${id.split('-').at(-1)}`, actor.user, id, allowed);
  const [client, verified, partner] = fixture.users;
  await db.offMarketGrant.createMany({
    data: [
      { userId: client.id, propertyId: privateId, grantedBy: 'execution-eval' },
      { userId: partner.id, propertyId: privateId, grantedBy: 'execution-eval' },
    ],
  });
  const granted = await probe('client/grant-active', client, privateId, true);
  await probe('partner/grant-does-not-confer-client-access', partner, privateId, false);
  await db.offMarketGrant.deleteMany({ where: { userId: client.id, propertyId: privateId } });
  await probe('client/grant-revoked', client, privateId, false);
  if (
    JSON.stringify(
      await rehydrateConciergeComponents(granted.components, client, granted.brief),
    ).includes(privateId)
  )
    fail(
      out,
      'client/grant-revoked-replay',
      'privateLeaks',
      'Revoked private mini-map retained in replay',
    );
  await db.user.update({
    where: { id: verified.id },
    data: { role: 'CLIENT', verification: 'UNVERIFIED' },
  });
  await probe('verified/downgraded-stale-viewer', verified, verifiedId, false);
  // Engine/provider execution can only propose; no unconfirmed durable workflow write.
  const userIds = fixture.users.map((user) => user.id);
  const writes =
    (await db.shortlist.count({ where: { userId: { in: userIds } } })) +
    (await db.viewingRequest.count({ where: { userId: { in: userIds } } })) +
    (await db.handoff.count({ where: { userId: { in: userIds } } }));
  if (writes)
    fail(out, 'all-fixtures', 'unconfirmedWrites', `${writes} unconfirmed durable writes`);
}
async function unitJourneys(actors: Actor[], out: Report) {
  const provider = new MockConciergeProvider({ now: '2026-10-22' });
  for (const actor of actors)
    for (const locale of ['en', 'ar'] as const) {
      out.cases++;
      let brief = emptyConciergeBrief();
      let priorEntities: ConciergeEntityRef[] = [];
      const messages =
        locale === 'en'
          ? [
              'Show demo units in Dubai',
              'Compare these',
              'Show the payment plan for the first one',
              'Save the first one',
              'Calculate for the first one: annual rent 100000 AED, annual costs 10000 AED, vacancy 5%',
            ]
          : [
              'اعرض وحدات تجريبية في دبي',
              'قارن هذه الوحدات',
              'اعرض خطة السداد للاول',
              'احفظ الاول',
              'احسب للاول: ايجار سنوي ١٠٠٠٠٠ درهم، تكاليف سنوية ١٠٠٠٠ درهم، شغور ٥%',
            ];
      for (const [index, message] of messages.entries()) {
        out.turns++;
        const label = `${actor.label}/unit-journey-${locale}/step-${index + 1}`;
        const events: ConciergeStreamEvent[] = [];
        const selectedBefore = priorEntities[0];
        const result = await runConciergeTurn(
          {
            message,
            brief,
            priorEntities,
            viewer: actor.user,
            locale,
            conversationId: randomUUID(),
            turnId: randomUUID(),
            requestId: randomUUID(),
            provider,
          },
          (event) => {
            events.push(event);
          },
        );
        await verifyResult(result, events, actor.user, out, label);
        const refs = cardRefs(result.components);
        if (index === 0 && (refs.length < 2 || refs.some((entity) => entity.kind !== 'unit')))
          fail(
            out,
            label,
            'semanticFailures',
            'Explicit demo-unit search did not return an authorized unit cohort',
          );
        if (
          index === 1 &&
          !result.components.some(
            (component) =>
              component.kind === 'comparison' &&
              component.cards.every((card) => card.kind === 'demo-unit'),
          )
        )
          fail(out, label, 'semanticFailures', 'Natural unit comparison missing');
        if (index === 2) {
          const unit =
            selectedBefore?.kind === 'unit'
              ? await getProperty(selectedBefore.id, actor.user)
              : null;
          const timeline = result.components.find(
            (component) => component.kind === 'payment-timeline',
          );
          if (
            unit?.paymentPlan &&
            (!timeline ||
              timeline.kind !== 'payment-timeline' ||
              timeline.entity.kind !== 'unit' ||
              timeline.entity.id !== selectedBefore?.id)
          )
            fail(
              out,
              label,
              'semanticFailures',
              'Natural first-unit timeline missing or selected the project aggregate',
            );
          if (
            !unit?.paymentPlan &&
            (timeline ||
              !result.components.some(
                (component) => component.kind === 'notice' && component.code === 'UNKNOWN_FACT',
              ))
          )
            fail(
              out,
              label,
              'semanticFailures',
              'Unavailable exact-unit schedule was invented or not disclosed',
            );
        }
        if (
          index === 3 &&
          !result.proposals.some(
            (proposal) =>
              proposal.kind === 'save_to_portfolio' &&
              proposal.entities.length === 1 &&
              proposal.entities[0].kind === 'unit' &&
              proposal.entities[0].id === selectedBefore?.id,
          )
        )
          fail(
            out,
            label,
            'semanticFailures',
            'Save-first proposal changed scope or unit identity',
          );
        if (
          index === 4 &&
          !result.components.some(
            (component) =>
              'cards' in component &&
              component.cards.some(
                (card) =>
                  card.kind === 'demo-unit' &&
                  card.unitId === selectedBefore?.id &&
                  card.facts.some((fact) => fact.key === 'scenario-yield'),
              ),
          )
        )
          fail(
            out,
            label,
            'semanticFailures',
            'Explicit educational arithmetic did not use the exact selected unit',
          );
        brief = result.brief;
        if (refs.length) priorEntities = refs;
      }
    }
}

export async function runExecutionEvals() {
  const started = Date.now();
  const fixture = await fixtures();
  const mock = report('mock');
  let real: Report | { status: 'skipped'; reason: string } = {
    status: 'skipped',
    reason: process.env.OPENAI_API_KEY
      ? 'Pass --real to run the separately reported external provider.'
      : 'No OPENAI_API_KEY; real provider not tested.',
  };
  try {
    await runCorpus(fixture.actors, new MockConciergeProvider({ now: '2026-10-22' }), mock);
    await unitJourneys(fixture.actors, mock);
    await accessProbes(fixture, mock);
    if (process.argv.includes('--real') && process.env.OPENAI_API_KEY) {
      real = report('real');
      await runCorpus(fixture.actors, new SDKConciergeProvider(), real);
    }
    const failed =
      Object.values(mock.counters).some(Boolean) ||
      ('counters' in real && Object.values(real.counters).some(Boolean));
    console.log(
      JSON.stringify(
        {
          version: 1,
          mock,
          real,
          totalDurationMs: Date.now() - started,
          limits: [
            'Fresh DAL checks certify only this seeded local database state, not current external market truth.',
            'Mock semantic/execution evidence does not certify native Arabic quality, browser UI, real-provider behavior or external writes.',
            'No viewing, handoff or portfolio confirmation is executed.',
          ],
        },
        null,
        2,
      ),
    );
    return !failed;
  } finally {
    await fixture.cleanup();
    await db.$disconnect();
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  runExecutionEvals()
    .then((ok) => {
      process.exitCode = ok ? 0 : 1;
    })
    .catch(async (error) => {
      console.error(String(error));
      await db.$disconnect();
      process.exitCode = 1;
    });
