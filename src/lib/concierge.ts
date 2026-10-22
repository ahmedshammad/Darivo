import { z } from 'zod';
import { ATLAS_TRAVEL_SPEED_KMH } from './atlas';
import type { AtlasCamera, AtlasLayer, AtlasPoint } from './atlas';

/** Client-safe wire contracts only: no database, session, provider or transport imports. */
export const CONCIERGE_VERSION = 1 as const;
export const CONCIERGE_LIMITS = {
  toolRounds: 3,
  callsPerPlan: 8,
  componentsPerTurn: 12,
  recommendations: 12,
  historyTurns: 100,
} as const;
const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/);
const shortText = z.string().trim().min(1).max(500);
export const conciergeLocaleSchema = z.enum(['en', 'ar']);
export const conciergeCurrencySchema = z.enum(['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP']);
export const localizedTextSchema = z.object({ en: shortText, ar: shortText }).strict();
export const moneySchema = z
  .object({ amount: z.number().finite().min(0).max(1e12), currency: conciergeCurrencySchema })
  .strict();
export const budgetSchema = z
  .object({
    min: z.number().finite().min(0).max(1e12).nullable(),
    max: z.number().finite().min(0).max(1e12).nullable(),
    currency: conciergeCurrencySchema,
    association: z.enum(['explicit', 'needs_clarification']),
    rawText: z.string().max(500),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.min === null && value.max === null)
      ctx.addIssue({ code: 'custom', message: 'A budget needs an amount.' });
    if (value.min !== null && value.max !== null && value.min > value.max)
      ctx.addIssue({ code: 'custom', message: 'Budget minimum exceeds maximum.' });
  });
export const sourceDateSchema = z
  .object({
    value: z.string().max(10).nullable(),
    precision: z.enum(['UNKNOWN', 'YEAR', 'MONTH', 'DAY']),
  })
  .strict()
  .superRefine(({ value, precision }, ctx) => {
    const valid =
      value === null
        ? precision === 'UNKNOWN'
        : precision === 'YEAR'
          ? /^\d{4}$/.test(value)
          : precision === 'MONTH'
            ? /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
            : precision === 'DAY' &&
              /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value) &&
              new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
    if (!valid)
      ctx.addIssue({ code: 'custom', message: 'Date must match its calendar and precision.' });
  });
export const deadlineSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('year'),
      year: z.number().int().min(1900).max(2200),
      boundary: z.enum(['before', 'by']),
      rawText: shortText,
    })
    .strict(),
  z
    .object({
      kind: z.literal('date'),
      date: z.iso.date(),
      boundary: z.enum(['before', 'by']),
      rawText: shortText,
    })
    .strict(),
  z
    .object({
      kind: z.literal('within_months'),
      months: z.number().int().min(1).max(240),
      relativeTo: z.iso.date(),
      rawText: shortText,
    })
    .strict(),
  z.object({ kind: z.literal('flexible'), rawText: shortText }).strict(),
]);
export const purposeSchema = z.enum([
  'residence',
  'investment',
  'holiday',
  'relocation',
  'golden_visa',
]);
export const marketBriefSchema = z
  .object({
    id,
    country: z.enum(['UAE', 'Egypt']),
    placeIds: z.array(id).max(12),
    placeMatch: z.enum(['any', 'all']),
    purpose: purposeSchema.nullable(),
    budget: budgetSchema.nullable(),
    deadline: deadlineSchema.nullable(),
    readiness: z.enum(['unspecified', 'ready_now', 'off_plan_acceptable']),
    propertyTypes: z
      .array(z.enum(['apartment', 'villa', 'penthouse', 'townhouse', 'mansion', 'plot']))
      .max(6),
    bedrooms: z.number().int().min(0).max(30).nullable(),
    rawText: z.string().max(1500),
  })
  .strict();
export const householdSchema = z
  .object({
    adults: z.number().int().min(1).max(30).nullable(),
    children: z.number().int().min(0).max(30).nullable(),
    curriculum: z.string().trim().min(1).max(100).nullable(),
    schoolRequirement: z.enum(['unspecified', 'nearby', 'verified_required']),
  })
  .strict();
export const briefConstraintSchema = z
  .object({
    id,
    text: shortText,
    marketIds: z.array(id).max(8),
    category: z.enum(['amenity', 'view', 'architecture', 'location', 'privacy', 'other']),
    verificationRequired: z.boolean(),
  })
  .strict();
export const privacySchema = z
  .object({
    mode: z.enum(['standard', 'discreet']),
    doNotSave: z.boolean(),
    doNotShare: z.boolean(),
    doNotBook: z.boolean(),
    writePolicy: z.literal('confirm_each_action'),
  })
  .strict();
export const tasteMemorySchema = z
  .object({
    consent: z.enum(['not_asked', 'granted', 'declined', 'revoked']),
    consentedAt: z.iso.datetime({ offset: true }).nullable(),
    items: z
      .array(
        z.object({ id, text: shortText, recordedAt: z.iso.datetime({ offset: true }) }).strict(),
      )
      .max(30),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.consent !== 'granted' && value.items.length)
      ctx.addIssue({ code: 'custom', message: 'Retained taste memory requires current consent.' });
    if (value.consent === 'granted' && value.consentedAt === null)
      ctx.addIssue({ code: 'custom', message: 'Granted consent requires a timestamp.' });
  });
const briefFields = {
  rawRequest: z.string().max(4000),
  responseLanguage: z.enum(['auto', 'en', 'ar']),
  overallPurpose: purposeSchema.nullable(),
  marketMode: z.enum(['independent', 'alternatives']),
  markets: z.array(marketBriefSchema).max(8),
  unassignedBudget: budgetSchema.nullable(),
  unassignedDeadline: deadlineSchema.nullable(),
  displayCurrencies: z.array(conciergeCurrencySchema).min(1).max(6),
  paymentCurrency: conciergeCurrencySchema.nullable(),
  household: householdSchema,
  mustHaves: z.array(briefConstraintSchema).max(30),
  exclusions: z.array(briefConstraintSchema).max(30),
  uncertainties: z.array(shortText).max(20),
  provenance: z
    .array(
      z
        .object({
          fieldId: shortText,
          rawText: z.string().max(1000),
          origin: z.enum(['user', 'inferred', 'edited']),
        })
        .strict(),
    )
    .max(100),
};
export const conciergeBriefSchema = z
  .object({
    version: z.literal(CONCIERGE_VERSION),
    revision: z.number().int().nonnegative(),
    ...briefFields,
    privacy: privacySchema,
    tasteMemory: tasteMemorySchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    for (const [key, rows] of [
      ['markets', value.markets],
      ['mustHaves', value.mustHaves],
      ['exclusions', value.exclusions],
    ] as const)
      if (new Set(rows.map((row) => row.id)).size !== rows.length)
        ctx.addIssue({ code: 'custom', path: [key], message: 'Stable IDs must be unique.' });
    if (new Set(value.displayCurrencies).size !== value.displayCurrencies.length)
      ctx.addIssue({
        code: 'custom',
        path: ['displayCurrencies'],
        message: 'Display currencies must be unique.',
      });
    const marketIds = new Set(value.markets.map((market) => market.id));
    for (const constraint of [...value.mustHaves, ...value.exclusions])
      if (constraint.marketIds.some((marketId) => !marketIds.has(marketId)))
        ctx.addIssue({ code: 'custom', message: 'Constraint names an absent market.' });
  });
export type ConciergeBrief = z.infer<typeof conciergeBriefSchema>;
export type MarketBrief = z.infer<typeof marketBriefSchema>;
export function emptyConciergeBrief(): ConciergeBrief {
  return conciergeBriefSchema.parse({
    version: 1,
    revision: 0,
    rawRequest: '',
    responseLanguage: 'auto',
    overallPurpose: null,
    marketMode: 'independent',
    markets: [],
    unassignedBudget: null,
    unassignedDeadline: null,
    displayCurrencies: ['AED'],
    paymentCurrency: null,
    household: { adults: null, children: null, curriculum: null, schoolRequirement: 'unspecified' },
    mustHaves: [],
    exclusions: [],
    uncertainties: [],
    provenance: [],
    privacy: {
      mode: 'standard',
      doNotSave: false,
      doNotShare: false,
      doNotBook: false,
      writePolicy: 'confirm_each_action',
    },
    tasteMemory: { consent: 'not_asked', consentedAt: null, items: [] },
  });
}

const mutableFields = z
  .object({ ...briefFields })
  .omit({ markets: true, mustHaves: true, exclusions: true })
  .partial()
  .strict();
const safePatchOperations = [
  z.object({ op: z.literal('fields.set'), value: mutableFields }).strict(),
  z.object({ op: z.literal('market.upsert'), value: marketBriefSchema }).strict(),
  z.object({ op: z.literal('market.remove'), id }).strict(),
  z
    .object({
      op: z.literal('constraint.upsert'),
      list: z.enum(['mustHaves', 'exclusions']),
      value: briefConstraintSchema,
    })
    .strict(),
  z
    .object({ op: z.literal('constraint.remove'), list: z.enum(['mustHaves', 'exclusions']), id })
    .strict(),
  z.object({ op: z.literal('memory.restrict'), consent: z.enum(['declined', 'revoked']) }).strict(),
  z
    .object({
      op: z.literal('privacy.restrict'),
      flags: z
        .array(z.enum(['doNotSave', 'doNotShare', 'doNotBook', 'discreet']))
        .min(1)
        .max(4),
    })
    .strict(),
] as const;
export const providerBriefPatchSchema = z
  .object({
    baseRevision: z.number().int().nonnegative(),
    operations: z.array(z.discriminatedUnion('op', safePatchOperations)).min(1).max(24),
  })
  .strict();
export const briefPatchSchema = z
  .object({
    baseRevision: z.number().int().nonnegative(),
    operations: z
      .array(
        z.discriminatedUnion('op', [
          ...safePatchOperations,
          z.object({ op: z.literal('privacy.replace'), value: privacySchema }).strict(),
          z.object({ op: z.literal('memory.replace'), value: tasteMemorySchema }).strict(),
        ]),
      )
      .min(1)
      .max(24),
  })
  .strict();
export type BriefPatch = z.infer<typeof briefPatchSchema>;
export type ProviderBriefPatch = z.infer<typeof providerBriefPatchSchema>;

export const entityRefSchema = z
  .object({ kind: z.enum(['project', 'unit', 'developer', 'place']), id })
  .strict();
export const evidenceBasisSchema = z.enum([
  'UNKNOWN',
  'AGENT_LISTING',
  'LISTING',
  'BROKER_PROJECT_PAGE',
  'PORTAL_PROJECT_PAGE',
  'PRESS_REPORT',
  'DEVELOPER',
  'DEMO_ESTIMATE',
  'USER_ASSUMPTION',
]);
const sourceFields = {
  id,
  title: z.string().max(500).nullable(),
  asOf: sourceDateSchema,
  retrieved: sourceDateSchema,
  confidence: z.enum(['UNASSESSED', 'LOW', 'MEDIUM', 'HIGH']),
};
export const groundedSourceSchema = z.discriminatedUnion('kind', [
  z
    .object({
      ...sourceFields,
      kind: z.literal('published'),
      url: z.url({ protocol: /^https?$/ }),
      publisher: shortText,
      basis: evidenceBasisSchema,
    })
    .strict(),
  z
    .object({
      ...sourceFields,
      kind: z.literal('demo'),
      url: z.null(),
      publisher: z.null(),
      basis: z.literal('DEMO_ESTIMATE'),
    })
    .strict(),
  z
    .object({
      ...sourceFields,
      kind: z.literal('user'),
      url: z.null(),
      publisher: z.null(),
      basis: z.literal('USER_ASSUMPTION'),
    })
    .strict(),
  z
    .object({
      ...sourceFields,
      kind: z.literal('missing'),
      url: z.null(),
      publisher: z.null(),
      basis: z.literal('UNKNOWN'),
    })
    .strict(),
]);
export const groundedFactSchema = z
  .object({
    id,
    entity: entityRefSchema,
    key: id,
    label: localizedTextSchema,
    value: z.union([z.string().max(2000), z.number().finite(), z.boolean(), z.null()]),
    unit: z.string().max(60).nullable(),
    currency: conciergeCurrencySchema.nullable(),
    sourceIds: z.array(id).max(12),
    asOf: sourceDateSchema,
    provenance: z.enum(['REAL_REFERENCE', 'DEMO', 'USER_ASSUMPTION', 'UNKNOWN']),
    qualifier: localizedTextSchema.nullable(),
    originalText: z.string().max(2000).nullable(),
    displayValue: localizedTextSchema.optional(),
  })
  .strict();
export const moneyDisplaySchema = z
  .object({
    native: moneySchema,
    qualifier: localizedTextSchema.nullable(),
    factId: id,
    converted: z
      .array(
        z
          .object({
            money: moneySchema,
            rate: z.number().finite().positive(),
            asOf: sourceDateSchema,
            method: z.literal('STATIC_DEMO_FX'),
          })
          .strict(),
      )
      .max(6),
    paymentCurrency: conciergeCurrencySchema.nullable(),
  })
  .strict();
const explanationSchema = z
  .object({
    text: localizedTextSchema,
    briefFieldIds: z.array(shortText).min(1).max(8),
    factIds: z.array(id).max(12),
    status: z.enum(['supported', 'unknown', 'conflict']),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status !== 'unknown' && !value.factIds.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Supported or conflicting reasons need fact references.',
      });
  });
const cardFields = {
  id,
  name: localizedTextSchema,
  center: z
    .tuple([z.number().min(-180).max(180), z.number().min(-85.051129).max(85.051129)])
    .nullable(),
  coordinatesApproximate: z.boolean(),
  price: moneyDisplaySchema.nullable(),
  facts: z.array(groundedFactSchema).max(80),
  sources: z.array(groundedSourceSchema).max(40),
  reasons: z.array(explanationSchema).min(2).max(3),
  tradeoff: explanationSchema,
};
export const groundedCardSchema = z.discriminatedUnion('kind', [
  z
    .object({
      ...cardFields,
      kind: z.literal('reference-project'),
      projectId: id,
      developerId: id,
      availability: z.literal('ON_REQUEST'),
    })
    .strict(),
  z
    .object({
      ...cardFields,
      kind: z.literal('demo-project'),
      projectId: id,
      developerId: id,
      availability: z.literal('DEMO_ONLY'),
    })
    .strict(),
  z
    .object({
      ...cardFields,
      kind: z.literal('demo-unit'),
      unitId: id,
      projectId: id,
      availability: z.literal('DEMO_ONLY'),
    })
    .strict(),
]);
export type GroundedCard = z.infer<typeof groundedCardSchema>;
export type GroundedSource = z.infer<typeof groundedSourceSchema>;
export type GroundedFact = z.infer<typeof groundedFactSchema>;

export const mapPointSchema: z.ZodType<AtlasPoint> = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-85.051129).max(85.051129),
]);
export const mapLayerSchema: z.ZodType<AtlasLayer> = z.enum([
  'beach',
  'golf',
  'school',
  'hospital',
  'airport',
  'culture',
  'hex',
]);
export const mapCameraSchema: z.ZodType<AtlasCamera> = z
  .object({
    center: mapPointSchema,
    zoom: z.number().min(1).max(18),
    pitch: z.number().min(0).max(60).optional(),
    bearing: z.number().min(-180).max(180).optional(),
    key: id,
    padding: z
      .object({
        top: z.number().nonnegative(),
        bottom: z.number().nonnegative(),
        left: z.number().nonnegative(),
        right: z.number().nonnegative(),
      })
      .strict()
      .optional(),
  })
  .strict();
const actionFields = {
  id,
  turnId: id,
  requestId: id,
  briefRevision: z.number().int().nonnegative(),
};
export const conciergeActionSchema = z.discriminatedUnion('type', [
  z
    .object({
      ...actionFields,
      type: z.literal('map.flyTo'),
      camera: mapCameraSchema,
      anchor: entityRefSchema,
    })
    .strict(),
  z
    .object({
      ...actionFields,
      type: z.literal('map.highlight'),
      entities: z.array(entityRefSchema).max(12),
    })
    .strict(),
  z
    .object({
      ...actionFields,
      type: z.literal('map.showLayer'),
      layer: mapLayerSchema,
      visible: z.boolean(),
    })
    .strict(),
  z
    .object({
      ...actionFields,
      type: z.literal('map.drawIsochrone'),
      center: mapPointSchema,
      origin: entityRefSchema,
      minutes: z.union([z.literal(10), z.literal(20), z.literal(30)]),
      method: z.literal('ILLUSTRATIVE_STRAIGHT_LINE'),
      speedKmh: z.literal(ATLAS_TRAVEL_SPEED_KMH),
    })
    .strict(),
  z
    .object({
      ...actionFields,
      type: z.literal('map.story'),
      storyId: z.enum(['islands', 'branded', 'sahel', 'saadiyat', 'ready']),
      autoplay: z.literal(false),
    })
    .strict(),
  z.object({ ...actionFields, type: z.literal('ui.showComparison'), componentId: id }).strict(),
  z.object({ ...actionFields, type: z.literal('ui.showTimeline'), componentId: id }).strict(),
  z
    .object({ ...actionFields, type: z.literal('brief.update'), brief: conciergeBriefSchema })
    .strict(),
]);
export type ConciergeAction = z.infer<typeof conciergeActionSchema>;
const componentFields = { id, turnId: id };
const evidenceBundle = {
  facts: z.array(groundedFactSchema).max(80),
  sources: z.array(groundedSourceSchema).max(40),
};
const paymentScheduleSchema = z
  .array(
    z
      .object({
        id,
        label: localizedTextSchema,
        percent: z.number().min(0).max(100),
        timing: shortText,
        factIds: z.array(id).min(1).max(8),
      })
      .strict(),
  )
  .min(1)
  .max(24)
  .superRefine((rows, ctx) => {
    if (Math.abs(rows.reduce((sum, row) => sum + row.percent, 0) - 100) > 0.001)
      ctx.addIssue({ code: 'custom', message: 'A full payment schedule must sum to 100 percent.' });
  });
export const conciergeComponentSchema = z.discriminatedUnion('kind', [
  z
    .object({
      ...componentFields,
      kind: z.literal('project-cards'),
      cards: z.array(groundedCardSchema).min(1).max(12),
    })
    .strict(),
  z
    .object({
      ...componentFields,
      kind: z.literal('comparison'),
      cards: z.array(groundedCardSchema).min(2).max(4),
      rows: z.array(z.object({ label: localizedTextSchema, factKey: id }).strict()).max(12),
    })
    .strict(),
  z
    .object({
      ...componentFields,
      kind: z.literal('mini-map'),
      entities: z.array(entityRefSchema).min(1).max(12),
      camera: mapCameraSchema,
      renderMode: z.literal('SHARED_MAP_PREVIEW'),
    })
    .strict(),
  z
    .object({
      ...componentFields,
      ...evidenceBundle,
      kind: z.literal('payment-timeline'),
      entity: entityRefSchema,
      price: moneyDisplaySchema,
      schedule: paymentScheduleSchema,
      mode: z.enum(['SOURCED_SCHEDULE', 'DEMO_ESTIMATE', 'USER_ASSUMPTION']),
    })
    .strict(),
  z
    .object({
      ...componentFields,
      kind: z.literal('price-area-chart'),
      cards: z.array(groundedCardSchema).min(2).max(12),
      points: z
        .array(z.object({ entity: entityRefSchema, priceFactId: id, areaFactId: id }).strict())
        .min(2)
        .max(12),
    })
    .strict(),
  z
    .object({
      ...componentFields,
      ...evidenceBundle,
      kind: z.literal('itinerary'),
      mode: z.enum(['SOURCED', 'DEMO_ILLUSTRATION']),
      steps: z
        .array(
          z
            .object({
              id,
              title: localizedTextSchema,
              placeId: id,
              time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
              factIds: z.array(id).max(8),
            })
            .strict(),
        )
        .min(1)
        .max(8),
    })
    .strict(),
  z
    .object({
      ...componentFields,
      ...evidenceBundle,
      kind: z.literal('developer-card'),
      developerId: id,
      name: localizedTextSchema,
      projectIds: z.array(id).max(24),
    })
    .strict(),
  z
    .object({
      ...componentFields,
      kind: z.literal('notice'),
      code: z.enum([
        'NO_MATCHES',
        'UNKNOWN_FACT',
        'NEEDS_CLARIFICATION',
        'ADVICE_HANDOFF',
        'DEMO_LIMITATION',
      ]),
      text: localizedTextSchema,
    })
    .strict(),
]);
export type ConciergeComponent = z.infer<typeof conciergeComponentSchema>;

const tool = <N extends string, S extends z.ZodType>(name: N, args: S) =>
  z.object({ name: z.literal(name), arguments: args }).strict();
const searchArgs = z
  .object({
    marketIds: z.array(id).max(8),
    query: z.string().max(500),
    limit: z.number().int().min(1).max(12),
  })
  .strict();
const writeArgs = z
  .object({ entities: z.array(entityRefSchema).min(1).max(24), mode: z.literal('propose') })
  .strict();
/** Exactly one target; existing projectId calls remain wire-compatible. */
export const timelineTargetSchema = z
  .object({ projectId: id.optional(), unitId: id.optional() })
  .strict()
  .refine(
    (value) => Number(value.projectId !== undefined) + Number(value.unitId !== undefined) === 1,
    { message: 'Choose exactly one project or unit for the payment timeline.' },
  );
export const conciergeToolCallSchema = z.discriminatedUnion('name', [
  tool('search_projects', searchArgs),
  tool('search_units', searchArgs.extend({ projectIds: z.array(id).max(12) }).strict()),
  tool('get_project', z.object({ projectId: id }).strict()),
  tool('get_developer', z.object({ developerId: id }).strict()),
  tool('compare', z.object({ entities: z.array(entityRefSchema).min(2).max(4) }).strict()),
  tool('area_insights', z.object({ placeId: id }).strict()),
  tool(
    'investment_calc',
    z
      .object({
        unitId: id,
        annualRent: moneySchema,
        vacancyPercent: z.number().min(0).max(100),
        annualCosts: moneySchema,
      })
      .strict(),
  ),
  tool(
    'payment_plan_projection',
    timelineTargetSchema.safeExtend({ scheduleFactIds: z.array(id).max(24) }),
  ),
  tool('save_to_portfolio', writeArgs.extend({ name: shortText }).strict()),
  tool(
    'request_viewing',
    writeArgs
      .extend({
        preferredSlots: z.array(z.iso.datetime({ offset: true })).max(3),
        modeOfViewing: z.enum(['in_person', 'video']),
        timezone: z.enum(['Asia/Dubai', 'Africa/Cairo', 'Europe/London']),
      })
      .strict(),
  ),
  tool('handoff_to_advisor', z.object({ reason: shortText, mode: z.literal('propose') }).strict()),
  tool('map.flyTo', z.object({ anchor: entityRefSchema }).strict()),
  tool('map.highlight', z.object({ entities: z.array(entityRefSchema).max(12) }).strict()),
  tool('map.showLayer', z.object({ layer: mapLayerSchema, visible: z.boolean() }).strict()),
  tool(
    'map.drawIsochrone',
    z
      .object({
        origin: entityRefSchema,
        minutes: z.union([z.literal(10), z.literal(20), z.literal(30)]),
      })
      .strict(),
  ),
  tool(
    'map.story',
    z.object({ storyId: z.enum(['islands', 'branded', 'sahel', 'saadiyat', 'ready']) }).strict(),
  ),
  tool(
    'ui.showComparison',
    z.object({ entities: z.array(entityRefSchema).min(2).max(4) }).strict(),
  ),
  tool('ui.showTimeline', timelineTargetSchema),
  tool('ui.showMiniMap', z.object({ entities: z.array(entityRefSchema).min(1).max(12) }).strict()),
  tool(
    'ui.showPriceAreaChart',
    z.object({ entities: z.array(entityRefSchema).min(2).max(12) }).strict(),
  ),
  tool('ui.showItinerary', z.object({ placeIds: z.array(id).min(1).max(4) }).strict()),
  tool('brief.update', providerBriefPatchSchema),
]);
export type ConciergeToolCall = z.infer<typeof conciergeToolCallSchema>;
export const providerPlanSchema = z
  .object({
    version: z.literal(CONCIERGE_VERSION),
    baseRevision: z.number().int().nonnegative(),
    responseLanguage: conciergeLocaleSchema,
    continue: z.boolean(),
    briefPatch: providerBriefPatchSchema.nullable(),
    calls: z.array(conciergeToolCallSchema).max(CONCIERGE_LIMITS.callsPerPlan),
    replyKey: z.enum([
      'ACKNOWLEDGE',
      'CLARIFY',
      'RESULTS',
      'NO_MATCHES',
      'ADVICE_HANDOFF',
      'WRITE_CONFIRMATION',
    ]),
    clarificationFields: z.array(shortText).max(5),
  })
  .strict();
export type ConciergeProviderPlan = z.infer<typeof providerPlanSchema>;
const proposalFields = {
  id,
  turnId: id,
  summary: localizedTextSchema,
  entities: z.array(entityRefSchema).max(24),
  expiresAt: z.iso.datetime({ offset: true }),
};
export const writeProposalSchema = z.discriminatedUnion('kind', [
  z
    .object({
      ...proposalFields,
      kind: z.literal('save_to_portfolio'),
      details: writeArgs.extend({ name: shortText }).strict(),
    })
    .strict(),
  z
    .object({
      ...proposalFields,
      kind: z.literal('request_viewing'),
      details: writeArgs
        .extend({
          preferredSlots: z.array(z.iso.datetime({ offset: true })).max(3),
          modeOfViewing: z.enum(['in_person', 'video']),
          timezone: z.enum(['Asia/Dubai', 'Africa/Cairo', 'Europe/London']),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      ...proposalFields,
      kind: z.literal('handoff_to_advisor'),
      details: z.object({ reason: shortText, mode: z.literal('propose') }).strict(),
    })
    .strict(),
]);
export type WriteProposal = z.infer<typeof writeProposalSchema>;
export const writeConfirmationSchema = z
  .object({ proposalId: id, requestId: id, decision: z.enum(['confirm', 'reject']) })
  .strict();

const eventFields = {
  version: z.literal(CONCIERGE_VERSION),
  id,
  conversationId: id,
  turnId: id,
  requestId: id,
  sequence: z.number().int().nonnegative(),
  createdAt: z.iso.datetime({ offset: true }),
};
export const conciergeStreamEventSchema = z.discriminatedUnion('type', [
  z
    .object({
      ...eventFields,
      type: z.literal('turn.started'),
      briefRevision: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      ...eventFields,
      type: z.literal('status'),
      phase: z.enum(['interpreting', 'retrieving', 'composing']),
    })
    .strict(),
  z
    .object({
      ...eventFields,
      type: z.literal('tool.started'),
      toolCallId: id,
      toolName: conciergeToolCallSchema.options[0].shape.name.or(
        z.enum([
          'search_units',
          'get_project',
          'get_developer',
          'compare',
          'area_insights',
          'investment_calc',
          'payment_plan_projection',
          'save_to_portfolio',
          'request_viewing',
          'handoff_to_advisor',
          'map.flyTo',
          'map.highlight',
          'map.showLayer',
          'map.drawIsochrone',
          'map.story',
          'ui.showComparison',
          'ui.showTimeline',
          'ui.showMiniMap',
          'ui.showPriceAreaChart',
          'ui.showItinerary',
          'brief.update',
        ]),
      ),
    })
    .strict(),
  z
    .object({
      ...eventFields,
      type: z.literal('text.delta'),
      text: z.string().max(1000),
      origin: z.literal('APPLICATION_COPY'),
    })
    .strict(),
  z
    .object({ ...eventFields, type: z.literal('brief.updated'), brief: conciergeBriefSchema })
    .strict(),
  z
    .object({
      ...eventFields,
      type: z.literal('component.upsert'),
      component: conciergeComponentSchema,
    })
    .strict(),
  z
    .object({ ...eventFields, type: z.literal('ui.action'), action: conciergeActionSchema })
    .strict(),
  z
    .object({ ...eventFields, type: z.literal('write.proposed'), proposal: writeProposalSchema })
    .strict(),
  z
    .object({
      ...eventFields,
      type: z.literal('turn.completed'),
      outcome: z.enum(['complete', 'needs_input', 'handoff_offered', 'confirmation_required']),
      briefRevision: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      ...eventFields,
      type: z.literal('turn.cancelled'),
      reason: z.enum(['user', 'superseded', 'disconnected']),
    })
    .strict(),
  z
    .object({
      ...eventFields,
      type: z.literal('turn.error'),
      code: z.enum([
        'PROVIDER_UNAVAILABLE',
        'INVALID_PLAN',
        'STALE_BRIEF',
        'ACCESS_CHANGED',
        'RATE_LIMITED',
        'TOOL_FAILED',
        'TIMEOUT',
      ]),
      retryable: z.boolean(),
    })
    .strict(),
]);
export type ConciergeStreamEvent = z.infer<typeof conciergeStreamEventSchema>;
export const conciergeHistoryTurnSchema = z
  .object({
    id,
    requestId: id,
    userText: z.string().max(4000),
    responseLanguage: conciergeLocaleSchema,
    status: z.enum(['complete', 'cancelled', 'failed']),
    assistantText: z.string().max(12000),
    components: z.array(conciergeComponentSchema).max(CONCIERGE_LIMITS.componentsPerTurn),
    briefRevision: z.number().int().nonnegative(),
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();
export type ConciergeHistoryTurn = z.infer<typeof conciergeHistoryTurnSchema>;
export type ConciergeEntityRef = z.infer<typeof entityRefSchema>;
export const conciergeReplaySchema = z
  .object({
    version: z.literal(CONCIERGE_VERSION),
    conversationId: id,
    mode: z.literal('snapshot'),
    applyActions: z.literal(false),
    brief: conciergeBriefSchema,
    turns: z.array(conciergeHistoryTurnSchema).max(CONCIERGE_LIMITS.historyTurns),
    cursor: z.string().max(200).nullable(),
  })
  .strict();
export type ConciergeReplay = z.infer<typeof conciergeReplaySchema>;
export interface ConciergeProvider {
  plan(input: {
    round: number;
    message: string;
    brief: ConciergeBrief;
    responseLanguage: 'en' | 'ar';
    priorEntities: z.infer<typeof entityRefSchema>[];
    toolResults: ConciergeComponent[];
    signal?: AbortSignal;
  }): Promise<ConciergeProviderPlan>;
}
