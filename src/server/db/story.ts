import type { User } from '@prisma/client';
import { db } from './client';
import {
  getProperty,
  propertyInclude,
  serializeProperty,
  visibilityWhere,
  currentViewer,
  type Viewer,
  type PropertyDTO,
} from './properties';
import { getAtlasData } from './atlas';
import {
  emptyConciergeBrief,
  conciergeCurrencySchema,
  type GroundedCard,
} from '@/src/lib/concierge';
import {
  canonicalStoryPath,
  storyDTOSchema,
  storySummarySchema,
  storySlugSchema,
  type StoryDTO,
  type StorySummary,
  type StoryMetric,
  type StoryCapability,
} from '@/src/lib/story';
import {
  officePreferencesSchema,
  type OfficePreferences,
  type OfficeEntityRef,
} from '@/src/lib/office';
import { groundProject, groundUnit, createFact } from '../concierge/grounding';
import { executeConciergeTool } from '../concierge/tools';
import { getClientPrivacy, officePrivacyBlocks } from '../office/privacy';
import { isClientRole } from '../auth/roles';
const text = (en: string, ar: string) => ({ en, ar });
const unknownDate = { value: null, precision: 'UNKNOWN' as const };

export async function readOfficePreferences(
  viewer: Viewer,
  supplied: Partial<OfficePreferences> = {},
): Promise<OfficePreferences> {
  const profile = viewer
    ? await db.clientProfile.findUnique({ where: { userId: viewer.id } })
    : null;
  return officePreferencesSchema.parse({
    currency: profile?.currency ?? 'AED',
    areaUnit: profile?.areaUnit ?? 'sqm',
    locale: profile?.language ?? 'en',
    arabicIndicDigits: profile?.arabicIndicDigits ?? false,
    ...supplied,
  });
}
function summary(
  card: GroundedCard,
  data: {
    slug: string;
    country: string;
    city: { en: string; ar: string };
    community: { en: string; ar: string };
    unit?: PropertyDTO;
  },
): StorySummary {
  const unit = data.unit;
  return storySummarySchema.parse({
    kind:
      card.kind === 'reference-project'
        ? 'REAL_REFERENCE_PROJECT'
        : card.kind === 'demo-project'
          ? 'DEMO_PROJECT'
          : 'DEMO_UNIT',
    entity: {
      kind: unit ? 'unit' : 'project',
      id: unit?.id ?? ('projectId' in card ? card.projectId : ''),
    },
    name: card.name,
    ...canonicalStoryPath(unit ? 'unit' : 'project', data.slug),
    country: data.country,
    city: data.city,
    community: data.community,
    center: card.center,
    coordinatesApproximate: card.coordinatesApproximate,
    price: card.price,
    availability: card.kind === 'reference-project' ? 'ON_REQUEST' : 'DEMO',
    facts: card.facts,
    sources: card.sources,
    media: unit
      ? unit.media
          .filter((m) => /^\/art\/property-[0-5]\.svg$/.test(m.url))
          .map((m) => ({
            url: m.url,
            alt: text(m.altEn, m.altAr),
            caption: text(
              'Illustrative fictional residence; not a photograph.',
              'رسم توضيحي لمسكن خيالي؛ ليس صورة فوتوغرافية.',
            ),
            provenance: 'DEMO',
            sourceIds: card.sources.map((s) => s.id),
          }))
      : [],
  });
}
function metrics(card: GroundedCard, unit?: PropertyDTO): StoryMetric[] {
  const price = card.facts.find((f) => f.key === 'price');
  const area = card.facts.find((f) => f.key === 'area');
  const sourceIds = card.sources.map((s) => s.id);
  const unavailable = (
    id: string,
    label: { en: string; ar: string },
    reason: 'UNKNOWN_FACT' | 'NOT_APPLICABLE' | 'INCOMPATIBLE_BASIS' = 'UNKNOWN_FACT',
  ): StoryMetric => ({
    id,
    label,
    status: 'UNAVAILABLE',
    reason,
    factIds: [],
    sourceIds: [],
    asOf: unknownDate,
    explanation: text(
      'The supplied record does not establish compatible evidence for this figure.',
      'لا يثبت السجل المقدم أدلة متوافقة لحساب هذا الرقم.',
    ),
  });
  const result: StoryMetric[] = [];
  for (const [id, denominator, label, metricUnit] of [
    ['price-per-sqm', unit?.areaSqm, text('Price per square metre', 'السعر للمتر المربع'), 'sqm'],
    [
      'price-per-sqft',
      unit ? unit.areaSqm * 10.76391041671 : undefined,
      text('Price per square foot', 'السعر للقدم المربع'),
      'sqft',
    ],
  ] as const) {
    result.push(
      unit && denominator && price && area
        ? {
            id,
            label,
            status: 'AVAILABLE',
            value: Number(unit.priceMinor) / 100 / denominator,
            unit: metricUnit,
            currency: card.price!.native.currency,
            basis: 'DEMO',
            factIds: [price.id, area.id],
            sourceIds,
            asOf: unknownDate,
            explanation: text(
              'Exact fictional unit price divided by its own recorded area; Demo arithmetic.',
              'سعر الوحدة الخيالية المحددة مقسوماً على مساحتها المسجلة؛ حساب تجريبي.',
            ),
          }
        : unavailable(id, label, 'INCOMPATIBLE_BASIS'),
    );
  }
  if (unit?.community.insight) {
    const insight = unit.community.insight;
    for (const [key, value, label, metricUnit, currency] of [
      [
        'community-average',
        insight.averageAedSqm,
        text('Demo community average', 'متوسط المنطقة التجريبي'),
        'sqm',
        'AED',
      ],
      [
        'yield-low',
        insight.yieldLow,
        text('Demo yield range — lower bound', 'نطاق العائد التجريبي — الحد الأدنى'),
        '%',
        null,
      ],
      [
        'yield-high',
        insight.yieldHigh,
        text('Demo yield range — upper bound', 'نطاق العائد التجريبي — الحد الأعلى'),
        '%',
        null,
      ],
    ] as const) {
      const f = createFact({ kind: 'unit', id: unit.id }, key, value, sourceIds, 'DEMO');
      f.label = label;
      f.unit = metricUnit;
      f.currency = currency;
      card.facts.push(f);
      result.push({
        id: key,
        label,
        status: 'AVAILABLE',
        value,
        unit: metricUnit,
        currency,
        basis: 'DEMO',
        factIds: [f.id],
        sourceIds,
        asOf: unknownDate,
        explanation: text(
          'Seeded community illustration, not observed market evidence or a return forecast.',
          'مثال تجريبي للمنطقة، وليس بيانات سوق مرصودة أو توقعاً للعائد.',
        ),
      });
    }
  } else {
    result.push(
      unavailable('community-average', text('Community average', 'متوسط المنطقة')),
      unavailable('indicative-yield', text('Indicative yield', 'العائد الإرشادي')),
    );
  }
  if (unit?.community.city.countryId === 'AE' && price) {
    const threshold = Number(process.env.GOLDEN_VISA_AED ?? 2000000);
    result.push({
      id: 'golden-visa',
      label: text(
        'Configured UAE price-threshold comparison',
        'مقارنة الحد السعري الإماراتي المضبوط',
      ),
      status: 'AVAILABLE',
      value: unit.priceAed >= threshold ? 1 : 0,
      unit: 'boolean',
      currency: null,
      basis: 'INDICATIVE_CONFIG',
      factIds: [price.id],
      sourceIds,
      asOf: unknownDate,
      explanation: text(
        `Illustrative configured threshold AED ${threshold}; this is not an eligibility decision. Confirm with an advisor.`,
        `حد مضبوط توضيحي ${threshold} درهم؛ ليس قرار أهلية. أكّد التفاصيل مع مستشار.`,
      ),
    });
  } else
    result.push(
      unavailable(
        'golden-visa',
        text('Indicative UAE threshold', 'الحد الإرشادي في الإمارات'),
        'NOT_APPLICABLE',
      ),
    );
  return result;
}
async function capabilities(
  kind: StoryDTO['kind'],
  viewer: User | null,
): Promise<StoryCapability[]> {
  const privacy = viewer ? await getClientPrivacy(viewer.id) : null;
  return (
    [
      'ASK_CONCIERGE',
      'COMPARE',
      'ADD_TO_PORTFOLIO',
      'REQUEST_UNIT_VIEWING',
      'ENQUIRE_PROJECT',
      'SELECT_UNIT',
      'COPY_PRIVATE_LINK',
    ] as const
  ).map((action) => {
    const applicable =
      action === 'SELECT_UNIT'
        ? kind === 'DEMO_PROJECT'
        : action === 'REQUEST_UNIT_VIEWING'
          ? kind === 'DEMO_UNIT'
          : action === 'ENQUIRE_PROJECT'
            ? kind === 'REAL_REFERENCE_PROJECT'
            : ['ADD_TO_PORTFOLIO', 'COMPARE'].includes(action)
              ? kind !== 'DEMO_PROJECT'
              : true;
    if (!applicable)
      return {
        action,
        allowed: false,
        reason: kind === 'DEMO_PROJECT' ? 'SELECT_UNIT' : 'NOT_APPLICABLE',
      };
    if (['ASK_CONCIERGE', 'COMPARE', 'SELECT_UNIT', 'COPY_PRIVATE_LINK'].includes(action)) {
      if (action === 'COPY_PRIVATE_LINK' && privacy && officePrivacyBlocks(privacy, 'share'))
        return { action, allowed: false, reason: 'PRIVACY_RESTRICTED' };
      return { action, allowed: true, reason: 'ALLOWED' };
    }
    if (!viewer) return { action, allowed: false, reason: 'SIGN_IN' };
    if (!isClientRole(viewer.role)) return { action, allowed: false, reason: 'CLIENT_REQUIRED' };
    const operation =
      action === 'ADD_TO_PORTFOLIO'
        ? 'save'
        : action === 'REQUEST_UNIT_VIEWING'
          ? 'viewing'
          : 'enquiry';
    return privacy && officePrivacyBlocks(privacy, operation)
      ? { action, allowed: false, reason: 'PRIVACY_RESTRICTED' }
      : { action, allowed: true, reason: 'ALLOWED' };
  });
}
/** One identity resolver powers HTML, metadata, JSON and exports. Never caches an authorization result globally. */
export async function resolveStory(
  slug: string,
  viewer: Viewer,
  supplied: Partial<OfficePreferences> = {},
): Promise<StoryDTO | null> {
  if (!storySlugSchema.safeParse(slug).success) return null;
  const current = viewer ? await db.user.findUnique({ where: { id: viewer.id } }) : null;
  await readOfficePreferences(current, supplied);
  const brief = emptyConciergeBrief();
  brief.displayCurrencies = [...conciergeCurrencySchema.options];
  let card: GroundedCard | null = null;
  let unit: PropertyDTO | undefined;
  let record: Awaited<ReturnType<typeof db.project.findUnique>> = null;
  let base: StorySummary;
  if (slug.startsWith('unit-')) {
    unit = (await getProperty(slug.slice(5), current)) ?? undefined;
    if (!unit) return null;
    card = groundUnit(unit, brief);
    if (!card) return null;
    base = summary(card, {
      slug: unit.slug,
      country: unit.community.city.countryId === 'AE' ? 'UAE' : 'Egypt',
      city: text(unit.community.city.nameEn, unit.community.city.nameAr),
      community: text(unit.community.nameEn, unit.community.nameAr),
      unit,
    });
  } else {
    record = await db.project.findUnique({ where: { slug: slug.slice(8) } });
    if (!record) return null;
    const project = (await getAtlasData(current)).projects.find((p) => p.id === record!.id);
    if (!project) return null;
    card = await groundProject(project, brief);
    if (!card) return null;
    const location = (key: string, fallback: string) =>
      card!.facts.find((f) => f.key === key)?.displayValue ?? text(fallback, fallback);
    base = summary(card, {
      slug: record.slug,
      country: record.country,
      city: location('city', record.city),
      community: location('community', record.communityName),
    });
  }
  const developer = await db.developer.findUnique({
    where: { id: unit?.developerId ?? record!.developerId },
  });
  if (!developer) return null;
  const developerResult =
    developer.kind === 'REAL_REFERENCE'
      ? await executeConciergeTool(
          { name: 'get_developer', arguments: { developerId: developer.id } },
          {
            brief,
            viewer: current,
            turnId: 'story',
            requestId: 'story',
            callId: `story-developer-${developer.id}`,
            message: '',
          },
        )
      : null;
  const developerCard = developerResult?.components.find(
    (component) => component.kind === 'developer-card',
  );

  const derived = metrics(card, unit);
  base = { ...base, facts: card.facts };
  const timelineResult =
    base.kind === 'DEMO_PROJECT'
      ? null
      : await executeConciergeTool(
          {
            name: 'ui.showTimeline',
            arguments: unit ? { unitId: unit.id } : { projectId: record!.id },
          },
          {
            brief,
            viewer: current,
            turnId: 'story',
            requestId: 'story',
            callId: `story-${base.entity.id}`,
            message: '',
          },
        );
  const timeline = timelineResult?.components.find((c) => c.kind === 'payment-timeline');
  const residences: StorySummary[] = [];
  if (base.kind === 'DEMO_PROJECT') {
    const fresh = await currentViewer(current);
    const rows = await db.property.findMany({
      where: { AND: [{ projectId: record!.id }, visibilityWhere(fresh)] },
      include: propertyInclude,
      orderBy: { id: 'asc' },
      take: 12,
    });
    for (const row of rows) {
      const p = serializeProperty(row);
      const c = groundUnit(p, brief);
      if (c)
        residences.push(
          summary(c, {
            slug: p.slug,
            country: p.community.city.countryId === 'AE' ? 'UAE' : 'Egypt',
            city: text(p.community.city.nameEn, p.community.city.nameAr),
            community: text(p.community.nameEn, p.community.nameAr),
            unit: p,
          }),
        );
    }
    if (!residences.length) return null;
  }
  const narrative = card.facts
    .filter(
      (f) =>
        f.key === 'community' ||
        f.key === 'completion' ||
        f.key === 'type' ||
        f.key.startsWith('headline_facts.'),
    )
    .slice(0, 6)
    .map((f) => ({
      id: f.id,
      title: f.label,
      text:
        f.displayValue ??
        text(
          String(f.value ?? 'Unknown'),
          f.value == null ? 'غير معروف' : `نص المصدر الأصلي: ${String(f.value)}`,
        ),
      factIds: [f.id],
    }));
  return storyDTOSchema.parse({
    ...base,
    version: 1,
    narrative,
    developer: {
      id: developer.id,
      name: text(developer.nameEn, developer.nameAr),
      kind: developer.kind,
      facts: developerCard?.kind === 'developer-card' ? developerCard.facts : [],
      sources: developerCard?.kind === 'developer-card' ? developerCard.sources : [],
    },
    metrics: derived,
    timeline:
      timeline?.kind === 'payment-timeline'
        ? { status: 'AVAILABLE', component: timeline }
        : {
            status: 'UNAVAILABLE',
            subjectName: card.name,
            reason: text(
              'A complete payment schedule for this subject is not established by this record. Confirm current terms with an advisor.',
              'لا يثبت هذا السجل خطة سداد كاملة لهذا العقار. أكّد الشروط الحالية مع مستشار.',
            ),
          },
    capabilities: await capabilities(base.kind, current),
    ...(unit
      ? { unitId: unit.id, projectId: unit.projectId, residences: null }
      : { projectId: record!.id, residences: base.kind === 'DEMO_PROJECT' ? residences : null }),
  });
}
export async function resolveOfficeEntity(
  ref: OfficeEntityRef,
  viewer: Viewer,
  preferences: Partial<OfficePreferences> = {},
): Promise<StoryDTO | null> {
  if (ref.kind === 'demo-unit') {
    const unit = await getProperty(ref.id, viewer);
    return unit
      ? resolveStory(canonicalStoryPath('unit', unit.slug).storySlug, viewer, preferences)
      : null;
  }
  const project = await db.project.findFirst({
    where: { id: ref.id, kind: 'REAL_REFERENCE' },
    select: { slug: true },
  });
  return project
    ? resolveStory(canonicalStoryPath('project', project.slug).storySlug, viewer, preferences)
    : null;
}
export function storySummary(story: StoryDTO): StorySummary {
  const fields = Object.keys(storySummarySchema.shape);
  return storySummarySchema.parse(
    Object.fromEntries(fields.map((key) => [key, story[key as keyof StoryDTO]])),
  );
}
