import { z } from 'zod';
import { conciergeCurrencySchema, localizedTextSchema } from './concierge';
import { storyDTOSchema, storyIdSchema, storySummarySchema } from './story';

export const officeEntityRefSchema = z
  .object({
    kind: z.enum(['reference-project', 'demo-unit']),
    id: storyIdSchema,
  })
  .strict();
export const officePrivacySchema = z
  .object({
    doNotSave: z.boolean(),
    doNotShare: z.boolean(),
    doNotBook: z.boolean(),
    version: z.number().int().nonnegative(),
    updatedAt: z.iso.datetime().nullable(),
  })
  .strict();
export const privacySettingsInputSchema = officePrivacySchema.omit({ updatedAt: true }).strict();
export const officePreferencesSchema = z
  .object({
    currency: conciergeCurrencySchema.default('AED'),
    areaUnit: z.enum(['sqm', 'sqft']).default('sqm'),
    locale: z.enum(['en', 'ar']).default('en'),
    arabicIndicDigits: z.boolean().default(false),
  })
  .strict();
const requestId = z
  .string()
  .min(8)
  .max(160)
  .regex(/^[a-zA-Z0-9._:-]+$/);
const name = z.string().trim().min(1).max(80);
export const portfolioCreateSchema = z.object({ name, clientRequestId: requestId }).strict();
export const portfolioRenameSchema = z
  .object({ name, version: z.number().int().nonnegative(), clientRequestId: requestId })
  .strict();
export const portfolioItemsInputSchema = z
  .object({
    refs: z.array(officeEntityRefSchema).min(1).max(24),
    version: z.number().int().nonnegative(),
    clientRequestId: requestId,
  })
  .strict();
export const portfolioItemSchema = z
  .object({ itemId: storyIdSchema, ref: officeEntityRefSchema, summary: storySummarySchema })
  .strict();
export const portfolioDTOSchema = z
  .object({
    id: storyIdSchema,
    name,
    version: z.number().int().nonnegative(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    items: z.array(portfolioItemSchema).max(100),
    visibleCount: z.number().int().nonnegative(),
  })
  .strict();
export const comparisonInputSchema = z
  .object({ refs: z.array(officeEntityRefSchema).min(2).max(4) })
  .strict();
export const officeComparisonSchema = z
  .object({ version: z.literal(1), entries: z.array(storySummarySchema).min(2).max(4) })
  .strict();
export const officeTimezoneSchema = z.enum(['Asia/Dubai', 'Africa/Cairo', 'Europe/London']);
export const viewingInputSchema = z
  .object({
    unitId: storyIdSchema,
    localSlots: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/))
      .min(1)
      .max(3),
    timezone: officeTimezoneSchema,
    mode: z.enum(['in_person', 'video']),
    clientRequestId: requestId,
  })
  .strict();
export const viewingDTOSchema = z
  .object({
    id: storyIdSchema,
    subject: storySummarySchema,
    slots: z.array(z.iso.datetime()).max(3),
    timezone: officeTimezoneSchema,
    mode: z.enum(['in_person', 'video']),
    status: z.enum(['REQUESTED', 'CONFIRMED', 'DECLINED', 'CANCELLED']),
    confirmedSlot: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
  })
  .strict();
export const projectEnquiryInputSchema = z
  .object({
    projectId: storyIdSchema,
    message: z.string().trim().min(1).max(2000),
    clientRequestId: requestId,
  })
  .strict();
export const projectEnquirySchema = z
  .object({
    id: storyIdSchema,
    subject: storySummarySchema,
    message: z.string().max(2000),
    status: z.enum(['REQUESTED', 'RESOLVED', 'CANCELLED']),
    createdAt: z.iso.datetime(),
  })
  .strict();
export const advisorAvailabilitySchema = z.enum(['AVAILABLE', 'AWAY', 'BY_APPOINTMENT', 'UNKNOWN']);
export const advisorDTOSchema = z
  .object({
    id: storyIdSchema,
    name: localizedTextSchema,
    kind: z.literal('DEMO'),
    availability: advisorAvailabilitySchema,
    availabilityUpdatedAt: z.iso.datetime().nullable(),
    threadId: storyIdSchema,
  })
  .strict();
export const threadMessageInputSchema = z
  .object({
    body: z.string().trim().min(1).max(4000),
    attachments: z.array(officeEntityRefSchema).max(4).default([]),
    clientRequestId: requestId,
  })
  .strict();
export const threadMessageSchema = z
  .object({
    id: storyIdSchema,
    author: z.enum(['CLIENT', 'ADVISOR']),
    body: z.string().max(4000),
    attachments: z.array(storySummarySchema).max(4),
    createdAt: z.iso.datetime(),
  })
  .strict();
export const threadDTOSchema = z
  .object({
    id: storyIdSchema,
    archived: z.boolean(),
    messages: z.array(threadMessageSchema).max(50),
    nextCursor: storyIdSchema.nullable(),
  })
  .strict();
export const officeDTOSchema = z
  .object({
    version: z.literal(1),
    portfolios: z.array(portfolioDTOSchema).max(100),
    viewings: z.array(viewingDTOSchema).max(100),
    enquiries: z.array(projectEnquirySchema).max(100),
    advisor: advisorDTOSchema.nullable(),
    privacy: officePrivacySchema,
  })
  .strict();
/** Server-generated, owner-only export payload. No new client content is stored by reading it. */
export const dossierDTOSchema = z
  .object({
    version: z.literal(1),
    portfolio: portfolioDTOSchema,
    stories: z.array(storyDTOSchema).max(24),
    generatedAt: z.iso.datetime(),
    preferences: officePreferencesSchema,
  })
  .strict();
export type OfficeEntityRef = z.infer<typeof officeEntityRefSchema>;
export type OfficePrivacy = z.infer<typeof officePrivacySchema>;
export type OfficePreferences = z.infer<typeof officePreferencesSchema>;
export type PortfolioDTO = z.infer<typeof portfolioDTOSchema>;
export type OfficeDTO = z.infer<typeof officeDTOSchema>;
export type OfficeComparison = z.infer<typeof officeComparisonSchema>;
export type ViewingDTO = z.infer<typeof viewingDTOSchema>;
export type AdvisorDTO = z.infer<typeof advisorDTOSchema>;
export type ThreadDTO = z.infer<typeof threadDTOSchema>;
export type DossierDTO = z.infer<typeof dossierDTOSchema>;
export type ProjectEnquiryDTO = z.infer<typeof projectEnquirySchema>;
