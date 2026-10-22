import { z } from 'zod';
import {
  conciergeComponentSchema,
  conciergeCurrencySchema,
  groundedFactSchema,
  groundedSourceSchema,
  localizedTextSchema,
  moneyDisplaySchema,
  sourceDateSchema,
} from './concierge';

/** Shared wire schemas only. No database, authorization or server imports. */
export const storyIdSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/);
export const storySlugSchema = z.string().regex(/^(project|unit)-[a-zA-Z0-9][a-zA-Z0-9_-]{0,180}$/);
export const storyEntityRefSchema = z
  .object({ kind: z.enum(['project', 'unit']), id: storyIdSchema })
  .strict();
export const storyKindSchema = z.enum(['REAL_REFERENCE_PROJECT', 'DEMO_PROJECT', 'DEMO_UNIT']);
export const storyActionSchema = z.enum([
  'ASK_CONCIERGE',
  'COMPARE',
  'ADD_TO_PORTFOLIO',
  'REQUEST_UNIT_VIEWING',
  'ENQUIRE_PROJECT',
  'SELECT_UNIT',
  'COPY_PRIVATE_LINK',
]);
export const storyCapabilitySchema = z
  .object({
    action: storyActionSchema,
    allowed: z.boolean(),
    reason: z.enum([
      'ALLOWED',
      'SIGN_IN',
      'CLIENT_REQUIRED',
      'PRIVACY_RESTRICTED',
      'SELECT_UNIT',
      'ON_REQUEST',
      'NOT_APPLICABLE',
    ]),
  })
  .strict();
const point = z.tuple([z.number().min(-180).max(180), z.number().min(-85.051129).max(85.051129)]);
export const storyMediaSchema = z
  .object({
    url: z.string().regex(/^\/art\/[a-zA-Z0-9._/-]+$/),
    alt: localizedTextSchema,
    caption: localizedTextSchema,
    provenance: z.enum(['ILLUSTRATIVE', 'DEMO', 'SOURCE_PHOTOGRAPH']),
    sourceIds: z.array(storyIdSchema).max(12),
  })
  .strict();
export const storySummarySchema = z
  .object({
    kind: storyKindSchema,
    entity: storyEntityRefSchema,
    name: localizedTextSchema,
    storySlug: storySlugSchema,
    storyPath: z.string().regex(/^\/p\/(project|unit)-[a-zA-Z0-9][a-zA-Z0-9_-]{0,180}$/),
    country: z.enum(['UAE', 'Egypt']),
    city: localizedTextSchema,
    community: localizedTextSchema,
    center: point,
    coordinatesApproximate: z.boolean(),
    price: moneyDisplaySchema.nullable(),
    availability: z.enum(['ON_REQUEST', 'DEMO']),
    facts: z.array(groundedFactSchema).max(100),
    sources: z.array(groundedSourceSchema).max(60),
    media: z.array(storyMediaSchema).max(12),
  })
  .strict();
const metricCommon = {
  id: storyIdSchema,
  label: localizedTextSchema,
  factIds: z.array(storyIdSchema).max(12),
  sourceIds: z.array(storyIdSchema).max(12),
  asOf: sourceDateSchema,
  explanation: localizedTextSchema,
};
export const storyMetricSchema = z.discriminatedUnion('status', [
  z
    .object({
      ...metricCommon,
      status: z.literal('AVAILABLE'),
      value: z.number().finite(),
      unit: z.string().min(1).max(40),
      currency: conciergeCurrencySchema.nullable(),
      basis: z.enum(['SOURCED', 'DEMO', 'INDICATIVE_CONFIG']),
    })
    .strict(),
  z
    .object({
      ...metricCommon,
      status: z.literal('UNAVAILABLE'),
      reason: z.enum(['UNKNOWN_FACT', 'INCOMPATIBLE_BASIS', 'NOT_APPLICABLE']),
    })
    .strict(),
]);
export const storyTimelineSchema = z.discriminatedUnion('status', [
  z
    .object({ status: z.literal('AVAILABLE'), component: conciergeComponentSchema.options[3] })
    .strict(),
  z
    .object({
      status: z.literal('UNAVAILABLE'),
      subjectName: localizedTextSchema,
      reason: localizedTextSchema,
    })
    .strict(),
]);
const common = {
  ...storySummarySchema.shape,
  version: z.literal(1),
  narrative: z
    .array(
      z
        .object({
          id: storyIdSchema,
          title: localizedTextSchema,
          text: localizedTextSchema,
          factIds: z.array(storyIdSchema).max(12),
        })
        .strict(),
    )
    .max(8),
  developer: z
    .object({
      id: storyIdSchema,
      name: localizedTextSchema,
      kind: z.enum(['REAL_REFERENCE', 'DEMO', 'AGGREGATE']),
      facts: z.array(groundedFactSchema).max(80),
      sources: z.array(groundedSourceSchema).max(60),
    })
    .strict(),
  metrics: z.array(storyMetricSchema).max(12),
  timeline: storyTimelineSchema,
  capabilities: z.array(storyCapabilitySchema).max(7),
};
export const storyDTOSchema = z.discriminatedUnion('kind', [
  z
    .object({
      ...common,
      kind: z.literal('REAL_REFERENCE_PROJECT'),
      projectId: storyIdSchema,
      availability: z.literal('ON_REQUEST'),
      residences: z.null(),
    })
    .strict(),
  z
    .object({
      ...common,
      kind: z.literal('DEMO_PROJECT'),
      projectId: storyIdSchema,
      availability: z.literal('DEMO'),
      residences: z.array(storySummarySchema).min(1).max(12),
    })
    .strict(),
  z
    .object({
      ...common,
      kind: z.literal('DEMO_UNIT'),
      unitId: storyIdSchema,
      projectId: storyIdSchema,
      availability: z.literal('DEMO'),
      residences: z.null(),
    })
    .strict(),
]);
export type StoryDTO = z.infer<typeof storyDTOSchema>;
export type StorySummary = z.infer<typeof storySummarySchema>;
export type StoryEntityRef = z.infer<typeof storyEntityRefSchema>;
export type StoryCapability = z.infer<typeof storyCapabilitySchema>;
export type StoryMetric = z.infer<typeof storyMetricSchema>;
export type StoryTimeline = z.infer<typeof storyTimelineSchema>;
export type StoryAction = z.infer<typeof storyActionSchema>;
/** Identity only. Authorization is always performed by resolveStory. */
export function canonicalStoryPath(kind: 'project' | 'unit', slug: string) {
  const storySlug = storySlugSchema.parse(`${kind}-${slug}`);
  return { storySlug, storyPath: `/p/${storySlug}` };
}
